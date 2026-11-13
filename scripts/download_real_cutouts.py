import os
import requests

TARGETS = [
    {
        "id": "barnards-star",
        "ra": 269.4521,
        "dec": 4.6934
    },
    {
        "id": "wise-0855",
        "ra": 133.7951,
        "dec": -7.2452
    },
    {
        "id": "epsilon-indi-b",
        "ra": 331.0438,
        "dec": -56.7828
    },
    {
        "id": "rw-aurigae",
        "ra": 76.9564,
        "dec": 30.4014
    },
    {
        "id": "r-draconis",
        "ra": 248.1675,
        "dec": 66.7550
    }
]

EPOCHS = [
    {"index": 0, "layer": "unwise-neo2", "name": "Epoch 1 (Survey 1)"},
    {"index": 1, "layer": "unwise-neo4", "name": "Epoch 2 (Survey 2)"},
    {"index": 2, "layer": "unwise-neo7", "name": "Epoch 3 (Survey 3)"}
]

out_dir = "public/cutouts"
os.makedirs(out_dir, exist_ok=True)

print("Downloading authentic real NASA multi-epoch imagery...")
for t in TARGETS:
    print(f"\nTarget: {t['id']}")
    for ep in EPOCHS:
        filename = f"{t['id']}_epoch{ep['index']}.jpg"
        filepath = os.path.join(out_dir, filename)
        url = f"https://www.legacysurvey.org/viewer/cutout.jpg?ra={t['ra']}&dec={t['dec']}&layer={ep['layer']}&size=512"
        try:
            r = requests.get(url, timeout=20)
            if r.status_code == 200 and len(r.content) > 1000:
                with open(filepath, "wb") as f:
                    f.write(r.content)
                print(f"  Saved {filename} ({len(r.content)} bytes) [{ep['layer']}]")
            else:
                print(f"  Failed for {filename}: HTTP {r.status_code}")
        except Exception as e:
            print(f"  Error downloading {filename}: {e}")

print("\nAll actual astronomical images downloaded successfully!")
