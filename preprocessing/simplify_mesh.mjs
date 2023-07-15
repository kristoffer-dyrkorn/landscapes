import { fromArrayBuffer } from "geotiff";
import * as fs from "fs";
import Delatin from "delatin";

function flipRaster(data, width, height) {
  const flippedArray = data.slice();
  for (let y = 0; y < height; y++) {
    const start = y * width;
    const end = start + width - 1;
    const target = (height - y - 1) * width;
    flippedArray.set(data.subarray(start, end + 1), target);
  }

  return flippedArray;
}

function toOBJVertices(tin, resolution) {
  let verticesString = "";
  for (let i = 0; i < tin.coords.length; i += 2) {
    const x = tin.coords[i];
    const y = tin.coords[i + 1];
    const z = tin.heightAt(x, y);
    verticesString += `v ${x * resolution} ${y * resolution} ${z.toFixed(2)}\n`;
  }

  return verticesString;
}

function toOBJIndices(vertices) {
  let indicesString = "";
  for (let i = 0; i < vertices.length; i += 3) {
    const v1 = vertices[i] + 1;
    const v2 = vertices[i + 1] + 1;
    const v3 = vertices[i + 2] + 1;
    indicesString += `f ${v2}/${v2} ${v1}/${v1} ${v3}/${v3}\n`;
  }

  return indicesString;
}

function toUVCoordinates(vertices, resolution, bbox) {
  let uvString = "";

  for (let i = 0; i < vertices.length; i += 2) {
    const x = vertices[i];
    const y = vertices[i + 1];

    const u = (x * resolution) / (bbox[2] - bbox[0] - resolution);
    const v = (y * resolution) / (bbox[3] - bbox[1] - resolution);

    uvString += `vt ${u.toFixed(4)} ${v.toFixed(4)}\n`;
  }
  return uvString;
}

if (process.argv.length != 4) {
  console.log(
    "Usage: node simplify_mesh.mjs <input geotiff file> <output obj file>"
  );
} else {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];

  console.log("Opening GeoTIFF file:", inputFile);

  const tiffArrayBuffer = fs.readFileSync(inputFile, null).buffer;
  const tiff = await fromArrayBuffer(tiffArrayBuffer);

  console.log("Reading height values from file...");
  const image = await tiff.getImage();

  const origin = image.getOrigin();
  let resolution = image.getResolution();
  const bbox = image.getBoundingBox();

  let data = await image.readRasters();
  const { width, height } = data;

  if (resolution[1] < 0) {
    data = flipRaster(data[0], width, height);
  } else {
    data = data[0];
  }
  resolution = resolution[0];

  console.log("Image size:", width, height);
  console.log("Projection:", image.geoKeys["PCSCitationGeoKey"]);
  console.log("Resolution:", resolution);
  console.log("Origin:", origin);
  console.log("Bounding box:", bbox);
  console.log("Triangle count:", 2 * (width - 1) * (height - 1));

  const tin = new Delatin(data, width, height);

  console.log("Simplifying mesh...");

  // simplify mesh but keep within 0.5 meter deviation of the original
  tin.run(0.5);

  console.log("...done.");
  const ratio = (100 * tin.triangles.length) / (2 * (width - 1) * (height - 1));

  console.log(
    `Triangle count: ${tin.triangles.length}, ${ratio.toFixed(1)}% of original`
  );

  const objVertices = toOBJVertices(tin, resolution);
  const objIndices = toOBJIndices(tin.triangles);
  const uvCoordinates = toUVCoordinates(tin.coords, resolution, bbox);

  const header = "mtllib terrain.mtl\nusemtl material0\n";

  fs.writeFileSync(
    outputFile,
    header + objVertices + uvCoordinates + objIndices
  );
}
