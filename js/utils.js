import { AxisGridHelper } from '../js/jsHelper/AxisGridHelper.js';
import * as THREE from 'three';

//GUI for Helper
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
const gui = new GUI();
export { gui };

//Function for Grid
export function makeAxisGrid(node, label, units, folder) {
    const helper = new AxisGridHelper(node, units);
    folder.add(helper, 'visible').name(label);
}

// Dimensions table, balls, pockets, borders, legs, floor
const TABLE_WIDTH = 5;
export { TABLE_WIDTH };
const TABLE_HEIGHT = 0.1;
export { TABLE_HEIGHT };
const TABLE_LENGTH = 10;
export { TABLE_LENGTH };
const BALL_RADIUS = 0.05;
export { BALL_RADIUS };
const CORNER_POCKET_RADIUS = 0.1;
export { CORNER_POCKET_RADIUS };
const SIDE_POCKET_RADIUS = 0.098;
export { SIDE_POCKET_RADIUS };
const BORDER_WIDTH = 0.127;
export { BORDER_WIDTH };
const BORDER_HEIGHT = 0.3;
export { BORDER_HEIGHT };
const BORDER_LENGTH = 10.26;
export { BORDER_LENGTH };
const SHORT_BORDER_WIDTH = 5.26;
export { SHORT_BORDER_WIDTH };
const SHORT_BORDER_HEIGHT = 0.3;
export { SHORT_BORDER_HEIGHT };
const SHORT_BORDER_LENGTH = 0.127;
export { SHORT_BORDER_LENGTH };
const LEG_WIDTH = 0.2;
export { LEG_WIDTH };
const LEG_HEIGHT = 2;
export { LEG_HEIGHT };
const LEG_DEPTH = 0.2;
export { LEG_DEPTH };
const DISTANCE_FROM_FLOOR = -LEG_WIDTH-0.8;
export { DISTANCE_FROM_FLOOR };
const ROOM_SIZE = 100;
export { ROOM_SIZE };
const CEILINGHEIGHT = 10;
export { CEILINGHEIGHT };

