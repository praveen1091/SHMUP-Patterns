/* vim: set ts=4 sw=4 sta et sts=4 ai ci: */
var canvas;
var context;
var canvasHeight;
var canvasWidth;
var HalfCanvasHeight;
var HalfCanvasWidth;
var lastTime;

var x0 = 0;
var y0 = 0;
var x1 = 0;
var y1 = 0;
var dt = 0;
var r = 20.0;

var ships0;
var ships1;

var MaxShipsPerFormation = 10;

var NumShipsLeft = 0;
var MirrorFormation = false;

var FormationInitFunc = null;

var TRANSLATE = 0;
var ROTATE = 1;
var ROTATE_TRANSLATE = 2;
var LOOP = 4;
var ENTER_LEFT = 5;
var EXIT_RIGHT = 6;
var TRANSLATE_TO = 7;
var SET_POS = 8;
var ENTER_RIGHT = 9;
var EXIT_LEFT = 10;

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
        "frames" : 10.0
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
        "frames" : 20.0
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

var pattern_1 = [
    {
        "cmd" : ENTER_RIGHT,
        "v" : -10.0,
        "x" : 0
    },

    {
        "cmd" : TRANSLATE_TO,
        "v" : -10.0,
        "x" : 200.0
    },

    {
        "cmd" : ROTATE,
        "v" : -10.0,
        "theta" : Math.PI / 20,
        "max" : Math.PI / 2 
    },

    {
        "cmd" : TRANSLATE,
        "v" : -10.0,
        "frames" : -10.0
    },

    {
        "cmd" : ROTATE,
        "v" : -10.0,
        "theta" : -Math.PI / 20,
        "max" : -Math.PI / 2 
    },

    {
        "cmd" : ROTATE,
        "v" : -10.0,
        "theta" : Math.PI / 20,
        "max" : Math.PI / 2 
    },

    {
        "cmd" : TRANSLATE,
        "v" : -10.0,
        "frames" : -20.0
    },

    {
        "cmd" : ROTATE,
        "v" : -10.0,
        "theta" : -Math.PI / 20,
        "max" : -Math.PI / 2 
    },

    {
        "cmd" : ROTATE,
        "v" : -10.0,
        "theta" : Math.PI / 20,
        "max" : (Math.PI * 2)
    },

    {
        "cmd" : EXIT_LEFT,
        "v" : -10.0,
        "x" : 0
    }
];



var formationPatternQueue0 = new Array(pattern_0);
var formationPatternQueue1 = new Array(pattern_1);

var patterns = new Array(
        pattern_0,
        pattern_1
        );


$(document).ready(function() {

    canvas = $("#myCanvas");
    context = canvas.get(0).getContext("2d");
    canvasHeight = canvas.height();
    canvasWidth = canvas.width();
    HalfCanvasHeight = canvasHeight / 2;
    HalfCanvasWidth = canvasWidth / 2;

    init();
    animate();

    for (var i=0; i<patterns.length; i++) {
        var pattern = patterns[i];
        for (var j=0; j<pattern.length; j++) {
            switch (pattern[j]["cmd"]) {
            case ENTER_LEFT:
                pattern[j]["x"] = -HalfCanvasWidth;
            break;
            case ENTER_RIGHT:
                pattern[j]["x"] = HalfCanvasWidth;
            break;
            case EXIT_LEFT:
                pattern[j]["x"] = -HalfCanvasWidth;
            break;
            case EXIT_RIGHT:
                pattern[j]["x"] = HalfCanvasWidth;
            break;
            }
        }
    }
});

function Ship() {

    this.x = null;
    this.y = null;
    this.color = null;
    this.v = null;
    this.theta = null;
    this.cosine = null;
    this.sine = null;

    this.dt = 0;
    this.dtheta = 0;
    
    this.leader = null;
    this.formation_offset = null;

    this.cur_pattern = null;
    this.cur_cmd = 0;
 
    this.patternQueue;
    this.patternQueuePos;

    this.alive = false;
    
    this.setPos = function(x, y) {
        this.x = x;
        this.y = y;
    }

    this.setColor = function(color) {
        this.color = color;
    }
   
    this.setVelocity = function(v) {
        this.v = v;
        console.log("set velocity: " + v);
    }

    this.setFormationOffset = function(offset) {
        this.formation_offset = offset;
    }

    this.setDir = function(theta) {
        this.theta = theta;
    }
    
    this.setPatternQueue = function(patternQueue) {
        this.patternQueue = patternQueue;
        this.patternQueuePos = 0;
        this.cur_pattern = this.patternQueue[0];
        this.cur_cmd = 0;
    }

    this.update = function(dt) {

        if (!this.alive) {
            return;
        }

        if (this.leader) {
            this.mirror();
            return;
        }

        var pattern = this.cur_pattern;
        var i = this.cur_cmd;

        switch (pattern[i]["cmd"]) {
            
            case ENTER_LEFT:
            this.v = pattern[i]["v"];
            if (this.x >= pattern[i]["x"]) {
                this.cur_cmd++;
            }
            break;

            case ENTER_RIGHT:
            this.v = pattern[i]["v"];
            if (this.x <= pattern[i]["x"]) {
                this.cur_cmd++;
            }
            break;

            case EXIT_LEFT:
            this.v = pattern[i]["v"];
            if (this.x <= pattern[i]["x"]) {
                this.cur_cmd++;
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

            if (this.v < 0) {
                if (this.x <= pattern[i]["x"]) {
                    this.cur_cmd++;
                }
            }
            else {
                if (this.x >= pattern[i]["x"]) {
                    this.cur_cmd++;
                }
            }
            break;
           
            case TRANSLATE:

            this.v = pattern[i]["v"];
            this.dt += this.v;

            if (this.v < 0) {
                if (this.dt <= pattern[i]["frames"]) {
                    this.dt = 0;
                    this.cur_cmd++;
                }
            }
            else {
                if (this.dt >= pattern[i]["frames"]) {
                    this.dt = 0;
                    this.cur_cmd++;
                }
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
        }

        this.cosine = Math.cos(this.theta);
        this.sine = Math.sin(this.theta);
        this.x = (this.v * this.cosine) + this.x;
        this.y = (this.v * this.sine) + this.y;

        if (this.cur_cmd >= pattern.length) {
            this.patternQueuePos++;
            if (this.patternQueuePos >= this.patternQueue.length) {
                this.alive = false;
                NumShipsLeft--;
            }
            else {
                this.cur_pattern = this.patternQueue[this.patternQueuePos];
                this.cur_cmd = 0;
            }
        }
    }

    this.mirror = function() {
        this.theta = this.leader.theta;
        this.x = (this.formation_offset * -this.leader.sine) + this.leader.x;
        this.y = (this.formation_offset * this.leader.cosine) + this.leader.y;
    }

    this.drawCenteredRect = function(x, y, w, h) {
        x -= w / 2;
        y -= h / 2;
        context.fillRect(x, y, w, h);
    }

    this.draw = function() {
        context.save();
        context.fillStyle = this.color;
        context.translate(this.x + HalfCanvasWidth,
                    this.y + HalfCanvasHeight);
        context.rotate(this.theta);
        this.drawCenteredRect(0, 0, 10, 10);
        context.restore();
    }
}


function initFormation0() {

    var startTheta = 0.0;
    var startX = -HalfCanvasWidth;
    var startY = HalfCanvasHeight - 40;

    for (var i=0; i<MaxShipsPerFormation; i++) {
        ships0[i].setPos(startX, startY);
        ships0[i].setDir(startTheta);
        ships0[i].setColor("rgb(255, 0, 0)");
        ships0[i].setPatternQueue(formationPatternQueue0);
        ships0[i].alive = true;
        ships0[i].leader = null;

        ships1[i].setPos(startX, startY);
        ships1[i].setColor("rgb(255, 255, 0)");
        ships1[i].setFormationOffset(20.0);

        ships1[i].alive = true;
        ships1[i].leader = ships0[i];

        startX = -HalfCanvasWidth - (i * 20.0);
    }

    NumShipsLeft = MaxShipsPerFormation;
    MirrorFormation = true;
    FormationInitFunc = initFormation0;
}

function initFormation1() {

    var startTheta = 0.0;
    var startX = -HalfCanvasWidth;
    var startY = HalfCanvasHeight - 40;

    for (var i=0; i<MaxShipsPerFormation; i++) {
        ships0[i].setPos(startX, startY);
        ships0[i].setDir(startTheta);
        ships0[i].setColor("rgb(255, 0, 0)");
        ships0[i].setPatternQueue(formationPatternQueue0);
        ships0[i].alive = true;
        ships0[i].leader = null;

        ships1[i].setPos(-startX, startY);
        ships1[i].setDir(startTheta);
        ships1[i].setColor("rgb(255, 255, 0)");
        ships1[i].setPatternQueue(formationPatternQueue1);
        ships1[i].alive = true;
        ships1[i].leader = null;

        startX = -HalfCanvasWidth - (i * 20.0);
    }

    NumShipsLeft = MaxShipsPerFormation * 2;
    FormationInitFunc = initFormation1;
}


function init() {
    lastTime = +new Date();

    ships0 = new Array();
    ships1 = new Array();

    for (var i=0; i<MaxShipsPerFormation; i++) {
        ships0[i] = new Ship();
        ships0[i].id = "id ship0 #" + i;
        ships1[i] = new Ship();
        ships0[i].id = "id ship1 #" + i;
    }

    initFormation1();
}

function animate() {
    var curTime = +new Date();
    var delta = curTime - lastTime;
    lastTime = curTime;

    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    for (var i=0; i<MaxShipsPerFormation; i++) {
        ships0[i].draw();
        ships1[i].draw();
        ships0[i].update(delta);
        ships1[i].update(delta);
    }

    setTimeout(animate, 33);

    if (NumShipsLeft < 1) {
        if (MirrorFormation) {
            NumShipsLeft = MaxShipsPerFormation;
        }
        else {
            NumShipsLeft = MaxShipsPerFormation * 2;
        }
        FormationInitFunc();
    }
}
