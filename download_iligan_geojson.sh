#!/bin/bash

# Download script for Iligan City Barangay GeoJSON data
# Created for Ekistia project

echo "🗺️  Downloading Iligan City Barangay GeoJSON data..."

# Create backup of existing files
echo "📁 Creating backups..."
mkdir -p public/backups
cp public/iligan_barangays*.geojson public/backups/ 2>/dev/null || true

# Array of potential URLs to try
declare -a urls=(
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/main/2023/geojson/barangays/103500000.geojson"
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/main/2023/geojson/municities/103500000.geojson"
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/main/geojson/barangays/103500000.geojson"
    "https://raw.githubusercontent.com/benjiao/philippine-boundaries/main/geojson/cities/iligan.geojson"
    "https://raw.githubusercontent.com/benjiao/philippine-boundaries/main/cities/iligan-barangays.geojson"
)

declare -a filenames=(
    "iligan_barangays_faeldon_2023.geojson"
    "iligan_municities_faeldon.geojson"
    "iligan_barangays_faeldon.geojson"
    "iligan_benjiao.geojson"
    "iligan_benjiao_barangays.geojson"
)

# Download function
download_file() {
    local url=$1
    local filename=$2
    local filepath="public/$filename"
    
    echo "🔄 Trying: $filename"
    
    # Download with curl
    if curl -s -f "$url" -o "$filepath"; then
        # Check if file is valid (not a 404 page)
        if [[ -s "$filepath" ]] && ! grep -q "404" "$filepath" && ! grep -q "Not Found" "$filepath"; then
            echo "✅ Success: $filename ($(stat -f%z "$filepath") bytes)"
            
            # Validate JSON
            if command -v jq >/dev/null 2>&1; then
                if jq empty "$filepath" >/dev/null 2>&1; then
                    echo "✅ Valid JSON format"
                    return 0
                else
                    echo "❌ Invalid JSON format"
                    rm "$filepath"
                    return 1
                fi
            else
                echo "⚠️  JSON validation skipped (jq not available)"
                return 0
            fi
        else
            echo "❌ Failed: Invalid file or 404 error"
            rm "$filepath" 2>/dev/null
            return 1
        fi
    else
        echo "❌ Failed: Download error"
        return 1
    fi
}

# Try downloading from each URL
echo "🚀 Starting downloads..."
success_count=0

for i in "${!urls[@]}"; do
    if download_file "${urls[$i]}" "${filenames[$i]}"; then
        ((success_count++))
    fi
    echo ""
done

echo "📊 Download Summary:"
echo "   Successful downloads: $success_count"
echo "   Available files:"
ls -la public/*.geojson | grep -v backups

if [ $success_count -eq 0 ]; then
    echo ""
    echo "⚠️  No files were successfully downloaded from GitHub repositories."
    echo "💡 Alternative options:"
    echo "   1. Use OpenStreetMap Overpass API"
    echo "   2. Check Philippine government data portals"
    echo "   3. Use your existing enhanced dataset and expand it"
    echo ""
    echo "🔧 You can also manually browse these repositories:"
    echo "   • https://github.com/faeldon/philippines-json-maps"
    echo "   • https://github.com/benjiao/philippine-boundaries"
fi

echo "✨ Download script completed!"

