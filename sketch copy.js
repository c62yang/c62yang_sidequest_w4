/*
Week 4 — Example 3: JSON Levels + Level class
Course: GBDA302
Instructors: Dr. Karen Cochrane and David Han
Date: Feb. 5, 2026

What this example teaches:
1) preload() + loadJSON() so external data is available before setup() runs. 
2) How to turn raw JSON arrays into objects (instances of a Level class). 
3) How to switch between multiple levels by index (by pressing N on the keyboard). 
4) How to resize the canvas when different levels have different dimensions. 

Important concept:
- "levels.json is just data"
- "Level (class) is code that knows how to interpret + draw that data"

*/

// ----------------------------
// Globals (shared sketch state)
// ----------------------------

// Raw JSON object loaded from disk.
// After preload(), it looks like: { levels: [ [ [..row..], [..row..] ], ... ] }
let levelsData;

// Array of Level objects (one object per grid in the JSON).
let levels = [];

// Index of the current active level in the `levels` array.
let current = 0;

// Tile size (pixels per grid cell).
const TS = 32;
let player;


// ----------------------------
// p5 preload: load assets/data
// ----------------------------

function preload() {
  // loadJSON runs in preload so that by the time setup() runs,
  // we can safely read levelsData.levels.
  levelsData = loadJSON("levels.json");
}

// ----------------------------
// Level class
// ----------------------------

/*
A Level represents ONE grid (one 2D array from the JSON file).

Responsibilities of Level:
- Store the grid
- Report its size (rows/cols, pixel width/height)
- Draw tiles to the canvas

Note:
- We are not using start/goal values (2 and 3) yet for gameplay.
  In this example, we’re only drawing walls vs floors like Example 2.
*/
class Level {
  constructor(grid, tileSize) {
    this.grid = grid;
    this.ts = tileSize;
    this.start = this.findTile(2);
    this.goal = this.findTile(3);
  }

  cols() {
    return this.grid[0].length;
  }

  rows() {
    return this.grid.length;
  }

  pixelWidth() {
    return this.cols() * this.ts;
  }

  pixelHeight() {
    return this.rows() * this.ts;
  }

 findTile(value) {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        if (this.grid[r][c] === value) {
          return createVector(c, r);
        }
      }
    }
    return createVector(1, 1);
  }

  isWall(c, r) {
    if (r < 0 || r >= this.rows() || c < 0 || c >= this.cols()) return true;
    return this.grid[r][c] === 1;
  }

  /*
  Draw the grid.

  Tile legend:
  - 1 = wall (dark teal)
  - anything else (0, 2, 3) = floor colour

  Why treat 2/3 as floor right now?
  - This example focuses on JSON loading + multi-level switching,
    not gameplay semantics yet.
  - In the next example you can extend the drawing to highlight 2/3. 
  */

  draw() {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        const v = this.grid[r][c];

        if (v === 1) fill(30, 50, 60);
        else fill(230);

        rect(c * this.ts, r * this.ts, this.ts, this.ts);

        if (v === 2) {
          fill(80, 180, 120);
          rect(c * this.ts + 8, r * this.ts + 8, this.ts - 16, this.ts - 16);
        }

        if (v === 3) {
          fill(220, 120, 80);
          rect(c * this.ts + 8, r * this.ts + 8, this.ts - 16, this.ts - 16);
        }
      }
    }
  }
}

// ----------------------------
// setup: build objects, make canvas
// ----------------------------

function setup() {
  /*
  Convert raw data into objects.

  levelsData.levels is an array of grids (2D arrays).
  We map each grid to a new Level instance.
  */
  levels = levelsData.levels.map((grid) => new Level(grid, TS));

  // Create a canvas that fits the first level.
  // This mirrors earlier approach of basing size on the current grid.
  createCanvas(levels[current].pixelWidth(), levels[current].pixelHeight());

  noStroke();
  textFont("sans-serif");
  textSize(14);
  
  startLevel(current);

}

function startLevel(index) {
  current = index;
  resizeCanvas(levels[current].pixelWidth(), levels[current].pixelHeight());
  player = levels[current].start.copy();
}

// ----------------------------
// draw: render the current level
// ----------------------------

function draw() {
  background(240);

  // Ask the current Level object to draw itself.
  // This keeps draw() clean as the project grows.
  levels[current].draw();
    drawPlayer();


  // Simple UI label (“press N for next”).
  fill(0);
  text("Level " + (current + 1) + " — press N for next", 10, 16);
  if (player.x === levels[current].goal.x && player.y === levels[current].goal.y) {
    const next = (current + 1) % levels.length;
    startLevel(next);
  }
}

function drawPlayer() {
  fill(60, 120, 220);
  rect(player.x * TS + 6, player.y * TS + 6, TS - 12, TS - 12);
}
// ----------------------------
// keyPressed: switch levels
// ----------------------------

function keyPressed() {
  let dx = 0;
  let dy = 0;

  if (keyCode === LEFT_ARROW) dx = -1;
  if (keyCode === RIGHT_ARROW) dx = 1;
  if (keyCode === UP_ARROW) dy = -1;
  if (keyCode === DOWN_ARROW) dy = 1;

  if (dx !== 0 || dy !== 0) {
    const nx = player.x + dx;
    const ny = player.y + dy;

    if (!levels[current].isWall(nx, ny)) {
      player.x = nx;
      player.y = ny;
    }
  }
}