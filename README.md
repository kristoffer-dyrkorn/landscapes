# landscapes

Landscape visualization in the browser - code used in the presentation at NDC 2023.

The repo contains a Node app for data preprocessing and a simple web app for rendering/presentation.

Meant to be used together with data sources mentioned in the presentation.

# Setting up data

The preprocessing code assumes you have a newer version of `node` (20.2, for example) and `npm` installed.

## Terrain

- Download a terrain model (GeoTIFF file), for example from [Kartkatalogen](https://kartkatalog.geonorge.no/metadata/dtm-10-terrengmodell-utm33/dddbb667-1303-4ac5-8640-7ec04c0e3918). Note: Use an UTM-based coordinate system, for example UTM33N.
- Open a terminal vindow and go to the `preprocessing/` directory. Install all dependencies: `npm install`
- Crop the terrain model to an area of interest, for example by using GDAL: `gdal_translate -projwin -35000 6737000 -25000 6727000 67m1_2_10m_z33.tif bergen.tif`
- Convert the GeoTIFF to a mesh, simplify it and save it as an OBJ: `node simplify_mesh.mjs bergen.tif bergen.obj`
- Note 1): The default simplification keeps removing triangles until the max vertical error of the simplified mesh is 1 meter.
- Note 2): The OBJ file refers to a texture file called texture.png, which is not yet created.
- Note 3): The mesh vertices in the OBJ have coordinates relative to the lower left corner of the terrain.
- Open the OBJ in a mesh viewer, for example MeshLab, and inspect the result:

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/mesh-large.jpg)

## Terrain texture

- Download an orthophoto, for example a satellite image (GeoTIFF file) from [Kartkatalogen](https://kartkatalog.geonorge.no/metadata/satellittdata-sentinel-2-skyfritt-opptak-norge-2022/2e996bf2-9b7b-4700-8a26-c1a8a274c136). Note: For simplicity, download data using the same coordinate system as the terrain.
- Crop the photo to the same area of interest, for example by using GDAL: `gdal_translate -projwin -35000 6737000 -25000 6727000 S2_RGB_17.tif texture.tif`
- Convert the cropped image file to a more common image format, for example PNG: `gdal_translate texture.tif texture.png`

- Note: Use the name texture.png so the OBJ file can successfully use the texture
- Open the OBJ in a mesh viewer, and inspect the result:

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/mesh-large-textured.jpg)

## Creating meshes out of building data

- Open [Maptiler](https://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/), zoom to zoom level 15, read out Google tile numbers (x and y) for the region you are interested in. In the current data setup, the tile area is `x: 16865 - 16807, y: 9442 - 9445`
- Download OpenStreetMap building tiles in GeoJSON format: `node get_buildings.mjs 16865 9442 16870 9445 buildings/`
- Convert GeoJSON building outlines to mesh objects stored in a OBJ file, with elevations matching the terrain surface:
  `node osm_to_obj.mjs -35000 6727000 bergen.obj buildings/ buildings.obj`
- Note 1): The reference point that must provided is the geo coordinate of the lower-left (most south-eastern) point of the terrain. This is so the building coordinates will match the terrain coordinates.
- Note 2): The terrain OBJ file that is used for setting building elevations must have coordinates to the same reference point. That will happen automatically if you have followed the previous steps in this documentation.

Open the building OBJ in a mesh viewer, and inspect the result:

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/buildings.jpg)

## Packaging

- Package the terrain OBJ (with texture) as a glb: `npx gltfpack -noq -i bergen.obj -o bergen.glb`
- Package the buildings OBJ (mesh only) as a glb: `npx gltfpack -noq -i buildings.obj -o buildings.glb `
- Note: The `gltfpack` command provided here results in a very simple conversion to glb. There are a lot more options that can be used when packaging, for example texture compression.

## Rendering in a browser

- Copy the glb files to the `app/` directory (one directory up)
- Go to the `app/` directory, install the dependencies for the web app: `npm install`, and start an http server there: `python3 -m http.server`
- Open a browser pointing to `http://localhost:8000` (or, the address your web server uses).
- Sit back and enjoy the final result!

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/result.jpg)
