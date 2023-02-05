/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var adminlevel2 = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Mozambique_Adminlevel_2"
  ),
  pemba_metuge = ee.FeatureCollection(
    "projects/ee-swisstph-cabodelgado/assets/Pemba-Metuge"
  );
/***** End of imports. If edited, may not auto-convert in the playground. *****/

// get one or multiplie region geometries
exports.getRegions = function (CONFIG) {
  // get geometries of the regions
  var ROI = adminlevel2
    .filter(ee.Filter.inList(CONFIG.REGION_LIST_COLUMN, CONFIG.REGION_LIST))
    .geometry();

  // plot them
  Map.centerObject(ROI, CONFIG.REGION_SCALE);
  Map.addLayer(
    ROI,
    { palette: ["black"] },
    CONFIG.REGION_NAME,
    !CONFIG.DEACTIVATE_MAP_DRAWING && true
  );

  // return region
  return ROI;
};
