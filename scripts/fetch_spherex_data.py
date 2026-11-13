import json
import time
import requests

TARGETS = [
    {
        "id": "barnards-star",
        "name": "Barnard's Star",
        "ra": 269.4521,
        "dec": 4.6934,
        "category": "proper-motion"
    },
    {
        "id": "wise-0855",
        "name": "WISE 0855−0714",
        "ra": 133.7951,
        "dec": -7.2452,
        "category": "brown-dwarf"
    },
    {
        "id": "epsilon-indi-b",
        "name": "Epsilon Indi B",
        "ra": 331.0438,
        "dec": -56.7828,
        "category": "brown-dwarf"
    },
    {
        "id": "rw-aurigae",
        "name": "RW Aurigae",
        "ra": 76.9564,
        "dec": 30.4014,
        "category": "variable-star"
    },
    {
        "id": "r-draconis",
        "name": "R Draconis",
        "ra": 248.1675,
        "dec": 66.7550,
        "category": "variable-star"
    }
]

TAP_URL = "https://irsa.ipac.caltech.edu/TAP/sync"

def query_spherex(ra, dec, size=0.08):
    adql = f"""
    SELECT TOP 6 
           'https://irsa.ipac.caltech.edu/' || a.uri || '?center={ra},{dec}&size={size}' AS uri, 
           p.time_bounds_lower, 
           p.time_bounds_upper, 
           p.energy_bandpassname
    FROM spherex.artifact a 
    JOIN spherex.plane p ON a.planeid = p.planeid 
    WHERE 1 = CONTAINS(POINT('ICRS', {ra}, {dec}), p.poly) 
    ORDER BY p.time_bounds_lower ASC
    """
    params = {
        "REQUEST": "doQuery",
        "LANG": "ADQL",
        "QUERY": adql,
        "FORMAT": "json"
    }
    for attempt in range(2):
        try:
            r = requests.get(TAP_URL, params=params, timeout=60)
            if r.status_code == 200:
                data = r.json()
                table = data.get("VOTABLE", {}).get("RESOURCE_ARRAY", [{}])[0].get("TABLE", {})
                rows = table.get("DATA", {}).get("TABLEDATA", [])
                cutouts = []
                for row in rows:
                    cutouts.append({
                        "url": row[0],
                        "time_mjd": row[1],
                        "time_mjd_upper": row[2],
                        "bandpass": row[3] if len(row) > 3 else "SPHEREx-IR"
                    })
                return cutouts
        except Exception as e:
            print(f"  Attempt {attempt+1} error for {ra}, {dec}: {e}")
            time.sleep(2)
    return []

def main():
    manifest = {}
    print("Querying NASA/IPAC IRSA TAP for the 5 benchmark targets...")
    for target in TARGETS:
        print(f"\nProcessing {target['name']} (RA: {target['ra']}, Dec: {target['dec']})...")
        cutouts = query_spherex(target["ra"], target["dec"])
        print(f"  Found {len(cutouts)} SPHEREx spectral observation planes.")
        
        # Format WiseView multi-epoch comparison URLs (as suggested by NASA resources)
        wise_cutout_epoch1 = f"https://alasky.cds.unistra.fr/hips-image-services/hips2fits?hips=CDS/P/allWISE/color&ra={target['ra']}&dec={target['dec']}&fov=0.15&width=512&height=512&format=jpg"
        wise_cutout_epoch2 = f"https://alasky.cds.unistra.fr/hips-image-services/hips2fits?hips=CDS/P/2MASS/color&ra={target['ra']}&dec={target['dec']}&fov=0.15&width=512&height=512&format=jpg"

        manifest[target["id"]] = {
            "name": target["name"],
            "ra": target["ra"],
            "dec": target["dec"],
            "category": target["category"],
            "spherex_cutouts": cutouts,
            "archival_comparison": {
                "epoch1_url": wise_cutout_epoch1,
                "epoch2_url": wise_cutout_epoch2
            }
        }
        time.sleep(1) # respectful rate limiting

    out_file = "public/data/spherex_manifest.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest successfully written to {out_file}!")

if __name__ == "__main__":
    main()
