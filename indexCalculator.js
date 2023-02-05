/* ////////////////////////////////////////////////////
This file contains the script to calcualte different indeces based on a collection input
*/ ////////////////////////////////////////////////////

var BANDS = {
  LANDSAT: {
    NIR: "SR_B5",
    GREEN: "SR_B3",
    RED: "SR_B4",
    BLUE: "SR_B2",
    SWIR: "SR_B6",
  },
  SENTINEL: {
    NIR: "B8",
    GREEN: "B3",
    RED: "B4",
    BLUE: "B2",
    SWIR: "B11",
    REDEDGE1: "B5",
    REDEDGE3: "B7",
  },
};

// Calculate Normalized Difference Vegetation Index (NDVI) using normalized difference
// Formula: NDVI = (NIR - red) / (NIR + red)
// https://www.usgs.gov/landsat-missions/landsat-normalized-difference-vegetation-index
var NDVI = function (image, collectionBands, CONFIG) {
  var expression = "(NIR - RED) / (NIR + RED)"; // formula
  var NDVI = ee
    .Image()
    .expression({
      expression: expression,
      map: {
        NIR: image.select(collectionBands["NIR"]),
        RED: image.select(collectionBands["RED"]),
      },
    })
    .rename("NDVI");
  return NDVI;
};

// Calculate Normalized Difference Water Index (NDWI) using normalized difference
// Formula: NDWI = (Green - NIR) / (Green + NIR) (based on formula from McFeeters 1996, used by Mananze)
var NDWI = function (image, collectionBands, CONFIG) {
  var expression = "(GREEN - NIR) / (GREEN + NIR)"; // formula
  var NDWI = ee
    .Image()
    .expression({
      expression: expression,
      map: {
        NIR: image.select(collectionBands["NIR"]),
        GREEN: image.select(collectionBands["GREEN"]),
      },
    })
    .rename("NDWI");
  return NDWI;
};

// Enhanced Vegetation Index (EVI)
// Formula: G * ( (NIR - Red) / (NIR + C1 * RED - C2 * BLUE + L) )
// https://www.usgs.gov/landsat-missions/landsat-enhanced-vegetation-index for Landsat 8 usage of formula
var EVI = function (image, collectionBands, CONFIG) {
  // G, C1, C2, and L are the same for Landsat-8 as for Sentinel-2

  var expression = "G * ( (NIR - RED) / (NIR + C1 * RED - C2 * BLUE + L) )";
  var EVI = ee
    .Image()
    .expression({
      expression: expression,
      map: {
        NIR: image.select(collectionBands["NIR"]),
        RED: image.select(collectionBands["RED"]),
        BLUE: image.select(collectionBands["BLUE"]),
        G: 2.5,
        C1: 6,
        C2: 7.5,
        L: 1,
      },
    })
    .rename("EVI");
  return EVI;
};

// Soil Adjusted Vegetation Index (SAVI)
// Formula ((NIR - R) / (NIR + R + L)) * (1 + L)
// see https://www.usgs.gov/landsat-missions/landsat-soil-adjusted-vegetation-index for landsat 8
var SAVI = function (image, collectionBands, CONFIG) {
  var expression = "( (NIR - RED) / (NIR + RED + L) ) * (1 + L)";
  var SAVI = ee
    .Image()
    .expression({
      expression: expression,
      map: {
        NIR: image.select(collectionBands["NIR"]),
        RED: image.select(collectionBands["RED"]),
        L: 0.5,
      },
    })
    .rename("SAVI");
  return SAVI;
};

// Normalized Difference Built-up Index
// NDBI = (SWIR - NIR) / (SWIR + NIR)
// Sentinel (B11−B8)/(B11+B8)
// formula from https://www.mdpi.com/2072-4292/14/20/5130
var NDBI = function (image, collectionBands, CONFIG) {
  var expression = "(SWIR - NIR) / (SWIR + NIR)";
  var NDBI = ee
    .Image()
    .expression({
      expression: expression,
      map: {
        SWIR: image.select(collectionBands["SWIR"]),
        NIR: image.select(collectionBands["NIR"]),
      },
    })
    .rename("NDBI");
  return NDBI;
};

// Urban Index (UI)
// UI = (Red Edge 3 - Red Edge 1) / (Red Edge 3 + Red Edge 1)
// In Sentinel: (B7−B5)/(B7+B5)
// This Index does not exist in Landsat. Only able to be calculated for SENTINEL
var UI = function (image, collectionBands, CONFIG) {
  if (CONFIG.IS_SENTINEL) {
    var expression = "(RE3 - RE1) / (RE3 + RE1)";
    var UI = ee
      .Image()
      .expression({
        expression: expression,
        map: {
          RE1: image.select(collectionBands["REDEDGE1"]),
          RE3: image.select(collectionBands["REDEDGE3"]),
        },
      })
      .rename("UI");
    return UI;
  } else {
    // This Index does not exist in Landsat and will not be calculated there -> only for Sentinel.
    return null;
  }
};

// Define the functions based on a key
var INDECES = {
  NDVI: NDVI,
  NDWI: NDWI,
  EVI: EVI,
  SAVI: SAVI,
  NDBI: NDBI,
  UI: UI,
};

exports.calculateIndex = function (CONFIG, collection, indexName) {
  var collectionBands = BANDS[CONFIG.COLLECTION];
  var indexFunction = INDECES[indexName];
  var index = indexFunction(collection, collectionBands, CONFIG);
  return index;
};
