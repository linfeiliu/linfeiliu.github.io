// Speed control
let stage1waitingtime = 3000;
let treebloominterval = 10000;
let createtreeinterval = 20000;
let treegrowspeed = 1;
let sun_moon_speed = 0.4;
let cloudspeed = 0.4;
let stage1glowspeed = 1 / 20;
let endscreenwaitingtime = 50000;
let speed_up = 10;
////////////////////////////////////////////////////////////////////////
// rain variables
var acceleration = 1;
var nDrops = 1000;
var rain = [];
////////////////////////////////////////////////////////////////////////
let gravity = 1;
let timeUnit = 0.5;
let windy = false;
let landScape = null;
let currentstage = 0;
let humanicon;
let logo;
// sound effects
let glow;
let bgm1;
let wind;
let thunder;
let raining;

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
var SunY = 50;
var moonY = 0;
var SunY_change = 0;
var moonY_change = 1;

//wave variables
var yOffset = 0;

//cloud variables
var cloudX = [];
var cloudY = [];
////////////////////////////////////////////////////////////////////////
// thunder variables
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





function speedup() {
  stage1waitingtime /= speed_up;
  treebloominterval /= speed_up;
  createtreeinterval /= speed_up;
  treegrowspeed *= speed_up;
  sun_moon_speed *= speed_up;
  cloudspeed *= speed_up;
  stage1glowspeed *= speed_up;
  endscreenwaitingtime /= speed_up;
}

function setup() {
  speedup();
  createCanvas(windowWidth - 10, windowHeight - 20);
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
  glow = loadSound('glow.wav');
  bgm1 = loadSound('bgm1.mp3');
  wind = loadSound('wind.mp3');
  thunder = loadSound('thunder.wav');
  raining = loadSound('raining.mp3');
  logo = loadImage('logo.png');
}









let transparency = 255;
let humaniconcolor = 'grey';
let glow_radius = 0;
function draw() {
  noStroke();
  let wind = createVector(0, 0);
  if (windy) {
    wind = createVector(random(300, 500), random(100, 300));
  }
  else {
    wind = createVector(random(-50, 50), 0);
  }
  ////////////////////////////////////////////////////////////////////////

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
    cloudY[i] = cloudY[i] + random(-0.5, 0.5);

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
  // rain
  if (windy) {
    createRain();
  }
  ////////////////////////////////////////////////////////////////////////
  if (currentstage == 3 || currentstage == 4) {
    fill([0, 0, 0, transparency - 100]);
    rect(0, 0, windowWidth, windowHeight);
    image(logo, windowWidth / 2 - windowHeight / 3, windowHeight / 2 - windowHeight / 3, windowHeight * 2 / 3, windowHeight * 2 / 3);
    tint([255, 255, 255, transparency]);
    if (transparency < 255) {
      transparency += 5;
    } else {
      if (currentstage != 4) {
        currentstage = 4; // Waiting for reloading.
        setTimeout(() => {
          location.reload();
        }, endscreenwaitingtime);
      }
    } 1
  }
  if (currentstage == 0 || currentstage == 1) {
    fill([0, 0, 0, transparency - 100]);
    rect(0, 0, windowWidth, windowHeight);
    fill([gradient['levels'][0], gradient['levels'][1], gradient['levels'][2], transparency - 100]);
    ellipse(windowWidth / 2, windowHeight / 2, glow_radius, glow_radius)
    image(humanicon, windowWidth / 2 - windowHeight / 3, windowHeight / 2 - windowHeight / 3, windowHeight * 2 / 3, windowHeight * 2 / 3);
    if (humaniconcolor == 'grey') {
      tint([150, 150, 150, transparency]);
    }
    else {
      tint([255, 255, 255, transparency]);
    }
    if (currentstage == 0) {
      return;
    }
  }
  if (currentstage == 1) {
    glow_radius += windowWidth * stage1glowspeed;
    transparency -= 5;
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
  //if (windy) {
  //  generate_thunder();
  //}



  //Arduino web interface
  //invoke();
  /*console.log(state);
  if (state == 'NBD') {
      if (userEntered) {
          userEntered = false;
          onLeave();
      } else {
          //
      }
  } else if (state == 'MOV') {
      if (userEntered) {
          windy = true;
          wind.loop();
      }
  } else if (state == 'STL') {
      if (userEntered) {
          windy = false;
          wind.stop();
      } else {
          userEntered = true;
          onEnter();
      }
  }*/
}
function createRain() {
  rain.forEach(function (d) {
    d.drawAndDrop();
  });
}
function Drop() {
  this.initX = function () {
    this.x = random(-windowWidth / 6, windowWidth);
  };
  this.initY = function () {
    this.y = random(-windowHeight / 6, windowHeight * 5 / 6); // Initialise rain.
  };

  this.initX();
  this.initY();


  this.length = random() * 10;
  this.speed = random() * 10;

  this.drawAndDrop = function () {
    this.draw();
    this.drop();
  };

  this.draw = function () {
    stroke(255, 255, 255, 200);
    strokeWeight(10);
    line(this.x, this.y, this.x, this.y + this.length);
  };

  this.drop = function () {
    if (this.y < windowHeight * 5 / 6) {
      this.y += this.speed;
      this.x += this.speed;
      this.speed += acceleration;
    } else {
      this.speed = random();
      this.initX();
      this.initY();
    }

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
  humaniconcolor = 'grey';
}
function mousePressed() {
  return;
  if (currentstage == 0) {
    onEnter();
  } else {
    windy = !windy;
    if (windy) {
      wind.loop();
      //thunder.loop();
      raining.loop();
      //rain
      for (i = 0; i < nDrops; i++) {
        rain.push(new Drop());
      }
    } else {
      wind.stop();
      //thunder.stop();
      raining.stop();
      rain = [];
    }
  }
}

function keyPressed() {
  if (key == 'm' && state != 'm') {
    if (currentstage != 0 && currentstage != 1) {
      state = 'm';
      windy = true;
      wind.loop();
      raining.loop();
      //rain
      for (i = 0; i < nDrops; i++) {
        rain.push(new Drop());
      }
    }
  } else if (key == 's' && state != 's') {
    if (state != 's') {
      state = 's';
      windy = false;
      wind.stop();
      raining.stop();
      rain = [];
    }
  } else if (key == 'b') {
    treeBloom();
  } else if (key == 'e' && state != 'e') {
    if (currentstage == 0) {
      state = 'e';
      onEnter();
    }
  } else if (key == 'l' && state != 'l') {
    if (currentstage != 0 && currentstage != 1) {
      if (state != 'm') {
        windy = true;
        wind.loop();
        raining.loop();
        //rain
        for (i = 0; i < nDrops; i++) {
          rain.push(new Drop());
        }
        onLeave()
      }
      state = 'l';
      currentstage = 3;
    }
  }
}
function treeBloom() {
  if (windy) {
    return;
  }
  for (let tree of landScape.trees) {
    tree.bloom(() => {
      return max(floor(randomGaussian(24, 12)), 0) * 10;
    });
  }
}

function createTree() {
  let strength = floor(random(6, 8));
  let x_position;
  let tree_height;
  let middle = windowWidth / 3000;
  switch (landScape.trees.length) {
    case 0:
      x_position = windowWidth * random(0.45, 0.55);
      tree_height = 0.9;
      middle = 2; // Bigger flowers.
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
    damping = 0.4,
    lineColor = [132, 90, 51,],
    bloomDepth = 0,
    flowerRubust = 0.01,
    flowerMass = () => {
      return random(100, 500) * middle;
    },
    flowerColor = () => {
      return [
        random(192, 216),
        random(96, 144),
        random(64, 96),
        255,
      ];
    },
    flowerShape = () => {
      // Draw petals.
      for (let i = 0; i < 5; i++) {
        ellipse(0, -0.8, 1.2, 1.2);
        rotate(radians(72));
      }
      // Draw pistil.
      fill([200, 51, 73, 255]);
      ellipse(0, 0, 1, 1);
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
  return;
  ellipse(x, y - 10, 40);
  ellipse(x + 10, y - 10, 30);
  ellipse(x + 10, y - 10 - 10, 40);
  ellipse(x + 20, y - 10, 35);
  ellipse(x + 30, y - 10, 30);
}