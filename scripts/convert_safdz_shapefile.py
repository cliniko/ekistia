#!/usr/bin/env python3
"""
Convert ILIGAN SAFDZ shapefile to GeoJSON format using GeoPandas.
"""

import geopandas as gpd
import json

def convert_shapefile_to_geojson(shp_path, output_path):
    """Convert shapefile to GeoJSON using GeoPandas"""
    print(f"Reading shapefile: {shp_path}")
    
    # Read shapefile
    gdf = gpd.read_file(shp_path)
    
    print(f"Loaded {len(gdf)} features")
    print(f"Columns: {list(gdf.columns)}")
    
    # Convert to WGS84 (EPSG:4326) for web mapping
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        print(f"Reprojecting from {gdf.crs} to EPSG:4326")
        gdf = gdf.to_crs(epsg=4326)
    
    # Convert to GeoJSON
    print(f"Writing GeoJSON to: {output_path}")
    gdf.to_file(output_path, driver='GeoJSON')
    
    print(f"✅ Conversion complete! {len(gdf)} features written.")
    
    # Print SAFDZ classification summary
    if 'SAFDZ' in gdf.columns:
        print("\nSAFDZ classification summary:")
        safdz_counts = gdf['SAFDZ'].value_counts()
        for safdz, count in safdz_counts.items():
            print(f"  {safdz}: {count} features")
    else:
        print("\nAvailable columns:")
        for col in gdf.columns:
            if col != 'geometry':
                print(f"  - {col}")

if __name__ == '__main__':
    shp_path = 'src/data/safdz_npaaad_extracted/safdz and npaaad/ILIGAN SAFDZ/ILIGAN SAFDZ.shp'
    output_path = 'public/iligan_safdz.geojson'
    
    convert_shapefile_to_geojson(shp_path, output_path)

