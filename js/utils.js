import { AxisGridHelper } from '../js/jsHelper/AxisGridHelper.js';


import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
const gui = new GUI();
export { gui };


export function makeAxisGrid(node, label, units, folder) {
    const helper = new AxisGridHelper(node, units);
    folder.add(helper, 'visible').name(label);
}


