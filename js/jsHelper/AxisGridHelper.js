import * as THREE from 'three';
// Turns both axes and grid visible on/off
// lil-gui requires a property that returns a bool
// to decide to make a checkbox so we make a setter
// and getter for `visible` which we can tell lil-gui
// to look at.
export class AxisGridHelper {
  constructor(node) {
    const axes = new THREE.AxesHelper();
    //Axis will be visible over other objects -> i will not have z-index artifacts (depthWrite = false)
    axes.material.depthTest = false;
    node.add(axes);
    this.axes = axes;
    //Initially it's not visible
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }

  set visible(v) {
    this._visible = v;
    this.axes.visible = v;
  }
}