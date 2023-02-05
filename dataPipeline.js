var data = require("users/florianburkhardt/EEClassifierPipeline:data.js");

/*
  Function to create training data based on parameters
  image: of type ee.image, image to be used for training
  trainingPointsCollection: merged feature collection
  config: global CONFIG from main
  returns: trainingData of type ee.FeatureCollection
*/
var createTrainingData = function (image, polygons, CONFIG) {
  // overlay the polygons from the training collection over the pixel values of an image
  // --> get pixel data below the polygons using sampleRegions
  var trainingData = image.sampleRegions({
    collection: polygons,
    properties: [CONFIG.CLASSIFICATION_LABEL],
    scale: CONFIG.COLLECTION_SCALE,
    tileScale: 16,
  });
  return trainingData;
};

exports.prepareData = function (CONFIG, compositeImage) {
  var mergedDataset = data.createDataset(CONFIG); // create dataset

  // Split dataset into training and validation polygons
  var splitPolygons = data.splitData(CONFIG, mergedDataset); // SPLIT the Polygons
  var trainingPolygons = splitPolygons.training;
  var validationPolygons = splitPolygons.validation;

  // Then overlay these polygons over the map to get each pixel value of it
  var trainingData = createTrainingData(
    compositeImage,
    trainingPolygons,
    CONFIG
  );
  var validationData = createTrainingData(
    compositeImage,
    validationPolygons,
    CONFIG
  );

  // Export Training and Validation Polygons to Shapefiles
  if (CONFIG.EXPORT_DATA_POLYGONS) {
    Export.table.toDrive({
      collection: trainingPolygons,
      description: "Training-Polygons",
      fileFormat: "SHP",
    });
    Export.table.toDrive({
      collection: validationPolygons,
      description: "Validation-Polygons",
      fileFormat: "SHP",
    });
  }

  if (CONFIG.SHOW_DATASET_SIZE) {
    // Print to console the training and validation data size (pixels per set)
    print(
      "Dataset size: ",
      trainingData.merge(validationData).size(),
      "Training and validation was split by",
      CONFIG.FEATURE_COLLECTION_SPLIT,
      "Training data size: ",
      trainingData.size(),
      "Training Polygons size:",
      trainingPolygons.size(),
      "Validation data size:",
      validationData.size(),
      "Validation Polygon Size",
      validationPolygons.size()
    );
  }

  return { trainingData: trainingData, validationData: validationData };
};
