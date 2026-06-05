#!/usr/bin/env python3
"""
Prepare GeoJSON data for the Catastro Minero viewer.

This script:
1. Copies the 4 GeoJSON files from the source directory to public/data/
2. Generates lightweight centroid JSON files for cluster views
3. Generates a stats.json with pre-computed statistics
"""

import json
import os
import shutil
from collections import Counter, defaultdict
from pathlib import Path

# Paths
SOURCE_DIR = Path("/Users/cavila/.gemini/antigravity-ide/scratch/catastro_conseciones")
TARGET_DIR = Path("/Users/cavila/.gemini/antigravity/scratch/kvil/public/data")

# The 4 GeoJSON types
TYPES = ["concesion", "manifestacion", "mensura", "pedimento"]

# Properties to keep in centroid files (lightweight)
CENTROID_PROPS = ["id", "nombre", "titular", "tipo", "hectareas", "juzgado", "anio_sentencia"]


def ensure_dirs():
    """Create target directory if it doesn't exist."""
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✓ Target directory ready: {TARGET_DIR}")


def copy_geojson_files():
    """Copy the full GeoJSON files to the data directory."""
    for tipo in TYPES:
        src = SOURCE_DIR / f"{tipo}.geojson"
        dst = TARGET_DIR / f"{tipo}.geojson"
        if src.exists():
            shutil.copy2(src, dst)
            size_mb = dst.stat().st_size / (1024 * 1024)
            print(f"✓ Copied {tipo}.geojson ({size_mb:.1f} MB)")
        else:
            print(f"✗ Source not found: {src}")


def load_geojson(filepath):
    """Load a GeoJSON file and return the parsed JSON."""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_centroids(geojson_data, tipo_name):
    """
    Generate a lightweight centroid FeatureCollection from the full GeoJSON.
    Uses lat_centro/lng_centro properties as point coordinates.
    Only keeps minimal properties for cluster views.
    """
    centroid_features = []

    for feature in geojson_data.get("features", []):
        props = feature.get("properties", {})

        # Get centroid coordinates from properties
        lat = props.get("lat_centro") or props.get("latCentro") or props.get("lat")
        lng = props.get("lng_centro") or props.get("lngCentro") or props.get("lng") or props.get("lon_centro") or props.get("lonCentro") or props.get("lon")

        if lat is None or lng is None:
            # Try to compute centroid from geometry if coordinates not in properties
            geom = feature.get("geometry")
            if geom and geom.get("coordinates"):
                centroid = compute_centroid(geom)
                if centroid:
                    lng, lat = centroid
                else:
                    continue
            else:
                continue

        # Ensure numeric
        try:
            lat = float(lat)
            lng = float(lng)
        except (TypeError, ValueError):
            continue

        # Build minimal properties
        minimal_props = {}
        for key in CENTROID_PROPS:
            val = props.get(key)
            if val is not None:
                minimal_props[key] = val

        # Add tipo if not already present
        if "tipo" not in minimal_props:
            minimal_props["tipo"] = tipo_name

        centroid_feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "properties": minimal_props
        }
        centroid_features.append(centroid_feature)

    return {
        "type": "FeatureCollection",
        "features": centroid_features
    }


def compute_centroid(geometry):
    """Compute a rough centroid from a geometry object."""
    geom_type = geometry.get("type", "")
    coords = geometry.get("coordinates", [])

    if not coords:
        return None

    all_points = []

    if geom_type == "Point":
        return coords
    elif geom_type == "MultiPoint":
        all_points = coords
    elif geom_type == "LineString":
        all_points = coords
    elif geom_type == "MultiLineString":
        for line in coords:
            all_points.extend(line)
    elif geom_type == "Polygon":
        # Use the outer ring
        if coords and coords[0]:
            all_points = coords[0]
    elif geom_type == "MultiPolygon":
        for polygon in coords:
            if polygon and polygon[0]:
                all_points.extend(polygon[0])
    else:
        return None

    if not all_points:
        return None

    # Average of all coordinates
    avg_lng = sum(p[0] for p in all_points) / len(all_points)
    avg_lat = sum(p[1] for p in all_points) / len(all_points)
    return [avg_lng, avg_lat]


def generate_centroid_files():
    """Generate centroid JSON files for each type."""
    all_data = {}

    for tipo in TYPES:
        src = TARGET_DIR / f"{tipo}.geojson"
        if not src.exists():
            print(f"✗ Cannot generate centroids, missing: {src}")
            continue

        print(f"  Loading {tipo}.geojson...")
        geojson_data = load_geojson(src)
        all_data[tipo] = geojson_data

        print(f"  Generating centroids for {tipo}...")
        centroid_data = generate_centroids(geojson_data, tipo)

        dst = TARGET_DIR / f"{tipo}-centroids.json"
        with open(dst, "w", encoding="utf-8") as f:
            json.dump(centroid_data, f, ensure_ascii=False)

        n_features = len(centroid_data["features"])
        size_mb = dst.stat().st_size / (1024 * 1024)
        print(f"✓ Generated {tipo}-centroids.json ({n_features} features, {size_mb:.2f} MB)")

    return all_data


def generate_stats(all_data):
    """Generate pre-computed statistics from all GeoJSON data."""
    stats = {
        "total_features": {},
        "top_titulares": [],
        "by_juzgado": {},
        "by_year": {},
        "by_tipo": {}
    }

    titular_counter = Counter()
    juzgado_counter = Counter()
    year_counter = Counter()
    tipo_counter = Counter()

    for tipo, geojson_data in all_data.items():
        features = geojson_data.get("features", [])
        stats["total_features"][tipo] = len(features)

        for feature in features:
            props = feature.get("properties", {})

            # Titular
            titular = props.get("titular", "").strip() if props.get("titular") else "Sin titular"
            if titular:
                titular_counter[titular] += 1

            # Juzgado
            juzgado = props.get("juzgado", "").strip() if props.get("juzgado") else None
            if juzgado:
                juzgado_counter[juzgado] += 1

            # Year from anio_sentencia
            anio = props.get("anio_sentencia")
            if anio is not None:
                try:
                    year_str = str(int(float(anio)))
                    year_counter[year_str] += 1
                except (TypeError, ValueError):
                    pass

            # Tipo
            tipo_val = props.get("tipo", tipo).strip() if props.get("tipo") else tipo
            tipo_counter[tipo_val] += 1

    # Top 20 titulares
    stats["top_titulares"] = [
        {"titular": name, "count": count}
        for name, count in titular_counter.most_common(20)
    ]

    # By juzgado (all)
    stats["by_juzgado"] = dict(juzgado_counter.most_common())

    # By year (sorted)
    stats["by_year"] = dict(sorted(year_counter.items()))

    # By tipo
    stats["by_tipo"] = dict(tipo_counter.most_common())

    # Save
    dst = TARGET_DIR / "stats.json"
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    size_kb = dst.stat().st_size / 1024
    print(f"✓ Generated stats.json ({size_kb:.1f} KB)")
    print(f"  Total features: {stats['total_features']}")
    print(f"  Top titular: {stats['top_titulares'][0] if stats['top_titulares'] else 'N/A'}")
    print(f"  Juzgados: {len(stats['by_juzgado'])} unique")
    print(f"  Years: {len(stats['by_year'])} unique")
    print(f"  Tipos: {len(stats['by_tipo'])} unique")

    return stats


def verify_output():
    """Verify all expected output files exist."""
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)

    expected_files = []
    for tipo in TYPES:
        expected_files.append(f"{tipo}.geojson")
        expected_files.append(f"{tipo}-centroids.json")
    expected_files.append("stats.json")

    all_ok = True
    for fname in expected_files:
        fpath = TARGET_DIR / fname
        if fpath.exists():
            size = fpath.stat().st_size
            if size < 1024:
                size_str = f"{size} B"
            elif size < 1024 * 1024:
                size_str = f"{size / 1024:.1f} KB"
            else:
                size_str = f"{size / (1024 * 1024):.1f} MB"
            print(f"  ✓ {fname} ({size_str})")
        else:
            print(f"  ✗ MISSING: {fname}")
            all_ok = False

    # Validate JSON format of centroid and stats files
    print("\nJSON validation:")
    for tipo in TYPES:
        fpath = TARGET_DIR / f"{tipo}-centroids.json"
        if fpath.exists():
            try:
                with open(fpath, "r") as f:
                    data = json.load(f)
                n = len(data.get("features", []))
                print(f"  ✓ {tipo}-centroids.json - valid JSON, {n} features")
            except json.JSONDecodeError as e:
                print(f"  ✗ {tipo}-centroids.json - INVALID JSON: {e}")
                all_ok = False

    stats_path = TARGET_DIR / "stats.json"
    if stats_path.exists():
        try:
            with open(stats_path, "r") as f:
                data = json.load(f)
            keys = list(data.keys())
            print(f"  ✓ stats.json - valid JSON, keys: {keys}")
        except json.JSONDecodeError as e:
            print(f"  ✗ stats.json - INVALID JSON: {e}")
            all_ok = False

    if all_ok:
        print("\n✅ All files verified successfully!")
    else:
        print("\n❌ Some files are missing or invalid!")

    return all_ok


def main():
    print("=" * 60)
    print("Catastro Minero - Data Preparation")
    print("=" * 60)

    # Step 1: Ensure directories
    print("\n[1/4] Creating directories...")
    ensure_dirs()

    # Step 2: Copy GeoJSON files
    print("\n[2/4] Copying GeoJSON files...")
    copy_geojson_files()

    # Step 3: Generate centroid files
    print("\n[3/4] Generating centroid files...")
    all_data = generate_centroid_files()

    # Step 4: Generate stats
    print("\n[4/4] Generating statistics...")
    if all_data:
        generate_stats(all_data)
    else:
        print("✗ No data loaded, cannot generate stats")

    # Verify
    verify_output()


if __name__ == "__main__":
    main()
