import * as THREE from 'three';
import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Reflector } from 'three/addons/objects/Reflector.js';
import './style.css';

const scene = new THREE.Scene();
const fbxLoader = new FBXLoader();
fbxLoader.load(
    'models/door/door.fbx',
    (object) => {      
      const gui = new dat.GUI({ closeFolders: true, title: 'Изменения двери по высоте и ширине' }); 
      const plano = object.getObjectByName('plano');
      const porta = object.getObjectByName('porta');
      const luz = object.getObjectByName('luz');
      const base = object.getObjectByName('base');
      
      plano.receiveShadow = true;
      porta.castShadow = true;
      porta.receiveShadow = true;
      base.castShadow = true;
      base.receiveShadow = true;
      luz.castShadow = true;
      luz.color.r = luz.color.g = luz.color.b = 255;
      luz.intensity = 0.015;
      luz.position.set(-0.8, 2, 5);  

      const scaleFolder = gui.addFolder('Регулирование дверной коробки')
      scaleFolder.add(base.scale, 'z').min(0.3).max(5).step(0.1).name('высота');
      scaleFolder.add(base.scale, 'x').min(0.3).max(5).step(0.1).name('ширина');  
      const scaleFolderTwo = gui.addFolder('Регулирование дверного полотна')
      scaleFolderTwo.add(porta.scale, 'z').min(0.5).max(5).step(0.1).name('высота');
      scaleFolderTwo.add(porta.scale, 'x').min(0.3).max(5).step(0.1).name('ширина');  
      scaleFolderTwo.add(porta.position, 'x').min(-5).max(5).step(0.1).name('направо / налево');  
      scaleFolderTwo.add(porta.position, 'y').min(0.35).max(5).step(0.1).name('вверх / вниз');  

      scene.add(object);
    }
)
const gltfLoader = new GLTFLoader();
gltfLoader.load(
    'models/light-source/Lantern.gltf',
    (object) => {
      object.scene.traverse( function( node ) {
        if ( node.isMesh ) { node.castShadow = true; }
      } );
      object.scene.scale.set(0.15, 0.15, 0.15);
      object.scene.position.set(-2.5, 0, 5);
      scene.add(object.scene);
    }
)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const cursor = {
  x: 0,
  y: 0,
}
const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height);
camera.position.z = 3;
camera.position.y = 2;
camera.position.x = -2;
scene.add( camera );

const canvas = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x5EA1EC);
renderer.render(scene, camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const geometry = new THREE.IcosahedronGeometry( 0.3, 5 );  
const circleMirror = new Reflector( geometry, {
					clipBias: 0.003,
					textureWidth: window.innerWidth * window.devicePixelRatio,
					textureHeight: window.innerHeight * window.devicePixelRatio,
					color: 0xc1cbcb
				} );
circleMirror.receiveShadow = true;
circleMirror.castShadow = true;
circleMirror.position.set(2, 0.5, 2);
scene.add( circleMirror );
const sphereMaterial = new THREE.MeshStandardMaterial( 
  {
    roughness: 0.05,
    metalness: 1
  });
const sphereMesh = new THREE.Mesh( geometry, sphereMaterial );
sphereMesh.receiveShadow = true;
sphereMesh.castShadow = true;
sphereMesh.position.set(-2, 0.5, 2);
scene.add( sphereMesh );

window.addEventListener('mousemove', (event) => {
  cursor.x = -(event.clientX / sizes.width - 0.5);
  cursor.y = event.clientY / sizes.height - 0.5;
})
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth; 
  sizes.height = window.innerHeight;
  
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
})
const tick = () => {
  controls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();