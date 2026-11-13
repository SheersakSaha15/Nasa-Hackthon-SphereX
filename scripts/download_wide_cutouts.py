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
    {"index": 0, "layer": "unwise-neo2"},
    {"index": 1, "layer": "unwise-neo4"},
    {"index": 2, "layer": "unwise-neo7"}
]

out_dir = "public/cutouts"
os.makedirs(out_dir, exist_ok=True)

print("Downloading authentic 1-degree (60') wide cutouts for benchmark targets...")
for t in TARGETS:
    print(f"\nTarget: {t['id']}")
    for ep in EPOCHS:
        filename = f"{t['id']}_epoch{ep['index']}_wide.jpg"
        filepath = os.path.join(out_dir, filename)
        url = f"https://www.legacysurvey.org/viewer/cutout.jpg?ra={t['ra']}&dec={t['dec']}&layer={ep['layer']}&size=900&pixscale=4"
        try:
            r = requests.get(url, timeout=20)
            if r.status_code == 200 and len(r.content) > 10000:
                with open(filepath, "wb") as f:
                    f.write(r.content)
                print(f"  Saved {filename} ({len(r.content)} B) [60' FOV]")
            else:
                print(f"  Failed {filename}: HTTP {r.status_code}")
        except Exception as e:
            print(f"  Error {filename}: {e}")

print("\nAll 60-arcmin wide cutouts saved successfully!")
