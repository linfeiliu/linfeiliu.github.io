// Speed control
let stage1waitingtime = 3000;
let treebloominterval = 10000;
let createtreeinterval = 20000;
let treegrowspeed = 1;
let sun_moon_speed = 0;
let cloudspeed = 0.4;
let stage1glowspeed = 1 / 20;
let daxiao = 1;
let enter_speed = 10;
////////////////////////////////////////////////////////////////////////
let gravity = 1;
let timeUnit = 0.5;
let leave = false;
let windy = false;
let windy1 = false;
let windypp = 1;
let windyqq = 0;
let landScape = null;
let currentstage = 0;
let humanicon;
let logo;
let thanks;
// sound effects
let glow;
let bgm1;
let wind1;
let wind2;
let thunder;

var SunY_change = 0;
var moonY_change = 1;
////////////////////////////////////////////////////////////////////////
//star variables
var starX = [10, 100, 3000, 40];
var starY = [];
var radius = [];
var maxRadius = [];
var speed = [];
var numStar = 20;
var SunY = -100;
var moonY = 0;
var SunY_change = 0;
var moonY_change = 1;

//wave variables
var yOffset = 0;

//cloud variables
var cloudX = [];
var cloudY = [];
////////////////////////////////////////////////////////////////////////
// thunder
var xCoord1 = 0;
var yCoord1 = 0;
var xCoord2 = 0;
var yCoord2 = 0;
////////////////////////////////////////////////////////////////////////
var httpRequest = new XMLHttpRequest();
var state = "unknown";
var userEntered = false;
function invoke() {
  httpRequest.open('GET', 'http://127.0.0.1:5000/read', true);
  httpRequest.send();
}







function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(24);

  httpRequest.onreadystatechange = function () {
    state = httpRequest.responseText;
  }
  ////////////////////////////////////////////////////////////////////////
  moonY = 2 * windowHeight;
  //Initialise star variables
  for (var i = 0; i < numStar; i++) {
    starX[i] = random(width);
    starY[i] = random(height / 2);
    radius[i] = 0;
    maxRadius[i] = random(5, 15);
    speed[i] = random(0.05, 0.25);
  }
  //Initialise cloud variables
  for (var i = 0; i < 5; i++) {
    cloudX[i] = random(width);
    cloudY[i] = 50 + i * 100;
  }
  //thunder
  xCoord2 = 0;
  yCoord2 = height / 2;
  ////////////////////////////////////////////////////////////////////////
  landScape = new LandScape([], []);
  humanicon = loadImage('humanicon.png');
  logo = loadImage('logo1.png');
  thanks = loadImage('thanks.png');
  glow = loadSound('glow.wav');
  bgm1 = loadSound('bgm1.mp3');
  wind1 = loadSound('wind1.mp3');
  wind2 = loadSound('wind2.mp3');
  thunder = loadSound('thunder.wav');
}









let transparency = 255;
let transparency1 = 0;
let humaniconcolor = 'grey';
let glow_radius = 0;
function draw() {
  noStroke();
  let wind = createVector(0, 0);
  if (windy && windy1) {
    wind = createVector(random(300, 500), random(100, 300));
  }
  else {
    wind = createVector(random(-30, 40), 0);
  }
  ////////////////////////////////////////////////////////////////////////
  if (currentstage == 2){
    sun_moon_speed = 0.4;
  }
  if (SunY > 2.5 * windowHeight) {
    SunY_change = 1;
  }
  else if (SunY < -0.5 * windowHeight) { SunY_change = 0; }
  if (SunY_change == 0) {
    SunY = SunY + sun_moon_speed;
  }
  else if (SunY_change == 1) { SunY = SunY - sun_moon_speed; }

  if (moonY > 2.5 * windowHeight) {
    moonY_change = 1;
  }
  else if (moonY < -0.5 * windowHeight) { moonY_change = 0; }
  if (moonY_change == 0) {
    moonY = moonY + sun_moon_speed;
  }
  else if (moonY_change == 1) { moonY = moonY - sun_moon_speed; }
  //Day/night cycle background colours
  var cycle = map(SunY * 0.7, 0, height, 0, 1);
  var night = color(82, 77, 130);
  var day = color(255, 205, 168);
  var gradient = lerpColor(day, night, cycle);

  background(gradient);

  //clouds have jitter movement in y-axis


  //when clouds reach beyond edge of screen, clouds reset to original side

  fill(247, 247, 156);
  ellipse(windowWidth - 360, SunY, 200);

  fill(255);
  ellipse(360, moonY, 200);

  //create numStars amount of stars
  for (var i = 0; i < numStar; i++) {
    //stars change size (pulse)
    radius[i] += speed[i];

    //stars slow down when the raidus is greater than maxRadius
    if (radius[i] > maxRadius[i]) {
      speed[i] *= -1;
    }

    //stars reappear in a random location and grow in size, after the radius is no longer visible (<0) 
    if (radius[i] < 0) {
      speed[i] *= -1;
      starX[i] = random(width);
      starY[i] = random(0, height / 2);
    }

    //stars disppear during the day
    var starOpacity = map(SunY, 0, height, 0, 255);

    push();
    fill(255, starOpacity);
    strokeWeight(2);
    stroke(255, starOpacity - 200);
    ellipse(starX[i], starY[i], radius[i] * 1.5);
    pop();
  }
  //clouds
  fill(255);

  //drawing clouds
  for (var i = 0; i < 5; i++) {
    clouds(cloudX[i], cloudY[i]);
    cloudX[i] = cloudX[i] + cloudspeed;
    //clouds have jitter movement in y-axis
    cloudY[i] = cloudY[i] + random(-cloudspeed, cloudspeed);

    //when clouds reach beyond edge of screen, clouds reset to original side
    if (cloudX[i] > width + 50) {
      cloudX[i] = -50;
    }
  }

  /*---------- WATER ----------*/


  //Subtle colour placed ontop of the whole sketch to give it atmosphere
  //have to change the color from the original to have an opacity level
  night = color(82, 77, 130, 60);
  day = color(255, 205, 168, 60);
  gradient = lerpColor(day, night, cycle);
  fill(gradient);
  rect(0, 0, width, height);
  ////////////////////////////////////////////////////////////////////////
  landScape.update(wind);
  landScape.checkUp();
  landScape.display();
  //////////////////////////////////////////////////////////////////////// water
  for (var i = 0; i < 4; i++) {
    push();

    //mapping water colour to mouse, to match time of day
    colorMode(HSB, 360, 100, 100, 100);
    //"i" is used for the colour gradient
    var from = color(209, 26, 95 - (i * 10), 95);
    var to = color(178, 10, 95 - (i * 5), 95);
    var waterCol = lerpColor(from, to, cycle); //cycle is already mapped from 0 to 1
    fill(waterCol);

    //drawing waves from the top layer to the bottom
    waves(height - windowHeight / 6 + ((i - 1) * windowHeight / 6 / 4), height - windowHeight / 20 + ((i - 1) * windowHeight / 6 / 4), i);
    pop();
  }
  ////////////////////////////////////////////////////////////////////////
  fill([gradient['levels'][0], gradient['levels'][1], gradient['levels'][2], transparency-30]);
  rect(0, 0, windowWidth, windowHeight);
  
  image(humanicon, (windowWidth / 2 - windowHeight*daxiao / 3),(windowHeight / 2 - windowHeight *daxiao/ 3), (windowHeight * 2 / 3)*daxiao, (windowHeight * 2 / 3)*daxiao);
  if (humaniconcolor == 'grey') {
    tint([100, 100, 100, transparency-30]);
  }
  else {
    tint([255, 255, 255, transparency]);
  }
  fill( [247, 247, 180, transparency-100]);
  ellipse(windowWidth / 2, windowHeight / 2, glow_radius, glow_radius)
  if (currentstage == 0) {
    return;
  }
  if (currentstage == 1) {
    glow_radius += windowWidth * stage1glowspeed*5*enter_speed/4;
    transparency -= enter_speed;
    daxiao -=0.01/3*enter_speed;
    if (transparency < 0) {
      currentstage = 2;
      bgm1.loop();
      createTree();
      setInterval(() => {
        createTree();
      }, createtreeinterval);
    }
  }

  setInterval(() => {
    treeBloom();
  }, treebloominterval);
  //thunder
  if (windy1) {
    generate_thunder();
  }

  //Arduino web interface
  //invoke();
  /*console.log(state);
  if (state == 'NBD') {
      if (userEntered) {
          userEntered = false;
          leave == true;
          onLeave();
      } else {
          //
      }
  } else if (state == 'MOV') {
      if (userEntered) {
          windy = true;
          wind1.loop();
          wind2.play();
      }
  } else if (state == 'STL') {
      if (userEntered) {
          windy = false;
          wind1.stop();
          wind2.stop();
      } else {
          userEntered = true;
          onEnter();
      }
  }*/
  if(leave == true){
    onLeave();
  }
}

function generate_thunder() {
  for (let i = 0; i < 20; i++) {
    xCoord1 = xCoord2;
    yCoord1 = yCoord2;
    xCoord2 = xCoord1 + int(random(-200, 200));
    yCoord2 = yCoord1 + int(random(-100, 200));
    strokeWeight(random(10, 30));
    strokeJoin(MITER);
    line(xCoord1, yCoord1, xCoord2, yCoord2);

    if ((xCoord2 > width) || (xCoord2 < 0) || (yCoord2 > height) || (yCoord2 < 0)) {
      //clear();
      //drawBackground();
      xCoord2 = int(random(0, width));
      yCoord2 = 0;
      stroke(255, 255, random(0, 255));
    }
  }
}

function onEnter() {
  humaniconcolor = 'white';
  glow.play();
  setTimeout(() => {
    currentstage = 1;
  }, stage1waitingtime);
}
function onLeave() {
  windy = true;
  windy1 = true;
  if (currentstage == 2) {
    transparency1 += 1;
    daxiao = 0.5;
    fill([0,0,0, transparency1]);
    rect(-10, -10, windowWidth+10, windowHeight+10);
    image(logo, (windowWidth / 2 - windowHeight*daxiao / 3),(2*windowHeight ), (windowHeight * 2 / 3)*daxiao, (windowHeight * 2 / 3)*daxiao);
    tint([255, 255, 255, 255]);
    image(logo, (windowWidth / 2 - windowHeight*daxiao / 3),(windowHeight / 2 - windowHeight *daxiao/ 2), (windowHeight * 2 / 3)*daxiao, (windowHeight * 2 / 3)*daxiao);
    tint([255, 255, 255, 255]);
    if (transparency1 > 150) {
      currentstage = 1;
      //bgm1.loop();
    }
  }
  if (currentstage == 1) {
    transparency1 += 1;
    fill([0,0,0, transparency1]);
    rect(0, 0, windowWidth, windowHeight);
    image(logo, (windowWidth / 2 - windowHeight*daxiao / 3),(windowHeight / 2 - windowHeight *daxiao/ 2), (windowHeight * 2 / 3)*daxiao, (windowHeight * 2 / 3)*daxiao);
    tint([255, 255, 255, 255]);
    image(thanks, (windowWidth / 2 - windowHeight*daxiao / 3),(windowHeight / 2 ), (windowHeight * 2 / 3)*daxiao, (windowHeight * 2 / 3)*daxiao);
    tint([255, 255, 255, 255]);
  }
}
function mousePressed() {
  if (currentstage == 0) {
    onEnter();
  } else {
    if(windyqq == 1){
      windy1 = false;
      windy = false;
      windyqq = 0;
    } else{
      windy1 = true;
      windy = true;
      windyqq = 1;
    }
    
    if (windy1) {
      wind1.loop();
      wind2.play();
      thunder.loop();
    } else {
      wind1.stop();
      wind2.stop();
      thunder.stop();
    }
  }
}

function keyPressed() {
  if (key == 'm') {
    if (state != 'm') {
      state = 'm';
      windy1 = true;
      wind1.loop();
      wind2.play();
    }
  } else if (key == 's') {
    if (state != 's') {
      state = 's';
      windy1 = false;
      wind1.stop();
      wind2.stop();
    }
  } else if (key == 'b') {
    if (state != 'b') {
      state = 'b';
      treeBloom();
    }
  } else if (key == 'e') {
    if (state != 'e') {
      state = 'e';
      onEnter();
    }
  }else if (key == 'l') {
    if (state != 'l') {
      state = 'l';
      onLeave();
    }
  }
}
function treeBloom() {
  if (windy1) {
    return;
  }
  
  for (let tree of landScape.trees) {
    tree.bloom(() => {
      return max(floor(randomGaussian(36, 24)), 0) * 10;
    });
  }
}

function createTree() {
  let strength = floor(random(6, 8));
  let x_position;
  let tree_height;
  let middle = 1;
  switch (landScape.trees.length) {
    case 0:
      x_position = windowWidth * random(0.45, 0.55);
      tree_height = 0.95;
      middle = 2; // Bigger flowers.
      break;

    case 1:
      x_position = windowWidth * random(0.15, 0.25);
      tree_height = random(0.6, 0.8);
      break;

    case 2:
      x_position = windowWidth * random(0.75, 0.85);
      tree_height = random(0.6, 0.8);
      break;

    default:
      if(windypp ==1){
        windy = true;
        windypp = 0;
      } else {
      windy = false;
      windypp = 1}
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
    damping = 0.4,
    lineColor = [96, 96, 72,],
    bloomDepth = 0,
    flowerRubust = 0.6,
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
      // Draw petals.
      for (let i = 0; i < 5; i++) {
        ellipse(0, -0.8, 1.2, 1.2);
        rotate(radians(72));
      }
    }
  ));
}

function removeAll() {
  landScape.removeAll();
}

function outOfScreen(pos) {
  return pos.x < 0 || pos.y < 0 || pos.x > windowWidth || pos.y > windowHeight;
}


function waves(minHeight, maxHeight, nStart) {

  beginShape();
  /* xOffset - x parameter for noise
     * yOffset - y parameter for noise */
  var xOffset = nStart;
  for (var x = 0; x <= width; x += 20) {
    //using noise to determine water flow/waves
    var y = map(noise(xOffset, yOffset), 0, 1, minHeight, maxHeight);
    vertex(x, y);
    xOffset += 0.05;
  }
  yOffset += 0.001;
  vertex(width, height);
  vertex(0, height);

  endShape(CLOSE);
}

/* Description - Drawing cloud shape with ellipses */
function clouds(x, y) {
  ellipse(x, y - 10, 40);
  ellipse(x + 10, y - 10, 30);
  ellipse(x + 10, y - 10 - 10, 40);
  ellipse(x + 20, y - 10, 35);
  ellipse(x + 30, y - 10, 30);
}