export class MinMaxGUIHelper {
  
  // obj: the object that contains the min and max properties -> it is camera
  // minProp: the name of the minimum property -> it is 'near'
  // maxProp: the name of the maximum property -> it is 'far'
  // minDif: the minimum difference between the two properties -> it is 0.1
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }

  // Getter for the 'min' property.
  get min() {
    return this.obj[this.minProp];
  }

  // Setter for the 'min' property.
  set min(v) {
    // Sets the value of the object's minimum property.
    this.obj[this.minProp] = v;
    // Ensures that the maximum property is always at least min + minDif.
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }

  // Getter for the 'max' property.
  get max() {
    return this.obj[this.maxProp];
  }

  // Setter for the 'max' property.
  set max(v) {
    // Sets the value of the object's maximum property.
    this.obj[this.maxProp] = v;
    // Updates the minimum property to ensure the minimum difference rule is respected so it will call the setter for 'min'.
    // I need that far is always greater than near
    this.min = this.min;
  }
}
