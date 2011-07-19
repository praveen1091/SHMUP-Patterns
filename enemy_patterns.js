var canvas;
var context;
var canvasHeight;
var canvasWidth;
var half_canvasHeight;
var half_canvasWidth;
var dateTemp;
var lastTime;

$(document).ready(function() {
	canvas = $("#myCanvas");
	context = canvas.get(0).getContext("2d");
	canvasHeight = canvas.height();
	canvasWidth = canvas.width();
	half_canvasHeight = canvasHeight / 2;
	half_canvasWidth = canvasWidth / 2;
	dateTemp = new Date();
	lastTime = dateTemp.getTime();
	animate();
});


function drawRect(x, y, width, height) {
	x -= width / 2;
	y -= height / 2;
	context.fillRect(x, y, width, height);
}


function drawFlyer(x, y, theta, color) {
	context.save();
	context.fillStyle = color;
	context.translate(x + half_canvasWidth, y + half_canvasHeight);
	context.rotate(theta);
	drawRect(0, 0, 10, 10);
	context.restore();
}

var x0 = 0;
var y0 = 0;
var x1 = 0;
var y1 = 0;
var dt = 0;
var r = 20.0;

function animate() {

	context.fillStyle = "rgb(0, 0, 0)";
	context.fillRect(0, 0, canvasWidth, canvasHeight);

	drawFlyer(x0, y0, dt, "rgb(255, 0, 0)");
	drawFlyer(x1, y1, dt, "rgb(255, 255, 0)");

	var c = Math.cos(dt);
	var s = Math.sin(dt);

	x0 = 10.0 * c + x0;
	y0 = 10.0 * s + y0;

	x1 = r * -s + x0;
	y1 = r * c + y0;

	if (x0 > half_canvasWidth) {
		x0 = -half_canvasWidth;
	}
	else if (x0 < -half_canvasWidth) {
		x0 = half_canvasWidth;
	}

	if (y0 > half_canvasHeight) {
		y0 = -half_canvasHeight;
	}
	else if (y0 < -half_canvasHeight) {
		y0 = half_canvasHeight;
	}

	if ((Math.random() * 100) < 60) {
		if ((Math.random() * 10) < 5) {
			dt += Math.PI / 32;
		}
		else {
			dt -= Math.PI / 32;
		}
	}

	setTimeout(animate, 33);
}
