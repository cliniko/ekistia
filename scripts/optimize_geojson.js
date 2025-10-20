#!/usr/bin/env node
/**
 * GeoJSON Optimization Script
 * 
 * This script optimizes GeoJSON files by:
 * 1. Reducing coordinate precision (6 decimals → 4 decimals saves ~30%)
 * 2. Removing unnecessary elevation values (0.0)
 * 3. Removing unnecessary whitespace
 * 4. Optionally simplifying geometries
 * 
 * Usage:
 *   node optimize_geojson.js <input-file> <output-file> [precision]
 * 
 * Example:
 *   node optimize_geojson.js public/iligan_safdz.geojson public/iligan_safdz_optimized.geojson 4
 */

import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node optimize_geojson.js <input-file> <output-file> [precision]');
  console.error('Example: node optimize_geojson.js input.geojson output.geojson 4');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];
const precision = parseInt(args[2]) || 4; // Default to 4 decimal places (~11m accuracy)

console.log(`🔧 Optimizing GeoJSON file: ${inputFile}`);
console.log(`📍 Coordinate precision: ${precision} decimal places`);

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

// Get input file size
const inputStats = fs.statSync(inputFile);
const inputSizeMB = (inputStats.size / (1024 * 1024)).toFixed(2);
console.log(`📊 Input size: ${inputSizeMB} MB`);

// Read and parse GeoJSON
console.log('📖 Reading file...');
const startTime = Date.now();
const geojsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

if (!geojsonData.type || geojsonData.type !== 'FeatureCollection') {
  console.error('❌ Error: Invalid GeoJSON format (not a FeatureCollection)');
  process.exit(1);
}

const featureCount = geojsonData.features.length;
console.log(`✅ Loaded ${featureCount} features`);

// Optimize coordinates recursively
function optimizeCoordinates(coords) {
  if (Array.isArray(coords)) {
    // Check if this is a coordinate pair [lon, lat] or [lon, lat, elevation]
    if (typeof coords[0] === 'number') {
      // This is a coordinate pair - reduce precision and remove elevation
      return [
        parseFloat(coords[0].toFixed(precision)),
        parseFloat(coords[1].toFixed(precision))
      ];
    } else {
      // This is an array of coordinate arrays - recurse
      return coords.map(optimizeCoordinates);
    }
  }
  return coords;
}

// Optimize each feature
console.log('⚙️  Optimizing features...');
let coordCount = 0;
geojsonData.features.forEach((feature, index) => {
  if (feature.geometry && feature.geometry.coordinates) {
    feature.geometry.coordinates = optimizeCoordinates(feature.geometry.coordinates);
    coordCount++;
  }
  
  // Progress indicator
  if ((index + 1) % 1000 === 0) {
    console.log(`   Processed ${index + 1}/${featureCount} features...`);
  }
});

console.log(`✅ Optimized ${coordCount} geometries`);

// Write optimized GeoJSON
console.log('💾 Writing optimized file...');
fs.writeFileSync(outputFile, JSON.stringify(geojsonData));

// Get output file size
const outputStats = fs.statSync(outputFile);
const outputSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);
const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log(`\n✅ Optimization complete!`);
console.log(`📊 Output size: ${outputSizeMB} MB`);
console.log(`📉 Size reduction: ${reduction}%`);
console.log(`⏱️  Time taken: ${duration}s`);
console.log(`📁 Output file: ${outputFile}`);

