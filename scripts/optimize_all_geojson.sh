#!/bin/bash
# Optimize all GeoJSON files in the public directory
# This script reduces coordinate precision and file sizes

set -e

echo "🚀 Starting GeoJSON Optimization Process"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Precision level (3 decimal places = ~111m accuracy for SAFDZ, 4 for others)
# Tolerance for geometry simplification (smaller = more aggressive simplification)
SAFDZ_PRECISION=3
SAFDZ_TOLERANCE=0.0001
OTHER_PRECISION=4
OTHER_TOLERANCE=0.00001

# Change to project root
cd "$(dirname "$0")/.."

# List of files to optimize
FILES=(
  "public/iligan_safdz.geojson"
  "public/iligan_flood_hazard.geojson"
  "public/iligan_landslide_hazard.geojson"
  "public/iligan_slope.geojson"
  "public/iligan_landuse.geojson"
)

# Track totals
TOTAL_BEFORE=0
TOTAL_AFTER=0

echo "📁 Files to optimize: ${#FILES[@]}"
echo ""

for FILE in "${FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "${YELLOW}⚠️  Skipping $FILE (not found)${NC}"
    continue
  fi
  
  # Get file size before
  SIZE_BEFORE=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
  TOTAL_BEFORE=$((TOTAL_BEFORE + SIZE_BEFORE))
  
  # Backup original
  BACKUP="${FILE%.geojson}_original.geojson.backup"
  if [ ! -f "$BACKUP" ]; then
    echo "💾 Backing up: $FILE"
    cp "$FILE" "$BACKUP"
  fi
  
  # Optimize with different parameters for SAFDZ vs others
  OUTPUT="${FILE%.geojson}_optimized.geojson"
  echo "⚙️  Optimizing: $FILE"

  if [[ "$FILE" == "public/iligan_safdz.geojson" ]]; then
    # SAFDZ: More aggressive optimization (lower precision, higher tolerance)
    node scripts/optimize_geojson.js "$FILE" "$OUTPUT" "$SAFDZ_PRECISION" "$SAFDZ_TOLERANCE"
  else
    # Other files: Conservative optimization
    node scripts/optimize_geojson.js "$FILE" "$OUTPUT" "$OTHER_PRECISION" "$OTHER_TOLERANCE"
  fi
  
  # Replace original with optimized
  mv "$OUTPUT" "$FILE"
  
  # Get file size after
  SIZE_AFTER=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
  TOTAL_AFTER=$((TOTAL_AFTER + SIZE_AFTER))
  
  echo ""
done

# Calculate totals
SAVED=$((TOTAL_BEFORE - TOTAL_AFTER))
PERCENT=$(echo "scale=1; 100 * $SAVED / $TOTAL_BEFORE" | bc)

# Convert bytes to MB
BEFORE_MB=$(echo "scale=2; $TOTAL_BEFORE / 1024 / 1024" | bc)
AFTER_MB=$(echo "scale=2; $TOTAL_AFTER / 1024 / 1024" | bc)
SAVED_MB=$(echo "scale=2; $SAVED / 1024 / 1024" | bc)

echo ""
echo "=========================================="
echo "${GREEN}✅ Optimization Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Total Results:"
echo "   Before:  ${BEFORE_MB} MB"
echo "   After:   ${AFTER_MB} MB"
echo "   Saved:   ${SAVED_MB} MB (${PERCENT}%)"
echo ""
echo "💡 Original files backed up with .backup extension"
echo "🎉 Your app will now load ${PERCENT}% faster!"
echo ""

