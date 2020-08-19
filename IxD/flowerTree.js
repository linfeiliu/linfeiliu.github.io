let gravity = 1;
let timeUnit = 0.5;
let windy = false;
let landScape = null;

let treecreated = false;
let bloomed = false;
//face
let ease = 0.3;
let video;
let poseNet;
let poses = [];
let x = 0;
let y = 0;
let a = 0;
let s = 0;
//motion
let previousFrame;
let threshold = 15;
threshold = threshold * threshold;
let r1, g1, b1, r2, g2, b2, diff, motionColor;


function setup() {
	createCanvas(windowWidth, windowHeight);
	frameRate(24);
	landScape = new LandScape([], []);
	//face
	video = createCapture(VIDEO);
	video.size(width, height);
	video.hide();
	poseNet = ml5.poseNet(video);
	poseNet.on('pose', poseDetected);

	//motion
	prevFrame = createImage(video.width, video.height);
	prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
}

function draw() {
	let wind = createVector(0, 0);
	if (windy) {
		wind = createVector(random(5, 15), 0);
	}
	landScape.update(wind);
	landScape.checkUp();
	landScape.display();
	//face
	drawFace();

	//motion
	//translate(width, 0); // move to far corner
	//scale(-1.0, 1.0);    // flip x-axis backwards
	prevFrame.loadPixels();
	video.loadPixels();

	//loop through every pixel	every four is a new pixel
	//to speed it up we are checking every other pixel
	for (let i = 0; i < video.pixels.length; i += 4) {
		//compare colors (previous vs. current)
		r1 = video.pixels[i];
		g1 = video.pixels[i + 1];
		b1 = video.pixels[i + 2];
		r2 = prevFrame.pixels[i];
		g2 = prevFrame.pixels[i + 1];
		b2 = prevFrame.pixels[i + 2];
		motionColor = (isMoving(r1, g1, b1, r2, g2, b2));

		// FUN SECTION
		//no motion detected
		windy = false;
		// Motion Detected
		if (motionColor >= threshold) {
			windy = true;
		}

	}

	setTimeout(function () {
		prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
	}, 200)


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
		rootPos = createVector(windowWidth / 2, windowHeight * 5 / 6),
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
		lineColor = [96, 96, 72,],
		bloomDepth = 0,
		flowerRubust = 0.5,
		flowerMass = () => {
			return random(12, 24);
		},
		flowerColor = () => {
			return [
				0,
				255,
				0,
				random(0, 255),
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

//face
function poseDetected(results) {
	poses = results;
}

function drawFace() {
	let detected = false;
	for (let i = 0; i < poses.length; i++) {
		detected = true;
	}
	if (detected) {
		if (!treecreated) {
			treecreated = true;
			createTree();
		}
		if (treecreated & !bloomed) {
			bloomed = true;
			setTimeout(() => {
				for (let tree of landScape.trees) {
					pointToATree = true;
					tree.bloom(() => {
						return max(floor(randomGaussian(24, 12)), 0);
					});
				}
				// grow automatically
				setInterval(() => {
					if (treecreated) {
						if (bloomed) {
							if (landScape.flowers.length < 10) {
								for (let tree of landScape.trees) {
									pointToATree = true;
									tree.bloom(() => {
										return max(floor(randomGaussian(24, 12)), 0);
									});
								}
							}
						}
					}
				}, 5000);
			}, 5000);

		}
	}
}

//motion
function isMoving(r1, g1, b1, r2, g2, b2) {
	return ((r2 - r1) * (r2 - r1)) + ((g2 - g1) * (g2 - g1)) + ((b2 - b1) * (b2 - b1));
	// return ((r2 - r1) * (r2 - r1)) + ((g2 - g1) * (g2 - g1)) + ((b2 - b1) * (b2 - b1))%15 > threshold;
}