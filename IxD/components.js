function Mountain(pos, shape, shadow, sunnyColor, shadowColor) {
  this.pos = pos;
  this.shape = shape;
  this.shadow = shadow;
  this.sunnyColor = sunnyColor;
  this.shadowColor = shadowColor;
  
  this.display = () => {
    noStroke();
    fill(10, 18, 70, 200);
    triangle(
      this.pos.x - this.shape.x / 2,
      this.pos.y,
      this.pos.x,
      this.pos.y - this.shape.y,
      this.pos.x + this.shape.x / 2 - this.shadow / 2,
      this.pos.y
    );
    fill(5, 15, 50, 200);
    triangle(
      this.pos.x + this.shape.x / 2,
      this.pos.y,
      this.pos.x,
      this.pos.y - this.shape.y,
      this.pos.x + this.shape.x / 2 - this.shadow / 2,
      this.pos.y
    );
  };
}

function Cloud(pos, size, leftHeight, rightHeight, cut, density, colour) {
  this.colour = colour;
  this.pos = pos;
  this.vel = 0;
  this.size = size;
  this.mass = size * size * density;
  this.cut = cut;
  this.leftHeight = leftHeight;
  this.rightHeight = rightHeight;
  this.leftArc = asin(1 - cut / leftHeight);
  this.rightArc = asin(1 - cut / rightHeight);
  this.sideArc = asin(1 - cut / 1);
  
  this.display = () => {
    push();
    translate(this.pos.x, this.pos.y);
    scale(this.size, this.size);
    noStroke();
    fill(this.colour);
    arc(-0.75, -0.5, 1, 1, -PI - this.sideArc, this.sideArc, CHORD);
    arc(-0.25, -this.leftHeight / 2, this.leftHeight, this.leftHeight, -PI - this.leftArc, this.leftArc, CHORD);
    arc(0.25, -this.rightHeight / 2, this.rightHeight, this.rightHeight, -PI - this.rightArc, this.rightArc, CHORD);
    arc(0.75, -0.5, 1, 1, -PI - this.sideArc, this.sideArc, CHORD);
    pop();
  };
  
  this.fly = (wind, baseWind, damping) => {
    let acc = (baseWind + wind.x) / this.mass;
    acc -= damping * this.vel;
    this.vel += acc;
    this.pos.x += this.vel;
    this.pos.x = (this.pos.x + this.size) % (windowWidth + 2 * this.size) - this.size;
  };
}
