import * as fs from "fs";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if (process.argv.length != 7) {
  console.log(
    "Usage: node get_buildings.mjs <min_x> <min_y> <max_x> <max_y> <output_dir>"
  );
} else {
  const tileMin = [parseFloat(process.argv[2]), parseFloat(process.argv[3])];
  const tileMax = [parseFloat(process.argv[4]), parseFloat(process.argv[5])];

  const outputDir = process.argv[6];

  for (let y = tileMin[1]; y <= tileMax[1]; y++) {
    for (let x = tileMin[0]; x <= tileMax[0]; x++) {
      const url = `https://a.data.osmbuildings.org/0.2/anonymous/tile/15/${y}/${x}.json`;
      console.log("Downloading", url);

      const response = await fetch(url);
      const jsonText = await response.text();
      const outputFile = outputDir + `${y}-${x}.json`;

      fs.writeFileSync(outputFile, jsonText);

      await sleep(2000);
    }
  }
}
