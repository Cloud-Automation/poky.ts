import * as THREE from 'three'
import utils from '../utils'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

export function createPathElement (path: string): HTMLElement {

  const svgRoot = document.createElement('svg')
  svgRoot.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const svgPath = document.createElement('path')
  svgPath.setAttribute('d', path)
  svgPath.setAttribute('fill', '#000000')
  svgRoot.append(svgPath)

  return svgRoot

}

export function createGeometryFromSVG (elem: HTMLElement, depth: number, material: THREE.Material): THREE.Group {
  const result = new THREE.Group()
  const svgMarkup = elem.outerHTML;
  const loader = new SVGLoader();
  const svgData = loader.parse(svgMarkup);
    
  svgData.paths.forEach((path: THREE.ShapePath) => {
    const shapes = path.toShapes(true);

    shapes.forEach((shape: THREE.Shape) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth,
        bevelEnabled: false
      });

      const mesh = new THREE.Mesh(geometry, material);
      result.add(mesh);
    });
  })

  return result

}

export type Config = {
  bigRadius: number;
  smallRadius?: number;
  length: number;
  depth: number;
  socketRadius: number;
  material?: THREE.Material;
}

export default class ArmModel extends THREE.Group {

  private config: Config

  constructor (config: Config) {
    super()

    this.config = config

    const bigRadius = config.bigRadius
    const smallRadius = config.smallRadius || config.bigRadius / 2
    const length = config.length
    const socketRadius = config.socketRadius
    const svgPath = 
      `M 0 ${bigRadius} ` + 
      `a ${bigRadius} ${bigRadius} 0 0 1 0 ${-2*bigRadius} ` + 
      `L ${length} ${-smallRadius} ` + 
      `a ${smallRadius} ${smallRadius} 0 0 1 0 ${2*smallRadius} ` + 
      'Z' + 
      `M 0 ${-socketRadius} ` + 
      `a ${socketRadius} ${socketRadius} 0 0 0 0 ${2*socketRadius} ` + 
      `a ${socketRadius} ${socketRadius} 0 0 0 0 ${-2* socketRadius} ` + 
      'Z' + 
      `M ${length} ${-socketRadius} ` + 
      `a ${socketRadius} ${socketRadius} 0 0 0 0 ${2* socketRadius} ` + 
      `a ${socketRadius} ${socketRadius} 0 0 0 0 ${-2* socketRadius} ` + 
      'Z'

    const svgRoot = createPathElement(svgPath)

    const material = config.material || new THREE.MeshNormalMaterial();
    const rootGeometry = createGeometryFromSVG(svgRoot, config.depth, material)

    
    this.add(rootGeometry)
  }


}
