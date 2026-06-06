#!/usr/bin/env python3
"""
Optimiza los archivos GeoJSON para carga más rápida:
1. Reduce precisión de coordenadas a 5 decimales (~1m, más que suficiente)
2. Simplifica geometrías con Douglas-Peucker (tolerancia 0.0005 ≈ 50m)
3. Elimina propiedades innecesarias
"""

import json
import os
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "public" / "data"

# Propiedades que mantener (descartar el resto)
KEEP_PROPS = {
    'nombre', 'titular', 'tipo', 'hectareas', 'comuna',
    'juzgado', 'anio_sentencia', 'f_sentenci', 'rol',
    'solicitud', 'boletin', 'bol_sol', 'bol_senten',
    'archivo', 'mensura', 'conservado', 'seccion_boletin',
    'dueno_norm', 'id', 'lat_centro', 'lng_centro',
}

def round_coords(coords, precision=5):
    """Recursively round coordinate arrays to given precision."""
    if isinstance(coords, (int, float)):
        return round(coords, precision)
    return [round_coords(c, precision) for c in coords]


def simplify_ring(ring, tolerance=0.0005):
    """Douglas-Peucker simplification for a coordinate ring."""
    if len(ring) <= 4:  # Minimum valid polygon
        return ring
    
    # Find point farthest from line between first and last
    max_dist = 0
    max_idx = 0
    
    start = ring[0]
    end = ring[-1]
    
    for i in range(1, len(ring) - 1):
        # Perpendicular distance from point to line
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        
        if dx == 0 and dy == 0:
            dist = ((ring[i][0] - start[0])**2 + (ring[i][1] - start[1])**2)**0.5
        else:
            t = max(0, min(1, ((ring[i][0] - start[0]) * dx + (ring[i][1] - start[1]) * dy) / (dx*dx + dy*dy)))
            proj_x = start[0] + t * dx
            proj_y = start[1] + t * dy
            dist = ((ring[i][0] - proj_x)**2 + (ring[i][1] - proj_y)**2)**0.5
        
        if dist > max_dist:
            max_dist = dist
            max_idx = i
    
    if max_dist > tolerance:
        left = simplify_ring(ring[:max_idx+1], tolerance)
        right = simplify_ring(ring[max_idx:], tolerance)
        return left[:-1] + right
    else:
        return [ring[0], ring[-1]]


def simplify_geometry(geom, tolerance=0.0005):
    """Simplify a GeoJSON geometry."""
    gtype = geom.get('type', '')
    
    if gtype == 'Polygon':
        new_rings = []
        for ring in geom['coordinates']:
            simplified = simplify_ring(ring, tolerance)
            if len(simplified) >= 4:  # Valid polygon needs at least 4 points
                new_rings.append(simplified)
            else:
                new_rings.append(ring)  # Keep original if too simplified
        geom['coordinates'] = new_rings
        
    elif gtype == 'MultiPolygon':
        new_polys = []
        for polygon in geom['coordinates']:
            new_rings = []
            for ring in polygon:
                simplified = simplify_ring(ring, tolerance)
                if len(simplified) >= 4:
                    new_rings.append(simplified)
                else:
                    new_rings.append(ring)
            new_polys.append(new_rings)
        geom['coordinates'] = new_polys
    
    return geom


def optimize_file(filepath, tolerance=0.0005):
    """Optimize a single GeoJSON file."""
    name = filepath.name
    print(f"\n📦 Procesando {name}...")
    
    # Read
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    original_size = filepath.stat().st_size
    features = data.get('features', [])
    print(f"   Registros: {len(features):,}")
    print(f"   Tamaño original: {original_size / 1024 / 1024:.1f} MB")
    
    # Optimize each feature
    optimized_features = []
    for feat in features:
        # Filter properties
        props = feat.get('properties', {})
        new_props = {k: v for k, v in props.items() if k in KEEP_PROPS}
        
        # Simplify + round geometry
        geom = feat.get('geometry')
        if geom:
            geom = simplify_geometry(geom, tolerance)
            geom['coordinates'] = round_coords(geom['coordinates'], 5)
        
        optimized_features.append({
            'type': 'Feature',
            'properties': new_props,
            'geometry': geom,
        })
    
    data['features'] = optimized_features
    
    # Write optimized
    out_path = filepath.parent / f"{filepath.stem}_optimized.geojson"
    with open(out_path, 'w') as f:
        json.dump(data, f, separators=(',', ':'), ensure_ascii=False)
    
    new_size = out_path.stat().st_size
    reduction = (1 - new_size / original_size) * 100
    
    print(f"   Tamaño optimizado: {new_size / 1024 / 1024:.1f} MB")
    print(f"   ✅ Reducción: {reduction:.0f}%")
    
    return original_size, new_size


def main():
    files = sorted(DATA_DIR.glob("*.geojson"))
    files = [f for f in files if '_optimized' not in f.name and '-centroids' not in f.name]
    
    if not files:
        print("❌ No se encontraron archivos GeoJSON en", DATA_DIR)
        sys.exit(1)
    
    print("=" * 50)
    print("🔧 OPTIMIZADOR DE GEOJSON")
    print("=" * 50)
    
    total_original = 0
    total_new = 0
    
    for f in files:
        orig, new = optimize_file(f)
        total_original += orig
        total_new += new
    
    print("\n" + "=" * 50)
    print(f"📊 RESUMEN:")
    print(f"   Original total:  {total_original / 1024 / 1024:.1f} MB")
    print(f"   Optimizado total: {total_new / 1024 / 1024:.1f} MB")
    print(f"   Reducción total:  {(1 - total_new / total_original) * 100:.0f}%")
    print("=" * 50)
    
    # Prompt to replace
    print("\n¿Reemplazar originales con optimizados? (los _optimized se renombran)")
    for f in files:
        opt = f.parent / f"{f.stem}_optimized.geojson"
        if opt.exists():
            backup = f.parent / f"{f.stem}_original.geojson"
            os.rename(f, backup)
            os.rename(opt, f)
            print(f"   ✅ {f.name} reemplazado (backup: {backup.name})")
    
    print("\n🎉 ¡Listo! Ejecuta 'npm run build' para reconstruir.")


if __name__ == '__main__':
    main()
