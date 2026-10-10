"""Objective comparison; this does not substitute for subjective headphone listening.

QA-only script requiring NumPy and FFmpeg, never imported by the website.
"""
import json
import subprocess
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
QA = ROOT / ".qa/audio"

def decode(path):
    data = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path), "-map", "0:a:0", "-ar", "48000", "-ac", "2", "-f", "f32le", "-"])
    return np.frombuffer(data, dtype="<f4").reshape(-1, 2)

def bands(data):
    # Averaged windowed power spectra preserve stereo-channel statistics.
    frames = data[:len(data)//4096*4096].reshape(-1, 4096, 2)
    power = np.mean(np.abs(np.fft.rfft(frames * np.hanning(4096)[None, :, None], axis=1))**2, axis=0)
    freq = np.fft.rfftfreq(4096, 1/48000)
    return {name: power[(freq >= low) & (freq < high)].sum(axis=0) for name,low,high in
            [("bass_20_120",20,120),("low_mid_120_1000",120,1000),("synth_1k_8k",1000,8000),("detail_8k_16k",8000,16000)]}

master = decode(QA / "analysis/loop-master.wav")
results = []
for path in sorted((QA / "candidates").iterdir()):
    decoded = decode(path)
    n = min(len(master),len(decoded))
    reference, output = master[:n], decoded[:n]
    original_bands, output_bands = bands(reference),bands(output)
    log = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True, check=True).stderr
    (QA / "analysis" / (path.stem + "-signal.log")).write_text(log)
    results.append({"file":path.name,"decoded_duration":len(decoded)/48000,
        "sample_peak_dbfs":float(20*np.log10(np.max(np.abs(output)))),
        "snr_db":float(10*np.log10(np.mean(reference**2)/np.mean((reference-output)**2))),
        "band_power_difference_db":{key:(10*np.log10(output_bands[key]/original_bands[key])).tolist() for key in original_bands},
        "stereo_correlation":float(np.corrcoef(output.T)[0,1]),
        "seam_sample_step":float(np.max(np.abs(output[0]-output[-1]))),
        "summary":log[log.rfind("Summary:"):]})
    print(path.name, "SNR",round(results[-1]["snr_db"],2),"peak",round(results[-1]["sample_peak_dbfs"],2),flush=True)
record={"method":"Decoded time-aligned error, windowed band power, correlation and FFmpeg EBU R128 true peak; no subjective listening certification.",
        "master_duration":len(master)/48000,"master_sample_peak_dbfs":float(20*np.log10(np.max(np.abs(master)))),
        "master_stereo_correlation":float(np.corrcoef(master.T)[0,1]),
        "master_seam_sample_step":float(np.max(np.abs(master[0]-master[-1]))),"candidates":results}
(QA / "analysis/comparison.json").write_text(json.dumps(record,indent=2))
