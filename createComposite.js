/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var landsatCollection = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2"),
  sentinelColleciton = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/* ////////////////////////////////////////////////////
// Import Script Modules from this repo
*/ ////////////////////////////////////////////////////
var indexCalculator = require("users/florianburkhardt/EEClassifierPipeline:indexCalculator.js");
var params = require("users/florianburkhardt/EEClassifierPipeline:params.js");
var helper = require("users/florianburkhardt/EEClassifierPipeline:helperFunctions.js");
var GLCMCalculator = require("users/florianburkhardt/EEClassifierPipeline:GLCMCalculator.js");

// this function will get the collection (sentinel or landsat) and apply the necessary pre processing
var prepareCollection = function (CONFIG) {
  // Init Variables
  var collection;
  var glcm_collection;

  // Create start and enddate based on year in config
  var startDate = ee.Date(CONFIG.YEAR + "-01-01");
  var endDate = ee.Date(CONFIG.YEAR + "-12-31");

  // get Sentinel or Landsat Image Collection depending on input parameter configuration
  if (CONFIG.IS_SENTINEL) {
    // Get Sentinel Imagery
    collection = sentinelColleciton
      .filterDate(startDate, endDate)
      .filter(
        ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", CONFIG.MAX_CLOUD_COVERAGE)
      ); // Pre-filter to get less cloudy granules.

    if (CONFIG.PRINT_NUMBER_OF_IMAGES) {
      // creates an image with the number of unmasked pixels
      var number_unmasked_pixels = collection.select("B1").count();

      // count pixels at poi
      var unmasked_pixels_poi = number_unmasked_pixels.reduceRegion(
        ee.Reducer.first(),
        CONFIG.REGION,
        CONFIG.COLLECTION_SCALE,
        null,
        null,
        true
      );

      print(
        "Number of unmasked pixels in the selected region: ",
        unmasked_pixels_poi
      );
      //print(collection.toArray());
    }

    // since the GLCM bands depend on the zoom factor, we don't apply any scaling to them...
    glcm_collection = collection.median();

    // add scaling to collection and mask clouds
    collection = collection
      .map(helper.maskS2clouds) // either mask clouds or divide to scale
      .median()
      //.divide(10000) // either mask clouds or use this to scale the image properly
      .set("system:time_start", startDate.millis()); // set start date as time-start for image
  } else {
    // LANDSAT in all other cases

    // prepare collection
    collection = landsatCollection
      .filterBounds(CONFIG.REGION)
      .filterDate(startDate, endDate) // now it takes the dates from the input parameters
      //.sort('CLOUD_COVER', false) // sort the images by the cloud cover..., not used
      .filterMetadata("CLOUD_COVER", "less_than", CONFIG.MAX_CLOUD_COVERAGE); // only get images with cloud coverage < config
    //.clip(CONFIG.REGION) // not used, moved to later usage in the script according to best practices proposed by the documentation.

    if (CONFIG.PRINT_NUMBER_OF_IMAGES) {
      print(collection.toArray());
    }

    // since the GLCM bands depend on the zoom factor, we don't apply any scaling to them...
    glcm_collection = collection.median();

    // add scaling to collection and mask clouds
    collection = collection
      .map(helper.prepSrL8) // using the google scale and masking clouds script
      .median()
      .set("system:time_start", startDate.millis()); // set start date as time-start for image
  }

  return [collection, glcm_collection];
};

// Calcualte Pearson Correlation and Print to console
var calculatePearsonCorrelation = function (CONFIG, collection) {
  if (CONFIG.RUN_PEARSON_CORRELATION) {
    var PCBands = CONFIG.PEARSON_CORRELEATION_BANDS;
    for (var i = 0; i < PCBands.length; ++i) {
      // for each default band
      for (var j = 0; j < PCBands.length; ++j) {
        // compare it with another default band
        if (i < j) {
          // instead of i != j to remove duplicates
          var inputImage = collection.select([PCBands[i], PCBands[j]]); // comapre the two bands
          var correlation = inputImage.reduceRegion({
            reducer: ee.Reducer.pearsonsCorrelation(),
            geometry: CONFIG.REGION,
            scale: CONFIG.COLLECTION_SCALE,
            //maxPixels: 2000000000, // activate if necessary
            bestEffort: true,
          });
          // objects contains "correlation" and "p-value".
          print(
            "Correlation for:",
            inputImage.bandNames(),
            correlation,
            ee.Dictionary(correlation).get("correlation")
          );
        }
      }
    }
  }
};

// This function calculates the vegetation indeces based on the list in CONFIG.VEGETATION_INDEXES
var calculateVegetationIndeces = function (CONFIG, collection) {
  // go through list of vegetation indeces to compute
  // add each to collection
  for (var i = 0; i < CONFIG.VEGETATION_INDECES.length; i++) {
    var indexName = CONFIG.VEGETATION_INDECES[i]; // get name of index from list
    var index = indexCalculator.calculateIndex(CONFIG, collection, indexName); // calculate index
    var indexBands = ee.Image([index]);
    collection = collection.addBands(indexBands); // add to collection
  }

  return collection;
};

// Function to draw the indeces to the map in the earth engine (hidden)
var mapIndeces = function (CONFIG, composite, prefix) {
  for (var i = 0; i < CONFIG.VEGETATION_INDECES.length; i++) {
    var indexName = CONFIG.VEGETATION_INDECES[i]; // get name of index from list

    Map.addLayer(
      composite.clip(CONFIG.REGION),
      params.getParams(CONFIG, indexName),
      prefix + indexName,
      false // hide index
    );
  }
};

// export and add true color image to map in EE as a layer
var mapTrueColor = function (CONFIG, collection, prefix) {
  // We can export the true color image to the drive
  if (CONFIG.EXPORT_TRUE_COLOR) {
    var bands = ["SR_B4", "SR_B3", "SR_B2"];
    if (CONFIG.IS_SENTINEL) {
      bands = ["B4", "B3", "B2"];
    }
    Export.image.toDrive({
      image: collection.select(bands),
      description: "TrueColor-Image",
      region: CONFIG.REGION,
      scale: CONFIG.COLLECTION_SCALE,
      skipEmptyTiles: true, // skip masked regions
      fileFormat: "GeoTIFF",
      maxPixels: 10000000000000,
    });
  }

  // show true color on map
  Map.addLayer(
    collection.clip(CONFIG.REGION),
    params.getParams(CONFIG, "TRUECOLOR"),
    prefix + "True Color",
    !CONFIG.DEACTIVATE_MAP_DRAWING && true
  );
};

// the following function create a image composite based on the Input data
exports.run = function (CONFIG) {
  var prefix = CONFIG.YEAR + "_";

  /* ////////////////////////////////////////////////////
  // Create Satellite Collection
  */ ////////////////////////////////////////////////////

  var collectionList = prepareCollection(CONFIG);
  var collection = collectionList[0];
  var glcm_collection = collectionList[1];

  /* ////////////////////////////////////////////////////
  // Calculate Pearson Correlation for this collection
  */ ////////////////////////////////////////////////////

  calculatePearsonCorrelation(CONFIG, collection);

  /* ////////////////////////////////////////////////////
  // CALCULATE GLCM Textures and add to COLLECTION Bands
  */ ////////////////////////////////////////////////////

  // Only calculate texture bands if necessary
  if (
    CONFIG.GLCM_COMBINATION != "NONE" &&
    CONFIG.GLCM_COMBINATION != "NOTEXTURE"
  ) {
    // calculate GLCM Bands
    var GLCMBands = GLCMCalculator.createTextureBands(
      glcm_collection,
      CONFIG,
      helper
    ); // using glcm_collection as input bands / image collection

    // Add GLCM Bands to collection image
    collection = collection.addBands(GLCMBands); // add the newly calcualted glcm bands to collection
  }

  /* ////////////////////////////////////////////////////
  // CALCULATE INDEXES and add to COLLECTION Bands
  */ ////////////////////////////////////////////////////

  collection = calculateVegetationIndeces(CONFIG, collection);

  /* ////////////////////////////////////////////////////
  // Remove unused bands and calculate final composite image that can be used for training
  */ ////////////////////////////////////////////////////

  // Final Composite Image, remove bands we don't want to use as input!
  var compositeImage = helper.removeBands(
    collection,
    CONFIG.BANDS_TO_BE_REMOVED
  );
  if (CONFIG.SHOW_COMPOSITE_IMAGE) {
    print(prefix + "Composite Image", compositeImage);
  }

  /* ////////////////////////////////////////////////////
  // Show True Color and Indexes as layers on the map
  */ ////////////////////////////////////////////////////

  mapTrueColor(CONFIG, collection, prefix); // TRUE COLOR USES COLLECTION INSTEAD OF compositeImage, since some bands might be removed beforehand!

  // draw Indeces on the map (hidden)
  mapIndeces(CONFIG, compositeImage, prefix);

  return compositeImage;
};
