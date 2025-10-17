// ============================================
// ILIGAN CITY CROP SUITABILITY ANALYSIS
// For Ekistia Platform Integration
// Google Earth Engine Script
// ============================================
//
// Run this script in Google Earth Engine Code Editor:
// https://code.earthengine.google.com/
//
// This will generate crop-specific suitability layers
// for the Iligan City area that can be integrated into Ekistia

// Define your exact coverage area
var ekistiaArea = ee.Geometry.Rectangle([
    124.10, 8.05,  // Southwest corner (Linamon area)
    124.50, 8.45   // Northeast corner (Tubaran/Digkilaan area)
]);

// Load AlphaEarth 2024
var dataset = ee.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL');
var alphaEarth2024 = dataset
    .filterDate('2024-01-01', '2024-12-31')
    .filterBounds(ekistiaArea)
    .first();

// ============================================
// LAYER 1: RICE SUITABILITY
// ============================================
var riceBands = alphaEarth2024.select(['A01', 'A05', 'A09', 'A15', 'A21']);

var riceSuitability = riceBands.expression(
    '(A01 * 0.25) + (A05 * 0.25) + (A09 * 0.20) + (A15 * 0.20) + (A21 * 0.10)',
    {
        'A01': riceBands.select('A01'),  // Vegetation vigor
        'A05': riceBands.select('A05'),  // Biomass
        'A09': riceBands.select('A09'),  // Moisture
        'A15': riceBands.select('A15'),  // Water access
        'A21': riceBands.select('A21')   // Soil texture
    }
);

// Classify rice suitability
var riceClasses = riceSuitability
    .where(riceSuitability.lt(-0.1), 1)   // Not suitable
    .where(riceSuitability.gte(-0.1).and(riceSuitability.lt(0.05)), 2)  // Marginal
    .where(riceSuitability.gte(0.05).and(riceSuitability.lt(0.15)), 3)  // Suitable
    .where(riceSuitability.gte(0.15), 4);  // Highly suitable

Map.addLayer(riceClasses, {
    min: 1, max: 4,
    palette: ['#d73027', '#fee08b', '#d9ef8b', '#1a9850']
}, 'Rice Suitability');

// Export for Ekistia
Export.image.toDrive({
    image: riceClasses,
    description: 'Ekistia_Rice_Suitability',
    region: ekistiaArea,
    scale: 10,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
});

// ============================================
// LAYER 2: CORN SUITABILITY
// ============================================
var cornBands = alphaEarth2024.select(['A01', 'A03', 'A10', 'A16', 'A25']);

var cornSuitability = cornBands.expression(
    '(A01 * 0.20) + (A03 * 0.25) + (A10 * 0.20) + (A16 * 0.20) + (A25 * 0.15)',
    {
        'A01': cornBands.select('A01'),  // Vegetation
        'A03': cornBands.select('A03'),  // Growth pattern
        'A10': cornBands.select('A10'),  // Biomass structure
        'A16': cornBands.select('A16'),  // Texture (corn rows)
        'A25': cornBands.select('A25')   // Soil conditions
    }
);

var cornClasses = cornSuitability
    .where(cornSuitability.lt(-0.05), 1)
    .where(cornSuitability.gte(-0.05).and(cornSuitability.lt(0.08)), 2)
    .where(cornSuitability.gte(0.08).and(cornSuitability.lt(0.18)), 3)
    .where(cornSuitability.gte(0.18), 4);

Map.addLayer(cornClasses, {
    min: 1, max: 4,
    palette: ['#8c510a', '#d8b365', '#f6e8c3', '#5ab4ac']
}, 'Corn Suitability');

Export.image.toDrive({
    image: cornClasses,
    description: 'Ekistia_Corn_Suitability',
    region: ekistiaArea,
    scale: 10,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
});

// ============================================
// LAYER 3: COCONUT SUITABILITY
// ============================================
var coconutBands = alphaEarth2024.select(['A01', 'A16', 'A20', 'A32', 'A40']);

var coconutSuitability = coconutBands.expression(
    '(A01 * 0.15) + (A16 * 0.25) + (A20 * 0.25) + (A32 * 0.20) + (A40 * 0.15)',
    {
        'A01': coconutBands.select('A01'),  // Perennial vegetation
        'A16': coconutBands.select('A16'),  // Tree structure
        'A20': coconutBands.select('A20'),  // Canopy pattern
        'A32': coconutBands.select('A32'),  // Spacing/texture
        'A40': coconutBands.select('A40')   // Long-term stability
    }
);

var coconutClasses = coconutSuitability
    .where(coconutSuitability.lt(0.0), 1)
    .where(coconutSuitability.gte(0.0).and(coconutSuitability.lt(0.10)), 2)
    .where(coconutSuitability.gte(0.10).and(coconutSuitability.lt(0.20)), 3)
    .where(coconutSuitability.gte(0.20), 4);

Map.addLayer(coconutClasses, {
    min: 1, max: 4,
    palette: ['#8c6bb1', '#9ebcda', '#8dd3c7', '#006d2c']
}, 'Coconut Suitability');

Export.image.toDrive({
    image: coconutClasses,
    description: 'Ekistia_Coconut_Suitability',
    region: ekistiaArea,
    scale: 10,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
});

// ============================================
// LAYER 4: CACAO SUITABILITY
// ============================================
var cacaoBands = alphaEarth2024.select(['A10', 'A16', 'A25', 'A32', 'A48']);

var cacaoSuitability = cacaoBands.expression(
    '(A10 * 0.20) + (A16 * 0.25) + (A25 * 0.20) + (A32 * 0.20) + (A48 * 0.15)',
    {
        'A10': cacaoBands.select('A10'),  // Elevation signature
        'A16': cacaoBands.select('A16'),  // Slope texture
        'A25': cacaoBands.select('A25'),  // Soil quality
        'A32': cacaoBands.select('A32'),  // Microclimate
        'A48': cacaoBands.select('A48')   // Tree crop pattern
    }
);

var cacaoClasses = cacaoSuitability
    .where(cacaoSuitability.lt(-0.05), 1)
    .where(cacaoSuitability.gte(-0.05).and(cacaoSuitability.lt(0.05)), 2)
    .where(cacaoSuitability.gte(0.05).and(cacaoSuitability.lt(0.15)), 3)
    .where(cacaoSuitability.gte(0.15), 4);

Map.addLayer(cacaoClasses, {
    min: 1, max: 4,
    palette: ['#f4a582', '#fddbc7', '#d1e5f0', '#0571b0']
}, 'Cacao Suitability');

Export.image.toDrive({
    image: cacaoClasses,
    description: 'Ekistia_Cacao_Suitability',
    region: ekistiaArea,
    scale: 10,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
});

// ============================================
// LAYER 5: BANANA SUITABILITY
// ============================================
var bananaBands = alphaEarth2024.select(['A01', 'A05', 'A09', 'A15', 'A20']);

var bananaSuitability = bananaBands.expression(
    '(A01 * 0.25) + (A05 * 0.25) + (A09 * 0.20) + (A15 * 0.20) + (A20 * 0.10)',
    {
        'A01': bananaBands.select('A01'),  // Vegetation vigor
        'A05': bananaBands.select('A05'),  // Biomass
        'A09': bananaBands.select('A09'),  // Moisture
        'A15': bananaBands.select('A15'),  // Water access
        'A20': bananaBands.select('A20')   // Canopy pattern
    }
);

var bananaClasses = bananaSuitability
    .where(bananaSuitability.lt(0.0), 1)
    .where(bananaSuitability.gte(0.0).and(bananaSuitability.lt(0.10)), 2)
    .where(bananaSuitability.gte(0.10).and(bananaSuitability.lt(0.20)), 3)
    .where(bananaSuitability.gte(0.20), 4);

Map.addLayer(bananaClasses, {
    min: 1, max: 4,
    palette: ['#762a83', '#af8dc3', '#e7d4e8', '#1b7837']
}, 'Banana Suitability');

Export.image.toDrive({
    image: bananaClasses,
    description: 'Ekistia_Banana_Suitability',
    region: ekistiaArea,
    scale: 10,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
});

// ============================================
// LAYER 6: MANGO SUITABILITY
// ============================================
var mangoBands = alphaEarth2024.select(['A03', 'A16', 'A25', 'A32', 'A40']);

var mangoSuitability = mangoBands.expression(
    '(A03 * 0.20) + (A16 * 0.25) + (A25 * 0.25) + (A32 * 0.15) + (A40 * 0.15)',
    {
        'A03': mangoBands.select('A03'),   // Growth pattern
        'A16': mangoBands.select('A16'),   // Tree structure
        'A25': mangoBands.select('A25'),   // Soil conditions
        'A32': mangoBands.select('A32'),   // Spacing
        'A40': mangoBands.select('A40')    // Perennial stability
    }
);

var mangoClasses = mangoSuitability
    .where(mangoSuitability.lt(-0.05), 1)
    .where(mangoSuitability.gte(-0.05).and(mangoSuitability.lt(0.05)), 2)
    .where(mangoSuitability.gte(0.05).and(mangoSuitability.lt(0.15)), 3)
    .where(mangoSuitability.gte(0.15), 4);

Map.addLayer(mangoClasses, {
    min: 1, max: 4,
    palette: ['#b2182b', '#f4a582', '#92c5de', '#2166ac']
}, 'Mango Suitability');

Export.image.toDrive({
    image: mangoClasses,
    description: 'Ekistia_Mango_Suitability',
    region: ekistiaArea,
    scale: 10,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
});

// ============================================
// LAYER 7: CURRENT CROP TYPE DETECTION
// ============================================
var allCropBands = alphaEarth2024.select([
    'A01', 'A03', 'A05', 'A09', 'A10',
    'A15', 'A16', 'A20', 'A25', 'A32'
]);

// Use unsupervised clustering to detect current crop patterns
var currentCrops = ee.Algorithms.Image.Segmentation.KMeans({
    image: allCropBands,
    numClusters: 12,  // Rice, Corn, Coconut, Forest, Urban, Water, etc.
    iterations: 25
});

Map.addLayer(currentCrops.randomVisualizer(), {}, 'Current Crop Detection');

Export.image.toDrive({
    image: currentCrops,
    description: 'Ekistia_Current_Crops_2024',
    region: ekistiaArea,
    scale: 10,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
});

// ============================================
// LAYER 8: INVESTMENT PRIORITY ZONES
// ============================================
// Combine all suitability scores
var investmentScore = ee.Image([
    riceClasses.multiply(0.20).rename('rice'),
    cornClasses.multiply(0.15).rename('corn'),
    coconutClasses.multiply(0.15).rename('coconut'),
    cacaoClasses.multiply(0.20).rename('cacao'),
    bananaClasses.multiply(0.15).rename('banana'),
    mangoClasses.multiply(0.15).rename('mango')
]).reduce(ee.Reducer.sum());

var investmentZones = investmentScore
    .where(investmentScore.lt(8), 1)    // Low priority
    .where(investmentScore.gte(8).and(investmentScore.lt(12)), 2)   // Medium
    .where(investmentScore.gte(12).and(investmentScore.lt(16)), 3)  // High
    .where(investmentScore.gte(16), 4);  // Very High

Map.addLayer(investmentZones, {
    min: 1, max: 4,
    palette: ['#fee5d9', '#fcae91', '#fb6a4a', '#cb181d']
}, 'Investment Priority Zones');

Export.image.toDrive({
    image: investmentZones,
    description: 'Ekistia_Investment_Priority',
    region: ekistiaArea,
    scale: 10,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
});

// ============================================
// STATISTICS FOR EKISTIA DASHBOARD
// ============================================
var stats = {
    rice: riceClasses,
    corn: cornClasses,
    coconut: coconutClasses,
    cacao: cacaoClasses,
    banana: bananaClasses,
    mango: mangoClasses
};

// Calculate area for each suitability class
Object.keys(stats).forEach(function(crop) {
    var areas = stats[crop].eq(4)  // Highly suitable areas
        .multiply(ee.Image.pixelArea())
        .divide(10000)  // Convert to hectares
        .reduceRegion({
            reducer: ee.Reducer.sum(),
            geometry: ekistiaArea,
            scale: 100,
            maxPixels: 1e13
        });

    print(crop + ' - Highly Suitable Area (ha):', areas);
});

// Calculate statistics for all suitability levels
Object.keys(stats).forEach(function(crop) {
    print('--- ' + crop.toUpperCase() + ' STATISTICS ---');

    for (var i = 1; i <= 4; i++) {
        var className = ['Not Suitable', 'Marginal', 'Suitable', 'Highly Suitable'][i-1];
        var area = stats[crop].eq(i)
            .multiply(ee.Image.pixelArea())
            .divide(10000)
            .reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: ekistiaArea,
                scale: 100,
                maxPixels: 1e13
            });

        print('  ' + className + ':', area);
    }
});

// Center map on Iligan
Map.centerObject(ekistiaArea, 11);
Map.setOptions('SATELLITE');

// ============================================
// EXPORT INSTRUCTIONS
// ============================================
print('');
print('=====================================');
print('EXPORT INSTRUCTIONS FOR EKISTIA');
print('=====================================');
print('');
print('1. Click "Tasks" tab in the right panel');
print('2. Run each export task (9 total)');
print('3. GeoTIFF files will be saved to Google Drive');
print('4. Upload to Mapbox Studio as tilesets');
print('5. Update Ekistia configuration with tileset IDs');
print('');
print('Expected exports:');
print('  - Ekistia_Rice_Suitability');
print('  - Ekistia_Corn_Suitability');
print('  - Ekistia_Coconut_Suitability');
print('  - Ekistia_Cacao_Suitability');
print('  - Ekistia_Banana_Suitability');
print('  - Ekistia_Mango_Suitability');
print('  - Ekistia_Current_Crops_2024');
print('  - Ekistia_Investment_Priority');
print('');
