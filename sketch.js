let paddle, ball;
let bricks = [];

function setup() {
    createCanvas(800, 600);

    paddle = new Paddle();
    ball = new Ball(paddle);

    generateBricks();
}
function generateBricks() {
    bricks = [];
    let rows = 5;
    let bricksPerRow = 20;
    let brickWidth = width / bricksPerRow;
    let brickHeight = 15;
    let color1 = color(random(0, 255), random(0, 255), random(0, 255));
    let color2 = color(random(0, 255), random(0, 255), random(0, 255));

    for (let r = 0; r < rows; r++) {
        for (let i = 0; i < bricksPerRow; i++) {
            let brickColor = lerpColor(color1, color2, (r * bricksPerRow + i) / (rows * bricksPerRow));
            let brick = new Brick(i * brickWidth, r * (brickHeight + 10) + 50, brickWidth - 2, brickHeight, brickColor);
            bricks.push(brick);
        }
    }
}

function Brick(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;
    this.alpha = 255; // Add an alpha value for transparency
    this.hit = false; // Add a flag to indicate whether the brick has been hit

    this.display = function () {
        if (this.hit && this.alpha > 0) {
            this.alpha -= 5; // Decrease the alpha value when the brick is hit
        }
        fill(red(this.c), green(this.c), blue(this.c), this.alpha);
        rect(this.x, this.y, this.w, this.h);
    }

    this.fade = function() {
        if (this.hit) {
            // Decrease the alpha value based on the frame rate
            this.alpha -= (255 / 60); // 60 is the frame rate
        }
    }
    
}


function draw() {
    background(0);
    frameRate(60); // Set the frame rate to 60 FPS

    paddle.display();
    paddle.update();

    ball.display();
    ball.update();

    for (let i = 0; i < bricks.length; i++) {
        bricks[i].display();
        bricks[i].fade(); // Call the fade function for each brick
        ball.collide(bricks[i]);

        if (bricks[i].alpha <= 0) { // Remove the brick when its alpha value is 0
            bricks.splice(i, 1);
            i--;
        }
    }
}

function Paddle() { 
    this.w = 160;
    this.h = 20;
    this.x = width / 2;
    this.y = height - this.h - 10;
    this.speed = 8;

    this.display = function () {
        rect(this.x, this.y, this.w, this.h);
    }

    this.update = function () {
        if (keyIsDown(LEFT_ARROW)) this.x -= this.speed;
        if (keyIsDown(RIGHT_ARROW)) this.x += this.speed;

        this.x = constrain(this.x, 0, width - this.w);
    }
}

function Ball(paddle) {
    this.diameter = 15; // Increase the size of the ball
    this.radius = this.diameter / 2;
    this.x = width / 2;
    this.y = height - paddle.h - this.radius - 5;
    this.speed = 5; // Increase the initial speed of the ball
    this.direction = createVector(0, -1);
    this.gravity = 0.0001; // Decrease the gravity

    this.display = function() {
      ellipse(this.x, this.y, this.diameter, this.diameter);
    }

    this.update = function() {
      this.x += this.direction.x * this.speed;
      this.y += this.direction.y * this.speed;

      if (this.x < this.radius || this.x > width - this.radius) {
        this.direction.x *= -1;
      }

      if (this.y < this.radius) {
        this.direction.y *= -1;
      }

      if (this.y + this.radius > paddle.y && this.x > paddle.x && this.x < paddle.x + paddle.w) {
        let hitLocation = (this.x - paddle.x) / paddle.w;
        let angle = map(hitLocation, 0, 1, -45, 45);
        this.direction = p5.Vector.fromAngle(radians(angle - 90));
      }

      for (let i = 0; i < bricks.length; i++) {
        if (this.collide(bricks[i])) {
          break;
        }
      }

      this.direction.y += this.gravity;
    }

    this.collide = function(brick) {
        if (brick && this.x + this.radius > brick.x && this.x - this.radius < brick.x + brick.w && this.y + this.radius > brick.y && this.y - this.radius < brick.y + brick.h) {
        let hitSide = this.x < brick.x + brick.w / 2 ? "left" : "right";
        let hitTopOrBottom = this.y < brick.y + brick.h / 2 ? "top" : "bottom";

        brick.hit = true; // Set the hit flag to true when the brick is hit

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
}
