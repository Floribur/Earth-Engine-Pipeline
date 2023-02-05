/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var pembaAgriculture = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaAgriculture"
  ),
  pembaBareSoils = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaBareSoils"
  ),
  pembaGrassland = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaGrassland"
  ),
  pembaNaturalVegetation = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaNaturalVegetation"
  ),
  pembaWaterbodies = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaWaterbodies"
  ),
  pembaUrban = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaUrban"
  ),
  metuge2018Agriculture = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/metuge2018Agriculture"
  ),
  metuge2018BareSoils = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/metuge2018BareSoils"
  ),
  metuge2018Grassland = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/metuge2018Grassland"
  ),
  metuge2018NaturalVegetationForest = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/metuge2018NaturalVegetationForest"
  ),
  metuge2018Urban = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/metuge2018Urban"
  ),
  metuge2018Waterbodies = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/metuge2018Waterbodies"
  ),
  pembaMetuge_GEE_2018_Agriculture = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaMetuge_GEE_2018_Agriculture"
  ),
  pembaMetuge_GEE_2018_BareSoils = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaMetuge_GEE_2018_BareSoils"
  ),
  pembaMetuge_GEE_2018_NaturalVegetation = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaMetuge_GEE_2018_NaturalVegetation"
  ),
  pembaMetuge_GEE_2018_Urban = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaMetuge_GEE_2018_Urban"
  ),
  pembaMetuge_GEE_2018_Waterbodies = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/pembaMetuge_GEE_2018_Waterbodies"
  ),
  Pemba2020_Agriculture = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2020_Agriculture"
  ),
  Pemba2020_BareSoils = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2020_BareSoils"
  ),
  Pemba2020_NaturalVegetation = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2020_NaturalVegetation"
  ),
  Pemba2020_Grassland = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2020_Grassland"
  ),
  Pemba2020_Urban = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2020_Urban"
  ),
  Pemba2020_Waterbodies = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2020_Waterbodies"
  ),
  Metuge2020_Agriculture = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2020_Agriculture"
  ),
  Metuge2020_BareSoils = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2020_BareSoils"
  ),
  Metuge2020_Grassland = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2020_Grassland"
  ),
  Metuge2020_NaturalVegetation = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2020_NaturalVegetation"
  ),
  Metuge2020_Urban = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2020_Urban"
  ),
  Metuge2020_Waterbodies = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2020_Waterbodies"
  ),
  Metuge2019_Agriculture = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2019_Agriculture"
  ),
  Metuge2019_BareSoils = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2019_BareSoils"
  ),
  Metuge2019_Grassland = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2019_Grassland"
  ),
  Metuge2019_NaturalVegetation = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2019_NaturalVegetation"
  ),
  Metuge2019_Urban = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2019_Urban"
  ),
  Metuge2019_Waterbodies = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Metuge2019_Waterbodies"
  ),
  Pemba2019_Waterbodies = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2019_Waterbodies"
  ),
  Pemba2019_Urban = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2019_Urban"
  ),
  Pemba2019_NaturalVegetation = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2019_NaturalVegetation"
  ),
  Pemba2019_Grassland = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2019_Grassland"
  ),
  Pemba2019_BareSoils = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2019_BareSoils"
  ),
  Pemba2019_Agriculture = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba2019_Agriculture"
  );
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/* ////////////////////////////////////////////////////
// Feature Collections
// This file imports all the feature collections, merges them and exports the training data for each year
*/ ////////////////////////////////////////////////////

/* ////////////////////////////////////////////////////
// Feature Collections Legend
*/ ////////////////////////////////////////////////////
/*
  INDEX | NAME
  0 Water Bodies (WB): areas periodically or permanently covered by water
  1 urban:  roads, towns, cities.. (this can be any type of building or road or manmade structure)
  2 Vegetation: natural vegetation/forest
  3 Grassland (GR): primarily covered by grass with or without scattered shrubs
  4 Bare soils (BS): uncovered areas which in the study area include prepared areas for agriculture
  5 Agriculture: cultivated fields
*/

/* ////////////////////////////////////////////////////
// Define Datasets and classes
*/ ////////////////////////////////////////////////////

// DATA OF PEMBA-METUGE 2019
var rawData2019 = {
  waterbodies: Pemba2019_Waterbodies.merge(Metuge2019_Waterbodies),
  urban: Pemba2019_Urban.merge(Metuge2019_Urban),
  vegetation: Pemba2019_NaturalVegetation.merge(Metuge2019_NaturalVegetation),
  grassland: Pemba2019_Grassland.merge(Metuge2019_Grassland),
  bareSoils: Pemba2019_BareSoils.merge(Metuge2019_BareSoils),
  agriculture: Pemba2019_Agriculture.merge(Metuge2019_Agriculture),
};

// DATA OF PEMBA-METUGE 2020
var rawData2020 = {
  waterbodies: Pemba2020_Waterbodies.merge(Metuge2020_Waterbodies),
  urban: Pemba2020_Urban.merge(Metuge2020_Urban),
  vegetation: Pemba2020_NaturalVegetation.merge(Metuge2020_NaturalVegetation),
  grassland: Pemba2020_Grassland.merge(Metuge2020_Grassland),
  bareSoils: Pemba2020_BareSoils.merge(Metuge2020_BareSoils),
  agriculture: Pemba2020_Agriculture.merge(Metuge2020_Agriculture),
};

/* ////////////////////////////////////////////////////
// Define on a year by year basis
*/ ////////////////////////////////////////////////////

var rawTrainingData = {
  2019: rawData2019,
  2020: rawData2020,
};

/* ////////////////////////////////////////////////////
// Create Datasets
*/ ////////////////////////////////////////////////////

/*
  Function to create the dataSet that can be used for training
  returns Object from splitData Function {training: ee.FeatureCollection, validation: ee.FeatureCollection}
*/
exports.createDataset = function (CONFIG) {
  var rawData = rawTrainingData[CONFIG.YEAR]; // get polygons based on year

  var property = CONFIG.CLASSIFICATION_LABEL;
  if (CONFIG.SHOW_NUMBER_OF_POLYGONS) {
    print("Number of pixels per class: ", getNumOfPixelsPerClass(rawData));
  }

  //print("Max Area Size: ", maxAreaSize);
  // todo: then duplicate the minority classes so they are +/- the same size as maxArea
  var transformedData = transformData(rawData, property);
  drawFeatures(rawData, property, CONFIG); // activate to draw a map for each class
  var mergedData = mergeData(transformedData);
  //Map.addLayer(mergedData, {}, property, false);
  //print("Feature Collection: " + property, mergedData);
  return mergedData;
};

/*
  Function to split a feature Collection into a training and validation set
  Input: Feature Collection
  Output: Object of form {training: ee.FeatureCollection, validation: ee.FeatureCollection}
*/
exports.splitData = function (CONFIG, dataset) {
  var columnName = "random";
  // The randomColumn() method will add a column of uniform random numbers
  // in a column named 'random' by default.
  // The SEED is used to create reproducable results for random functions
  dataset = dataset.randomColumn(columnName, CONFIG.SPLIT_SEED);

  var training = dataset.filter(
    ee.Filter.lt(columnName, CONFIG.FEATURE_COLLECTION_SPLIT)
  );
  var validation = dataset.filter(
    ee.Filter.gte(columnName, CONFIG.FEATURE_COLLECTION_SPLIT)
  );

  return {
    training: training,
    validation: validation,
  };
};

// get number of pixels per class
function getNumOfPixelsPerClass(rawData) {
  var classes = {
    waterbodies: calcPixels(rawData.waterbodies),
    urban: calcPixels(rawData.urban),
    vegetation: calcPixels(rawData.vegetation),
    grassland: calcPixels(rawData.grassland),
    bareSoils: calcPixels(rawData.bareSoils),
    agriculture: calcPixels(rawData.agriculture),
  };
  return classes;
}

// calculate the area of all polygons in the feature collection
function calcPixels(featureCollection) {
  // calculate the area of all polygons in the feature collection
  // divided by 900 because 30mx30m = 900! So area in m^2 divided by the sqm area for each pixel...
  // round to nearest integer value
  var pixels = ee
    .Number(featureCollection.geometry().area().divide(900))
    .round();
  var sentinelPixels = ee
    .Number(featureCollection.geometry().area().divide(100))
    .round();

  var polygons = featureCollection.size(); // number of polygons in that collection

  return {
    landsatPixels: pixels,
    sentinelPixels: sentinelPixels,
    polygons: polygons,
  };
}

/*
  Function to draw the featureCollections on the map, if needed
*/
function drawFeatures(rawData, property, CONFIG) {
  if (CONFIG.DRAW_TRAINING_SAMPLES) {
    var colorParams = function (color) {
      return { color: color, pointRadius: 5 };
    };
    Map.addLayer(
      rawData.waterbodies,
      colorParams("0000FF"),
      "Feature: waterbodies " + property,
      false
    );
    Map.addLayer(
      rawData.urban,
      colorParams("DCDCDC"),
      "Feature: urban " + property,
      false
    );
    Map.addLayer(
      rawData.vegetation,
      colorParams("228B22"),
      "Feature: vegetation " + property,
      false
    );
    Map.addLayer(
      rawData.grassland,
      colorParams("F0E68C"),
      "Feature: grassland " + property,
      false
    );
    Map.addLayer(
      rawData.bareSoils,
      colorParams("FFFF00"),
      "Feature: bareSoils " + property,
      false
    );
    Map.addLayer(
      rawData.agriculture,
      colorParams("FFC0CB"),
      "Feature: agriculture " + property,
      false
    );
    //print("drew features of ", rawData);
  }
}

// this function merges the transformed data into the trainingdata
function mergeData(transformedData) {
  var trainingdata = transformedData.vegetation
    .merge(transformedData.urban)
    .merge(transformedData.waterbodies)
    .merge(transformedData.grassland)
    .merge(transformedData.bareSoils)
    .merge(transformedData.agriculture);
  return trainingdata;
}

// This functions adds the corresponding property and value to each class
function transformData(rawFeatureCollection, property) {
  rawFeatureCollection.waterbodies = addPropertyToFeatureCollection(
    rawFeatureCollection.waterbodies,
    property,
    0
  );
  rawFeatureCollection.urban = addPropertyToFeatureCollection(
    rawFeatureCollection.urban,
    property,
    1
  );
  rawFeatureCollection.vegetation = addPropertyToFeatureCollection(
    rawFeatureCollection.vegetation,
    property,
    2
  );
  rawFeatureCollection.grassland = addPropertyToFeatureCollection(
    rawFeatureCollection.grassland,
    property,
    3
  );
  rawFeatureCollection.bareSoils = addPropertyToFeatureCollection(
    rawFeatureCollection.bareSoils,
    property,
    4
  );
  rawFeatureCollection.agriculture = addPropertyToFeatureCollection(
    rawFeatureCollection.agriculture,
    property,
    5
  );

  return rawFeatureCollection;
}

// This function adds a property to each feature to distinguish between the different categories / classes
function addPropertyToFeatureCollection(featurecollection, property, value) {
  // for each property, set new property with corresponding value
  var addProperty = function (feature) {
    feature = feature.select(["system:index"]).set(property, value);
    return feature;
  };

  // return new collection with added property
  return featurecollection.map(addProperty);
}

/*
  // Not used at the moment:
  // Generic Function to remove a property from a feature, 
  var removeProperty = function(feat, property) {
    var properties = feat.propertyNames()
    var selectProperties = properties.filter(ee.Filter.neq('item', property))
    return ee.Feature(feat).select(selectProperties)
  }
  
  // first remove all other properties
  feature = removeProperty(feature, 'LC_15');
  feature = removeProperty(feature, 'LC_19');
  feature = removeProperty(feature, 'name');
  feature = removeProperty(feature, 'Name');
  feature = removeProperty(feature, 'descriptio');
*/
