var w = 1000;
var curvatureSlider;
var currentNoiseSlider;
var tentacleNoiseSlider;

function setup() {
  createCanvas(w, w);

  curvatureSlider = createSlider(0, 1, 1, 1);
  curvatureSlider.position(55, 55 + 24 * 3);
  curvatureSlider.style('width', '36px');

  currentNoiseSlider = createSlider(0, 1, 0, 1);
  currentNoiseSlider.position(55, 55 + 24 * 4);
  currentNoiseSlider.style('width', '36px');

  tentacleNoiseSlider = createSlider(0, 1, 0, 1);
  tentacleNoiseSlider.position(55, 55 + 24 * 5);
  tentacleNoiseSlider.style('width', '36px');

}

var velocity = {
  bg: -1,
  oct: 1
}

function draw() {
  frameRate(24);
  angleMode(DEGREES);
  background(220);

  translate(w / 2, w / 2);

  ///// ///// DISPLAY ///// /////
  ///// GRID /////
  noFill();
  stroke(255);
  var gridW = 200;
  for (var g = 0; g < int(w / gridW); g++) {
    var gy = (frameCount * velocity.bg - g * gridW) % w + w / 2;
    line(gy, -w / 2, gy, w / 2);
  }
  
  ///// NOISE /////
  
  
  ///// BODY /////
  noFill();
  stroke(0);
  var body = {
    size: 100,
    x: frameCount * (velocity.oct + velocity.bg),
    y: 0
  }
  square(body.x - body.size / 2, -body.size / 2, body.size);

  ///// TENTACLES /////
  noStroke();
  fill(0);

  var tentacle = {
    num: 8,
    dotDistMin: 4,
    dotDistMax: 10,
    dotNum: 30,
    startX: -body.size / 2,
    startY: 0,
    startAngleMax: 90,
    tailAngleMax: -5,
    samples: [],
    sampleSize: 5,
    sampleAngle: 0,
    sampleSpread: 0
  }
  tentacle.sampleNum = tentacle.dotNum / tentacle.sampleSize + 1;
  var sampleWeightSum = 0;

  ///// GET DOTS /////
  for (var t = 0; t < tentacle.num; t++) {
    var multiplier = round(t / tentacle.num) * 2 - 1;
    var spreadRatio = t / (tentacle.num / 2 - 0.5) - 1; //linear
    spreadRatio = multiplier * (1-pow(abs(spreadRatio)-1, 2));

    var startAngle = spreadRatio * tentacle.startAngleMax;
    var tailAngle = spreadRatio * tentacle.tailAngleMax;
    var dot = {
      prevX: tentacle.startX,
      prevY: tentacle.startY,
      prevR: startAngle
    }

    noStroke();
    fill(0);
    ellipse(dot.prevX, dot.prevY, 10, 10);

    for (var d = 0; d <= tentacle.dotNum; d++) {
      ///// EXPO EQTN
      var ratio = d / tentacle.dotNum;
      var expoDist = tentacle.dotDistMin + tentacle.dotDistMax * (1 - pow(ratio, 2));
      var curvature = (startAngle - tailAngle) * (pow(ratio - 1, 6)) + tailAngle;

      var rot = 90 * spreadRatio;//multiplier; //spreadRatio;
      var currentNoise = 1;
      var tentacleNoise = 1;

      ///// SET DOT
      dot.r = curvature + rot;
      dot.x = dot.prevX - expoDist * cos(dot.r); // negative for backward
      dot.y = dot.prevY + expoDist * sin(dot.r);

      ///// SAMPLING
      noStroke();
      fill(0);
      var dotSize = 5;

      if (d % tentacle.sampleSize == 0) {
        stroke(0);
        noFill();
        var sampleCount = d / tentacle.sampleSize;
        var sampleWeight = pow(sampleCount / tentacle.sampleNum - 1, 2);
        sampleWeightSum = sampleWeightSum + sampleWeight;
        dotSize = dotSize * (1 + sampleWeight);

        tentacle.sampleAngle = tentacle.sampleAngle + rot * sampleWeight;
        tentacle.sampleSpread = tentacle.sampleSpread + abs(rot) * sampleWeight;

      }



      ///// DOT PREVIEW
      ellipse(dot.x, dot.y, dotSize, dotSize);

      ///// MOVE CUR TO PREV
      dot.prevX = dot.x;
      dot.prevY = dot.y;
      dot.prevR = dot.r;

      ///// DOT END
    }
    ///// TENTACLE END
  }
  tentacle.sampleAngle = int(tentacle.sampleAngle / 90 / sampleWeightSum);
  tentacle.sampleSpread = tentacle.sampleSpread / 90 / sampleWeightSum;

  ///// FRAME /////
  noFill();
  stroke(0);
  square(-w / 2 + 50, -w / 2 + 50, w - 100);

  ///// DESCRIPTION /////
  noStroke();
  fill(0);
  textAlign(LEFT, TOP);
  textSize(16);
  textLeading(24);
  text("BG Velocity: " + velocity.bg +
    "\nOctopus Velocity: " + velocity.oct +
    "\nFrame Count: " + frameCount +
    "\n\t\t\t\t\tCurvature" +
    "\n\t\t\t\t\tCurrent Noise: " +
    "\n\t\t\t\t\tTentacle Noise" +
    "\nSample Num: " + tentacle.sampleNum +
    "\nSample Angle: " + tentacle.sampleAngle +
    "\nSample Spread: " + tentacle.sampleSpread,
    -w / 2 + 55, -w / 2 + 55);

  ///// BG END
}