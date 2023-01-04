import * as THREE from 'three';
import Robot, { Config as RobotConfig } from './robot'

export default class InvKin {

    private _robot: Robot
    private _targetAngle: number

    constructor (robot: Robot, targetAngle = Math.PI) {

      this._robot = robot
      this._targetAngle = targetAngle

    }

    /** 
     * Calculating the angles q1...q4 for the robot, returning
     * a array with the requested angles. Those can be assigned to
     * the robot like so :
     *
     * robot.angles = invkin.calc(x, y, z)
     *
     */
    calc (x: number, y: number, z: number) : number[] {

      /* Adjust position system to the robot OffsetY */

      let dz = -z
      let dx = x
      let dy = y - this._robot.offsetY 

      /* Calculating the rotation angle q1 is fairly simple and
       * self explaining */

      let q1 = Math.atan2(dz, dx)

      if (isNaN(q1)) {
        throw new Error('Invalid Position')
      }

      /* temps for the robot joint lengths */

      const a = this._robot.length[0];
      const b = this._robot.length[1];
      const c = this._robot.length[2] + this._robot.pointerLength
 
      /* the 3d problem is simplified in to a 2d problem
       * with a kinematic for 2 degrees of freedom */

      const newX = Math.sqrt(dz ** 2 + dx ** 2) - Math.sin(this._targetAngle) * c
      const newY = dy - Math.cos(this._targetAngle) * c

      /* t is the length of the hypert. of the 2d position
       * q2 and q3 are calculated with the help of the law of cosine
       * also fairly simple */

      const t = Math.sqrt(newX ** 2 + newY ** 2)
      const q2 = Math.acos( ( a ** 2 + t ** 2 - b ** 2) / ( 2 * a * t ) ) + (Math.asin(newY/t))
      const q3 = Math.PI +  Math.acos((a ** 2 + b ** 2 - t ** 2) / (2*a*b));

      if (isNaN(q2) || isNaN(q3)) {
        throw new Error('Invalid Position')
      }

      return [ q1, q2, q3, 1/2 * Math.PI + this._targetAngle - q2 - q3 ]

    }


  }



