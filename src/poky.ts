import utils from './utils'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Robot, { Config as RobotConfig } from './robot'
import PointerModel, { Config as PointerConfig } from './models/pointer'
import InvKin from './invkin'


export type Config = {
  targetY: number;
  position: {
    type: 'relative' | 'absolute',
    x: number,
    y: number
  }
}

export default class Poky {

  private _rootElement: HTMLElement
  private _config: Config
  private _camera: THREE.PerspectiveCamera
  private _scene: THREE.Scene
  private _renderer: THREE.WebGLRenderer
  private _lastMousePosition = { offsetX: 0, offsetY: 0, active: false }
  private _robot: Robot
  private _invkin: InvKin

  constructor (rootElement?: HTMLElement | null, config?: Config) {

    if (!rootElement) {
      this._rootElement = document.createElement('div')
      document.body.append(this._rootElement)
    } else {
      this._rootElement = rootElement
    }

    if (!config) {
      this._config = {
        targetY: 50,
        position: {
          type: 'relative',
          x: 0,
          y: 1
        }
      }
    } else {
      this._config = config
    }

    this._scene = new THREE.Scene();
    // this._scene.background = new THREE.Color( 0xb0b0b0 );

    this._camera = new THREE.PerspectiveCamera(
      50, 
      this._rootElement.clientWidth / this._rootElement.clientHeight, 
      0.1, 
      1000 );
    this._renderer = new THREE.WebGLRenderer( { alpha: true });
    this._renderer.setSize( utils.getInnerWidth(this._rootElement), utils.getInnerHeight(this._rootElement) );
    this._rootElement.appendChild( this._renderer.domElement );

    // setup lights
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.2 );

    directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
    this._scene.add( directionalLight );
    this._scene.add( ambientLight );

    // initial camera position
    this._camera.position.set(0, -200, 0)
    this._camera.lookAt(0, 0, 0)

    // setup animation frame and renderer
    this._animate();


    this._initScene();

    /* initiate robot */

    const realTopLeftPosition = this._getRealPositionAt(-1, -1, 0)
    const realBottomRightPosition = this._getRealPositionAt(1, 1, 0)
    const width = Math.abs(realTopLeftPosition.x - realBottomRightPosition.x)
    const height = Math.abs(realTopLeftPosition.z - realBottomRightPosition.z)
    const maxRadius = Math.sqrt((width * 1.1 / 2) ** 2 + (height * 1.1 / 2) ** 2)

    /* Move camera so that base socket is in the bottom left corner */
    if (this._config.position.type === 'relative') {
      this._camera
        .translateX(width * (-1 * (this._config.position.x - 1/2)))
        .translateY(height * (1 * (this._config.position.y - 1/2)))
    } else if (this._config.position.type === 'absolute') {
      this._camera
        .translateX(-1 * (this._config.position.x - (width * 1/2)))
        .translateY(1 * (this._config.position.y - (height * 1/2)))
    }

    const pointerConfig: PointerConfig = {
      connector: {
        radius: 0.5,
        length: 3
      },
      knob: {
        radius: 1.5
      }
    }

    const robotConfig: RobotConfig = {
      table: {
        radius: 12,
        height: 5,
      },
      firstArc: {
        bigRadius: 9,
        smallRadius: 6,
        length: maxRadius * 1.1,
        depth: 4 ,
        socketRadius: 1,
        distance: 8
      },
      nextArcs: [ 
        {
          smallRadius: 4,
          length: maxRadius * 1.1,
        },
        {
          smallRadius: 3,
          length: 15.5
        }
      ],
      pointer: new PointerModel(pointerConfig)
    }

    this._robot = new Robot(robotConfig)
    this._invkin = new InvKin(this._robot)

    // initial position
    this._robot.angles = [ -1/4 * Math.PI, 1/2 * Math.PI, 0, 0 ]
    this._scene.add( this._robot );


    // setup events
    this._rootElement.addEventListener('touchstart', this.mouseUpdate.bind(this))
    this._rootElement.addEventListener('touchend', this.mouseUpdate.bind(this))
    this._rootElement.addEventListener('touchmove', this.mouseUpdate.bind(this))

    this._rootElement.addEventListener('mousedown', this.mouseUpdate.bind(this))
    this._rootElement.addEventListener('mouseup', this.mouseUpdate.bind(this))
    this._rootElement.addEventListener('mousemove', this.mouseUpdate.bind(this))

  }

  clear () {

    this._scene.clear()
    this._renderer.clear()

    this._renderer.domElement.remove()
  }

  private _animate (): void {
    requestAnimationFrame( this._animate.bind(this) )
    this._renderer.render( this._scene, this._camera )
  }

  private _getRealPositionAt(relX : number, relY : number, targetY: number) : THREE.Vector3 {

    const vec = new THREE.Vector3()
    const pos = new THREE.Vector3()

    vec.set(relX, -relY, 0)
    vec.unproject(this._camera)
    vec.sub(this._camera.position).normalize()

    let distance = (targetY - this._camera.position.y) / vec.y
    pos.copy(this._camera.position).add(vec.multiplyScalar(distance))

    return pos

  }

  mouseUpdateDirect (position: { x: number, y: number, active: boolean }) {

    const relX = position.x * 2 - 1
    const relY = position.y * 2 - 1
    const targetY = position.active ? 0 : this._config.targetY
    const pos = this._getRealPositionAt(relX, relY, 0)

    try {
      this._robot.angles = this._invkin.calc(pos.x, targetY, pos.z)
    } catch (e) {
    }


  }

  mouseUpdate(event: MouseEvent | TouchEvent) {

    let currentPosition = { offsetX: 0, offsetY: 0, active : false }

    if (event instanceof MouseEvent) {
      currentPosition.active = event.buttons > 0
      currentPosition.offsetX = event.offsetX
      currentPosition.offsetY = event.offsetY
      this._lastMousePosition = currentPosition
    } else if (event instanceof TouchEvent) {
      if (event.targetTouches.length === 0) {
        currentPosition = this._lastMousePosition
        return
      } 

      const rect = this._rootElement.getBoundingClientRect();
      currentPosition.active = event.targetTouches.length === 1
      currentPosition.offsetX = event.targetTouches[0].pageX - rect.left;
      currentPosition.offsetY = event.targetTouches[0].pageY - rect.top;
      this._lastMousePosition = currentPosition
    }

    this.mouseUpdateDirect({ 
      x: currentPosition.offsetX / this._rootElement.clientWidth,
      y: currentPosition.offsetY / this._rootElement.clientHeight,
      active: currentPosition.active 
    })

  }

  private _initScene(showHelper = false): void {

    // setup light


    if (showHelper) {

      const helperA = new THREE.GridHelper( 160, 100 );
      helperA.rotation.x = Math.PI / 2;

      this._scene.add(helperA)

      const helperB = new THREE.GridHelper( 160, 100 );
      helperB.rotation.y = Math.PI / 2;

      this._scene.add(helperB)

      const axesHelper = new THREE.AxesHelper( 100 );
      this._scene.add( axesHelper );

    }

    if (showHelper) {
      const controls = new OrbitControls( this._camera, this._renderer.domElement );
      controls.minDistance = 10;
      controls.maxDistance = 1000;
    }

  }

}

