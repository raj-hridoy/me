"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { SoundtrackController } from "@/lib/soundtrack-controller";
import soundtrack from "@/data/soundtrack.json";

const Soundtrack = createContext<SoundtrackController | null>(null);
export function BackgroundAudio({ children }: { children: React.ReactNode }) {
  const [controller] = useState(() => new SoundtrackController(soundtrack));
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (audio.current) return controller.attach(audio.current);
  }, [controller]);
  return (
    <Soundtrack.Provider value={controller}>
      {children}
      <audio
        ref={audio}
        data-soundtrack
        loop
        preload="none"
        hidden
        aria-hidden="true"
      />
      <noscript>
        <style>{`.sound-interface{display:none!important}`}</style>
      </noscript>
    </Soundtrack.Provider>
  );
}
export function SoundControl() {
  const control = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = document.querySelector(".site-header");
    const element = control.current;
    if (!header || !element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) element.removeAttribute("data-docked");
      else element.dataset.docked = "true";
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const controller = useContext(Soundtrack);
  if (!controller)
    throw new Error("SoundControl requires the root soundtrack provider.");
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getServerSnapshot,
  );
  const loading = state.phase === "starting" || state.phase === "buffering";
  const playing = state.phase === "playing";
  const stopping = playing || loading;
  const label =
    state.phase === "error"
      ? "RETRY"
      : state.phase === "blocked"
        ? "READY"
        : loading
          ? "LOADING"
          : playing
            ? "ON"
            : "OFF";
  return (
    <div className="sound-interface" ref={control}>
      <button
        className="sound-control"
        data-audio-control
        data-phase={state.phase}
        type="button"
        disabled={!state.ready}
        aria-pressed={playing}
        aria-describedby="sound-status"
        aria-label={
          state.phase === "error"
            ? "Retry background audio"
            : stopping
              ? "Turn background sound off"
              : "Turn background sound on"
        }
        title={state.message}
        onClick={controller.toggle}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 9H7L12 5V19L7 15H3V9Z" />
          {playing ? (
            <path d="M16 8V16M20 5V19" className="sound-lines" />
          ) : loading ? (
            <path d="M16 8H21V13H16V8Z" />
          ) : (
            <path d="M16 9L21 14M21 9L16 14" />
          )}
        </svg>
        <span className="sound-label">
          <span>{loading ? "AUDIO" : "SOUND"}</span>
          <span>{label}</span>
        </span>
      </button>
      <span
        className="sr-only"
        id="sound-status"
        role="status"
        aria-live="polite"
      >
        {state.message}
      </span>
    </div>
  );
}
