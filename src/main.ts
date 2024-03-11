import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { CSG } from "three-csg-ts";
import { LoadSTLGeometry, LoadSTLModel } from "./loader/LoadSTLModel";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const gui = new GUI();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 120;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

const orbitControls = new OrbitControls(camera, renderer.domElement);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemisphereLight);

const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 10);
scene.add(hemisphereLightHelper);

const lightFolder = gui.addFolder("Light");
lightFolder.add(hemisphereLight, "intensity", 0, 1);
lightFolder.add(hemisphereLightHelper, "visible");
lightFolder.add(hemisphereLight.position, "x", -100, 100);
lightFolder.add(hemisphereLight.position, "y", -100, 100);
lightFolder.add(hemisphereLight.position, "z", -100, 100);

let loadedMesh;
let sphere;

async function init() {
	const geometry = await LoadSTLGeometry("/models/model.stl");
	const material = new THREE.MeshStandardMaterial();
	loadedMesh = new THREE.Mesh(geometry, material);
	scene.add(loadedMesh);

	sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 5, 5), new THREE.MeshStandardMaterial());
	scene.add(sphere);

	const sphereFolder = gui.addFolder("sphere");
	sphereFolder.add(sphere.position, "x", -100, 100);
	sphereFolder.add(sphere.position, "y", -100, 100);
	sphereFolder.add(sphere.position, "z", -100, 100);
	sphereFolder.add(sphere.scale, "x", 0, 100);
	sphereFolder.open();
}

init();

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

function animate() {
	stats.update();
	hemisphereLightHelper.update();

	render();
	requestAnimationFrame(animate);
}

function render() {
	renderer.render(scene, camera);
}

function performBooleanOperation() {
	if (loadedMesh && sphere) {
		const subRes = CSG.subtract(loadedMesh, sphere);
		subRes.position.x = 5;
		disposeMesh(loadedMesh)

		scene.add(subRes);

		console.log(subRes);
	}
}

document.addEventListener(
	"click",
	function (event) {
		event.preventDefault();

		// Calculate mouse position in normalized device coordinates
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

		// Raycasting
		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects([sphere]); // Check for intersection with the sphere

		if (intersects.length > 0) {
			performBooleanOperation(); // Perform boolean operation if sphere is clicked
		}
	},
	false
);
function disposeMesh(mesh) {
	// Remove the mesh from the scene
	scene.remove(mesh);

	// Dispose of the geometry
	if (mesh.geometry) {
		mesh.geometry.dispose();
	}

	// Dispose of the material
	if (mesh.material) {
		if (Array.isArray(mesh.material)) {
			mesh.material.forEach((material) => {
				material.dispose();
			});
		} else {
			mesh.material.dispose();
		}
	}
}


animate();
