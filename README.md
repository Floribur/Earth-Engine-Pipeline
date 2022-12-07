# Google Earth Engine Landcover Classification in Mozambique

This repository contains the files used for analyzing landcover change in Pemba-Metuge between 2018 and 2020 in paper [XY](LINK).

## Usage

The entry point to execute the script is the file `main`.
There, you find all the possible configuration that can be adjusted to your specific analysis.
After that, the analysis can be run.

### Adding training data

Training points or polygons can be added in the file `featureCollection`.
There, an object containing each landcover class (waterbodies, urban, vegetation, grasland, bare soils, and agriculture) can be addded to the exports statement.

### Limitations

- Some configurations are not possible or will time out based on the restrictions from Google Earth Engine. For example, running classification and separability measurements concurrently might lead to timeouts.
- Also, at the moment, only regions in Mozambique are supported (which could be extended by importing the region boundaries in the `region` file).
- At this time, the defined classes are static and can't be changed.

### Region

- Import the region data table.

## Import into Google Earth Engine

There are two ways to import this script into Google Earth Engine.
Either you download the files from this repository and manually add them to your repository one by one,
or you use the [git repositories of Google Earth Engine](https://earthengine.googlesource.com/) to import the files.

**Notice:**
The files are interlinked with each other since most of them are imported in another file.
To make them work in your own Earth Engine Repository you have to change the imports to fit your own repostiroy path in the following files:

- main
- classification
- classStatistics
- compositeCreator
- GLCMCalculator
- legend

## Citation

If you use this code, then please cite the paper as follow:

```
@misc{
    Citation Information...
}

```
