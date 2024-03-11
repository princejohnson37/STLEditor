import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

export async function LoadSTLGeometry(url: string): Promise<THREE.BufferGeometry> {
	return new Promise((resolve, reject) => {
		const loader = new STLLoader();

		loader.load(
			url,
			function (geometry) {
				resolve(geometry);
			},
			(xhr) => {
				// console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
			},
			(error) => {
				reject(error);
			}
		);
	});
}
export function LoadSTLModel(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
	if (material) {
		return new THREE.Mesh(geometry, material);
	}
	return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
}
