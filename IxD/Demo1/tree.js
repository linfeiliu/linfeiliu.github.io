function Tree(rootPos, totalHeight, depth, angleMean, angleRange,
              asymmetry, divergence, precocity, limit, rubust, damping, lineColor,
              bloomDepth, flowerRubust, flowerMass, flowerColor, flowerShape) {
  this.depth = depth;
  this.angleRange = angleRange;
  this.asymmetry = asymmetry;
  this.divergence = divergence;
  this.precocity = precocity;
  this.limit = limit;
  this.rubust = rubust;
  this.damping = damping;
  this.lineColor = lineColor;
  this.bloomDepth = bloomDepth;
  this.flowerRubust = flowerRubust;
  this.flowerMass = flowerMass;
  this.flowerColor = flowerColor;
  this.flowerShape = flowerShape;
  let lengthDecay = 1 / (1 + limit);
  let edgeLength = totalHeight / (1 + 1 / (1 - lengthDecay));
  this.trunkLength = edgeLength * 2;
  this.trunkWidth = this.trunkLength * this.rubust * (1 + limit) / 4;
  this.rootNode = new Node(
    dist(0, 0, rootPos.x, rootPos.y),
    atan2(rootPos.y, rootPos.x),
    null,
    this
  );
  this.rootNode.children.push(new Node(
    this.trunkLength,
    angleMean,
    this.rootNode,
    this
  ));
  
  this.display = () => {
    this.rootNode.display();
  };
  
  this.displayFlower = () => {
    this.rootNode.displayFlower();
  };
  
  this.sway = (wind) => {
    this.rootNode.sway(wind);
  };
  
  this.grow = (speed) => {
    this.rootNode.grow(speed);
  };
  
  this.bloom = (wait) => {
    this.rootNode.bud();
    this.rootNode.bloom(wait);
  };
}