// target frames per second
const FPS = 30;
var playerSpeed = 60;
var canvasSpeed = 30;
var bulletSpeed = 50;
var x = 0;
var y = 0;
var time = 0;
var aspectRatio = 1;
var scale = 1;
var nominalWidth = 512;
var nominalHeight = nominalWidth / aspectRatio;
var image = new Image();
image.src = "gears.png";
var canvas = null;
var context2D = null;
var player = null;
var bullets = [];

function Sprite(image) {
    this.x = 0;
    this.y = 0;
    this.image = image;
}
Sprite.prototype.minX = function() {
    return this.x - this.image.width / 2;
};
Sprite.prototype.minY = function() {
    return this.y - this.image.height / 2;
};
Sprite.prototype.maxX = function() {
    return this.x + this.image.width / 2;
};
Sprite.prototype.maxY = function() {
    return this.y + this.image.height / 2;
};

function Bullet(image, x, y, speedx, speedy, accelx, accely) {
    this.x = x;
    this.y = y;
    this.speedx = speedx;
    this.speedy = speedy;
    this.accelx = accelx;
    this.accely = accely;
    this.image = image;
    this.grazed = false;
}
Bullet.prototype = new Sprite();
Bullet.prototype.move = function(time) {
    this.speedx += this.accelx * time;
    this.speedy += this.accely * time;
    this.x += this.speedx * time;
    this.y += this.speedy * time;
}
Bullet.prototype.isDead = function() {
    if (this.maxX() < x || this.minX() >= x + nominalWidth ||
	this.maxY() < y || this.minY() >= y + nominalHeight)
	return true;
    else
	return false;
}

function TestEnemy(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.time = 0;
    this.seqPos = 0;	
}
TestEnemy.prototype = new Sprite();
TestEnemy.prototype.sequence = [
    [1.0, shootCircle, 16, 0],
    [0.4, shootCircle, 16, 0],
    [0.4, shootCircle, 16, 0],

    [1.0, shootCircle, 16, 0],
    [0.4, shootCircle, 16, 0.1],
    [0.4, shootCircle, 16, 0.2],
    [0.4, shootCircle, 16, 0.3],
    [0.4, shootCircle, 16, 0.4],

    [0.4, shootCircle, 16, 0.5],
    [0.4, shootCircle, 16, 0.4],
    [0.4, shootCircle, 16, 0.3],
    [0.4, shootCircle, 16, 0.2],
    [0.4, shootCircle, 16, 0.1],

];

TestEnemy.prototype.update = function(time) {
    this.time += time;
    if (this.time >= this.sequence[this.seqPos][0]) {
	this.sequence[this.seqPos][1](this.x, this.y, this.sequence[this.seqPos][2], this.sequence[this.seqPos][3]);
	this.time -= this.sequence[this.seqPos][0];
	this.seqPos++;
	if (this.seqPos >= this.sequence.length) {
	    this.seqPos = 0;
	}
    }
}

function addBullet(bullet) {
    if (bullets.used == bullets.length) {
	bullets.push(bullet);
    }
    else {
	bullets[bullets.used] = bullet;
    }
    bullets.used++;
}
function delBullet(index) {
    bullets.used--;
    bullets[index] = bullets[bullets.used];
}

function shootCircle(x, y, count, start) {
    for (var alpha = start ;
	 alpha < 2 * Math.PI + start ;
	 alpha += Math.PI / (count / 2)) {
	addBullet(new Bullet(redbullet,
			     x, y,
			     Math.cos(alpha) * bulletSpeed,
			     Math.sin(alpha) * bulletSpeed,
			     Math.cos(alpha) * bulletSpeed * 0.1,
			     Math.sin(alpha) * bulletSpeed * 0.1));
    }
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
    return {width: myWidth - 5, height: myHeight - 5};
}

function resizeWindow() {
    var size = getWindowSize();
    size.height = Math.min(nominalHeight, size.height);
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

function initGame() {
    var now = new Date();
    startTime = now.getTime() / 1000;
    time = 0;
    timeAlive = 0;
    bullets = [];
    bullets.used = 0;
    player = new Sprite(plimg);
    player.x = nominalWidth / 2;
    player.y = player.image.height / 2;
    x = 0;
    y = 0;
    startAlpha = 0;
    alive = true;
    graze = 0;
    enemies = [];
    enemies.push(new TestEnemy(badguy, nominalWidth / 2, y + nominalHeight / 4 * 3));
}

var imagesLoaded = 0;
var imagesToLoad;
function loadingDone() {
    imagesLoaded += 1;
    if (imagesLoaded == imagesToLoad) {
	setInterval(draw, 1000 / FPS);
	document.onkeydown = keydown;
	document.onkeyup = keyup;
	initGame();
    }
}

$(function() {
    canvas = document.getElementById('canvas');
    context2D = canvas.getContext('2d');

    resizeWindow();

    imagesToLoad = 3;
    plimg = new Image();
    plimg.src = "character.png"
    $(plimg).load(loadingDone);
    redbullet = new Image();
    redbullet.src = "redbullet.png";
    $(redbullet).load(loadingDone);
    badguy = new Image();
    badguy.src = "badguy.png";
    $(badguy).load(loadingDone);
    $("#restart").click(initGame);
});
    
$(window).resize(resizeWindow);

var keys = [];
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
    var now = new Date();
    timePrev = time;
    time = now.getTime() / 1000 - startTime;
    var timeStep = time - timePrev;

    if (!alive) return;

    timeAlive = time;
    if (keys.right && player.maxX() < x + nominalWidth)
	player.x += timeStep * playerSpeed;
    if (keys.left && player.minX() > x)
	player.x -= timeStep * playerSpeed;
    if (keys.up && player.maxY() < y + nominalHeight)
	player.y += timeStep * playerSpeed;
    if (keys.down && player.minY() > y)
	player.y -= timeStep * playerSpeed;
    
    y += timeStep * canvasSpeed;
    player.y += timeStep * canvasSpeed;
    for (var i = 0 ; i < enemies.length ; ++i)
	enemies[i].y += timeStep * canvasSpeed;
    for (var i = 0 ; i < enemies.length ; i++) {
	enemies[i].update(timeStep);
    }
    
    var i = 0;
    while (i < bullets.used) {
	bullets[i].move(timeStep);
	if (alive) bullets[i].y += timeStep * canvasSpeed;
	if (bullets[i].isDead()) {
	    delBullet(i);
	    i--;
	}
	var dist = (bullets[i].x - player.x) * (bullets[i].x - player.x) +
	    (bullets[i].y - player.y) * (bullets[i].y - player.y);
	if (dist < (14 + 10) * (14 + 10)) {
	    alive = false;
	    delBullet(i);
	    i--;
	}
	else if (alive && dist < (14 + 32) * (14 + 32) && !bullets[i].grazed) {
	    graze++;
	    bullets[i].grazed = true;
	}
	i++;
    }

    context2D.clearRect(0, 0, canvas.width, canvas.height);

    var count = 0;
    var tile_x = Math.floor(x / image.width);
    var my_x = tile_x * image.width - x;
    while (my_x < nominalWidth) {
	var tile_y = Math.floor(y / image.height);
	var my_y = tile_y * image.height - y;
	while (my_y < nominalHeight) {
	    context2D.drawImage(image, my_x * scale,
				(nominalHeight - my_y - image.height) * scale,
				image.width * scale, image.height * scale);
	    my_y += image.height;
	    count++;
	}
	my_x += image.width;
    }

    context2D.drawImage(player.image,
			(player.minX() - x) * scale,
			(nominalHeight - (player.minY() - y) - player.image.height) * scale,
			player.image.width * scale,
			player.image.height * scale);


    for (var i = 0 ; i < enemies.length ; ++i) {
	var e = enemies[i];
	context2D.drawImage(e.image,
			    (e.minX() - x) * scale,
			    (nominalHeight - (e.minY() - y) - e.image.height) * scale,
			    e.image.width * scale, e.image.height * scale);
    }

    for (var i = 0 ; i < bullets.length ; ++i) {
	var b = bullets[i];
	context2D.drawImage(b.image,
			    (b.minX() - x) * scale,
			    (nominalHeight - (b.minY() - y) - b.image.height) * scale,
			    b.image.width * scale, b.image.height * scale);
    }

    //context2D.fillText(time.toFixed(2) + " " + count + " " + graze, 0, 10);
    $("#score").html((timeAlive * 1000 + graze * 10000).toFixed(0));
    $("#timeAlive").html(timeAlive.toFixed(1) + ' s');
    $("#graze").html(graze);
}
