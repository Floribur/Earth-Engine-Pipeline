/* ////////////////////////////////////////////////////
    Contains helper functions for other operations
*/ ////////////////////////////////////////////////////

// Applies scaling factors for true color image
// https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_L2#bands
exports.applyScaleFactors = function (image) {
  var opticalBands = image.select("SR_B.").multiply(0.0000275).add(-0.2);
  var thermalBands = image.select("ST_B.*").multiply(0.00341802).add(149.0);
  return image
    .addBands(opticalBands, null, true)
    .addBands(thermalBands, null, true);
};

// Define a function that scales and masks Landsat 8 surface reflectance images
// taken from https://developers.google.com/earth-engine/guides/classification
exports.prepSrL8 = function (image) {
  // Develop masks for unwanted pixels (fill, cloud, cloud shadow).
  var qaMask = image.select("QA_PIXEL").bitwiseAnd(parseInt("11111", 2)).eq(0);
  var saturationMask = image.select("QA_RADSAT").eq(0);

  // Apply the scaling factors to the appropriate bands.
  var getFactorImg = function (factorNames) {
    var factorList = image.toDictionary().select(factorNames).values();
    return ee.Image.constant(factorList);
  };

  var scaleImg = getFactorImg([
    "REFLECTANCE_MULT_BAND_.|TEMPERATURE_MULT_BAND_ST_B10",
  ]);
  var offsetImg = getFactorImg([
    "REFLECTANCE_ADD_BAND_.|TEMPERATURE_ADD_BAND_ST_B10",
  ]);

  // choose all bands with prefix SR_B. or ST_B10 to aply scaling...
  var scaled = image.select("SR_B.|ST_B10").multiply(scaleImg).add(offsetImg);

  // Replace original bands with scaled bands and apply masks.
  return image
    .addBands(scaled, null, true) // activate overwrite
    .updateMask(qaMask)
    .updateMask(saturationMask);
};

// this function removes bands from an image
// returns the new image
exports.removeBands = function (image, listOfBandsToRemove) {
  var bandNames = image.bandNames();
  var bandsToKeep = bandNames.removeAll(listOfBandsToRemove);
  image = image.select(bandsToKeep);

  return image;
};

/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
exports.maskS2clouds = function (image) {
  var qa = image.select("QA60");

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa
    .bitwiseAnd(cloudBitMask)
    .eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  //return image.divide(10000); // without masking clouds
  return image.updateMask(mask).divide(10000); // with masking clouds
};

// creates a unique file name based on the parameters and year
exports.createFileName = function (prefix, CONFIG, disableSeed) {
  var vegetationCombination = getVegetationCombination(CONFIG);
  var bands = sumOfBands(CONFIG);
  var textureCombination = getTextureCombination(CONFIG, false);
  var date = "";
  if (CONFIG.YEAR) {
    date = ee.String("_YEAR-").cat(ee.Number(CONFIG.YEAR).format()); // format year to string.
  }

  // create file name based on inputs...
  var file_name = ee
    .String(prefix) // e.g., JM or IMAGE etc.
    .cat("_")
    .cat(textureCombination) // add texture combination
    .cat("_")
    .cat(vegetationCombination) // add number of vegetation indexes
    .cat("_Bands-")
    .cat(bands) // add number of bands
    .cat("_")
    .cat(CONFIG.COLLECTION) // add collection type
    .cat(date); // add date if year is present
  if (!disableSeed) {
    // add seeds to filename
    ee.String(file_name)
      .cat("_SplitSeed-")
      .cat(ee.Number(CONFIG.SPLIT_SEED).format()) // add seed used to split data
      .cat("_RFSeed-")
      .cat(ee.Number(CONFIG.RF_SEED).format()); // add seed used as input for RF training
  }

  return file_name.getInfo(); // bring file_name to client side!
};

// creates a unique folder name based on the parameters and year
exports.createFolderName = function (CONFIG) {
  var vegetationCombination = getVegetationCombination(CONFIG);
  var bands = sumOfBands(CONFIG);
  var textureCombination = getTextureCombination(CONFIG, true);

  // create file name based on inputs...
  var file_name = ee
    .String(CONFIG.REGION_NAME) // e.g., JM or IMAGE etc.
    .cat("/")
    .cat(textureCombination) // add texture combination
    .cat("/")
    .cat(vegetationCombination) // add number of vegetation indexes
    .cat("/Bands-")
    .cat(bands) // add number of bands
    .cat("/")
    .cat(CONFIG.COLLECTION); // add collection type
  return file_name.getInfo(); // bring file_name to client side!
};

// return vegetation combination name
function getVegetationCombination(CONFIG) {
  return CONFIG.VEGETATION_INDEX_COMBINATION;
  // deprecated: returns the number of vegetation indeces as a string
  //return ee.Number(CONFIG.VEGETATION_INDECES.length).format(); // return as STRING!
}

// calculate the number of bands based on the config for automatic file naming
function sumOfBands(CONFIG) {
  var sum = 0;
  sum = CONFIG.GLCM_RELEVANT_BANDS.length * CONFIG.GLCM_BANDS_FILTER.length; // add number of GLCM bands
  sum = CONFIG.VEGETATION_INDECES.length; // add number of indexes

  if (CONFIG.IS_SENTINEL) {
    // sentinel has 23 default bands
    sum = sum + (23 - CONFIG.BANDS_TO_BE_REMOVED.length);
  } else {
    // landsat has 19 default bands
    sum = sum + (19 - CONFIG.BANDS_TO_BE_REMOVED.length); // there are 19 default bands. Remove all bands that will be removed automatically in the composite
  }

  return ee.Number(sum).format(); // return as STRING!
}

function getTextureCombination(CONFIG, folder) {
  // add Texture Combination and Window Size if GLCM was used
  var textureName = CONFIG.GLCM_COMBINATION; // T1,T2,T3,T4 etc.
  var windowsizeGap = "_W-";
  if (folder) {
    // if folder, use other name
    windowsizeGap = "/WindowSize-";
  }
  textureName = ee
    .String(textureName)
    .cat(windowsizeGap)
    .cat(ee.Number(CONFIG.GLCM_WINDOW_SIZE).format()); // insert GLCM windowsize into filename

  return textureName;
}
