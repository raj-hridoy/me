export type SoundPhase =
  | "off"
  | "starting"
  | "playing"
  | "buffering"
  | "blocked"
  | "stopping"
  | "suspended"
  | "error";
type Snapshot = { phase: SoundPhase; ready: boolean; message: string };
const INITIAL: Snapshot = {
  phase: "starting",
  ready: false,
  message: "Initializing the background soundtrack.",
};
const PREFERENCE = "rh-sound-preference";
const GESTURES = [
  "pointerdown",
  "pointerup",
  "touchstart",
  "touchend",
  "click",
  "keydown",
  "wheel",
  "scroll",
] as const;

export function audioAssetPath(
  file: string,
  prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "",
) {
  return `${prefix.replace(/\/$/, "")}/audio/${file}`;
}

/** One root-layout media element; no polling, decoded song buffers, or audio libraries. */
export class SoundtrackController {
  private audio: HTMLAudioElement | null = null;
  private snapshot = INITIAL;
  private listeners = new Set<() => void>();
  private disposeEvents: (() => void) | null = null;
  private desired = false;
  private inFlight = false;
  private token = 0;
  private fadeFrame = 0;
  private supportsVolume = true;
  private fadeInPending = false;
  private gesturesArmed = false;
  private strongUsed = false;
  private weakUsed = false;
  private resumeOnVisible = false;
  private selected: "opus" | "aac" | null = null;
  private fallbackUsed = false;
  private seekAfterLoad = 0;

  constructor(private assets: { opus: string; aac: string }) {}
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => INITIAL;
  private publish(phase: SoundPhase, message: string) {
    const ready = this.audio !== null;
    if (
      phase === this.snapshot.phase &&
      ready === this.snapshot.ready &&
      message === this.snapshot.message
    )
      return;
    this.snapshot = { phase, ready, message };
    this.listeners.forEach((notify) => notify());
  }
  private save(value: "on" | "off") {
    try {
      localStorage.setItem(PREFERENCE, value);
    } catch {
      /* Storage-restricted browsing remains usable. */
    }
  }
  private cancelFade() {
    cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = 0;
  }
  private fade(to: number, duration: number, done?: () => void) {
    this.cancelFade();
    const audio = this.audio;
    if (!audio) return;
    if (
      !this.supportsVolume ||
      document.hidden ||
      Math.abs(audio.volume - to) < 0.001
    ) {
      if (this.supportsVolume) audio.volume = to;
      done?.();
      return;
    }
    const from = audio.volume,
      start = performance.now();
    const tick = (time: number) => {
      const progress = Math.max(0, Math.min(1, (time - start) / duration));
      audio.volume = from + (to - from) * (1 - (1 - progress) ** 3);
      if (progress < 1) this.fadeFrame = requestAnimationFrame(tick);
      else {
        this.fadeFrame = 0;
        done?.();
      }
    };
    this.fadeFrame = requestAnimationFrame(tick);
  }
  private disarmGestures() {
    if (!this.gesturesArmed) return;
    GESTURES.forEach((type) =>
      document.removeEventListener(type, this.gesture, true),
    );
    this.gesturesArmed = false;
  }
  private armGestures() {
    if (this.gesturesArmed || this.strongUsed || !this.desired) return;
    GESTURES.forEach((type) =>
      document.addEventListener(type, this.gesture, {
        capture: true,
        passive: true,
      }),
    );
    this.gesturesArmed = true;
  }
  private gesture = (event: Event) => {
    if (!event.isTrusted || !this.desired || this.inFlight || document.hidden)
      return;
    if ((event.target as Element | null)?.closest?.("[data-audio-control]"))
      return;
    if (
      event instanceof KeyboardEvent &&
      (event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        ["Shift", "Control", "Alt", "Meta", "Escape", "Tab"].includes(
          event.key,
        ))
    )
      return;
    const weak =
      ["wheel", "scroll", "touchstart"].includes(event.type) ||
      (event instanceof PointerEvent &&
        event.pointerType !== "mouse" &&
        event.type === "pointerdown");
    const strong =
      !weak &&
      ((navigator.userActivation?.isActive ?? false) ||
        ["click", "touchend", "keydown"].includes(event.type));
    if (strong) {
      if (this.strongUsed) return;
      this.strongUsed = true;
      this.disarmGestures();
    } else {
      if (this.weakUsed) return;
      this.weakUsed = true;
    }
    // play() executes inside the trusted event stack: no await, timer, or fake click.
    this.start();
  };
  private chooseSource() {
    const audio = this.audio;
    if (!audio) return false;
    if (!this.selected)
      this.selected = audio.canPlayType('audio/ogg; codecs="opus"')
        ? "opus"
        : audio.canPlayType('audio/mp4; codecs="mp4a.40.2"')
          ? "aac"
          : null;
    if (!this.selected) {
      this.publish("error", "This browser cannot play the soundtrack.");
      return false;
    }
    if (!audio.getAttribute("src"))
      audio.src = audioAssetPath(this.assets[this.selected]);
    return true;
  }
  private fallback() {
    const audio = this.audio;
    if (
      !audio ||
      this.selected !== "opus" ||
      this.fallbackUsed ||
      !audio.canPlayType('audio/mp4; codecs="mp4a.40.2"')
    )
      return false;
    this.fallbackUsed = true;
    this.selected = "aac";
    this.token++;
    this.inFlight = false;
    this.seekAfterLoad = audio.currentTime || 0;
    audio.src = audioAssetPath(this.assets.aac);
    if (this.desired && !document.hidden) this.start();
    return true;
  }
  private reject(error: unknown, token: number) {
    if (token !== this.token || !this.audio || !this.desired) return;
    this.inFlight = false;
    this.cancelFade();
    const name =
      error instanceof Error || error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError") {
      this.publish(
        "blocked",
        "Sound is enabled, but your browser has not allowed playback yet. Your first tap, click, or key may start it; this control can also activate it.",
      );
      this.armGestures();
    } else if (name === "NotSupportedError" && this.fallback()) {
      // Switch once after an actual codec failure, never after an autoplay rejection.
    } else if (name === "AbortError") {
      this.publish(
        "off",
        "Playback was interrupted. Activate sound to resume.",
      );
    } else {
      this.disarmGestures();
      this.publish("error", "Audio could not load. Activate sound to retry.");
    }
  }
  private start() {
    const audio = this.audio;
    if (
      !audio ||
      !this.desired ||
      this.inFlight ||
      document.hidden ||
      !this.chooseSource()
    )
      return;
    this.cancelFade();
    const token = ++this.token;
    this.inFlight = true;
    // Request audible full-volume playback. Apply the fade only after it is allowed.
    this.fadeInPending = audio.paused;
    if (audio.paused && this.supportsVolume) audio.volume = 1;
    this.publish(
      "starting",
      "Loading the background soundtrack. Activate again to stop.",
    );
    try {
      const playback = audio.play();
      Promise.resolve(playback)
        .then(() => {
          if (token !== this.token || !this.audio || !this.desired) return;
          this.inFlight = false;
          this.playing();
        })
        .catch((error: unknown) => this.reject(error, token));
    } catch (error) {
      this.reject(error, token);
    }
  }
  private playing = () => {
    const audio = this.audio;
    if (!audio) return;
    if (!this.desired || document.hidden) {
      audio.pause();
      return;
    }
    this.inFlight = false;
    this.disarmGestures();
    if (this.snapshot.phase === "playing") return;
    if (this.fadeInPending && this.supportsVolume) audio.volume = 0.02;
    this.fadeInPending = false;
    this.publish("playing", "Background soundtrack playing at 100% volume.");
    this.fade(1, 360);
  };
  private stop(immediate = false) {
    this.desired = false;
    this.resumeOnVisible = false;
    this.token++;
    this.inFlight = false;
    this.disarmGestures();
    const audio = this.audio;
    if (!audio) return;
    const finish = () => {
      audio.pause();
      this.publish(
        "off",
        "Sound is off and will stay off until you enable it.",
      );
    };
    if (immediate || audio.paused) {
      this.cancelFade();
      finish();
    } else {
      this.publish("stopping", "Turning sound off.");
      this.fade(0.001, 160, finish);
    }
  }
  toggle = () => {
    const audio = this.audio;
    if (!audio) return;
    if (
      this.desired &&
      ["starting", "playing", "buffering"].includes(this.snapshot.phase)
    ) {
      this.save("off");
      this.stop();
    } else {
      this.desired = true;
      this.strongUsed = false;
      this.weakUsed = false;
      this.disarmGestures();
      this.save("on");
      if (audio.error) {
        this.seekAfterLoad = audio.currentTime || 0;
        audio.load();
      }
      this.start();
    }
  };
  private suspend = () => {
    const audio = this.audio;
    if (!audio || !this.desired || (audio.paused && !this.inFlight)) return;
    this.resumeOnVisible = true;
    this.token++;
    this.inFlight = false;
    this.cancelFade();
    audio.pause();
    this.publish(
      "suspended",
      "Sound is paused while this page is in the background.",
    );
  };
  private resume = () => {
    if (document.hidden || !this.resumeOnVisible || !this.desired) return;
    this.resumeOnVisible = false;
    this.strongUsed = false;
    this.weakUsed = false;
    this.start();
  };
  attach(audio: HTMLAudioElement) {
    this.audio = audio;
    audio.preload = "none";
    audio.loop = true;
    audio.muted = false;
    try {
      audio.volume = 0.5;
      this.supportsVolume = Math.abs(audio.volume - 0.5) < 0.01;
      audio.volume = 1;
    } catch {
      this.supportsVolume = false;
    }
    const waiting = () => {
      if (this.desired && !audio.paused)
        this.publish(
          "buffering",
          "Buffering audio. Playback will continue when data arrives.",
        );
    };
    const paused = () => {
      if (this.resumeOnVisible || document.hidden) return;
      if (["error", "blocked"].includes(this.snapshot.phase)) return;
      if (this.desired && !this.inFlight) {
        this.desired = false;
        this.disarmGestures();
        this.cancelFade();
        this.publish("off", "Playback paused. Activate sound to resume.");
      }
    };
    const error = () => {
      if (
        (audio.error?.code === 3 || audio.error?.code === 4) &&
        this.fallback()
      )
        return;
      this.token++;
      this.inFlight = false;
      this.disarmGestures();
      this.cancelFade();
      this.publish("error", "Audio could not load. Activate sound to retry.");
    };
    const metadata = () => {
      if (this.seekAfterLoad && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(
          this.seekAfterLoad,
          Math.max(0, audio.duration - 0.1),
        );
        this.seekAfterLoad = 0;
      }
    };
    const visibility = () => {
      if (document.hidden) this.suspend();
      else this.resume();
    };
    const storage = (event: StorageEvent) => {
      if (event.key === PREFERENCE && event.newValue === "off") this.stop(true);
    };
    const mediaEvents = {
      playing: this.playing,
      waiting,
      stalled: waiting,
      pause: paused,
      error,
      loadedmetadata: metadata,
    };
    Object.entries(mediaEvents).forEach(([type, listener]) =>
      audio.addEventListener(type, listener),
    );
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("freeze", this.suspend);
    window.addEventListener("pagehide", this.suspend);
    window.addEventListener("pageshow", this.resume);
    window.addEventListener("storage", storage);
    this.disposeEvents = () => {
      Object.entries(mediaEvents).forEach(([type, listener]) =>
        audio.removeEventListener(type, listener),
      );
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("freeze", this.suspend);
      window.removeEventListener("pagehide", this.suspend);
      window.removeEventListener("pageshow", this.resume);
      window.removeEventListener("storage", storage);
    };
    this.strongUsed = false;
    this.weakUsed = false;
    try {
      this.desired = localStorage.getItem(PREFERENCE) !== "off";
    } catch {
      this.desired = true;
    }
    this.publish(
      "off",
      this.desired
        ? "Initializing the background soundtrack."
        : "Sound is off and will stay off until you enable it.",
    );
    if (this.desired) this.start();
    return () => {
      this.token++;
      this.inFlight = false;
      this.desired = false;
      this.resumeOnVisible = false;
      this.disarmGestures();
      this.cancelFade();
      this.disposeEvents?.();
      this.disposeEvents = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      this.audio = null;
    };
  }
}
