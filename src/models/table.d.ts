import * as THREE from 'three';
export type Config = {
    radius: number;
    height: number;
    material?: THREE.Material;
};
export default class TableModel extends THREE.Group {
    private _config;
    private _angle;
    constructor(config: Config);
    set angle(value: number);
    get angle(): number;
    get config(): Config;
}
