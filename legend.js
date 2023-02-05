/*
  This file defines the legend used in the classification
*/

/* ////////////////////////////////////////////////////
// CLASSES LEGEND
// This legend creates an overlay showing the 6 classes (waterbodies etc.) and their corresponding colours
*/ ////////////////////////////////////////////////////

exports.showClasses = function (CONFIG, params) {
  // set position of panel
  var legend = ui.Panel({
    style: {
      position: "bottom-left",
      padding: "8px 15px",
    },
  });

  // Create legend title
  var legendTitle = ui.Label({
    value: "Classes",
    style: {
      fontWeight: "bold",
      fontSize: "18px",
      margin: "0 0 4px 0",
      padding: "0",
    },
  });

  // Add the title to the panel
  legend.add(legendTitle);

  // Creates and styles 1 row of the legend.
  var makeRow = function (color, name) {
    // Create the label that is actually the colored box.
    var colorBox = ui.Label({
      style: {
        backgroundColor: "#" + color,
        // Use padding to give the box height and width.
        padding: "8px",
        margin: "0 0 4px 0",
      },
    });

    // Create the label filled with the description text.
    var description = ui.Label({
      value: name,
      style: { margin: "0 0 4px 6px" },
    });

    // return the panel
    return ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow("horizontal"),
    });
  };
  // Add color and and names
  for (var i = 0; i < params.classPalette.length; i++) {
    legend.add(makeRow(params.classPalette[i], params.classNames[i]));
  }

  Map.add(legend);
};

/* ////////////////////////////////////////////////////
// CONFIG LEGEND
// This legend is generated based on the parameters set in the config
*/ ////////////////////////////////////////////////////

exports.showConfig = function (CONFIG) {
  var configLegend = ui.Panel({
    style: {
      position: "bottom-right",
      padding: "8px 15px",
    },
  });

  // Create legend title
  var configTitle = ui.Label({
    value: "Settings",
    style: {
      fontWeight: "bold",
      fontSize: "18px",
      margin: "0 0 4px 0",
      padding: "0",
    },
  });

  configLegend.add(configTitle);

  var subTitle = function (title) {
    // Create legend title
    return ui.Label({
      value: title,
      style: {
        fontWeight: "bold",
        fontSize: "16px",
        margin: "0 0 4px 0",
        padding: "0",
      },
    });
  };

  // Creates styles for label: value items
  var addPair = function (label, value) {
    // Create the label that is actually the colored box.
    var labelBox = ui.Label({
      value: label + ": ",
      style: { margin: "0 0 4px 6px", fontWeight: "bold", fontSize: "14px" },
    });

    // Create the label filled with the description text.
    var valueBox = ui.Label({
      value: value,
      style: { margin: "0 0 4px 6px", fontSize: "14px" },
    });

    // return the panel
    return ui.Panel({
      widgets: [labelBox, valueBox],
      layout: ui.Panel.Layout.Flow("horizontal"),
    });
  };

  // calculate the number of bands based on the config for showing in the legend
  function sumOfBands(CONFIG) {
    var sum = 0;
    if (CONFIG.GLCM) {
      sum = CONFIG.GLCM_RELEVANT_BANDS.length * CONFIG.GLCM_BANDS_FILTER.length; //
    }
    if (CONFIG.VEGETATION_INDEXES) {
      sum = sum + 5; // add all 4 vegetation indexes
    }
    if (CONFIG.IS_SENTINEL) {
      // sentinel has 23 default bands
      sum = sum + (23 - CONFIG.BANDS_TO_BE_REMOVED.length);
    } else {
      // landsat has 19 default bands
      sum = sum + (19 - CONFIG.BANDS_TO_BE_REMOVED.length); // there are 19 default bands. Remove all bands that will be removed automatically in the composite
    }

    return sum;
  }

  configLegend.add(addPair("Region", CONFIG.REGION_NAME));
  configLegend.add(addPair("Collection", CONFIG.COLLECTION));
  configLegend.add(addPair("Collection Scale", CONFIG.COLLECTION_SCALE));
  configLegend.add(addPair("Max Cloud Coverage", CONFIG.MAX_CLOUD_COVERAGE));

  if (CONFIG.MAKE_CLASSIFICATION) {
    configLegend.add(subTitle("Classification"));
    configLegend.add(addPair("Split rate", CONFIG.FEATURE_COLLECTION_SPLIT));
    configLegend.add(addPair("Classifier Type", CONFIG.CLASSIFIERTYPE));
    if (CONFIG.CLASSIFIERTYPE === "RF") {
      configLegend.add(addPair("RF Trees", CONFIG.RANDOM_FOREST_TREES));
    }
  }

  configLegend.add(subTitle("Features"));
  configLegend.add(addPair("Vegetation Indexes", CONFIG.VEGETATION_INDEXES));
  configLegend.add(addPair("GLCM Bands", CONFIG.GLCM));
  if (CONFIG.GLCM) {
    configLegend.add(addPair("Texture Combination", CONFIG.GLCM_COMBINATION));
    configLegend.add(addPair("GLCM Window Size", CONFIG.GLCM_WINDOW_SIZE));
  }
  configLegend.add(addPair("Number of Bands", sumOfBands(CONFIG)));

  Map.add(configLegend);
  //return configLegend;
};
