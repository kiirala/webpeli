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
    bullets = dynamicArray();
    bullets.used = 0;
    player = new Player(plimg, nominalWidth / 2, plimg.height / 2);
    /*
    player = new Player(plimg);
    player.x = nominalWidth / 2;
    player.y = plimg.height / 2;
    */
    x = 0;
    y = 0;
    startAlpha = 0;
    alive = true;
    graze = 0;
    enemies = dynamicArray();
    enemies.lastTime = 0;
}

var imagesLoaded = 0;
var imagesToLoad;
function loadingDone() {
    imagesLoaded += 1;
    if (imagesLoaded == imagesToLoad) {
	setInterval(draw, 1000 / FPS);
	if(window.event) {
	    // IE
	    document.onkeydown = keydown_ie;
	    document.onkeyup = keyup_ie;
	}
	else {
	    // Netscape/Firefox/Opera
	    document.onkeydown = keydown;
	    document.onkeyup = keyup;
	}
	initGame();
    }
}

function loadImage(name) {
    var img = new Image();
    img.src = name;
    $(img).load(loadingDone);
    return img;
}

$(function() {
    canvas = document.getElementById('canvas');
    context2D = canvas.getContext('2d');

    resizeWindow();

    imagesToLoad = 4;
    plimg = loadImage("character.png");
    redbullet = loadImage("redbullet.png");
    yellowbullet = loadImage("yellowbullet.png");
    badguy = loadImage("badguy.png");

    $("#restart").click(initGame);
});
    
$(window).resize(resizeWindow);

var keys = [];
keys.down = false;
keys.up = false;
keys.left = false;
keys.right = false;
keys.shoot = false;
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
    case 90: // z
	return 'shoot'
    default:
	$("#debug").html(code);
    }
    return 'unknown';
}

function keydown(event) {
    var keynum = event.which;
    var name = keyCodeToName(keynum);
    keys[name] = true;
}
function keydown_ie(event) {
    var keynum = event.keyCode;
    var name = keyCodeToName(keynum);
    keys[name] = true;
}

function keyup(event) {
    var keynum = event.which;
    var name = keyCodeToName(keynum);
    keys[name] = false;
}
function keyup_ie(event) {
    var keynum = event.keyCode;
    var name = keyCodeToName(keynum);
    keys[name] = false;
}

function updateBullets(timeStep) {
    var i = 0;
    while (i < bullets.used) {
	bullets[i].move(timeStep);
	if (alive) bullets[i].y += timeStep * canvasSpeed;
	if (bullets[i].isDead()) {
	    delBullet(bullets, i);
	    continue;
	}
	var dist = (bullets[i].x - player.x) * (bullets[i].x - player.x) +
	    (bullets[i].y - player.y) * (bullets[i].y - player.y);
	if (dist < (14 + 10) * (14 + 10)) {
	    alive = false;
	    delBullet(bullets, i);
	    continue;
	}
	else if (alive && dist < (14 + 32) * (14 + 32) && !bullets[i].grazed) {
	    graze++;
	    bullets[i].grazed = true;
	}
	i++;
    }
}

function updatePlayerBullets(timeStep) {
    var i = 0;
    while (i < player.bullets.used) {
	var bullet = player.bullets[i];
	bullet.move(timeStep);
	if (alive) bullet.y += timeStep * canvasSpeed;
	if (bullet.isDead()) {
	    delBullet(player.bullets, i);
	    continue;
	}
	var e = 0;
	var hit = false;
	while (e < enemies.used) {
	    var enemy = enemies[e];
	    var dist = (bullet.x - enemy.x) * (bullet.x - enemy.x) +
		(bullet.y - enemy.y) * (bullet.y - enemy.y);
	    if (dist < (14 + 10) * (14 + 10)) {
		arrayDel(enemies, e);
		delBullet(player.bullets, i);
		hit = true;
		break;
	    }
	    e++;
	}
	if (!hit)
	    i++;
    }
}

function updatePlayer(timeStep, time) {
    if (keys.right && player.maxX() < x + nominalWidth)
	player.x += timeStep * playerSpeed;
    if (keys.left && player.minX() > x)
	player.x -= timeStep * playerSpeed;
    if (keys.up && player.maxY() < y + nominalHeight)
	player.y += timeStep * playerSpeed;
    if (keys.down && player.minY() > y)
	player.y -= timeStep * playerSpeed;
    player.y += timeStep * canvasSpeed;
    if (keys.shoot && time - player.lastShot > 0.5) {
	addBullet(player.bullets, new Bullet(yellowbullet,
					     player.x, player.y,
					     0, 2 * bulletSpeed, 0, 0));
	player.lastShot = time;
    }
}

function updateEnemies(timeStep, time) {
    if (time - enemies.lastTime > 5 ||
	(enemies.used == 0 && time - enemies.lastTime > 2)) {
	var emptyArea = 32;
	var pos = Math.random() * (nominalWidth - 2 * emptyArea) + emptyArea;
	arrayAdd(enemies, new TestEnemy(badguy,
					pos, y + nominalHeight / 4 * 3));
	enemies.lastTime = time;
    }
    for (var i = 0 ; i < enemies.used ; ++i)
	enemies[i].y += timeStep * canvasSpeed;
    for (var i = 0 ; i < enemies.used ; i++) {
	enemies[i].update(timeStep);
    }
}

function draw() {
    var now = new Date();
    timePrev = time;
    time = now.getTime() / 1000 - startTime;
    var timeStep = time - timePrev;

    if (!alive) return;

    timeAlive = time;
    updatePlayer(timeStep, time);
    updateEnemies(timeStep, time);
    updateBullets(timeStep);
    updatePlayerBullets(timeStep);

    y += timeStep * canvasSpeed;

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


    for (var i = 0 ; i < enemies.used ; ++i) {
	var e = enemies[i];
	context2D.drawImage(e.image,
			    (e.minX() - x) * scale,
			    (nominalHeight - (e.minY() - y) - e.image.height) * scale,
			    e.image.width * scale, e.image.height * scale);
    }

    for (var i = 0 ; i < bullets.used ; ++i) {
	var b = bullets[i];
	context2D.drawImage(b.image,
			    (b.minX() - x) * scale,
			    (nominalHeight - (b.minY() - y) - b.image.height) * scale,
			    b.image.width * scale, b.image.height * scale);
    }

    for (var i = 0 ; i < player.bullets.used ; ++i) {
	var b = player.bullets[i];
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
