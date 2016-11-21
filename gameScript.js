var canvas = document.getElementById("canvas");

var level = 1;
var levelSpeed = 0;
var levelUp = 10;
var ship;
var shipSpd = 3;
var bullets = [0, 0, 0];
var bulletCount = 0;
var readyFire = false;
var score = 0;
var multiplier = 1;
var comboChain = 0;

var boulders = [];
var bCount = 0;
var missMeter = [];
var missCount = 3;
var enemies = [];
var maxEnemies = 5;
var currentEnemy = 0;
var enemyCount = 0;
var enemyFrequency = 100;
var boulderFrequency = 120;
var totalEnemies = 0;

var shipSize = 20;
var widthpx = "400px";
var heightpx = "400px";
var width = 400;
var height = 400;
var scoreX = 20;
var frameCounter = 0;
var paused = false;
var game_over = false;

document.getElementById("canvas").style.width = width;

function startGame() {
	
	ctx = canvas.getContext("2d");
	canvas.style.width = widthpx;
	canvas.style.height = heightpx;
	canvas.height = height;
	canvas.width = width;
	this.height = height;
	this.width = width;
	ctx.font = "20px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText("Press space to start", width/2, height/2 - height/10);
	ctx.fillText("Move: arrow keys", width/2, height/2);
	ctx.fillText("Shoot: spacebar", width/2, height/2 + height/10);
	ctx.fillText("Pause: escape key", width/2, height/2 + 2*(height/10));
	window.addEventListener('keydown', spaceStart); 

	
	ship = new component(shipSize, shipSize, "black", width/2 - (shipSize/2), height - (shipSize*2), true);
}

var gameArea = {
	//canvas: document.createElement("canvas"),
	
	
	start: function() {

		this.context = canvas.getContext("2d");
		canvas.style.width = widthpx;
		canvas.style.height = heightpx;
		canvas.height = height;
		canvas.width = width;
		this.height = height;
		this.width = width;

		window.addEventListener('keydown', function (e) {
			gameArea.keys = (gameArea.keys || []);
			gameArea.keys[e.keyCode] = true;
			if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
				e.preventDefault();
			}
		})
		window.addEventListener('keyup', function (e) {
			gameArea.keys[e.keyCode] = false;
			if (readyFire == true){
				fireBullet();
				readyFire = false;
			}			
		})
		
		this.interval = setInterval(updateGameArea, 20);
		
		var missX = 0;
		for(i = 0; i < 3; i++){
			missMeter[i] = new component(10, 10, 'black', width-70+missX , 10);
			missX += 15;
		}
		
	},
	clear: function() {
		this.context.clearRect(0, 0, this.width, this.height);	
		/*
		if(game_over){
			/////////fixx this BS
			this.context.font = "20px Arial";
			this.context.fillStyle = "black";
			this.context.fillText("Miss:", width - width/3.1, 22);
			var levelString = level.toString();
			gameArea.context.fillText("Level: " + levelString, scoreX, 45);
			scoreUpdate();
		}*/
	},
	
	HUD: function(){	
		//console.log("HUD CALL");
		this.context.font = "20px Arial";
		this.context.fillStyle = "black";
		this.context.fillText("Miss:", width - width/3.1, 22);
		var levelString = level.toString();
		gameArea.context.fillText("Level: " + levelString, scoreX, 45);
		scoreUpdate();
		
	},
	
	reset: function(){
		game_over = false;
		bullets = [0, 0, 0];
		bulletCount = 0;
		readyFire = false;
		missMeter = [];
		missCount = 3;
		enemies = [];
		currentEnemy = 0;
		enemyCount = 0;
		totalEnemies = 0;
		boulders = [];
		bCount = 0;
		frameCounter = 0;
		enemyFrequency = 100;
		score = 0;
		multiplier = 1;
		comboChain = 0;
		shipSpd = 3;
		level = 1;
		levelSpeed = 0;
		levelUp = 10;
	},
	pause: function(e){
		if (!paused) {
			paused = true;
			console.log("PAUSE");
			clearInterval(gameArea.interval);
			
			window.addEventListener('keydown', gameArea.pause);
		}
		else {
			if (e.keyCode == 27){
				console.log("unpause");
				window.removeEventListener('keydown', gameArea.pause);
				paused = false;
				gameArea.keys[27] = 0;
				gameArea.interval = setInterval(updateGameArea, 20);

			}
		}
	}
}

	function spaceStart(e){
		var key = e.keyCode;
		if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
				e.preventDefault();
			}
		if (key == 32){
			window.removeEventListener('keydown', spaceStart);
			if (game_over){
				gameArea.reset();
				startGame();
			}
			else{
				gameArea.start();
			}
		}
	}

function component(width, height, color, x, y, isShip) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.speedX = 0;
	this.speedY = 0;
	this.update = function(){
		ctx = gameArea.context;
		ctx.fillStyle = color;
		
		if (isShip){ //add turret
			var date = new Date();
			var millisec = date.getMilliseconds();
			var floatPos = Math.sin(millisec/150); //make the ship float up and down
			floatPos = floatPos * 5;
			var shipY = this.y + floatPos;
			
			ctx.fillRect(this.x + (this.width/2) - (this.width/3)/2, shipY - this.height/3, this.width/3, this.height/3);
			ctx.fillRect(this.x, shipY, this.width, this.height);
			sidesCheck();
		}	
		else { ctx.fillRect(this.x, this.y, this.width, this.height);}
	}
	this.newPos = function() {
		this.x += this.speedX;
		this.y += this.speedY;
	}
}  

function boulder(width, height, color, x, y, rotate){
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.speedX = 0;
	this.speedY = 0;
	this.rotPos = 0;
	this.update = function(){
		this.newPos();
		this.bounce();
		this.checkhit();
		ctx = gameArea.context;
		if(frameCounter%2 == 0){
			ctx.fillStyle = 'red';
		} else {
			ctx.fillStyle = 'orange';
		}
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillRect(this.x + this.width/6, this.y - this.height/6, this.width * (4/6), this.height * (8/6));
		ctx.fillRect(this.x - this.width/8, this.y + this.height/6, this.width * (10/8), this.height * (4/6));
		ctx.save();
		ctx.fillStyle = color;
		var tempx = this.x + (-this.x) + (-this.width/2);
		var tempy = this.y + (-this.y) + (-this.height/2);
		ctx.translate(this.x + this.width/2, this.y + this.height/2);
		ctx.rotate(rotate + this.rotPos);

		this.rotPos += rotate;
		ctx.fillRect(tempx, tempy + this.height/6, this.width, this.height * (4/6));
		ctx.fillRect(tempx + this.width/6, tempy, this.width* (4/6), this.height);
		
		//this.x = this.x + this.width/2;
		//this.y = this.y + this.height/2;
		ctx.restore();

	}
	this.newPos = function(){
		this.x += this.speedX;
		this.y += this.speedY;
	}
	this.bounce = function() {
		if (this.x < 0 && this.speedX < 0){ 
			this.speedX = -this.speedX; 
		}
		if ((this.x + this.width) > gameArea.width && this.speedX > 0) { 
			this.speedX = -this.speedX; 
		}
	}
	this.checkhit = function() {
		var extraRoom = 5;
		checkHit(this, -1);
		if (((this.y + this.height > ship.y) && this.y < (ship.y + ship.height)) && 
			((this.x + this.width - extraRoom) > ship.x && this.x + extraRoom < (ship.x + ship.width))){
				game_over = true;
		}
		
	}
}
	


function sidesCheck(){ //if ship goes past the edge of the screen warp to the other side
	if (ship.x < -ship.width){ ship.x = width;}
	if (ship.x > width) { ship.x = -ship.width;}
}

function enemy(){
	totalEnemies++;
	var num;
	console.log("level: " + level);
	if (totalEnemies % levelUp == 0){
		level++;
		totalEnemies = 0;
	}

	
	if (level == 1) {
		chooseEnemy(-1);
	}
	if (level == 2) {
		chooseEnemy(2);
		levelUp = 15;
	}
	if (level == 3) {
		console.log("level 3");

		num = Math.floor(Math.random() * 3); 
		chooseEnemy(num); //choose random number 0-2
		levelUp = 10;
	}	
	if (level == 4) {
		console.log("level 4");

		//levelSpeed = 0.5;
		//num = Math.floor(Math.random() * 3);
		num = 3;
		chooseEnemy(num); //choose random number 0-2
		
		levelUp = 10;
		//chooseEnemy(num);
	}
	if (level == 5) {
		console.log("level 5");
		enemyFrequency = 90;
		num = Math.floor(Math.random() * 4);
		chooseEnemy(num); //choose random number 0-3
		levelUp = 20
	}	
	if (level >= 6) {
		levelSpeed = 0.5;
		shipSpd = 4;
		num = Math.floor(Math.random() * 4);
		chooseEnemy(num); //choose random number 0-2
	}
	
	currentEnemy = (currentEnemy + 1) % maxEnemies;
	if (enemyCount < maxEnemies){
		enemyCount++;
	}
}

function chooseEnemy(num){
	//console.log("num: " + num);
	switch(num){
		case 0:
			enemies[currentEnemy] = new component(20, 15, 'black', Math.floor((Math.random() * (width-20))), 0);
			console.log("case 0");
			//console.log("totalEnemies: " + totalEnemies);
			enemies[currentEnemy].speedY = 2;
			enemies[currentEnemy].speedX = 0.5 + levelSpeed;
			break;
		case 1:
			enemies[currentEnemy] = new component(20, 15, 'black', Math.floor((Math.random() * (width-20))), 0);
			console.log("case 1");
			//console.log("totalEnemies: " + totalEnemies);
			enemies[currentEnemy].speedY = 2;
			enemies[currentEnemy].speedX = -0.5 + levelSpeed;
			break;
		case 2:
			enemies[currentEnemy] = new component(20, 15, 'black', Math.floor((Math.random() * (width-20))), 0);
			console.log("case 2");//totalEnemies++; 
			console.log("totalEnemies: " + totalEnemies);
			enemies[currentEnemy].speedY = 2 + levelSpeed;
			enemies[currentEnemy].speedX = 0;
			break;
		case 3:
			console.log("case 3: BOLDER");
			boulders[bCount] = 	new boulder(100, 100, 'brown', Math.floor((Math.random() * (width-100))), -100, 0.05);
			boulders[bCount].speedX = 1.5;
			boulders[bCount].speedY = 1.5;
			bCount++;
			enemyFrequency = boulderFrequency;
			console.log("bCount: " + bCount);
			break;
		case -1: //level 1
			console.log("case -1");
			enemies[currentEnemy] = new component(20, 15, 'black', Math.floor((Math.random() * (width-20))), 0);
			enemies[currentEnemy].speedY = 1.5;
			enemies[currentEnemy].speedX = 0;
	}

}

function fireBullet(){
	if(bullets[bulletCount] == 0){
		bullets[bulletCount] = new component(5, 5, 'black', ship.x + ship.width/2 - (5/2), ship.y);
		bullets[bulletCount].speedY = -3;
		bulletCount = (bulletCount + 1) % 3;
			
		//console.log(bulletCount);
	}
}

function bulletUpdate(){
	var i;
	for(i = 0; i < 3; i++){
		if (bullets[i].y < 0){
			bullets[i] = 0;
		}
		checkHit(bullets[i], i);
		if (bullets[i] != 0){
			bullets[i].newPos();
			bullets[i].update();
		}
		
	}
}

function enemyUpdate(){
	
	for(i=0; i<enemyCount; i++){
		if (enemies[i] && enemies[i].y < height){

			enemies[i].newPos();
			if (enemies[i].x < 0){ enemies[i].speedX = -enemies[i].speedX; }
			if (enemies[i].x + enemies[i].width > width) { enemies[i].speedX = -enemies[i].speedX; }
			enemies[i].update();
		}
		
		if (enemies[i] && enemies[i] != 0 && enemies[i].y > (ship.y + ship.height)) {
			missCount--;
			//console.log("miss count: " + missCount);
			enemies[i] = 0;
			comboChain = 0;
			multiplierUpdate();
		}
		
	}
}

function missUpdate(){
	for(i = 0; i < missCount; i++){
		missMeter[i].update();
	}
	if (missCount <= 0){
		game_over = true;	
	}
}

function scoreUpdate() {
	gameArea.context.font = "20px Arial";
	gameArea.context.fillStyle = "black";
	scoreString = score.toString();
	gameArea.context.fillText("Score: " + scoreString, scoreX, 22);
}

function multiplierUpdate(){
	if (comboChain < 5) { multiplier = 1; }
	else if (comboChain < 10) { multiplier = 1.5; }
	else if (comboChain < 15) { multiplier = 2; }
	else if (comboChain < 20) { multiplier = 3; }
	else { multiplier = 4; }
	
	//console.log("multiplier: " + multiplier);
	
}

function gameOver(){
	game_over = true;
	console.log("GAMEOVER");
	clearInterval(gameArea.interval);
	window.addEventListener('keydown', spaceStart); 
	
	//gameArea.context.clearRect(0, 0, width, height);
	//gameArea.HUD();
	//scoreUpdate();
	gameArea.context.fillStyle = "black";
	gameArea.context.fillRect(0, height/2 - 25, width, height/6);
	gameArea.context.font = "20px Arial";
	gameArea.context.fillStyle = "white";
	gameArea.context.textAlign = "center";
	gameArea.context.fillText("Game Over", width/2, height/2);		
	gameArea.context.fillText("Space to try again", width/2, height/2 + 25);	
}

function checkHit(obj, bulnum){
	//console.log("bullet check" + bul);
	
	for(i = 0; i<enemyCount; i++){
		if (enemies[i] && (obj.y > enemies[i].y) && obj.y < (enemies[i].y + enemies[i].height)) {
			
			if((obj.x + obj.width) > enemies[i].x && obj.x < (enemies[i].x + enemies[i].width)){
				
				enemies[i] = 0;
				if (bulnum >= 0){
					bullets[bulnum] = 0;
					score = score + (10 * multiplier);
					comboChain += 1;
					console.log("combo:" + comboChain);
					multiplierUpdate();
				}
				
			}
		}
	}
}

function boulderUpdate(){
	for(var i = 0; i < bCount; i++){
		boulders[i].update();
		//if (boulders[i].y > gameArea.height){
		//	boulders[i] = 0;
		//}
	}
}

function shipSpeed() {
	if (gameArea.keys && gameArea.keys[37]) {ship.speedX = -shipSpd; }
	if (gameArea.keys && gameArea.keys[39]) {ship.speedX = shipSpd; }	
	if (!gameArea.keys[37] && !gameArea.keys[39]) {
		
		ship.speedX = ship.speedX * 0.8
		if (ship.speedX < 0.1 && ship.speedX > -0.1) {
			ship.speedX = 0;
		}
	}
}
	
function updateGameArea(){
	if (!game_over){
	gameArea.clear();
	}
	//ship.speedX = 0;
	//ship.speedY = 0;
	
	shipSpeed();

	if (gameArea.keys && gameArea.keys[32]) {
		readyFire = true;
	}
	if(gameArea.keys && gameArea.keys[27]){
		console.log("escape: " + gameArea.keys[27]);
		gameArea.pause();
	}
	ship.newPos();
	ship.update();
	enemyUpdate();
	boulderUpdate();
	bulletUpdate();
	missUpdate();
	gameArea.HUD();
	
	if (game_over) { 
		gameOver();
	}
	
	
	if (frameCounter == 0){
		console.log("SPAWN");
		enemy();
	}
	//b1.update();
	frameCounter = (frameCounter + 1) % enemyFrequency;

}

startGame();