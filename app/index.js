import * as THREE from "three";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

const canvas = document.getElementById("webgl");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1.0,
  10000
);

camera.position.set(1000, 3000, 1200);
camera.up.set(0, 0, 1);

const controls = new OrbitControls(camera, canvas);
controls.zoomSpeed = 0.8;
controls.panSpeed = 0.2;
controls.rotateSpeed = 0.1;

controls.update();

const scene = new THREE.Scene();

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight2.position.set(-0.2, 0, 0.8);
scene.add(directionalLight2);

let terrainMesh, buildingMesh;

const loader = new GLTFLoader();
loader.load(
  "terrain.glb",
  function (glb) {
    terrainMesh = glb.scene.children[0];
    terrainMesh.geometry.computeVertexNormals();
    scene.add(terrainMesh);

    controls.target.copy(terrainMesh.geometry.boundingSphere.center);

    // helper = new VertexNormalsHelper(mesh, 50, 0xcccccc);
    // scene.add(helper);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

loader.load(
  "buildings.glb",
  function (glb) {
    buildingMesh = glb.scene.children[0];
    buildingMesh.material.color.set(0xffffff);
    scene.add(buildingMesh);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

window.addEventListener("resize", () => {
  resetViewport();
});

resetViewport();
drawScene();

function drawScene() {
  requestAnimationFrame(drawScene);

  controls.update();
  renderer.render(scene, camera);
}

function resetViewport() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.update();
}
