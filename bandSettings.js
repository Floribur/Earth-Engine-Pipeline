/* ////////////////////////////////////////////////////
This file contains the following settings:
- Define texture bands combinations
- Define the Scales for the collections
*/ ////////////////////////////////////////////////////

// Texture band combinations
// These are in the format of NAME: ["Texture name", "Texture name 2"]
// The texture combination can be selected in the CONFIG under GLCM_COMBINATION
var GLCM_BAND_COMBINATION = {
  T1: [
    "ASM",
    "CONTRAST",
    "CORR",
    "VAR",
    "IDM",
    "SAVG",
    "SVAR",
    "SENT",
    "ENT",
    "DVAR",
    "DENT",
    "IMCORR1",
    "IMCORR2",
    "MAXCORR",
    "DISS",
    "INERTIA",
    "SHADE",
    "PROM",
  ],
  T2: ["ASM", "ENT", "INERTIA", "SHADE", "PROM"],
  T3: ["CONTRAST", "CORR", "VAR", "SAVG", "DISS"],
  T4: ["ASM", "CONTRAST", "VAR", "CORR", "ENT", "IDM"],
  NONE: [],
  NOTEXTURE: [],
};

var VEGETATION_INDEX_COMBINATION = {
  INDEX1: ["NDVI", "NDWI", "SAVI", "NDBI", "UI"], // EVI not included
  INDEX2: ["EVI"], // only EVI
  NONE: [],
  NOINDECES: [],
};

// These are the scales of the satelite images
// see https://developers.google.com/earth-engine/guides/scale for more information
var COLLECTION_SCALE = {
  LANDSAT: 30, // 30x30m image (mostly)
  SENTINEL: 10, // 10x10m image (mostly)
};

// Define Bands that are used to calculate the pearson correlation between each other
// Since the bands have different names, they have to be defined separatly for Landsat or Sentinel Analysis
var PEARSON_CORRELEATION_BANDS = {
  LANDSAT: [
    "SR_B1",
    "SR_B2",
    "SR_B3",
    "SR_B4",
    "SR_B5",
    "SR_B6",
    "SR_B7",
    "ST_B10",
  ],
  SENTINEL: [
    //"B1", // B1 was removed since it should not be used for landcover classification
    "B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
    "B8",
    "B9",
    "B11",
    "B12",
  ],
};

// The relevant bands are the bands for which the GLCM Bands (combinations) are computed
var GLCM_RELEVANT_BANDS = {
  LANDSAT: ["SR_B1", "SR_B5", "SR_B6"], //
  SENTINEL: ["B2", "B3", "B4"], //
};

// this lists contains all the bands, that are removed from the final image composition
// and not used for training and classifying
var BANDS_TO_BE_REMOVED = {
  LANDSAT: [
    // 'SR_B1', // used in GLCM Calculation. Should be a feature
    "SR_B2",
    "SR_B3",
    "SR_B4",
    //'SR_B5', // used in GLCM Calculation. Should be a feature
    //'SR_B6', // used in GLCM Calculation. Should be a feature
    "SR_B7",
    "ST_B10", // has to be removed. Has masked areas.
    "SR_QA_AEROSOL",
    "ST_ATRAN",
    "ST_CDIST",
    "ST_DRAD",
    "ST_EMIS", // has to be removed. Has masked areas.
    "ST_EMSD", // has to be removed. Has masked areas.
    "ST_QA", // has to be removed. Has masked areas.
    "ST_TRAD", // has to be removed. Has masked areas.
    "ST_URAD", // has to be removed. Has masked areas.
    "QA_PIXEL",
    "QA_RADSAT",
  ],
  // we keep B2, B8, and B12 as spectral bands for the analysis
  SENTINEL: [
    "B1",
    //"B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
    //'B8',
    "B8A",
    "B9",
    "B11",
    //"B12",
    "AOT",
    "WVP",
    "SCL",
    "TCI_R",
    "TCI_G",
    "TCI_B",
    "MSK_CLDPRB",
    "MSK_SNWPRB",
    "QA10",
    "QA20",
    "QA60",
  ],
};

// This function adds the above defined parameters to the global config
exports.addToConfig = function (CONFIG) {
  // VALUES BASED ON LANDSAT OR SENTINEL
  CONFIG.COLLECTION_SCALE = COLLECTION_SCALE[CONFIG.COLLECTION]; // set scale based on LANDSAT or SENTINEL
  CONFIG.GLCM_RELEVANT_BANDS = GLCM_RELEVANT_BANDS[CONFIG.COLLECTION]; // set bands based on LANDSAT or SENTINEL
  CONFIG.BANDS_TO_BE_REMOVED = BANDS_TO_BE_REMOVED[CONFIG.COLLECTION]; // set bands based on LANDSAT or SENTINEL
  CONFIG.PEARSON_CORRELEATION_BANDS =
    PEARSON_CORRELEATION_BANDS[CONFIG.COLLECTION]; // set bands LANDSAT or SENTINEL
  CONFIG.IS_SENTINEL = CONFIG.COLLECTION === "SENTINEL"; // set boolean true if collection is sentinel

  // based on GLCM_COMBINATION, get texture bands based on choice
  CONFIG.GLCM_BANDS_FILTER = GLCM_BAND_COMBINATION[CONFIG.GLCM_COMBINATION];
  CONFIG.VEGETATION_INDECES =
    VEGETATION_INDEX_COMBINATION[CONFIG.VEGETATION_INDEX_COMBINATION];

  return CONFIG;
};
