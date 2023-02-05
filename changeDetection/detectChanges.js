/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var IMG2019 = ee.Image(
    "projects/ee-swisstph-cabodelgado/assets/classifiedImages/CLASSIFIED-IMAGE-6781_T2_W-25_INDEX1_Bands-8_SENTINEL_YEAR-2019"
  ),
  IMG2020 = ee.Image(
    "projects/ee-swisstph-cabodelgado/assets/classifiedImages/CLASSIFIED-IMAGE-6781_T2_W-25_INDEX1_Bands-8_SENTINEL_YEAR-2020"
  );
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/* ////////////////////////////////////////////////////
// CHANGE DETECTION
*/ ////////////////////////////////////////////////////

var params = require("users/florianburkhardt/EEClassifierPipeline:params.js");
var region = require("users/florianburkhardt/EEClassifierPipeline:region.js");

// Define composites (e.g., import them)
var earlierComposite = IMG2019;
var laterComposite = IMG2020;

var CHANGECONFIG = {
  NUMBER_OF_CLASSES: 6,
  REGION: null,
  REGION_NAME: "Pemba-Metuge", // "Pemba-Metuge" | "Montepuez" Name of the region
  REGION_LIST: ee.List(["MZ0104", "MZ0109"]), // ["MZ0104", "MZ0109"] | ["MZ0111"] Codes of the regions to be included. Has to be of type ee.List()
  REGION_LIST_COLUMN: "ADM2_PCODE", // The column in which to search for the REGION_LIST parameter. Standard: ADM2_PCODE
  REGION_SCALE: 13, // Scale of Map by default, 11 for Pemba-Metuge, 9 for Motenpuez (recommended)

  COLLECTION_SCALE: 10, // e.g., Sentinel = 10, Landsat = 30

  GAIN_COLOR: "green",
  LOSS_COLOR: "red",
  NO_CHANGE_COLOR: "gray",
};

CHANGECONFIG.REGION = region.getRegions(CHANGECONFIG);

// Calculate the gain or loss in KM^2
// todo: check if one could also use the function "calculateAreaOfClasses" from areaCalculator....
function calculateGainAndLoss(gainOrLossImage, CHANGECONFIG) {
  // Convert the pixels to m^2 and add bands of the classified image (give each pixel the unit of square metres)
  var areaImage = ee.Image.pixelArea().addBands(gainOrLossImage);

  // Reduce all pixels to a statistic and sum it in each group
  var areas = areaImage.reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: "class",
    }),
    geometry: CHANGECONFIG.REGION,
    scale: CHANGECONFIG.COLLECTION_SCALE,
    maxPixels: 1e10,
  });

  // Make a list with reduced group and get the 'groups'
  var classAreas = ee.List(areas.get("groups"));

  var convertAreaSize = function (area) {
    return ee.String(ee.Number(area).format()).cat("km^2");
  };

  // Map over a function to extract individual class area
  var classAreaLists = classAreas.map(function (item) {
    var areaDict = ee.Dictionary(item);
    var type = ee.Number(areaDict.get("class")).format();
    var area = ee.Number(areaDict.get("sum")).divide(1e6).round();
    return ee.Dictionary({
      type: type,
      area: convertAreaSize(area),
      note: "type: -1 = loss, 0 = no change, 1 = gain",
    });
  });

  return classAreaLists;
}

var run = function (CHANGECONFIG, composite1, composite2) {
  // iterate over each individual class and create a image with gains and losses
  for (var i = 0; i < CHANGECONFIG.NUMBER_OF_CLASSES; i++) {
    // first, let's only consider the pixels of the images that are in class i
    var classImage1 = composite1.eq(i);
    var classImage2 = composite2.eq(i);

    // mask gain image and calculate how much the gain was
    var gainImage = classImage1.mask(classImage2).subtract(1).multiply(-1);
    //var gainArea = calculateGainOrLoss(gainImage, CHANGECONFIG);
    //print(gainImage);

    // mask loss image and calculate how much the loss was
    var lossImage = classImage2.mask(classImage1).subtract(1);
    //var lossArea = calculateGainOrLoss(lossImage, CHANGECONFIG);
    //print(lossImage);

    var className = params.classNames[i];

    var mask = classImage1.add(classImage2);
    var fullRegion = classImage1.mask(mask).multiply(0); // set all pixels to 0
    var combinedImage = fullRegion
      .add(gainImage.unmask())
      .add(lossImage.unmask());
    //print(combinedImage);

    // calculate area sizes of the classes lost/gained
    var areaSize = calculateGainAndLoss(combinedImage, CHANGECONFIG);
    var classAreaSize = { class: className, sizes: areaSize };
    print(classAreaSize);

    Map.addLayer(
      combinedImage.clip(CHANGECONFIG.REGION),
      {
        min: -1,
        max: 1,
        palette: [
          CHANGECONFIG.LOSS_COLOR,
          CHANGECONFIG.NO_CHANGE_COLOR,
          CHANGECONFIG.GAIN_COLOR,
        ],
      },
      "Gain and Loss of " + className
    );

    Export.image.toDrive({
      image: combinedImage.clip(CHANGECONFIG.REGION),
      description:
        "Gain-Loss-of-" + className + "-in-" + CHANGECONFIG.REGION_NAME,
      region: CHANGECONFIG.REGION,
      scale: CHANGECONFIG.COLLECTION_SCALE,
      skipEmptyTiles: true, // skip masked regions
      fileFormat: "GeoTIFF",
      maxPixels: 10000000000000,
    });
  }
};

// run change detection
run(CHANGECONFIG, earlierComposite, laterComposite);
