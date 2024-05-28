import { gui } from '../js/gui.js';
import { AxisGridHelper } from '../js/jsHelper/AxisGridHelper.js';
 
export function makeAxisGrid(node, label, units) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, 'visible').name(label);
}