"""Prepare the supplied recording without modifying it. Requires FFmpeg/FFprobe.

Run from the project: python3 scripts/optimize-audio.py /path/to/recording.mp3
Candidates and analysis stay in .qa/audio; only the selected pair enters public/audio.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
QA = ROOT / ".qa/audio"
SOURCE = Path(sys.argv[1]).resolve()
for directory in (QA / "analysis", QA / "candidates", ROOT / "public/audio"):
    directory.mkdir(parents=True, exist_ok=True)

def run(args):
    subprocess.run(args, check=True, capture_output=True)

def probe(path):
    return json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)
    ]))

original_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
if original_hash != "26fc42d7233e3130d799f7944e41c86dd9546cac32fdbc35c7a704f5c9155394":
    raise SystemExit("This preparation is specific to the inspected Bliss recording. Analyze a replacement before changing its loop/level settings.")
original = probe(SOURCE)
(QA / "analysis/original-probe.json").write_text(json.dumps(original, indent=2))
# Source-specific: measured trailing silence starts here; there is no leading silence.
# The two-second tail/head equal-power blend is baked in. Rotate the loop at the
# end of the intro overlap so its file boundary is a continuous source transition.
end = 140.017167
overlap = 2.0
gain_db = -5.5  # Source decoded true peak is +4.4dBFS: preserve dynamics with headroom.
master = QA / "analysis/loop-master.wav"
filters = (
    "[0:a:0]asplit=3[body][tail][head];"
    f"[body]atrim=start={overlap}:end={end-overlap},asetpts=PTS-STARTPTS[middle];"
    f"[tail]atrim=start={end-overlap}:end={end},asetpts=PTS-STARTPTS[t];"
    f"[head]atrim=start=0:end={overlap},asetpts=PTS-STARTPTS[h];"
    f"[t]afade=t=out:st=0:d={overlap}:curve=qsin[tf];"
    f"[h]afade=t=in:st=0:d={overlap}:curve=qsin[hf];"
    "[tf][hf]amix=inputs=2:duration=longest:normalize=0[bridge];"
    f"[middle][bridge]concat=n=2:v=0:a=1,volume={gain_db}dB[out]"
)
run(["ffmpeg", "-y", "-v", "error", "-i", str(SOURCE), "-filter_complex", filters,
     "-map", "[out]", "-map_metadata", "-1", "-c:a", "pcm_f32le", "-ar", "48000",
     "-ac", "2", str(master)])
records = []
for codec, rates, suffix in (("libopus", (80, 96, 112), "ogg"), ("aac", (96, 128), "m4a")):
    for rate in rates:
        target = QA / "candidates" / f"bliss-{codec}-{rate}.{suffix}"
        settings = (["-application", "audio", "-vbr", "on", "-compression_level", "10",
                     "-frame_duration", "20", "-page_duration", "200000"]
                    if codec == "libopus" else ["-profile:a", "aac_low", "-movflags", "+faststart"])
        command = ["ffmpeg", "-y", "-v", "error", "-i", str(master), "-map", "0:a:0",
                   "-map_metadata", "-1", "-vn", "-c:a", codec, "-b:a", f"{rate}k",
                   "-ar", "48000", "-ac", "2", *settings, str(target)]
        run(command)
        info = probe(target)
        records.append({"file": target.name, "codec": codec, "target_kbps": rate,
                        "bytes": target.stat().st_size,
                        "reduction_percent": round(100*(1-target.stat().st_size/SOURCE.stat().st_size), 2),
                        "command": command, "probe": info})
        print(target.name, target.stat().st_size, "bytes", flush=True)
selected = {}
for generated in (ROOT / "public/audio").glob("bliss-*.*"):
    if generated.suffix in (".ogg", ".m4a"):
        generated.unlink()
for codec, rate, key, suffix in (("libopus", 96, "opus", "ogg"), ("aac", 128, "aac", "m4a")):
    record = next(r for r in records if r["codec"] == codec and r["target_kbps"] == rate)
    candidate = QA / "candidates" / record["file"]
    name = f"bliss-{hashlib.sha256(candidate.read_bytes()).hexdigest()[:12]}.{suffix}"
    shutil.copyfile(candidate, ROOT / "public/audio" / name)
    selected[key] = name
(ROOT / "src/data/soundtrack.json").write_text(json.dumps(selected, indent=2) + "\n")
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == original_hash
(QA / "encoding.json").write_text(json.dumps({
    "source_sha256": original_hash, "source_bytes": SOURCE.stat().st_size,
    "loop_end_seconds": end, "overlap_seconds": overlap, "gain_db": gain_db,
    "master_filter": filters, "candidates": records,
    "selected": selected,
}, indent=2))
