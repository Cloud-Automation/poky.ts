import * as THREE from 'three'
import ArmModel, { Config as ArmModelConfig, createPathElement, createGeometryFromSVG } from './arm'

export type Config = ArmModelConfig & {
  distance: number;
}

export default class ArcModel extends THREE.Group {

  private _angle = 0
  private _config: Config
  private _nextArc?: ArcModel

  constructor (config: Config) {
    super()

    this._config = config

    const firstArm = new ArmModel(config)
    const secndArm = new ArmModel(config)

    firstArm.translateZ(-1/2 * config.distance - config.depth)
    secndArm.translateZ(1/2 * config.distance)

    const bigRadius = config.bigRadius
    const smallRadius = config.smallRadius || config.bigRadius / 2
    const socketRadius = config.socketRadius

    const svgBigFillerPath = 
      `M 0 ${bigRadius} `+
      `a ${bigRadius} ${bigRadius} 0 0 1 0 ${-2 * bigRadius} ` +
      `a ${bigRadius} ${bigRadius} 0 0 1 0 ${2 * bigRadius} ` + 
      'Z' +
      `M 0 ${-socketRadius} ` + 
      `a ${socketRadius} ${socketRadius} 0 0 0 0 ${2* socketRadius} ` + 
      `a ${socketRadius} ${socketRadius} 0 0 0 0 ${-2* socketRadius} ` + 
      'Z'


    const svgSmallFillerPath = 
      `M 0 ${smallRadius} `+
      `a ${smallRadius} ${smallRadius} 0 0 1 0 ${-2 * smallRadius} ` +
      `a ${smallRadius} ${smallRadius} 0 0 1 0 ${2 * smallRadius} ` + 
      'Z' +
      `M 0 ${-socketRadius} ` + 
      `a ${socketRadius} ${socketRadius} 0 0 0 0 ${2* socketRadius} ` + 
      `a ${socketRadius} ${socketRadius} 0 0 0 0 ${-2* socketRadius} ` + 
      'Z'


    const svgBigFiller = createPathElement(svgBigFillerPath)
    const svgSmallFiller = createPathElement(svgSmallFillerPath)

    const material = config.material || new THREE.MeshNormalMaterial()
    const bigFillerGeometry = createGeometryFromSVG(svgBigFiller, config.distance, material)
    const smallFillerGeometry = createGeometryFromSVG(svgSmallFiller, config.distance, material)

    bigFillerGeometry.translateZ(-1/2 * config.distance)
    smallFillerGeometry.translateZ(-1/2 * config.distance).translateX(config.length)

    this.add(firstArm, secndArm, bigFillerGeometry, smallFillerGeometry)

  }

  set angle (value: number) {
    this._angle = value;
    this.rotation.z = this._angle
  }

  get angle (): number {
    return this._angle
  }

  get length (): number {
    return this._config.length
  }

  get config (): Config {
    return this._config
  }

  connect (smallRadius: number, length: number) : ArcModel {

    const arcConfig: Config = {
      bigRadius: this._config.smallRadius || (this._config.bigRadius / 2),
      smallRadius,
      length,
      depth: this._config.depth / 2,
      distance: this._config.distance / 2,
      socketRadius: this._config.socketRadius,
      material: this._config.material
    }

    this._nextArc = new ArcModel(arcConfig)

    this._nextArc.translateX(this._config.length)
    this.add(this._nextArc)
    return this._nextArc
  }


}
