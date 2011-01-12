// target frames per second
const FPS = 30;
var x = 0;
var y = 0;
var xDirection = 1;
var yDirection = 1;
var image = new Image();
image.src = "gears.png";
var canvas = null;
var context2D = null;

$(function() {
      canvas = document.getElementById('canvas');
      context2D = canvas.getContext('2d');
      setInterval(draw, 1000 / FPS);
      canvas.width = document.width;
  });

function draw() {
    context2D.clearRect(0, 0, canvas.width, canvas.height);
    context2D.drawImage(image, x, y);
    x += 1 * xDirection;
    y += 1 * yDirection;
	
    if (x >= canvas.width - image.width) {
	x = canvas.width - image.width;
	xDirection = -1;
    }
    else if (x <= 0) {
	x = 0;
	xDirection = 1;
    }
	
    if (y >= canvas.height - image.height) {
	y = canvas.height - image.height;
	yDirection = -1;
    }
    else if (y <= 0) {
	y = 0;
	yDirection = 1;
    }
}
