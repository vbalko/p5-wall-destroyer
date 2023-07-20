let paddle, ball;
let bricks = [];
let gradient;
let bokeh = [];

function setup() {
  createCanvas(800, 600);

  gradient = generateGradient();

  for (let i = 0; i < 100; i++) {
    bokeh.push({
      x: random(width),
      y: random(height),
      size: random(20, 100),
      transparency: random(50, 200),
      color: generateSmoothColor(),
      vx: random(-0.2, 0.2), // Add velocity along the x-axis
      vy: random(-0.2, 0.2) // Add velocity along the y-axis
    });
  }

  paddle = new Paddle();
  ball = new Ball(paddle);

  generateBricks();
}

function generateGradient() {
  let gradient = createGraphics(width, height);

  let hueStart = random(0, 360);
  let hueEnd = hueStart + 180;
  let saturation = random(80, 100);
  let lightness = random(30, 70);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let hue = map(inter, 0, 1, hueStart, hueEnd);
    let color1 = color(255, 160, 0);
    let color2 = color(0, 192, 255);
    let finalColor = lerpColor(color1, color2, inter);
    finalColor = lerpColor(finalColor, color(hue, saturation, lightness), 0.5);
    gradient.stroke(finalColor);
    gradient.line(0, y, width, y);
  }

  return gradient;
}



function generateBricks() {
  bricks = [];
  let rows = 5;
  let bricksPerRow = 10;
  let brickWidth = width / bricksPerRow;
  let brickHeight = 30;

  for (let r = 0; r < rows; r++) {
      for (let i = 0; i < bricksPerRow; i++) {
          let brick = new Brick(i * brickWidth, r * (brickHeight + 10) + 50, brickWidth - 5, brickHeight);
          bricks.push(brick);
      }
  }
}


function Brick(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = color(random(100, 255), random(100, 255), random(100, 255));
  this.alpha = 255; // Add an alpha channel for fading

  this.display = function () {
      fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
      rect(this.x, this.y, this.w, this.h);
  }

  this.fade = function() {
      if (this.alpha > 0) {
          this.alpha -= 5; // Adjust this value to change the speed of fading
      }
  }
}




function draw() {
  image(gradient, 0, 0); // Use image() function instead of background()

  for (let i = 0; i < bokeh.length; i++) {
    let b = bokeh[i];
    let blurRadius = b.size * 0.5; // Adjust the blur radius

    // Update bokeh particle position based on velocity
    b.x += b.vx;
    b.y += b.vy;

    // Wrap around the screen
    if (b.x < 0) b.x = width;
    if (b.x > width) b.x = 0;
    if (b.y < 0) b.y = height;
    if (b.y > height) b.y = 0;

    // Draw the bokeh particle with smooth color transition and animation
    for (let r = b.size; r > 0; r -= blurRadius) {
      let transparency = map(r, 0, b.size, b.transparency, 0);
      let c = lerpColor(color(255), b.color, r / b.size);
      noStroke();
      fill(red(c), green(c), blue(c), transparency);
      ellipse(b.x, b.y, r, r);
    }
  }

  paddle.display();
  paddle.update();

  ball.display();
  ball.update();

  for (let i = 0; i < bricks.length; i++) {
    for (let i = 0; i < bricks.length; i++) {
      bricks[i].display();
      bricks[i].fade();
  }
    ball.collide(bricks[i]);

    if (bricks[i].hit && millis() - bricks[i].hitTime > 1000) {
      bricks.splice(i, 1);
      i--;
    }
  }
}

function generateSmoothColor() {
  let startColor = color(random(100, 255), random(100, 255), random(100, 255));
  let endColor = color(random(100, 255), random(100, 255), random(100, 255));
  let smoothColor = lerpColor(startColor, endColor, random(1));
  return smoothColor;
}


function Paddle() {
  this.w = 160;
  this.h = 20;
  this.x = width / 2;
  this.y = height - this.h - 10;
  this.speed = 8;

  this.display = function () {
    noStroke();
    let paddleColor = color(255, 200, 0); // Adjust the paddle color

    // Draw the paddle with rounded corners and a subtle 3D effect
    let cornerRadius = 5; // Adjust the corner radius
    let shadowColor = color(0, 50); // Adjust the shadow color

    // Draw the paddle body
    fill(paddleColor);
    rect(this.x, this.y, this.w, this.h, cornerRadius);

    // Draw the paddle shadow
    fill(shadowColor);
    rect(this.x + 3, this.y + this.h, this.w, 5); // Adjust the shadow size and position
  }

  this.update = function () {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.speed;

    this.x = constrain(this.x, 0, width - this.w);
  }
}


function Ball(paddle) {
  this.diameter = 15;
  this.radius = this.diameter / 2;
  this.x = width / 2;
  this.y = height - paddle.h - this.radius - 5;
  this.speed = 5;
  this.direction = createVector(0, -1);
  this.gravity = 0.0001;

  this.display = function () {
    stroke(0);
    fill(255);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };

  this.update = function() {
    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;
  
    if (this.x < this.radius || this.x > width - this.radius) {
      this.direction.x *= -1;
    }
  
    if (this.y < this.radius) {
      this.direction.y *= -1;
    }
  
    if (
      this.y + this.radius >= paddle.y &&
      this.y - this.radius <= paddle.y + paddle.h &&
      this.x >= paddle.x &&
      this.x <= paddle.x + paddle.w
    ) {
      let hitLocation = (this.x - paddle.x) / paddle.w;
      let angle = map(hitLocation, 0, 1, 45, -45);
      this.direction = p5.Vector.fromAngle(radians(angle));
    }
    
    
  
    for (let i = 0; i < bricks.length; i++) {
      if (this.collide(bricks[i])) {
        break;
      }
    }
  
    this.direction.y += this.gravity;
  }
  

  this.collide = function (brick) {
    if (
      brick &&
      this.x + this.radius > brick.x &&
      this.x - this.radius < brick.x + brick.w &&
      this.y + this.radius > brick.y &&
      this.y - this.radius < brick.y + brick.h
    ) {
      let hitSide = this.x < brick.x + brick.w / 2 ? "left" : "right";
      let hitTopOrBottom = this.y < brick.y + brick.h / 2 ? "top" : "bottom";

      brick.hit = true;

      if (
        (hitSide === "left" && this.direction.x > 0) ||
        (hitSide === "right" && this.direction.x < 0)
      ) {
        this.direction.x *= -1;
      }

      if (
        (hitTopOrBottom === "top" && this.direction.y > 0) ||
        (hitTopOrBottom === "bottom" && this.direction.y < 0)
      ) {
        this.direction.y *= -1;
      }

      bricks.splice(bricks.indexOf(brick), 1);
      return true;
    }

    return false;
  };
}
