/* vim: set ts=4 sw=4 sta et sts=4 ai ci: */
var canvas;
var context;
var canvasHeight;
var canvasWidth;
var half_canvasHeight;
var half_canvasWidth;
var lastTime;

var x0 = 0;
var y0 = 0;
var x1 = 0;
var y1 = 0;
var dt = 0;
var r = 20.0;

var fliers0;
var fliers1;

var numFliers = 10;

const TRANSLATE = 0;
const ROTATE = 1;
const ROTATE_TRANSLATE = 2;
const PAUSE = 3;
const LOOP = 4;
const ENTER_LEFT = 5;
const EXIT_RIGHT = 6;
const TRANSLATE_TO = 7;
const SET_POS = 8;


var pattern_0 = [
    {
        "cmd" : ENTER_LEFT,
        "v" : 10.0,
        "x" : 0
    },

    {
        "cmd" : TRANSLATE_TO,
        "v" : 10.0,
        "x" : -200.0
    },

    {
        "cmd" : ROTATE,
        "v" : 10.0,
        "theta" : -Math.PI / 20,
        "max" : -Math.PI / 2 
    },

    {
        "cmd" : TRANSLATE,
        "v" : 10.0,
        "durration" : 10.0
    },


    {
        "cmd" : ROTATE,
        "v" : 10.0,
        "theta" : Math.PI / 20,
        "max" : Math.PI / 2 
    },

    {
        "cmd" : ROTATE,
        "v" : 10.0,
        "theta" : -Math.PI / 20,
        "max" : -Math.PI / 2 
    },

    {
        "cmd" : TRANSLATE,
        "v" : 10.0,
        "durration" : 20.0
    },


    {
        "cmd" : ROTATE,
        "v" : 10.0,
        "theta" : Math.PI / 20,
        "max" : Math.PI / 2 
    },


    {
        "cmd" : ROTATE,
        "v" : 10.0,
        "theta" : -Math.PI / 20,
        "max" : (-Math.PI * 2)
    },

    {
        "cmd" : EXIT_RIGHT,
        "v" : 10.0,
        "x" : 0
    }
];


$(document).ready(function() {
    canvas = $("#myCanvas");
    context = canvas.get(0).getContext("2d");
    canvasHeight = canvas.height();
    canvasWidth = canvas.width();
    half_canvasHeight = canvasHeight / 2;
    half_canvasWidth = canvasWidth / 2;
    init();
    animate();

    pattern_0[0]["x"] = -half_canvasWidth;
    pattern_0[9]["x"] = half_canvasWidth;
});

function Flyer(startX, startY, startTheta, color, v, r) {
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.theta = startTheta;
    this.color = color;
    this.r = r;
    this.v = v;
    this.cosine = Math.cos(this.theta);
    this.sine = Math.sin(this.theta);
    this.dt = 0;
    this.dtheta = 0;
    this.loop = false;
    this.reset_loop = true;
    this.cur_pattern = null;
    this.cur_cmd = 0;
    this.bounds_check = false;
    this.start_pattern = true;

    this.update = function(dt) {

        var pattern = this.cur_pattern;
        var i = this.cur_cmd;

        switch (pattern[i]["cmd"]) {
            
            case ENTER_LEFT:
            this.v = pattern[i]["v"];
            if (this.x >= pattern[i]["x"]) {
                this.cur_cmd++;
                this.start_pattern = false;
            }
            break;

            case EXIT_RIGHT:
            this.v = pattern[i]["v"];
            if (this.x >= pattern[i]["x"]) {
                this.cur_cmd++;
            }
            break;


            case TRANSLATE_TO:
            this.v = pattern[i]["v"];
            if (this.x >= pattern[i]["x"]) {
                this.cur_cmd++;
            }
            break;
           
            case TRANSLATE:
            this.v = pattern[i]["v"];
            this.dt += v;
            if (this.dt >= pattern[i]["durration"]) {
                this.dt = 0;
                this.cur_cmd++;
            }
            break;

            case ROTATE:
            this.v = pattern[i]["v"];
            this.dtheta += pattern[i]["theta"];
            this.theta += pattern[i]["theta"];

            if (pattern[i]["max"] < 0) {
                if (this.dtheta <= pattern[i]["max"]) {
                    this.dtheta = 0;
                    this.cur_cmd++;
                }
            }
            else {
                if (this.dtheta >= pattern[i]["max"]) {
                    this.dtheta = 0;
                    this.cur_cmd++;
                }
            }

            break;

            case PAUSE:
            break;
        }

        if (this.cur_cmd >= pattern.length) {
            this.cur_cmd = 0;
            this.start_pattern = true;
            this.bounds_check = false;
            this.reset();
        }

        if (this.bounds_check) {
            if (this.x > half_canvasWidth) {
                this.x = -half_canvasWidth;
            }
            else if (!this.start_pattern && (this.x < -half_canvasWidth)) {
                this.x = half_canvasWidth;
            }

            if (this.y > half_canvasHeight) {
                this.y = -half_canvasHeight;
            }
            else if (this.y < -half_canvasHeight) {
                this.y = half_canvasHeight;
            }
        }

        if (this.start_pattern == false) {
            this.bounds_check = true;
        }

        this.cosine = Math.cos(this.theta);
        this.sine = Math.sin(this.theta);
        this.x = this.v * this.cosine + this.x;
        this.y = this.v * this.sine + this.y;
    }

    this.reset = function() {
        this.x = -half_canvasWidth;
        this.y = this.startY;
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
    var dateTemp = new Date();
    lastTime = dateTemp.getTime();

    fliers0 = new Array();
    fliers1 = new Array();

    for (var i=0; i<numFliers; i++) {
        fliers0[i] = new Flyer(-half_canvasWidth - (i * 20), half_canvasHeight - 40, 
            0, "rgb(255, 0, 0)", 10, 0);

        fliers0[i].cur_pattern = pattern_0;

        fliers1[i] = new Flyer(-half_canvasWidth - (i * 20), half_canvasHeight - 20,
                0, "rgb(255, 255, 0)", 10, 20);

        modifier = i * 20;
    }

}

function animate() {
    var dateTemp = new Date();
    var curTime = dateTemp.getTime();
    var delta = curTime - lastTime;
    lastTime = curTime;

    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    for (var i=0; i<numFliers; i++) {
        fliers0[i].draw();
        fliers1[i].draw();
        fliers0[i].update(delta);
        fliers1[i].mirror(fliers0[i]);
    }

    setTimeout(animate, 33);
}
