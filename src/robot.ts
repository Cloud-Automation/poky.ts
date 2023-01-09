import * as THREE from 'three'
import ArcModel, { Config as ArcConfig } from './models/arc'
import TableModel, { Config as TableConfig } from './models/table'

export type PointerType = THREE.Object3D & { readonly length: number };

export type Config = {

  table: TableConfig;
  firstArc: ArcConfig,
  nextArcs: {
    smallRadius: number;
    length: number;
  }[],
  pointer?: THREE.Object3D & { readonly length: number };

}

export default class Robot extends THREE.Group {

  private _config: Config
  private _arcList: ArcModel[] = []
  private _lastArc: ArcModel;
  private _table: TableModel;
  private _pointer?: PointerType; 
  private _range: number

  constructor (config: Config) {
    super()

    this._config = config
    this._table = new TableModel(config.table)
    this._table.translateY(1/2 * config.table.height)

    const firstArc = new ArcModel(config.firstArc)

    this._arcList.push(firstArc)
    this._lastArc = firstArc
    firstArc.translateY(config.table.height + config.firstArc.bigRadius + 2)

    this._table.add(firstArc)

    config.nextArcs.forEach((config) => {
      this.addArc(config.smallRadius, config.length)
    })

    if (config.pointer) {
      this._lastArc.add(config.pointer)
      this._pointer = config.pointer
      config.pointer.translateX(this._lastArc.length + (this._lastArc.config.smallRadius || 0))
    }

    this._range = this._arcList[0].length + this._arcList[1].length

    this.add(this._table)
  }

  private addArc (smallRadius: number, length: number): Robot {

    const newArc = this._lastArc.connect(smallRadius, length)

    this._arcList.push(newArc)
    this._lastArc = newArc

    return this

  }

  set angles (angles: number[]) {

    if (angles.length > (this._arcList.length + 1)) {
      throw new Error('Invalid angles count')
    }

    if (angles.length === 0) {
      return
    }

    this._table.angle = angles[0]

    angles.forEach((value, index) => {
      if (index === 0) {
        return
      }
      this._arcList[index - 1].angle = value
    })

  }

  get angles (): number[] {

    const res: number[] = []

    res.push(this._table.angle)

    this._arcList.forEach((arg) => {
      res.push(arg.angle)
    })

    return res

  }

  get offsetY (): number {
    return this._table.config.height + 13.5
  }

  get range (): number {
    return this._range
  }

  get length (): number[] {

    const res: number[] = []

    this._arcList.forEach((arg) => {
      res.push(arg.config.length)
    })

    return res

  }

  get pointerLength(): number {

    if (!this._config.pointer) {
      return 0
    }

    return this._config.pointer.length

  }

}
