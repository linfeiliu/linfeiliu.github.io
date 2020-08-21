let gravity = 1;
let timeUnit = 0.5;
let windy = false;
let landScape = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(24);
  landScape = new LandScape([], []);
}

function draw() {
  let wind = createVector(0, 0);
  if (windy) {
    wind = createVector(random(5, 15), 0);
  }
  landScape.update(wind);
  landScape.checkUp();
  landScape.display();
}

function mousePressed() {
  createTree();
}

function keyPressed() {
  if (key == ' ') {
    windy = !windy;
  } else if (key == 'b') {
    treeBloom();
  }
  else {
    removeAll();
  }
}
function treeBloom() {
  for (let tree of landScape.trees) {
    tree.bloom(() => {
      return max(floor(randomGaussian(24, 12)), 0);
    });
  }
}

function createTree() {
  let strength = floor(random(8, 10));
  let x_position;
  let tree_height;
  let middle = 1;
  switch (landScape.trees.length) {
    case 0:
      x_position = windowWidth * random(0.45, 0.55);
      tree_height = 0.9;
      middle = 3; // Bigger flowers.
      break;

    case 1:
      x_position = windowWidth * random(0.15, 0.25);
      tree_height = random(0.5, 0.6);
      break;

    case 2:
      x_position = windowWidth * random(0.75, 0.85);
      tree_height = random(0.5, 0.6);
      break;

    default:
      return
      break;
  }
  landScape.addTree(new Tree(
    rootPos = createVector(x_position, windowHeight * 5 / 6),
    totalHeight = windowHeight * 5 / 6 * tree_height,
    depth = strength,
    angleMean = -PI / 2,
    angleRange = PI / 2.5,
    asymmetry = 0.1,
    divergence = 0.8,
    precocity = 0.25,
    limit = 0.2,
    rubust = 0.2,
    damping = 0.5,
    lineColor = [96, 96, 72,],
    bloomDepth = 0,
    flowerRubust = 0.1,
    flowerMass = () => {
      return random(10, 100) * middle;
    },
    flowerColor = () => {
      return [
        random(192, 216),
        random(96, 144),
        random(64, 96),
        192,
      ];
    },
    flowerShape = () => {
      ellipse(0, 0, 1.2, 1.2);
    }
  ));
}

function removeAll() {
  landScape.removeAll();
}

function outOfScreen(pos) {
  return pos.x < 0 || pos.y < 0 || pos.x > windowWidth || pos.y > windowHeight;
}