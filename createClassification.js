/* ////////////////////////////////////////////////////
// This scripts are responsible for training a classifier and classifying an image
*/ ////////////////////////////////////////////////////

// function to train a classifier
var trainClassifier = function (CONFIG, trainingData, image) {
  // Initialize the RF classifier
  var classifier = ee.Classifier.smileRandomForest({
    numberOfTrees: CONFIG.RANDOM_FOREST_TREES,
    variablesPerSplit: null,
    minLeafPopulation: 1,
    bagFraction: 0.5,
    maxNodes: null,
    seed: CONFIG.RF_SEED,
  });

  // train classifier
  var trainedClassifier = classifier.train({
    features: trainingData,
    classProperty: CONFIG.CLASSIFICATION_LABEL, // the property to be trained on, e.g. 'LC_20'
    inputProperties: image.bandNames(), // [inputProperty] //
  });
  return trainedClassifier;
};

/*
  Function to test classifier on validation data set.
  State: classifier is trained, but before using it on the entire image, we use it on the validation data set first.
  We classify the pixels of the validation set
  and then print an error matrix showing how good the classifier is on unknown data (validation data).
  Based on config, the matrix and all it's parameters are also exported
  We also allow the confusion matrix to be exported directly (individual) or be returned to the caller for later batch export
*/
var validationErrorMatrix = function (
  validationCollection,
  trainedClassifier,
  CONFIG,
  compositeImage
) {
  var data = validationCollection.classify(trainedClassifier); // Classifies the validation data

  // create confusion matrix
  var confusionMatrix = data.errorMatrix(
    CONFIG.CLASSIFICATION_LABEL,
    "classification"
  );

  if (CONFIG.SHOW_REBSTITUTION_MATRIX) {
    print("Resubstitution error matrix: ", confusionMatrix);
  }
  if (CONFIG.SHOW_ACCUARCY) {
    print("Training overall accuracy: ", confusionMatrix.accuracy());
  }

  // Confusion Matrix transofed into a feature than can be exported to .CSV
  var exportConfusionMatrix = ee.Feature(null, {
    Year: CONFIG.YEAR,
    Bands: compositeImage.bandNames(), //CONFIG.GLCM_RELEVANT_BANDS,
    Texture: CONFIG.GLCM_COMBINATION,
    WindowSize: CONFIG.GLCM_WINDOW_SIZE,
    Vegetation: CONFIG.VEGETATION_INDEX_COMBINATION,
    RF_seed: CONFIG.RF_SEED,
    Matrix: confusionMatrix.array(),
    Accuracy: confusionMatrix.accuracy(),
    ConsumersAccuracy: confusionMatrix.consumersAccuracy(),
    ProducersAccuracy: confusionMatrix.producersAccuracy(),
    Fscore: confusionMatrix.fscore(),
    Kappa: confusionMatrix.kappa(),
  });

  if (CONFIG.EXPORT_INDIVIDUAL_CONFUSION_MATRIX) {
    // single export, only of THIS run!
    var prefix = "CONFUSION_MATRIX_Seed-" + CONFIG.RF_SEED;
    var fileName = helper.createFileName(prefix, CONFIG, CONFIG.YEAR);
    var folderName = helper.createFolderName(CONFIG);
    // Export the FeatureCollection.
    Export.table.toDrive({
      collection: ee.FeatureCollection(exportConfusionMatrix),
      description: fileName,
      folder: folderName,
      fileFormat: "CSV",
      selectors: [
        "Year",
        "Bands",
        "Texture",
        "WindowSize",
        "Vegetation",
        "RF_seed",
        "Matrix",
        "Accuracy",
        "ConsumersAccuracy",
        "ProducersAccuracy",
        "Fscore",
        "Kappa",
      ],
    });
  }
  return exportConfusionMatrix;
};

/*
  Inspired by https://dges.carleton.ca/CUOSGwiki/index.php/Supervised_Classifications_using_Google_Earth_Engine
  prints a chart of Landcover by area of each class
*/
var classificationChart = function (
  classifiedImage,
  classList,
  CONFIG,
  classPalette
) {
  // for classList, create a list of your classes as strings
  // see https://developers.google.com/earth-engine/guides/charts_style
  var options = {
    hAxis: { title: "Class" },
    vAxis: { title: "Area in km^2" },
    title: "Area by class",
    colors: classPalette,
  };

  if (CONFIG.CREATE_BAR_CHART) {
    // create chart based on config
    var chartScale = 300; // rough analysis when just printing to the console
    var areaChart = ui.Chart.image
      .byClass({
        image: ee.Image.pixelArea()
          .multiply(1e-6) // pixel area in km2
          .addBands(classifiedImage),
        classBand: "classification",
        scale: chartScale,
        region: CONFIG.REGION,
        reducer: ee.Reducer.sum(), // sum up all areas to one value per class
        classLabels: classList, // list of labels for each class
      })
      .setOptions(options);
    print(
      'Attention: scale not "correct" since computation would run out. Export for detailed analysis.',
      areaChart
    );
  }
};

exports.run = function (CONFIG, data, compositeImage, helper, params) {
  var prefix = CONFIG.YEAR + "_";

  // init confusion matrices list for later export
  var confusionMatrices = [];
  var classifiedImages = [];

  // now we iterate through all the seeds for the random forest classification
  for (var j = 0; j < CONFIG.RF_SEEDS.length; j++) {
    CONFIG.RF_SEED = CONFIG.RF_SEEDS[j]; // set seed for iteration

    //Train the classifier with the training data
    var trainedClassifier = trainClassifier(
      CONFIG,
      data.trainingData,
      compositeImage
    );

    // Explain trained classifier
    if (CONFIG.EXPLAIN_CLASSIFIER) {
      print("Results of trained classifier", trainedClassifier.explain());
    }

    // Validate trained classifier using the validation data and trained classifier, add to confusion matrices list
    confusionMatrices[j] = validationErrorMatrix(
      data.validationData,
      trainedClassifier,
      CONFIG,
      compositeImage
    );

    // Classify image based on trained classifier
    var classifiedImage = compositeImage.classify(trainedClassifier);
    classifiedImages[j] = classifiedImage; // add to list

    //Map the classified image
    if (CONFIG.MAP_CLASSIFIED_IMAGE) {
      Map.addLayer(
        classifiedImage.clip(CONFIG.REGION),
        params.classifiedImage,
        prefix + "Classified Image",
        !CONFIG.DEACTIVATE_MAP_DRAWING && true
      );
    }

    // Export classified image to TIFF
    if (CONFIG.EXPORT_CLASSIFIED_IMAGE) {
      var namingPrefix = ee
        .String("CLASSIFIED-IMAGE-")
        .cat(ee.Number(CONFIG.RF_SEED).format());
      var imageFileName = helper.createFileName(namingPrefix, CONFIG);
      var imageFolderName = helper.createFolderName(CONFIG);
      Export.image.toDrive({
        image: classifiedImage,
        description: imageFileName,
        folder: imageFolderName,
        region: CONFIG.REGION,
        scale: CONFIG.COLLECTION_SCALE,
        // crs: 'EPSG:5070',
        skipEmptyTiles: true, // skip masked regions
        fileFormat: "GeoTIFF",
        maxPixels: 10000000000000,
      });
    }

    // print a chart of Landcover by area of each class
    if (CONFIG.CREATE_BAR_CHART) {
      classificationChart(
        classifiedImage,
        params.classNames,
        CONFIG,
        params.classPalette
      );
    }

    // add each class to the map, individually
    if (CONFIG.SHOW_CLASS_INDIVIDUALLY) {
      for (var classNr = 0; classNr <= 5; classNr++) {
        var mapOfClass = classifiedImage
          .clip(CONFIG.REGION)
          .eq(classNr)
          .selfMask(); // only show the the specific class
        Map.addLayer(
          mapOfClass,
          params.oneClassImage(classNr), // get the Palette-Color from this class
          prefix + params.classNames[classNr] + " (" + classNr + ")", // get name of that class from params
          false
        );
      }
    }
  }

  // after all seeds classification have run, we can export the confusion matrices if we wish
  if (CONFIG.EXPORT_CONFUSION_MATRICES) {
    var fileName = helper.createFileName(
      "CONFUSION_MATRICES",
      CONFIG,
      CONFIG.YEAR,
      true
    ); // create filename without seeds in it
    var folderName = helper.createFolderName(CONFIG);
    // Export the FeatureCollection to csv file
    Export.table.toDrive({
      collection: ee.FeatureCollection(confusionMatrices),
      description: fileName,
      folder: folderName,
      fileFormat: "CSV",
      selectors: [
        "Year",
        "Bands",
        "Texture",
        "WindowSize",
        "Vegetation",
        "RF_seed",
        "Matrix",
        "Accuracy",
        "ConsumersAccuracy",
        "ProducersAccuracy",
        "Fscore",
        "Kappa",
      ],
    });
  }

  return {
    confusionMatrices: confusionMatrices,
    classifiedImages: classifiedImages,
  };
};
