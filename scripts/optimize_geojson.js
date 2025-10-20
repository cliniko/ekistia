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
  console.error('Usage: node optimize_geojson.js <input-file> <output-file> [precision] [simplify-tolerance]');
  console.error('Example: node optimize_geojson.js input.geojson output.geojson 3 0.0001');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];
const precision = parseInt(args[2]) || 3; // Default to 3 decimal places (~111m accuracy) for SAFDZ
const simplifyTolerance = parseFloat(args[3]) || 0.0001; // Default tolerance for simplification

console.log(`🔧 Optimizing GeoJSON file: ${inputFile}`);
console.log(`📍 Coordinate precision: ${precision} decimal places`);
console.log(`📐 Simplify tolerance: ${simplifyTolerance}`);

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

// Douglas-Peucker line simplification algorithm
function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points;

  // Find the point with the maximum distance
  let maxDistance = 0;
  let maxIndex = 0;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const point = points[i];
    const distance = perpendicularDistance(point, firstPoint, lastPoint);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const leftPoints = douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const rightPoints = douglasPeucker(points.slice(maxIndex), tolerance);

    // Combine results (remove duplicate point at junction)
    return leftPoints.concat(rightPoints.slice(1));
  } else {
    // Return only the endpoints
    return [firstPoint, lastPoint];
  }
}

// Calculate perpendicular distance from point to line
function perpendicularDistance(point, lineStart, lineEnd) {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

  return denominator === 0 ? 0 : numerator / denominator;
}

// Simplify polygon rings
function simplifyPolygonRing(ring, tolerance) {
  // Close the ring if it's not already closed
  if (ring.length > 1 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
    ring = [...ring, ring[0]];
  }

  const simplified = douglasPeucker(ring, tolerance);

  // Ensure the ring is still closed
  if (simplified.length > 1 && (simplified[0][0] !== simplified[simplified.length - 1][0] || simplified[0][1] !== simplified[simplified.length - 1][1])) {
    simplified.push(simplified[0]);
  }

  return simplified;
}

// Optimize coordinates recursively with simplification
function optimizeCoordinates(coords, level = 0) {
  if (Array.isArray(coords)) {
    // Check if this is a coordinate pair [lon, lat] or [lon, lat, elevation]
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      // This is a coordinate pair - reduce precision and remove elevation
      return [
        parseFloat(coords[0].toFixed(precision)),
        parseFloat(coords[1].toFixed(precision))
      ];
    } else {
      // This is an array of coordinate arrays
      let optimized = coords.map(coord => optimizeCoordinates(coord, level + 1));

      // Apply simplification at the ring level (level 2 = polygon rings)
      if (level === 2 && optimized.length > 3) {
        optimized = simplifyPolygonRing(optimized, simplifyTolerance);
      }

      return optimized;
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

