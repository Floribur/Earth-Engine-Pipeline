/* 
  Contains Scrips to calculate the GLCM Textures Metric for each Landsat band
  GLCM = grey level co-occurrence matrix (GLCM) measurements
*/

/*
  In this study, the 14 GLCM metrics proposed by [55], namely Angular Second Moment (asm),
  Contrast (contrast), Correlation (corr), Variance (var), Inverse Difference Moment (idm), Sum Average
  (savg), Sum Variance (svar), Sum Entropy (sent), Entropy (ent), Difference variance (dvar), Difference
  entropy (dent), Information Measure of correlation 1 (imcorr1), Information Measure of correlation
  2 (imcorr2), and maximum correlation coefficient (maxcorr), and an additional four textural features
  from[68], specifically,Dissimilarity (diss), Inertia (inertia), Cluster Shade (shade) andCluster prominence
  (prom), were computed for each Landsat band.
*/

/*
  Function to calculate all GLCM texture metric for the bands of an image
  image: of type ee.Image. The bands will be added to this image.
  bands: list of bands for which the GLCM texture metrics should be calculated
  CONFIG: the global CONFIG as defined in the main file
  returns the image with the new GLCM bands
*/
exports.createTextureBands = function (image, CONFIG, helper) {
  var bands = CONFIG.GLCM_RELEVANT_BANDS;

  // get the relevant bands and cast them to int32
  // because only int32 images are currently supported by GLCM calculator
  image = image.select(bands).toInt32(); //
  //var bandNames = image.bandNames();

  //print("Inside texture function", image, bands, bands.length);

  // loop through remaining bands and add GLCMs to these bands
  for (var i = 0; i < bands.length; i++) {
    var band = bands[i]; // get band from list
    //var prefix = ee.String(band).cat('_'); // creates prefix, e.g. "B1_"
    var prefix = band + "_"; // otherwise, .getInfo()!
    image = image.addBands(createGLCMBands(image, band, prefix, CONFIG));
  }

  // remove the initial (non-relevant) bands before returning the new GLCM Bands
  image = helper.removeBands(image, bands);

  return image;
};

/*
  function to create the GLCM Bands for a specific band, renames them with a prefix and returns the bands
  image: of type ee.Image
  bandName: single bandName of band for which the GLCM Bands should be generated
  prefix: Prefix for this band
  CONFIG: the global CONFIG as defined in the main file
  returns: the input-image including the new GLCM bands
*/

function createGLCMBands(image, bandName, prefix, CONFIG) {
  // rename GLCM bands with prefix of band
  var renameBandsList = [
    prefix + "ASM", // ASM: f1, Angular Second Moment; measures the number of repeated pairs
    prefix + "CONTRAST", // CONTRAST: f2, Contrast; measures the local contrast of an image
    prefix + "CORR", //CORR: f3, Correlation; measures the correlation between pairs of pixels
    prefix + "VAR", // VAR: f4, Variance; measures how spread out the distribution of gray-levels is
    prefix + "IDM", // IDM: f5, Inverse Difference Moment; measures the homogeneity
    prefix + "SAVG", // SAVG: f6, Sum Average
    prefix + "SVAR", // SVAR: f7, Sum Variance
    prefix + "SENT", // SENT: f8, Sum Entropy
    prefix + "ENT", // ENT: f9, Entropy. Measures the randomness of a gray-level distribution
    prefix + "DVAR", // DVAR: f10, Difference variance
    prefix + "DENT", // DENT: f11, Difference entropy
    prefix + "IMCORR1", // IMCORR1: f12, Information Measure of Corr. 1
    prefix + "IMCORR2", // IMCORR2: f13, Information Measure of Corr. 2
    prefix + "MAXCORR", // MAXCORR: f14, Max Corr. Coefficient. (not computed)
    prefix + "DISS", // DISS: Dissimilarity
    prefix + "INERTIA", // INERTIA: Inertia
    prefix + "SHADE", // SHADE: Cluster Shade
    prefix + "PROM", // PROM: Cluster prominence
  ];

  // dynamic way to select relevant GLCM bands based on a list without the prefixes
  var bandsToKeep = []; // new list with prefix + old label
  var relGLCMBands = CONFIG.GLCM_BANDS_FILTER; // list with label of GLCM bands
  for (var i = 0; i < relGLCMBands.length; i++) {
    var newLabel = prefix + relGLCMBands[i];
    bandsToKeep.push(newLabel);
  }

  // Add GLCM Texture to input band
  var inputBand = image.select(bandName);
  var glcm = inputBand.glcmTexture({ size: CONFIG.GLCM_WINDOW_SIZE }); // six different window sizes (2, 5, 10, 20, 25, and 30) were tested

  // rename bands
  glcm = glcm.rename(renameBandsList).select(bandsToKeep).toDouble(); // convert to double

  return glcm;

  // https://developers.google.com/earth-engine/apidocs/ee-image-glcmtexture
  // This implementation computes the 14 GLCM metrics proposed by Haralick,
  // and 4 additional metrics from Conners. Inputs are required to be integer valued.
}
