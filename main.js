/* ////////////////////////////////////////////////////
// IMPORT SCRIPTS
*/ ////////////////////////////////////////////////////
var compositeCreator = require("users/florianburkhardt/EEClassifierPipeline:createComposite.js");
var legend = require("users/florianburkhardt/EEClassifierPipeline:legend.js");
var bandSettings = require("users/florianburkhardt/EEClassifierPipeline:bandSettings.js");
var region = require("users/florianburkhardt/EEClassifierPipeline:region.js");
var dataPipeline = require("users/florianburkhardt/EEClassifierPipeline:dataPipeline.js");
var createClassification = require("users/florianburkhardt/EEClassifierPipeline:createClassification.js");
var helper = require("users/florianburkhardt/EEClassifierPipeline:helperFunctions.js");
var params = require("users/florianburkhardt/EEClassifierPipeline:params.js");

/* ////////////////////////////////////////////////////
// GLOBAL SETTINGS
// USER CAN / SHOULD CHANGE THESE
*/ ////////////////////////////////////////////////////

// This is the heart of the config and can be adjusted as you like it
// Every parameter is explained to its right.
// The notation X|Y|Z means that one of the values X, Y or Z should be inserted at that position.
// Don't delete parameters or set them to null if null is not one of the values described
var CONFIG = {
  // YEAR OF INTEREST
  YEAR: 2019, // e.g. 2019|2020, should be integer. Has to be defined!
  // REGION OF INTEREST
  REGION_NAME: "Pemba-Metuge", // "Pemba-Metuge" | "Montepuez" Name of the region
  REGION_LIST: ee.List(["MZ0104", "MZ0109"]), // ["MZ0104", "MZ0109"] | ["MZ0111"] Codes of the regions to be included. Has to be of type ee.List()
  REGION_LIST_COLUMN: "ADM2_PCODE", // The column in which to search for the REGION_LIST parameter. Standard: ADM2_PCODE
  REGION_SCALE: 9, // Scale of Map by default, 11 for Pemba-Metuge, 9 for Motenpuez (recommended)
  MAX_CLOUD_COVERAGE: 30, // int (percentage) of cloud coverage of region
  REGION: null, // Should be null, since it's set later automatically. (Region as type of geometry, based on input above).

  // IMAGE COLLECTION
  COLLECTION: "SENTINEL", // "LANDSAT" | "SENTINEL", whether to run the analysis using Landsat or Sentinel
  COLLECTION_SCALE: null, // leave null, will be calculated based on COLLECTION (Sentinel or Landsat)
  IS_SENTINEL: null, // leave null, will be calculated based on COLLECTION (Sentinel or Landsat). Result: true|false
  EXPORT_TRUE_COLOR: false, // true|false, if activated then you can export the resulting true color image via "tasks"

  // STATISTICAL ANALYSIS
  RUN_PEARSON_CORRELATION: false, // true|false, whether to run pearson correlation on bands
  PEARSON_CORRELEATION_BANDS: null, // leave null, will be calculated based on COLLECTION (Sentinel or Landsat)

  // CLASSIFICATION
  MAKE_CLASSIFICATION: false, // true|false, whether to run the classification
  CLASSIFIERTYPE: "RF", // CONFIG NOT FULLY IMPLEMENTED! - CART|SVM|RF, RF=default, which algorithm to run for the classification
  RANDOM_FOREST_TREES: 500, // number of trees to use for the random forest. Mamanze used 500
  FEATURE_COLLECTION_SPLIT: 0.7, // float between 0 and 1. A value of 0.7 means 70% will be training data, 30% validation data
  CLASSIFICATION_LABEL: "Landcover", // the label used for each class in the feature collection dataset
  FEATURE_COLLECTION_LIMIT: 50000, // Limit number of polygons per collection to this number (rarely used, should be high enough)
  EXPORT_INDIVIDUAL_CONFUSION_MATRIX: false, // true|false, whether to export the confusion matrices of the classification (for each seed 1 file)
  EXPORT_CONFUSION_MATRICES: true, // true|false, whether to export the confusion matrix of the classification (1 file containing all seeds)
  MAP_CLASSIFIED_IMAGE: false, // true|false, whether to add the classified image(s) as a layer to EE.
  EXPORT_CLASSIFIED_IMAGE: false, // true|false, whether to export the classified image

  // FEATURE SETTINGS
  VEGETATION_INDEX_COMBINATION: "NOINDECES", // the combinationa of vegetation indeces to consider when computing the composite image, e.g., INDEX1 or NOINDECES. Can be adjusted in bandSettings.js
  VEGETATION_INDECES: null, // leave null,  will automatically be calculated based on the
  GLCM_WINDOW_SIZE: 0, // integer > 0, normally 5,10,25,30. The size of the GLCM window
  GLCM_COMBINATION: "NOTEXTURE", // T1|T2|T3|T4|NOTEXTURE, chose which texture combination to use, see GLCM_BAND_COMBINATION in bandSettings.js.
  GLCM_BANDS_FILTER: null, // leave null, will be automatically calculated based on GLCM_COMBINATION
  GLCM_RELEVANT_BANDS: null, // leave null, will be automatically calculated based on the COLLECTION (Sentinel or Landsat)
  BANDS_TO_BE_REMOVED: null, // leave null, will automatically be calculated based on the COLLECTION (Sentinel or Landsat)

  // LOGGER SETTINGS (print to console)
  DRAW_TRAINING_SAMPLES: false, // true|false, whether to show the training polygons on the map
  SHOW_ACCUARCY: false, // true|false, wheteher to print the classification accuary to the console
  SHOW_REBSTITUTION_MATRIX: false, // true|false, whether to print the classification rebstitution matrix to the console
  EXPLAIN_CLASSIFIER: false, // true|false, whether to print the explaination of the trained classifier to the console
  CREATE_BAR_CHART: false, // true|false, whteher to draw the bar chart
  BAR_CHART_TYPE: "EXPORT", // CONSOLE|EXPORT draw bar chart to console or export it to google drive (not implemented yet)
  SHOW_CLASS_INDIVIDUALLY: false, // true|false, whether to add each classified class as an individual layer to the map
  DEACTIVATE_MAP_DRAWING: true, // true|false. Show or hide results on map (e.g. classification etc.) [note: this only hides all the layers. Users can still activate them later]
  SHOW_LEGENDS: false, // true|false. Show legends on the Map for classes and settings
  SHOW_NUMBER_OF_POLYGONS: false, // true|false. Whether to print the number of polygons and pixels to the console
  SHOW_COMPOSITE_IMAGE: false, // true|false, whether to "print" the composite image to the console
  SHOW_DATASET_SIZE: true, // true|false, whether to print the size of the dataset, trainingdata, and validation data to the console (in number of pixels)
  EXPORT_DATA_POLYGONS: false, // true|false, whether to export the training and validation polygons to TIFF
  PRINT_NUMBER_OF_IMAGES: false, // true|false, whether to print the number of images to the console that were combined (using median) in the composite creator

  // SEEDS FOR REPRODUCABILITY
  SPLIT_SEED: 9340, // INTEGER, either 0 or use a seed to create reproducable results. Used to split data into training and validation set. // used before: 9340
  RF_SEEDS: [
    6781, 1583, 4387, 6621, 5457, 5256, 4427, 7932, 1993, 1993, 7336, 6908,
    1465, 5781, 3930, 1870, 1501, 4064, 2780, 5153,
  ], // type list [], default in our analysis is [6781, 1583, 4387, 6621, 5457, 5256, 4427, 7932, 1993, 1993, 7336, 6908,1465, 5781, 3930, 1870, 1501, 4064, 2780, 5153,]
  RF_SEED: 0, // INTEGER, will be set automatically based on RF_SEEDS List
};

/* ////////////////////////////////////////////////////
DYNAMICALLY LOAD CORRECT PARAMETERS BASED ON SETTINGS
- add correct bands (sentinel vs landsat)
- get region of interest
*/ ////////////////////////////////////////////////////

CONFIG = bandSettings.addToConfig(CONFIG);
CONFIG.REGION = region.getRegions(CONFIG);

/* ////////////////////////////////////////////////////
// Create image composites based on settings
*/ ////////////////////////////////////////////////////

// Create Composite Image
var composite = compositeCreator.run(CONFIG, CONFIG.YEAR);
print(composite);

// Prepare Dataset and map it onto the composite image
var dataset = dataPipeline.prepareData(CONFIG, composite);
//print(dataset);
// returns object of type {trainingData, validationData}

// Run Classification
if (CONFIG.MAKE_CLASSIFICATION) {
  var classification = createClassification.run(
    CONFIG,
    dataset,
    composite,
    helper,
    params
  );
  //print(classification);
}

/* ////////////////////////////////////////////////////
// SHOW LEGEND 
*/ ////////////////////////////////////////////////////

if (CONFIG.SHOW_LEGENDS) {
  legend.showClasses(CONFIG, params);
  legend.showConfig(CONFIG);
}
