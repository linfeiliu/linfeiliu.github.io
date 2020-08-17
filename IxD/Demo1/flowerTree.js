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
  if (!landScape.checkBloom(mouseX)) {
    createTree();
  }
}

function keyPressed() {
  if (key == ' ') {
    windy = !windy;
  } else {
    removeAll();
  }
}

function createTree() {
  let strength = floor(random(8, 10));
  landScape.addTree(new Tree(
    rootPos = createVector(mouseX, windowHeight * 5 / 6),
    totalHeight = windowHeight / 15 * strength,
    depth = strength,
    angleMean = -PI / 2,
    angleRange = PI / 3,
    asymmetry = 0.2,
    divergence = 0.8,
    precocity = 0.25,
    limit = 0.2,
    rubust = 0.2,
    damping = 0.5,
    lineColor = [96, 96, 72, ],
    bloomDepth = 0,
    flowerRubust = 0.5,
    flowerMass = () => {
      return random(12, 24);
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