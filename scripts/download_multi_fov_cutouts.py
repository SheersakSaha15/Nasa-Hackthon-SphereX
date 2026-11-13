import os
import requests

TARGETS = [
    {"id": "barnards-star", "ra": 269.4521, "dec": 4.6934},
    {"id": "wise-0855", "ra": 133.7951, "dec": -7.2452},
    {"id": "epsilon-indi-b", "ra": 331.0438, "dec": -56.7828},
    {"id": "rw-aurigae", "ra": 76.9564, "dec": 30.4014},
    {"id": "r-draconis", "ra": 248.1675, "dec": 66.7550}
]

EPOCHS = [
    {"index": 0, "layer": "unwise-neo2", "year": "2015"},
    {"index": 1, "layer": "unwise-neo4", "year": "2017"},
    {"index": 2, "layer": "unwise-neo7", "year": "2020"}
]

# Scale mapping:
# ps1 -> ~8 arcmin (Tight Zoom / 5'-10')
# ps2 -> ~17 arcmin (Default / 15'-20')
# ps4 -> ~34 arcmin (Moon size / 30'-40')
# ps8 -> ~68 arcmin (Wide-angle / 60')
PIXSCALES = [1, 2, 4, 8]

out_dir = "public/cutouts"
os.makedirs(out_dir, exist_ok=True)

print("Downloading multi-FOV authentic NASA images...")
for t in TARGETS:
    print(f"\nTarget: {t['id']}")
    for ep in EPOCHS:
        for ps in PIXSCALES:
            filename = f"{t['id']}_epoch{ep['index']}_ps{ps}.jpg"
            filepath = os.path.join(out_dir, filename)
            if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
                continue
            url = f"https://www.legacysurvey.org/viewer/cutout.jpg?ra={t['ra']}&dec={t['dec']}&layer={ep['layer']}&size=512&pixscale={ps}"
            try:
                r = requests.get(url, timeout=15)
                if r.status_code == 200 and len(r.content) > 1000:
                    with open(filepath, "wb") as f:
                        f.write(r.content)
                    print(f"  Saved {filename} ({len(r.content)} B) [scale {ps}]")
                else:
                    print(f"  Skipped {filename} (status {r.status_code})")
            except Exception as e:
                print(f"  Error {filename}: {e}")

print("\nMulti-FOV actual images ready!")
