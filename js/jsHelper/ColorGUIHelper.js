export class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    // I get the color as hexadecimal string so i need # before it
    return `#${this.object[this.prop].getHexString()}`;
  }
  // I set the color as hexadecimal string.
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}