var canvas;
var context;
var canvasHeight;
var canvasWidth;
var half_canvasHeight;
var half_canvasWidth;
var dateTemp;
var lastTime;

var x0 = 0;
var y0 = 0;
var x1 = 0;
var y1 = 0;
var dt = 0;
var r = 20.0;

var fliers;
var f0;
var f1;

$(document).ready(function() {
	canvas = $("#myCanvas");
	context = canvas.get(0).getContext("2d");
	canvasHeight = canvas.height();
	canvasWidth = canvas.width();
	half_canvasHeight = canvasHeight / 2;
	half_canvasWidth = canvasWidth / 2;
	init();
	animate();
});


function Flyer(startX, startY, startTheta, color, v, r) {
	
	this.x = startX;
	this.y = startY;
	this.theta = startTheta;
	this.color = color;
	this.r = r;
	this.v = v;
	this.cosine = Math.cos(this.theta);
	this.sine = Math.sin(this.theta);

	this.move = function() {
		this.cosine = Math.cos(this.theta);
		this.sine = Math.sin(this.theta);
		this.x = this.v * this.cosine + this.x;
		this.y = this.v * this.sine + this.y;

		if (this.x > half_canvasWidth) {
			this.x = -half_canvasWidth;
		}
		else if (this.x < -half_canvasWidth) {
			this.x = half_canvasWidth;
		}

		if (this.y > half_canvasHeight) {
			this.y = -half_canvasHeight;
		}
		else if (this.y < -half_canvasHeight) {
			this.y = half_canvasHeight;
		}

		if ((Math.random() * 100) < 60) {
			if ((Math.random() * 10) < 5) {
				this.theta += Math.PI / 32;
			}
			else {
				this.theta -= Math.PI / 32;
			}
		}
	}

	this.mirror = function(leader) {
		this.theta = leader.theta;
		this.x = r * -leader.sine + leader.x;
		this.y = r * leader.cosine + leader.y;
	}

	this.drawCenteredRect = function(x, y, w, h) {
		x -= w / 2;
		y -= h / 2;
		context.fillRect(x, y, w, h);
	}

	this.draw = function() {
		context.save();
		context.fillStyle = color;
		context.translate(this.x + half_canvasWidth,
			       	this.y + half_canvasHeight);
		context.rotate(this.theta);
		this.drawCenteredRect(0, 0, 10, 10);
		context.restore();
	}
}

function init() {
	dateTemp = new Date();
	lastTime = dateTemp.getTime();
	f0 = new Flyer(0, 0, 0, "rgb(255, 0, 0)", 10, 0);
	f1 = new Flyer(0, 20, 0, "rgb(255, 255, 0)", 10, 20);
}

function animate() {

	context.fillStyle = "rgb(0, 0, 0)";
	context.fillRect(0, 0, canvasWidth, canvasHeight);

	f0.draw();
	f1.draw();

	f0.move();
	f1.mirror(f0);

	setTimeout(animate, 33);
}
