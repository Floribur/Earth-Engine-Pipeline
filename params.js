/* ////////////////////////////////////////////////////
- Contains Params for visualizing different bands / indeces on a Map
- Some settings about the classes
*/ ////////////////////////////////////////////////////

// Define different parameters
var NDWI = {
  bands: ["NDWI"],
  min: 0.0,
  max: 1.0,
  opacity: 1,
  palette: ["0000ff", "00ffff", "ffff00", "ff0000", "ffffff"],
};

var trueColorLandsat = {
  bands: ["SR_B4", "SR_B3", "SR_B2"],
  min: 0.0,
  max: 0.3,
  gamma: 1.4,
  opacity: 1,
};

var trueColorSentinel = {
  bands: ["B4", "B3", "B2"],
  min: 0.0,
  max: 0.3,
  gamma: 1.4,
  opacity: 1,
};

// default for all other indeces
var defaultParams = {
  bands: [],
  min: 0.0,
  max: 1.0,
  opacity: 1,
  palette: [
    "FFFFFF",
    "CE7E45",
    "DF923D",
    "F1B555",
    "FCD163",
    "99B718",
    "74A901",
    "66A000",
    "529400",
    "3E8601",
    "207401",
    "056201",
    "004C00",
    "023B01",
    "012E01",
    "011D01",
    "011301",
  ],
};

// function to get parameters based on use case
exports.getParams = function (CONFIG, indexName) {
  if (indexName == "NDWI") {
    // special index
    return NDWI;
  } else if (indexName == "TRUECOLOR") {
    if (CONFIG.IS_SENTINEL) {
      return trueColorSentinel;
    } else {
      return trueColorLandsat;
    }
  } else {
    // all other indeces are based on the default params, just adjust the bands
    var params = defaultParams;
    params.bands = [indexName];
    return params;
  }
};

/* ////////////////////////////////////////////////////
- Classnames and class colours
*/ ////////////////////////////////////////////////////

/*
  0 Water Bodies (WB): areas periodically or permanently covered by water
  1 urban:  roads, towns, cities.. (this can be any type of building or road or manmade structure)
  2 Vegetation: natural vegetation/forest
  3 Grassland (GR): primarily covered by grass with or without scattered shrubs
  4 Bare soils (BS): uncovered areas which in the study area include prepared areas for agriculture
  5 Agriculture: cultivated fields
  */

exports.classNames = [
  "Waterbodies",
  "Urban",
  "Natural Vegetation",
  "Grasslands",
  "Bare Soils",
  "Agriculture",
];

// Palette for classified Image. Which color for which class?
var classifiedPalette = [
  "0000FF", // waterbodies (0)  -- blue
  "606060", //  Urban (1) -- gray, used to be DCDCDC
  "228B22", // Vegetation (2)-- forest green
  "F0E68C", // Grasslands (3)-- khaki
  "FFFF00", // Bare Soils (4)  -- yellow
  "FFC0CB", // Agriculture (5)-- pink
];

exports.classPalette = classifiedPalette;

exports.classifiedImage = {
  palette: classifiedPalette,
  min: 0,
  max: classifiedPalette.length - 1,
};

exports.oneClassImage = function (classNr) {
  return {
    palette: [classifiedPalette[classNr]],
  };
};
