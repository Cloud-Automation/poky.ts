import * as THREE from 'three';
import { Config as ArmModelConfig } from './arm';
export type Config = ArmModelConfig & {
    distance: number;
};
export default class ArcModel extends THREE.Group {
    private _angle;
    private _config;
    private _nextArc?;
    constructor(config: Config);
    set angle(value: number);
    get angle(): number;
    get length(): number;
    get config(): Config;
    connect(smallRadius: number, length: number): ArcModel;
}
