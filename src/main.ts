
import { LoadSTLGeometry } from "./loader/LoadSTLModel";

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { CSG } from './utils/CSGMesh'

const scene = new THREE.Scene()

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
//create a hemisphere light that cast light from bottom 
// const hemisphereLight1 = new THREE.HemisphereLight(0x080820, 0xffffbb, 1);
// scene.add(hemisphereLight1);

// const hemisphereLight2 = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
// scene.add(hemisphereLight2);
scene.add(hemisphereLight);

const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 10);
scene.add(hemisphereLightHelper);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.x = 0.5
camera.position.y = 2
camera.position.z = 2.5

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

{
  const cubeG = await LoadSTLGeometry("/models/model.stl");
  //create a cube and sphere and intersect them
    const cubeMesh = new THREE.Mesh(
      // new THREE.BoxGeometry(2, 2, 2),
      cubeG,
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
    )
    const sphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.45),
        new THREE.MeshStandardMaterial({ color: 0x0000ff })
    )
    cubeMesh.position.set(-5, 0, -6)
    scene.add(cubeMesh)
    cubeMesh.updateMatrixWorld();
    sphereMesh.position.set(-5, 0, 6)
    scene.add(sphereMesh)
    sphereMesh.updateMatrixWorld();

    const cubeCSG = CSG.fromMesh(cubeMesh, 0)
    const sphereCSG = CSG.fromMesh(sphereMesh, 1)

    const cubeSphereIntersectCSG = cubeCSG.intersect(sphereCSG)
    const cubeSphereIntersectMesh = CSG.toMesh(
        cubeSphereIntersectCSG,
        new THREE.Matrix4(),
        [cubeMesh.material, sphereMesh.material]
    )
    cubeSphereIntersectMesh.position.set(0, 4, 0)
    scene.add(cubeSphereIntersectMesh)
    scene.remove(cubeMesh)
    scene.remove(sphereMesh)
}

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()