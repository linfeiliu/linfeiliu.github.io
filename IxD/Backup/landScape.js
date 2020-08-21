function LandScape(trees, flowers) {
  this.bgColor = 240;
  this.waterColor = [240, 128,];
  this.cloudColor = 255;
  this.mountainSunnyColor = 216;
  this.mountainShadowColor = 192;
  this.ground = windowHeight * 5 / 6;
  this.flowerScatter = 0.5;
  this.baseWind = 5;
  this.airDamping = 0.1;
  this.waterDamping = (y) => {
    return this.airDamping * 2 * (1 + (windowHeight - y) / (windowHeight - this.ground));
  };
  this.waterFlow = (wind, y) => {
    let baseFlow = 1 + (y - this.ground) / (windowHeight - this.ground);
    return createVector(baseFlow * (1 + wind.x / this.baseWind), 0);
  };

  this.mountains = [];
  this.clouds = [];
  this.trees = [];
  this.flowers = [];

  this.generateMountains = () => {
    let orogene = [];
    for (let i = 0; i < 6; i++) {
      let x = 0;
      let valid = false;
      while (!valid) {
        valid = true;
        x = random(0.1, 0.9) * windowWidth;
        orogene.forEach((pos) => {
          if (abs(x - pos.x) < windowWidth / 20) {
            valid = false;
          }
        });
      }
      orogene.push(createVector(
        x,
        random(0.5, 1) * cos((x - windowWidth * 0.5) / windowWidth * 2)
      ));
    }
    orogene.sort((a, b) => {
      return a.y > b.y ? -1 : 1;
    });
    orogene.forEach((pos) => {
      this.mountains.push(new Mountain(
        createVector(pos.x, this.ground),
        createVector(windowWidth * 0.5 * pos.y, windowHeight * 0.6 * pos.y),
        windowWidth * 0.25 * pos.y,
        this.mountainSunnyColor,
        this.mountainShadowColor
      ));
    });
  };
  this.generateMountains();

  this.generateClouds = () => {
    for (let i = 0; i < 4; i++) {
      this.clouds.push(new Cloud(
        createVector(windowWidth * random(), windowHeight * random(0.1, 0.6)),
        random(60, 80),
        random(1.2, 1.5),
        random(1.2, 1.5),
        0.6,
        0.01,
        this.cloudColor
      ));
    }
  };
  this.generateClouds();

  this.display = () => {
    background(this.bgColor);
    this.displayAll();
    push();
    translate(0, this.ground * 2);
    scale(1, -1);
    this.displayAll();
    pop();
    noStroke();
    fill(this.waterColor);
    rect(0, this.ground, windowWidth, windowHeight - this.ground);
    this.flowers.forEach((flower) => {
      flower.display();
    });
  };

  this.displayAll = () => {
    this.mountains.forEach((mountain) => {
      mountain.display();
    });
    this.clouds.forEach((cloud) => {
      cloud.display();
    });
    this.trees.forEach((tree) => {
      tree.display();
    });
    this.trees.forEach((tree) => {
      tree.displayFlower();
    });
  };

  this.update = (wind) => {
    this.trees.forEach((tree) => {
      tree.grow(2);
      tree.sway(wind);
    });
    this.flowers.forEach((flower) => {
      flower.fly(wind, this.airDamping, this.waterDamping,
        this.waterFlow, this.flowerScatter, this.ground);
      flower.update();
    });
    this.clouds.forEach((cloud) => {
      cloud.fly(wind, this.baseWind, this.airDamping);
    });
  };

  this.addTree = (tree) => {
    this.trees.push(tree);
  };

  this.checkBloom = (x) => {
    let pointToATree = false;
    for (let tree of landScape.trees) {
      if (abs(x - tree.rootNode.pos.x) < tree.trunkLength) {
        pointToATree = true;
        tree.bloom(() => {
          return max(floor(randomGaussian(24, 12)), 0);
        });
      }
    }
    return pointToATree;
  };

  this.checkUp = () => {
    for (let i = this.flowers.length - 1; i >= 0; i--) {
      if (outOfScreen(this.flowers[i].pos)) {
        this.flowers.splice(i, 1);
      }
      if (this.flowers[i].onGround) {
        this.flowers.splice(i, 1);
      }
    }
  };

  this.removeAll = () => {
    windy = true;
    return
    while (this.trees.length > 0) {
      this.trees.pop();
    }
    while (this.flowers.length > 0) {
      this.flowers.pop();
    }
    while (this.mountains.length > 0) {
      this.mountains.pop();
    }
    while (this.clouds.length > 0) {
      this.clouds.pop();
    }
    this.generateMountains();
    this.generateClouds();
  };
}
