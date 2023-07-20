let paddle, ball;
let bricks = [];
let gradient;
let bokeh = [];
let gameStarted = false;
let gameOver = false;

function setup() {
  createCanvas(800, 600);

  gradient = generateGradient();
  gameStarted = false;

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
      // Randomly decide whether to place a brick here
      if (random() < 0.5) {
        let brick;
        if (random() < 0.1) { // 10% chance to create a special brick
          let category = floor(random(1, 4)); // Randomly assign a category between 1 and 3
          brick = new SpecialBrick(i * brickWidth, r * (brickHeight + 10) + 50, brickWidth - 5, brickHeight, category);
        } else {
          let brickColor = color(map(i, 0, bricksPerRow, 0, 255), map(r, 0, rows, 0, 255), 150);
          brick = new Brick(i * brickWidth, r * (brickHeight + 10) + 50, brickWidth - 5, brickHeight, brickColor);
        }
        bricks.push(brick);
      }
    }
  }
}

function SpecialBrick(x, y, w, h, category) {
  Brick.call(this, x, y, w, h);
  this.category = category;

  // Change the color and symbol based on the category
  switch (this.category) {
    case 1:
      this.color = color(255, 0, 0); // Red for category 1
      this.symbol = "A"; // Symbol A for category 1
      break;
    case 2:
      this.color = color(0, 255, 0); // Green for category 2
      this.symbol = "B"; // Symbol B for category 2
      break;
    case 3:
      this.color = color(0, 0, 255); // Blue for category 3
      this.symbol = "C"; // Symbol C for category 3
      break;
    default:
      this.color = color(255, 255, 255); // White for any other category
      this.symbol = "?"; // Symbol ? for any other category
      break;
  }
}

SpecialBrick.prototype = Object.create(Brick.prototype);

SpecialBrick.prototype.display = function() {
  fill(this.color);
  rect(this.x, this.y, this.w, this.h);
  fill(255); // White text
  textSize(20); // Set the text size
  textAlign(CENTER, CENTER);
  text(this.symbol, this.x + this.w / 2, this.y + this.h / 2);
}





function Brick(x, y, w, h, color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = color;
  this.hit = false;
  this.hitTime = 0;
  this.alpha = 255;

  this.display = function () {
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    rect(this.x, this.y, this.w, this.h);
  }

  this.fade = function () {
    if (this.hit && this.alpha > 0) {
      this.alpha -= 5;
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



  for (let i = 0; i < bricks.length; i++) {
    bricks[i].display();
    bricks[i].fade();
    ball.collide(bricks[i]);

    if (bricks[i].alpha <= 0) {
      bricks.splice(i, 1);
      i--;
    }
  }

  ball.display();
  ball.update();

  // End game if ball hits bottom of canvas
  if (ball.y + ball.radius > height) {
    gameOver = true;
    noLoop();
  }

  // If the game is over, draw the game over text
  if (gameOver) {
    textSize(32);
    fill(255);
    textFont('Georgia');
    text('Game Over', width / 2, height / 2);
    text('Press R to restart', width / 2, height / 2 + 50);
  }

}

function resetGame() {
  // Reset all game variables and states
  ball = new Ball(paddle);
  generateBricks();
  gameOver = false;
  gameStarted = false;
}

function keyPressed() {
  if (key === ' ') {
    gameStarted = true;
    // Calculate a random angle between -45 and 45 degrees
    let angle = random(-45, 45);

    // Convert the angle to radians and create a new direction vector from it
    ball.direction = p5.Vector.fromAngle(radians(angle));
  }
  if (gameOver && key === 'r' || key === 'R') {
    resetGame();
    loop(); // Start the draw loop again
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
  this.diameter = 20;
  this.radius = this.diameter / 2;
  this.x = width / 2;
  this.y = height - paddle.h - this.radius - 5;
  this.speed = 8;
  this.direction = createVector(0, -1);

  this.display = function () {
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

  this.update = function () {
    if (gameStarted) {
      this.x += this.direction.x * this.speed;
      this.y += this.direction.y * this.speed;

      if (this.x < this.radius || this.x > width - this.radius) {
        this.direction.x *= -1;
      }

      if (this.y < this.radius) {
        this.direction.y *= -1;
      }

      // Check for collision with the paddle
      if (this.y + this.radius >= paddle.y && this.x >= paddle.x && this.x <= paddle.x + paddle.w) {
        let hitLocation = (this.x - paddle.x) / paddle.w;
        let angle = map(hitLocation, 0, 1, 45, 135);
        // Convert the angle to radians and create a new direction vector from it
        this.direction = p5.Vector.fromAngle(radians(angle - 90));
        this.direction.y = abs(this.direction.y) * -1; // Ensure the ball always bounces upwards
      }

      for (let i = 0; i < bricks.length; i++) {
        if (this.collide(bricks[i])) {
          break;
        }
      }
    } else {
      this.stickToPaddle(paddle);
    }
  }

  this.collide = function (brick) {
    if (brick && this.x > brick.x && this.x < brick.x + brick.w && this.y - this.radius < brick.y + brick.h) {
      let hitSide = this.x < brick.x + brick.w / 2 ? "left" : "right";
      let hitTopOrBottom = this.y < brick.y + brick.h / 2 ? "top" : "bottom";

      if (hitSide === "left" && this.direction.x > 0 || hitSide === "right" && this.direction.x < 0) {
        this.direction.x *= -1;
      }

      if (hitTopOrBottom === "top" && this.direction.y > 0 || hitTopOrBottom === "bottom" && this.direction.y < 0) {
        this.direction.y *= -1;
      }

      bricks.splice(bricks.indexOf(brick), 1);
      return true;
    }

    return false;
  }

  this.stickToPaddle = function (paddle) {
    this.x = paddle.x + paddle.w / 2;
    this.y = paddle.y - this.radius;
  }

}
