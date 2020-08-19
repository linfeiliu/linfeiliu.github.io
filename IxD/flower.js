function Flower(relativePos, node) {
  this.node = node;
  this.relativePos = relativePos;
  this.pos = createVector(0, 0);
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.mass = this.node.tree.flowerMass();
  this.colour = this.node.tree.flowerColor();
  this.shape = this.node.tree.flowerShape;
  this.radius = sqrt(this.mass);
  this.toBloom = -1;
  this.dropped = false;
  this.onGround = false;

  this.display = () => {
    if (this.toBloom <= 0) {
      push();
      if (this.dropped) {
        translate(this.pos.x, this.pos.y);
      } else {
        rotate(this.node.angle);
        translate(this.relativePos.x, this.relativePos.y);
      }
      noStroke();
      fill(this.colour);
      scale(this.radius, this.radius);
      this.shape();
      pop();
    } else {
      this.toBloom--;
    }
  };

  this.bloom = (wait) => {
    this.toBloom = wait();
  };

  this.fall = () => {
    this.pos = createVector(
      this.pos.x * cos(this.node.angle) - this.pos.y * sin(this.node.angle),
      this.pos.y * cos(this.node.angle) + this.pos.x * sin(this.node.angle)
    );
    let fatherNode = this.node;
    while (fatherNode) {
      this.pos.add(fatherNode.pos);
      fatherNode = fatherNode.father;
    }
    this.dropped = true;
    landScape.flowers.push(this);
  };

  this.fly = (wind, airDamping, waterDamping, waterFlow, scatter, ground) => {
    if (!this.onGround) {
      if (this.pos.y > ground && random() > scatter) {
        this.vel = createVector(0, 0);
        this.onGround = true;
      } else {
        this.acc = p5.Vector.mult(this.vel, -airDamping);
        this.acc.add(p5.Vector.div(wind, this.mass));
        this.acc.add(createVector(0, gravity));
      }
    } else {
      this.acc = p5.Vector.mult(
        p5.Vector.sub(this.vel, waterFlow(wind, this.pos.y)),
        -waterDamping(this.pos.y)
      );
    }
  };

  this.update = () => {
    this.vel.add(p5.Vector.mult(this.acc, timeUnit));
    this.pos.add(p5.Vector.mult(this.vel, timeUnit));
  };
}
