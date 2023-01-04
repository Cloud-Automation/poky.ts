import * as THREE from 'three'
import utils from '../utils'
import ArmModel from './arm'

export type Config = {
  radius: number;
  height: number;
  material?: THREE.Material;
}

export default class TableModel extends THREE.Group {

  private _config: Config
  private _angle = 0

  constructor (config: Config) {
    super()

    this._config = config

    const geometry = new THREE.CylinderGeometry(
      config.radius, 
      config.radius, 
      config.height,
      64)
    const cylinder = new THREE.Mesh( geometry, config.material || new THREE.MeshNormalMaterial());


    const leftArm = new ArmModel({
      bigRadius: config.height / 2,
      smallRadius: config.height / 2,
      length: 13.5,
      depth: 8,
      socketRadius: 1,
    })

    leftArm.rotateZ(1/2 * Math.PI)
    leftArm.translateZ(-4)

    this.add(cylinder, leftArm)

  }

  set angle (value: number) {
    this._angle = value;
    this.rotation.y = this._angle
  }

  get angle (): number {
    return this._angle
  }

  get config (): Config {
    return this._config
  }

}
