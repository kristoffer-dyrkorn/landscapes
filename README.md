# landscapes

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/result.jpg)

Landscape visualization in the browser - as presented at NDC 2023.

This repo contains code for a `node` app for data processing, and a simple web app for rendering/presentation.

The code is meant to be run on geodata as described in the documentation below. You will need to have `npm` and a newer version of `node` (20.2, for example) installed.

# Getting data, processing files

## Terrain

- Download a terrain model (GeoTIFF file), for example from [Kartkatalogen](https://kartkatalog.geonorge.no/metadata/dtm-10-terrengmodell-utm33/dddbb667-1303-4ac5-8640-7ec04c0e3918). Note: Use an UTM-based coordinate system, for example UTM33N.
- Open a terminal vindow and go to the `preprocessing/` directory. Install the dependencies: `npm install`.
- Crop the terrain model to an area of interest, for example by using GDAL: `gdal_translate -projwin -35000 6737000 -25000 6727000 67m1_2_10m_z33.tif bergen.tif`.
- Convert the GeoTIFF to a mesh, simplify it and save it as an OBJ: `node simplify_mesh.mjs bergen.tif bergen.obj`
- Note 1): The simplification process keeps removing triangles until the max vertical error introduced by simplification is 1 meter. This can be adjusted in the source code.
- Note 2): The OBJ file refers to a texture file called texture.png, which is not yet created. You might get warnings when opening the OBJ at this stage.
- Note 3): The mesh vertices in the OBJ will have coordinates relative to the lower left corner of the terrain. This mainly a convenience, but also improves numerical precision.
- Open the OBJ in a mesh viewer, for example MeshLab, and have a look at the result:

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/mesh-large.jpg)

## Terrain texture

- Download an orthophoto, for example a satellite image (GeoTIFF file) from [Kartkatalogen](https://kartkatalog.geonorge.no/metadata/satellittdata-sentinel-2-skyfritt-opptak-norge-2022/2e996bf2-9b7b-4700-8a26-c1a8a274c136). Note: For simplicity, download data using the same coordinate system as the terrain. This way you will not need to reproject the image.
- Crop the photo to the same area of interest, for example by using GDAL: `gdal_translate -projwin -35000 6737000 -25000 6727000 S2_RGB_17.tif texture.tif`
- Convert the cropped image file to a more common image format, for example PNG: `gdal_translate texture.tif texture.png`
- Note: Use the file name `texture.png` for the output so the (currently hardcoded) material definition that the OBJ points to can read the texture.
- Open the OBJ in a mesh viewer - now the surface should be textured:

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/mesh-large-textured.jpg)

## Creating meshes out of building outlines

- Open [Maptiler](https://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/), zoom to zoom level 15, read out Google tile numbers (x and y) for the region you are interested in. In the current data setup, one possible tile area can be `x: 16865 - 16870, y: 9442 - 9445`.
- Download OpenStreetMap building tiles in GeoJSON format: `node get_buildings.mjs 16865 9442 16870 9445 buildings/`.
- Convert the GeoJSON building outlines to mesh objects stored in a OBJ file, and set elevations so they are clamped to the terrain surface: `node osm_to_obj.mjs -35000 6727000 bergen.obj buildings/ buildings.obj`.
- Note 1): The reference point that must provided is the geo coordinate of the lower-left (most south-western) point of the terrain. This is to ensure the building coordinates have same local coordinate system as the terrain has.
- Note 2): The terrain OBJ file that is used for setting the building elevations must have the same local coordinate system as the buildings. This will happen automatically if you have followed the steps in this documentation.

Open the building OBJ in a mesh viewer:

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/buildings.jpg)

## Packaging

- Package the terrain OBJ (with texture) as a GLB: `npx gltfpack -noq -i bergen.obj -o bergen.glb`
- Package the buildings OBJ (mesh only) as a GLB: `npx gltfpack -noq -i buildings.obj -o buildings.glb `
- Note: The `gltfpack` command provided here gives a very simple conversion to GLB. There are a lot more options that can be explored and used when packaging OBJ files, for example can gltfpack enable texture compression.

# Rendering in a browser

- Copy the GLB files to the `app/` directory (one directory up)
- Go to the `app/` directory, install the dependencies for the web app: `npm install`, and start an http server there: `python3 -m http.server`
- Open a browser pointing to `http://localhost:8000` (or, the address provided by your web server).
- Sit back and enjoy the final rendering!

![](https://github.com/kristoffer-dyrkorn/landscapes/blob/main/images/result.jpg)
