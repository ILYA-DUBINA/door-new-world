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
      const handMain = object.getObjectByName('handMain');
      const handFasteners = object.getObjectByName('handFasteners');
      const baseFasteners = object.getObjectByName('baseFasteners');
      
      plano.receiveShadow = true;
      porta.castShadow = true;
      porta.receiveShadow = true;
      base.castShadow = true;
      base.receiveShadow = true;
      luz.castShadow = true;
      luz.color.r = luz.color.g = luz.color.b = 255;
      luz.intensity = 0.015;
      luz.position.set(-0.8, 2, 5); 

      porta.add(handFasteners);
      handFasteners.rotateX(1.57);
      handFasteners.position.set(0, 0, 0);       
      base.add(baseFasteners);
      baseFasteners.rotateX(1.57);
      baseFasteners.position.set(-0.014, -0.004, 0.01);      

      const scaleFolder = gui.addFolder('Регулирование дверной коробки')
      scaleFolder.add(base.scale, 'z').min(0.98).max(3.5).step(0.1).name('высота');
      scaleFolder.add(base.scale, 'x').min(0.967).max(3.8).step(0.1).name('ширина');  
      scaleFolder.onChange(obj => {
        console.log(base.scale, base.position);
        if(obj.value && (obj.controller._name === 'высота' || obj.controller._name === 'ширина')){
            base.position.set(
              obj.property === 'x' ? 0.06195836514234543 - ((0.968 - obj.value)/2.3) : base.position.x, 
              0.007500767707824707,            
              -0.04286585748195648
            )  
        }      
      });
      const scaleFolderTwo = gui.addFolder('Регулирование дверного полотна')
      scaleFolderTwo.add(porta.scale, 'z').min(0.99).max(4).step(0.1).name('высота').getValue();
      scaleFolderTwo.add(porta.scale, 'x').min(0.99).max(4).step(0.1).name('ширина');  
      // scaleFolderTwo.add(porta.position, 'x').min(-5).max(4).step(0.1).name('направо / налево');  
      // scaleFolderTwo.add(porta.position, 'y').min(0.35).max(4).step(0.1).name('вверх / вниз');       
      scaleFolderTwo.onChange(obj => {
        let scaleX = -0.36046507954597473;
        let scaleY = 0.340925877690315;
        let scaleZ = 0.3294737935066223;

        // let positionX = 0.9846507954597473;
        // let positionY = 0.980925877690315;
        // let positionZ = 0.3294737935066223;

        if(obj.value && (obj.controller._name === 'высота' || obj.controller._name === 'ширина')){
          handMain.position.set(
            obj.property === 'x' ? scaleX - ((0.98 - obj.value)/1.2) : handMain.position.x, 
            obj.property === 'z' ? scaleY - ((0.98 - obj.value)/0.9) : handMain.position.y,            
            obj.property === 'y' ? scaleZ + ((0.98 - obj.value)/2) : handMain.position.z
            )  
          porta.position.set(             
             -0.36046507954597473 ,     
            obj.property === 'z' ? 0.3294737935066223 - ((0.968 - obj.value)/3) : porta.position.y,       
            0.04850925877690315 
          )               
          console.log(porta.position)
        } 
        // else if(obj.value){
        //   handMain.position.set(
        //     obj.property === 'x' ? scaleX - ((1 - obj.value)) : handMain.position.x, 
        //     obj.property === 'y' ? scaleZ - ((1 - obj.value)/1) : handMain.position.y,            
        //     obj.property === 'z' ? scaleY - ((1 - obj.value)/1.5) : handMain.position.z
        //   )
        // }        
      });
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