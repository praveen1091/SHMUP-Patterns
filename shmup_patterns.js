/* vim: set ts=4 sw=4 sta et sts=4 ai ci: */
(function() {

var canvas;
var context;
var canvasHeight;
var canvasWidth;
var HalfCanvasHeight;
var HalfCanvasWidth;
var lastTime;

var ships0;
var ships1;

var MaxShipsPerFormation = 10;

var NumShipsLeft = 0;
var MirrorFormation = false;

var FormationInitFunc = null;

var TRANSLATE = 0;
var ROTATE = 1;
var TRANSLATE_TO = 2;
var EXIT_LEFT = 3;
var EXIT_RIGHT = 4;
var ENTER_LEFT = 5;
var ENTER_RIGHT = 6;

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

var pattern_2 = [
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
];


var pattern_3 = [

    {
        "cmd" : ROTATE,
        "v" : 10.0,
        "theta" : Math.PI / 20,
        "max" : Math.PI / 2 
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
        "cmd" : TRANSLATE,
        "v" : 10.0,
        "frames" : 10.0
    },

    {
        "cmd" : ROTATE,
        "v" : 10.0,
        "theta" : Math.PI / 20,
        "max" : 2 * Math.PI 
    },

    {
        "cmd" : EXIT_LEFT,
        "v" : 20.0,
        "x" : 0
    }
];


var formationPatternQueue0 = new Array(pattern_0);
var formationPatternQueue1 = new Array(pattern_1);
var formationPatternQueue2 = new Array(pattern_2, pattern_3);

var patterns = new Array(
        pattern_0,
        pattern_1,
        pattern_2,
        pattern_3
        );

var doAnimation = false;

$(document).ready(function() {

    canvas = $("#g1_myCanvas");
    context = canvas.get(0).getContext("2d");
    canvasHeight = canvas.height();
    canvasWidth = canvas.width();
    HalfCanvasHeight = canvasHeight / 2;
    HalfCanvasWidth = canvasWidth / 2;

    init();

    // clear canvas
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

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

    var toggleBtn = $("#g1_toggleBtn");
    var f0 = $("#g1_f0");
    var f1 = $("#g1_f1");
    var f2 = $("#g1_f2");

    toggleBtn.click(function() {
        doAnimation = !doAnimation;
        if (doAnimation) {
            animate();
        }
    });

    f0.click(function() {
        initFormation0();
    });
    f1.click(function() {
        initFormation1();
    });
    f2.click(function() {
        initFormation2();
    });
});

function Ship() {


    this.reset = function() {
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
    }
    
    this.reset();

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
        
        startX = -HalfCanvasWidth - (i * 20.0);

        ships0[i].reset();
        ships1[i].reset();

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

        startX = -HalfCanvasWidth - (i * 20.0);

        ships0[i].reset();
        ships1[i].reset();

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
    }

    NumShipsLeft = MaxShipsPerFormation * 2;
    MirrorFormation = false;
    FormationInitFunc = initFormation1;
}

function initFormation2() {

    var startTheta = 0.0;
    var startX = -HalfCanvasWidth;
    var startY = HalfCanvasHeight - 40;

    for (var i=0; i<MaxShipsPerFormation; i++) {

        startX = -HalfCanvasWidth - (i * 20.0);

        ships0[i].reset();
        ships1[i].reset();

        ships0[i].setPos(startX, startY);
        ships0[i].setDir(startTheta);
        ships0[i].setColor("rgb(255, 0, 0)");
        ships0[i].setPatternQueue(formationPatternQueue2);
        ships0[i].alive = true;
        ships0[i].leader = null;

        ships1[i].setPos(startX, startY);
        ships1[i].setColor("rgb(255, 255, 0)");
        ships1[i].setFormationOffset(20.0);

        ships1[i].alive = true;
        ships1[i].leader = ships0[i];
    }

    NumShipsLeft = MaxShipsPerFormation;
    MirrorFormation = true;
    FormationInitFunc = initFormation2;
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

function update() {
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

function animate() {
    update();
    if (doAnimation) {
        setTimeout(animate, 33);
    }
}

})();
