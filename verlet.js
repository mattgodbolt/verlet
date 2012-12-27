var canvas = null;
var ctx = null;

var Height = 480;
var Width = 640;
var Gravity = 0.18;
var Friction = 0.9995;
var Elastic = 0.997;

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.add = function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    }
    this.sub = function(p) {
        this.x -= p.x;
        this.y -= p.y;
    }
    this.mul = function(scale) {
        this.x *= scale;
        this.y *= scale;
    }
};

function Static(xPos, yPos) {
    this.x = xPos;
    this.y = yPos;

    this.draw = function() {};
    this.move = function() {
        this.x = xPos;
        this.y = yPos;
    };
    this.constrain = function() {};
};

function Mouse() {
    this.x = 0;
    this.y = 0;

    var mouseX = 0;
    var mouseY = 0;
    canvas.addEventListener('mousemove', function(evt) {
        var rect = canvas.getBoundingClientRect();
        mouseX = evt.clientX - rect.left;
        mouseY = evt.clientY - rect.top;
    });

    this.draw = function() {};
    this.move = function() {
        this.x = mouseX;
        this.y = mouseY;
    };
    this.constrain = function() {};
    this.collide = function() {};
};

function Circle(xPos, yPos) {
    this.x = xPos;
    this.y = yPos;
    this.radius = 20;

    this.oldX = this.x;
    this.oldY = this.y;

    this.draw = function() {
        ctx.fillStyle = "#a22";
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };

    this.move = function() {
        var velX = this.x - this.oldX;
        var velY = this.y - this.oldY + Gravity;
        this.oldX = this.x;
        this.oldY = this.y;
        this.x += velX * Friction;
        this.y += velY * Friction;
    };

    this.constrain = function() {
        if (this.x < this.radius) this.x = this.radius;
        if (this.x > Width - this.radius) this.x = Width - this.radius;
        if (this.y < this.radius) this.y = this.radius;
        if (this.y > Height - this.radius) this.y = Height - this.radius;
    };
    this.collide = function(other) {
        if (other.radius !== undefined) {
            var xDist = this.x - other.x;
            var yDist = this.y - other.y;
            var distSqr = xDist * xDist + yDist * yDist;
            var dist = Math.sqrt(distSqr);
            var minDist = this.radius + other.radius;
            if (dist >= minDist) return;
            var ratio = (minDist / dist);
            var midX = (this.x + other.x) / 2.0;
            var midY = (this.y + other.y) / 2.0;
            this.x = midX + (xDist / 2) * ratio;
            this.y = midY + (yDist / 2) * ratio;
            other.x = midX - (xDist / 2) * ratio;
            other.y = midY - (yDist / 2) * ratio;
        }
    };
}

function Rope(from, to, maxDist) {
    this.from = from;
    this.to = to;

    this.draw = function() {
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.closePath();
        ctx.stroke();
    }

    this.move = function() {};

    this.constrain = function() {
        var xDist = this.from.x - this.to.x;
        var yDist = this.from.y - this.to.y;
        var distSqr = xDist * xDist + yDist * yDist;
        var dist = Math.sqrt(distSqr);
        if (dist < maxDist) return;
        var ratio = (maxDist / dist) * Elastic;
        var midX = (this.from.x + this.to.x) / 2.0;
        var midY = (this.from.y + this.to.y) / 2.0;
        this.from.x = midX + (xDist / 2) * ratio;
        this.from.y = midY + (yDist / 2) * ratio;
        this.to.x = midX - (xDist / 2) * ratio;
        this.to.y = midY - (yDist / 2) * ratio;
    };
    this.collide = function() {};
};
var scene = [];

function init() {
    //scene = [new Static(80, 20)];
    scene = [new Mouse()];

    for (var i = 0; i < 9; ++i) {
        scene.push(new Circle(80 + 25 * i, 20 + 45 * i));
    }
    var numRopes = scene.length;
    for (var i = 1; i < numRopes; ++i) {
        scene.push(new Rope(scene[i-1], scene[i], 40));
    }
}


function tick() {
    var i, j;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, Width, Height);
    for (i = 0; i < scene.length; ++i) {
        scene[i].draw();
    }
    for (i = 0; i < scene.length; ++i) {
        scene[i].move();
    }
    for (i = 0; i < scene.length; ++i) {
        scene[i].constrain();
    }
    for (i = 0; i < scene.length; ++i) {
        for (j = i+1; j < scene.length; ++j) {
            scene[i].collide(scene[j]);
        }
    }
}

function simulate() {
    canvas = $("canvas")[0];
    ctx = canvas.getContext("2d");
    init();
    tick();
    setInterval(tick, 8);
}


$(simulate);
