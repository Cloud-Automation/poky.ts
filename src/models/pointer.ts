import * as THREE from 'three'

export type Config = {
  connector: {
    radius: number;
    length: number
  },
  knob: {
    radius: number;
  },
  material?: THREE.Material;
}

export default class PointerModel extends THREE.Group {

  private _config: Config

  constructor (config: Config) {
    super()

    this._config = config

    const material = config.material || new THREE.MeshNormalMaterial();

    const connectorGeometry = new THREE.CylinderGeometry(
      config.connector.radius,
      config.connector.radius,
      config.connector.length + config.knob.radius,
      64);
    const connectorMesh = new THREE.Mesh(connectorGeometry, material)

    //connectorMesh.translateX(config.connector.length / 2)

    connectorMesh.rotateZ(1/2 * Math.PI)

    const knobGeometry = new THREE.SphereGeometry(
      config.knob.radius,
      64,
      64)

    const knobMesh = new THREE.Mesh(knobGeometry, material)
    knobMesh.translateX(config.connector.length)

    this.add(connectorMesh, knobMesh)

  }

  get length (): number {
    return this._config.connector.length + 2*this._config.knob.radius
  }

}
