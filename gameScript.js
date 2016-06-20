var canvas = document.getElementById("canvas");
var ship;
var widthpx = "300px";
var heightpx = "300px";
var width = 300;
var height = 300;
document.getElementById("canvas").style.width = width;

function startGame() {
	gameArea.start();
	ship = new component(30, 30, "black", 10, 20);
}

var gameArea = {
	//canvas: document.createElement("canvas"),
	start: function() {
		//this.canvas.width = 1000;
		//this.canvas.height = 900;
		this.context = canvas.getContext("2d");
		canvas.style.width = widthpx;
		canvas.style.height = heightpx;
		this.height = height;
		this.width = width;
		//document.body.insertBefore(this.canvas, gameElem.childNodes[0]);
		this.interval = setInterval(updateGameArea, 20);
	},
	clear: function() {
		this.context.clearRect(0, 0, this.width, this.height);
	}
}

function component(width, height, color, x, y) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.update = function(){
		ctx = gameArea.context;
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

function updateGameArea(){
	gameArea.clear();
	ship.x += 1;
	ship.update();
}

startGame();