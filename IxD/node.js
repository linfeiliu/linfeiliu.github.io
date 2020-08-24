function Node(edgeLength, angle, father, tree) {
  this.tree = tree;
  this.father = father;
  this.children = [];
  this.angle = angle;
  this.angleRaw = angle;
  this.angleVel = 0;
  this.angleAcc = 0;
  this.hasFlower = false;
  this.flower = null;
  this.grown = !father;
  if (this.father) {
    this.angleDelta = this.father.angleDelta / (2 - this.tree.divergence);
    this.depth = this.father.depth + 1;
    this.edgeLength = 0;
  } else {
    this.edgeLength = edgeLength;
    this.angleDelta = this.tree.angleRange;
    this.depth = -1;
  }
  this.targetEdgeLength = edgeLength;

  this.display = () => {
    this.updateEdge();
    push();
    translate(this.pos);
    this.children.forEach((childNode) => {
      push();
      rotate(childNode.angle);
      noStroke();
      fill(this.tree.lineColor);
      beginShape();
      vertex(0, -this.edgeWidth / 2);
      vertex(0, this.edgeWidth / 2);
      vertex(childNode.edgeLength, childNode.edgeWidth / 2);
      vertex(childNode.edgeLength, -childNode.edgeWidth / 2);
      endShape();
      pop();
      childNode.display();
    });
    pop();
    this.update();
  };

  this.displayFlower = () => {
    push();
    if (this.hasFlower && this.grown) {
      this.flower.display();
    }
    translate(this.pos);
    this.children.forEach((childNode) => {
      childNode.displayFlower();
    });
    pop();
  };

  this.grow = (speed) => {
    this.children.forEach((childNode) => {
      childNode.grow(speed);
    });
    if (!this.grown) {
      if (windy) {
        // Pause tree growth.
        return
      }
      this.edgeLength += speed;
      this.updateEdge();
      if (this.edgeLength >= this.targetEdgeLength * this.tree.precocity &&
        this.children.length == 0 &&
        this.depth < this.tree.depth) {
        this.fork();
      }
      if (this.edgeLength >= this.targetEdgeLength) {
        this.edgeLength = this.targetEdgeLength;
        this.grown = true;
      }
    }
  };

  this.fork = () => {
    let deltaNutrition = random(-0.5, 0.5) * this.tree.asymmetry;
    for (let direct of [-1, 1]) {
      let nutrition = 0.5 + direct * deltaNutrition;
      let childEdgeLength = this.targetEdgeLength / (0.5 + this.tree.limit / 2) * nutrition;
      if (this.father === this.tree.rootNode) {
        childEdgeLength /= 1.5;
      }
      if (childEdgeLength / this.tree.trunkLength > random(this.tree.limit)) {
        let childAngle = this.angle + direct * (1 - nutrition) * this.angleDelta;
        let childNode = new Node(childEdgeLength, childAngle, this, this.tree);
        this.children.push(childNode);
      }
    }
  };

  this.bud = () => {
    if (!this.hasFlower) {
      if (random() < (this.depth - this.tree.bloomDepth) / (this.tree.depth - this.tree.bloomDepth)) {
        this.flower = new Flower(
          createVector(random(this.edgeLength), this.edgeWidth * random(-1, 1)),
          this
        );
        this.hasFlower = true;
      }
    }
    this.children.forEach((childNode) => {
      childNode.bud();
    });
  };

  this.bloom = (wait) => {
    if (this.hasFlower) {
      this.flower.bloom(wait);
    }
    this.children.forEach((childNode) => {
      childNode.bloom(wait);
    });
  };

  this.sway = (wind) => {
    if (this.grown) {
      if (this.hasFlower &&
        windy == true &&
        random(wind.mag()) > this.tree.flowerRubust * this.flower.mass) {
        this.flower.fall();
        this.hasFlower = false;
      }
      let force = createVector(0, gravity * this.mass).add(wind);
      this.children.forEach((childNode) => {
        force.add(childNode.sway(wind));
      });
      if (this.father) {
        let radialForce = force.x * cos(this.angle) + force.y * sin(this.angle);
        let tangentialForce = force.y * cos(this.angle) - force.x * sin(this.angle);
        this.angleAcc = tangentialForce / this.mass / this.edgeLength;
        this.angleAcc -= (this.angle - this.angleRaw) * this.tree.damping;
        this.angleAcc -= this.angleVel * this.tree.damping;
        return createVector(cos(this.angle), sin(this.angle)).mult(radialForce);
      }
    }
  };

  this.update = () => {
    if (this.father) {
      this.angleVel += this.angleAcc * timeUnit;
      this.angle += this.angleVel * timeUnit;
    }
    this.updateEdge();
  };

  this.updateEdge = () => {
    if (this === this.tree.rootNode) {
      this.edgeWidth = this.tree.trunkWidth * (1 + this.tree.limit) * (1 + this.tree.limit);
    } else if (this.father === this.tree.rootNode) {
      this.edgeWidth = this.edgeLength / this.tree.trunkLength * this.tree.trunkWidth;
    } else {
      this.edgeWidth = this.edgeLength * this.edgeLength / this.tree.trunkLength * this.tree.rubust;
    }
    this.mass = this.edgeLength * this.edgeWidth;
    this.pos = p5.Vector.mult(createVector(cos(this.angle), sin(this.angle)), this.edgeLength);
  };

  this.updateEdge();
}