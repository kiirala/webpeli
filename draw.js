// target frames per second
const FPS = 30;
var x = 0;
var y = 0;
var time = 0;
var aspectRatio = 4/3;
var scale = 1;
var nominalWidth = 1024;
var nominalHeight = nominalWidth / aspectRatio;
var image = new Image();
image.src = "gears.png";
var canvas = null;
var context2D = null;
var player = null;

function Player() {
    this.x = 0;
    this.y = 0;
    this.image = new Image();
    this.image.src = "character.png";
    this.minX = function() {
	return this.x - this.image.width / 2;
    };
    this.minY = function() {
	return this.y - this.image.height / 2;
    };
    this.maxX = function() {
	return this.x + this.image.width / 2;
    };
    this.maxY = function() {
	return this.y + this.image.height / 2;
    };
}

function getWindowSize() {
    var myWidth = 0, myHeight = 0;
    if( typeof( window.innerWidth ) == 'number' ) {
	//Non-IE
	myWidth = window.innerWidth;
	myHeight = window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
	//IE 6+ in 'standards compliant mode'
	myWidth = document.documentElement.clientWidth;
	myHeight = document.documentElement.clientHeight;
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
	//IE 4 compatible
	myWidth = document.body.clientWidth;
	myHeight = document.body.clientHeight;
    }
    return {width: myWidth - 30, height: myHeight - 30};
}

function resizeWindow() {
    var size = getWindowSize();
    if (size.width / aspectRatio < size.height) {
	canvas.width = size.width;
	canvas.height = size.width / aspectRatio;
    }
    else {
	canvas.width = size.height * aspectRatio;
	canvas.height = size.height;
    }
    scale = canvas.width / nominalWidth;
}

$(function() {
      canvas = document.getElementById('canvas');
      context2D = canvas.getContext('2d');
      setInterval(draw, 1000 / FPS);
      resizeWindow();
      player = new Player();
      player.x = player.image.width / 2;
      player.y = nominalHeight / 2;
      document.onkeydown = keydown;
      document.onkeyup = keyup;
  });

$(window).resize(
function() {
    resizeWindow();
});

var keys = new Array();
keys.down = false;
keys.up = false;
keys.left = false;
keys.right = false;
function keyCodeToName(code) {
    switch(code) {
    case 37: 
	return 'left';
    case 38:
	return 'up';
    case 39:
	return 'right';
    case 40:
	return 'down';
    }
    return 'unknown';
}

//$(document).keydown(
function keydown(event) {
    var keynum = 0;
    if(window.event) {
	keynum = event.keyCode; // IE
    }
    else if(event.which) {
	keynum = event.which; // Netscape/Firefox/Opera
    }
    var name = keyCodeToName(keynum);
    keys[name] = true;
}
//);

//$(document).keyup(
function keyup(event) {
    var keynum = 0;
    if(window.event) {
	keynum = event.keyCode; // IE
    }
    else if(event.which) {
	keynum = event.which; // Netscape/Firefox/Opera
    } 
    var name = keyCodeToName(keynum);
    keys[name] = false;
}
//);

function draw() {
    time += 1;

    if (keys.right && player.maxX() < x + nominalWidth) player.x += 2;
    if (keys.left && player.minX() > x) player.x -= 2;
    if (keys.down && player.maxY() < y + nominalHeight) player.y += 2;
    if (keys.up && player.minY() > y) player.y -= 2;
    player.x += 1;
    x += 1;

    context2D.clearRect(0, 0, canvas.width, canvas.height);

    var tile_x = Math.floor(x / image.width);
    var my_x = tile_x * image.width - x;
    while (my_x < nominalWidth) {
	var tile_y = Math.floor(y / image.height);
	var my_y = tile_y * image.height - y;
	while (my_y < nominalHeight) {
	    context2D.drawImage(image, my_x * scale, my_y * scale,
				image.width * scale, image.height * scale);
	    my_y += image.height;
	}
	my_x += image.width;
    }
    context2D.drawImage(player.image,
			(player.minX() - x) * scale,
			(player.minY() - y) * scale,
			player.image.width * scale,
			player.image.height * scale);
    context2D.fillText((time / 30).toFixed(2), 0, 10);
}
