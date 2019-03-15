'use strict';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;

let userPlanes = [];

const VOID_HEIGHT = 150;
const VOID_RADIUS = 20;

const Y_START = 0;
const Y_END = -VOID_HEIGHT / 2;

const PLANE_STATE_MOVES_DOWN = 'plane.state.moves_down';
const PLANE_STATE_CREATED = 'plane.state.created';
const PLANE_STATE_STOPPED = 'plane.state.stopped';
const PLANE_STATE_READY_FOR_DISPOSE = 'plane.state.ready_for_dispose';

const FIRST_SPEED = 1;
const SECOND_SPEED = 2;
const THIRD_SPEED = 2;

const xSize = 10;
const ySize = 30;
const zSize = 1;

//SCENE
let scene = new THREE.Scene();

//CAMERA
let camera = new THREE.PerspectiveCamera(174.6 / calcAspect(), calcAspect());
camera.position.y = -VOID_HEIGHT / 2;

//TESTING
// let cameraHelper = new THREE.CameraHelper(camera);
// scene.add(cameraHelper);

// let cameraRight = new THREE.PerspectiveCamera(50, calcAspect());
// let cameraRight = new THREE.OrthographicCamera(300, -300, 300, -300);

//RENDERER
let canvas = document.getElementById('3d-void');
let renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = false;

//POSTPROCESSING
let composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 2, 0, 0);
composer.addPass(bloomPass);

let afterimagePass = new THREE.AfterimagePass();
afterimagePass.renderToScreen = true;
composer.addPass(afterimagePass);

//GEOMETRY
let cylinderGeometry = new THREE.CylinderBufferGeometry(VOID_RADIUS, VOID_RADIUS, VOID_HEIGHT, 4, 8, true);
let cylinderEdges = new THREE.EdgesGeometry(cylinderGeometry);

// let width = Math.sqrt(Math.pow(2*VOID_RADIUS, 2) / 2); //2*width^2 = (2*VOID_RADIUS)^2; width == height
let width = Math.sqrt(Math.pow(VOID_RADIUS, 2) / 2); //2*width^2 = VOID_RADIUS^2; width == height
let planeGeometry = new THREE.PlaneBufferGeometry(width, width, 1, 1);
let planeEdges = new THREE.EdgesGeometry(planeGeometry);

//GEOMETRY: GRIDS
let n = xSize * ySize * zSize;
let gridGeometry = new THREE.BufferGeometry();
//get the positions of every dot in 3d space
let positions = [];
for (let i = 0; i < n; i++) {
    let p = mapTo3D(i);
    positions.push((p.x - xSize / 2) * 3.14);
    positions.push((p.y - ySize / 2) * 5);
    positions.push((p.z - zSize / 2));
}

let positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
gridGeometry.addAttribute("position", positionAttribute);

let indexPairs = [];
for (let i = 0; i < n; i++) {
    let p = mapTo3D(i);
    if (p.x + 1 < xSize) {
        indexPairs.push(i);
        indexPairs.push(mapFrom3D(p.x + 1, p.y, p.z));
    }
    if (p.y + 1 < ySize) {
        indexPairs.push(i);
        indexPairs.push(mapFrom3D(p.x, p.y + 1, p.z));
    }
    if (p.z + 1 < zSize) {
        indexPairs.push(i);
        indexPairs.push(mapFrom3D(p.x, p.y, p.z + 1));
    }
}

gridGeometry.setIndex(indexPairs);

//MATERIAL
// let cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
let cylinderMaterial = new THREE.LineBasicMaterial({ color: 0x5d963d, linewidth: 2 });

// let planeMaterial1 = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 1 });
let planeMaterial1 = new THREE.LineBasicMaterial({ color: 0x5d963d, linewidth: 1 });
let planeMaterial2 = planeMaterial1.clone();

let gridMaterial = new THREE.LineBasicMaterial();
gridMaterial.transparent = true;
gridMaterial.opacity = 0.2;

//MESH
let cylinder = new THREE.LineSegments(cylinderEdges, cylinderMaterial);
scene.add(cylinder);

let plane1 = new THREE.LineSegments(planeEdges, planeMaterial1);
let plane2 = new THREE.LineSegments(planeEdges, planeMaterial2);
plane1.position.y = plane2.position.y = Y_START;
plane1.rotation.x = plane2.rotation.x = -Math.PI / 2;
plane1.rotation.z = plane2.rotation.z = 0.788;
plane1.state = PLANE_STATE_MOVES_DOWN;
plane1.speed = FIRST_SPEED;
plane2.state = PLANE_STATE_STOPPED;
scene.add(plane1);
scene.add(plane2);

let grid1 = new THREE.LineSegments(gridGeometry, gridMaterial);
grid1.rotation.y = 0.784;

grid1.position.x = 11.55;
grid1.position.y = 5;
grid1.position.z = 9.3;
scene.add(grid1);

let grid2 = grid1.clone();
grid2.position.x = -8.6;
grid2.position.z = -10.8;
scene.add(grid2);

let grid3 = grid1.clone();
grid3.rotation.y = 2.35;
grid3.position.x = 9.2;
grid3.position.z = -11.5;
scene.add(grid3);

let grid4 = grid1.clone();
grid4.rotation.y = 2.35;
grid4.position.x = -10.7;
grid4.position.z = 8.6;
scene.add(grid4);

//

window.addEventListener('resize', onWindowResize);
document.body.addEventListener('click', addUserPlane);

camera.lookAt(cylinder.position);

//TESTING
// cameraRight.position.set(50, -50, 50);
// cameraRight.lookAt(0, -50, 0);
//
// let controls = new THREE.OrbitControls(cameraRight, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
// controls.enableZoom = true;

render();

//TESTING
// let gui = new dat.GUI();
// let cameraGui = gui.addFolder('camera right');
// cameraGui.add(cameraRight.position, 'x');
// cameraGui.add(cameraRight.position, 'y');
// cameraGui.add(cameraRight.position, 'z');
// cameraGui.add(camera, 'fov');
// cameraGui.open();
//
// let planeGui = gui.addFolder('plane');
// planeGui.add(plane1.position, 'x');
// planeGui.add(plane1.position, 'y');
// planeGui.add(plane1.position, 'z');
// planeGui.open();

//RENDER & ANIMATE FUNCTIONS
function render() {
    requestAnimationFrame(render);

    //TESTING
    // camera.lookAt(cylinder.position);
    // camera.updateProjectionMatrix();
    // cameraRight.updateProjectionMatrix();
    // cameraHelper.update();

    renderer.clear();

    animatePlanes();
    animateUserPlanes();

    //TESTING
    // renderer.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
    // cameraHelper.visible = false;

    composer.render();

    //TESTING
    // renderer.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
    // cameraHelper.visible = true;
    // renderer.render(scene, cameraRight);
}

function animatePlanes() {
    if (animatePlanes.delayed) { return; }

    //endY always is less than startY
    let half = Y_END + (VOID_HEIGHT / 2 + Y_START) / 2;

    if (plane1.position.y <= Y_END) {
        plane1.position.y = Y_START;
        plane1.material.linewidth = 0.01;
        plane1.state = PLANE_STATE_STOPPED;
        plane2.speed = FIRST_SPEED;
    }
    if (plane1.position.y <= half - 20) {
        plane2.state = PLANE_STATE_MOVES_DOWN;
        plane2.speed = SECOND_SPEED;
        plane1.speed = FIRST_SPEED;
    }

    if (plane2.position.y <= Y_END) {
        plane2.position.y = Y_START;
        plane2.material.linewidth = 0.01;
        plane2.state = PLANE_STATE_STOPPED;
        plane1.speed = FIRST_SPEED;
    }
    if (plane2.position.y <= half - 20) {
        plane1.state = PLANE_STATE_MOVES_DOWN;
        plane1.speed = SECOND_SPEED;
        plane2.speed = FIRST_SPEED;
    }

    setTimeout(function() {
        animatePlanes.delayed = false;
        if (plane1.state === PLANE_STATE_MOVES_DOWN) {
            plane1.position.y -= plane1.speed;
        }
        if (plane2.state === PLANE_STATE_MOVES_DOWN) {
            plane2.position.y -= plane2.speed;
        }

        plane1.material.linewidth = Math.abs(plane1.position.y / 15 || 0.01);
        plane2.material.linewidth = Math.abs(plane2.position.y / 15 || 0.01);

    }, 125);

    animatePlanes.delayed = true;
}

function animateUserPlanes() {
    if (!userPlanes.length || animateUserPlanes.delayed) {
        return;
    }

    setTimeout(function() {
        animateUserPlanes.delayed = false;

        for (let i = 0; i < userPlanes.length; i += 1) {
            let userPlane = userPlanes[i];
            switch (userPlane.state) {
                case PLANE_STATE_CREATED:
                    scene.add(userPlane);
                    userPlane.state = PLANE_STATE_MOVES_DOWN;
                case PLANE_STATE_MOVES_DOWN:
                    if (userPlane.position.y <= Y_END) {
                        userPlane.state = PLANE_STATE_READY_FOR_DISPOSE;
                    }

                    userPlane.position.y -= userPlane.speed;
                    userPlane.material.linewidth = Math.abs(userPlane.position.y / 15 || 0.01);
                    break;
                case PLANE_STATE_READY_FOR_DISPOSE:
                    let p = userPlanes.splice(i, 1)[0];
                    i -= 1;
                    scene.remove(p);
                    p.material.dispose();
                    p = null;
                    break;
                default:
                    break;
            }
        }
    }, 25);

    animateUserPlanes.delayed = true;
}

function addUserPlane() {
    if (userPlanes.length >= 5) {
        return;
    }

    let material = new THREE.LineBasicMaterial({ color: 0x9fdb7d, linewidth: 1 });
    let plane = new THREE.LineSegments(planeEdges, material);
    plane.state = PLANE_STATE_CREATED;
    plane.speed = THIRD_SPEED;
    plane.position.y = Y_START;
    plane.rotation.x = -Math.PI / 2;
    plane.rotation.z = 0.788;
    userPlanes.push(plane);
}

// HELPERS

//thanks to j4nw for sharing. https://discourse.threejs.org/t/3d-grid-of-lines/3850.
function mapTo3D(i) {
    let z = Math.floor(i / (xSize * ySize));
    i -= z * xSize * ySize;
    let y = Math.floor(i / xSize);
    let x = i % xSize;
    return { x: x, y: y, z: z };
}
function mapFrom3D(x, y, z) {
    return x + y * xSize + z * xSize * ySize;
}

function calcAspect() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    //in this case: cameraCount = 2
    //50 = 100 / cameraCount;
    // return Math.round(SCREEN_WIDTH / SCREEN_HEIGHT * 50) / 100;

    return Math.round(SCREEN_WIDTH / SCREEN_HEIGHT * 100) / 100;
}

function onWindowResize() {
    camera.fov = 174.6 / calcAspect();
    camera.aspect = calcAspect();
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

