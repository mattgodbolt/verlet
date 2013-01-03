var canvas = null;
var ctx = null;

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.plus = function(p) { return new Point(this.x + p.x, this.y + p.y); };
    this.minus = function(p) { return new Point(this.x - p.x, this.y - p.y); };
    this.scale = function(scale) { return new Point(this.x * scale, this.y * scale); };
    this.assign = function(p) { this.x = p.x; this.y = p.y; };
    this.distanceTo = function(p) {
        var xDist = this.x - p.x;
        var yDist = this.y - p.y;
        return Math.sqrt(xDist * xDist + yDist * yDist);
    }
};

Point.midpoint = function(p1, p2) {
    return p1.plus(p2).scale(0.5);
}

Point.constrainDistance = function(p1, p2, distFunc) {
    var actualDist = p1.distanceTo(p2);
    var constrainDist = distFunc(actualDist);
    if (constrainDist === actualDist) return;
    var scale = constrainDist / actualDist;
    var halfVector = p1.minus(p2).scale(0.5 * scale);
    var midPoint = Point.midpoint(p1, p2);
    p1.assign(midPoint.plus(halfVector));
    p2.assign(midPoint.minus(halfVector));
}

var Height = 480;
var Width = 640;
var Gravity = new Point(0, 0.18);
var AirFriction = 0.9995;
var GroundFriction = 0.8;
var Elastic = 0.994;
var Bounce = 0.9;

function Static(xPos, yPos) {
    this.pos = new Point(xPos, yPos);

    this.draw = function() {};
    this.move = function() {
        this.pos.x = xPos;
        this.pos.y = yPos;
    };
    this.constrain = function() {};
    this.collide = function() {};
};

function Mouse() {
    this.pos = new Point(0, 0);

    var mousePos = new Point(0,0);
    canvas.addEventListener('mousemove', function(evt) {
        var rect = canvas.getBoundingClientRect();
        mousePos.x = evt.clientX - rect.left;
        mousePos.y = evt.clientY - rect.top;
    });

    this.draw = function() {};
    this.move = function() {
        this.pos.assign(mousePos);
    };
    this.constrain = function() {};
    this.collide = function() {};
};

function Circle(xPos, yPos) {
    this.pos = new Point(xPos, yPos);
    this.radius = 20;

    this.oldPos = new Point(xPos, yPos);

    this.draw = function() {
        ctx.fillStyle = "#a22";
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };

    this.move = function() {
        var velocity = this.pos.minus(this.oldPos).plus(Gravity).scale(AirFriction);
        this.oldPos.assign(this.pos);
        this.pos = this.pos.plus(velocity);
    };

    this.constrain = function() {
        if (this.pos.x < this.radius) {
            this.pos.x = this.radius;
        }
        if (this.pos.x > Width - this.radius) {
            this.pos.x = Width - this.radius;
        }
        if (this.pos.y < this.radius) {
            this.y = this.pos.radius;
        }
        if (this.pos.y > Height - this.radius) {
            this.pos.y = Height - this.radius;
            var velY = this.pos.y - this.oldPos.y;
            velY *= -Bounce;
            this.oldPos.y = this.pos.y - velY;
            var velX = this.pos.x - this.oldPos.x;
            velX *= GroundFriction;
            this.oldPos.x = this.pos.x - velX;
        }
    };

    this.collide = function(other) {
        if (other.radius !== undefined) {
            var minDist = this.radius + other.radius;
            Point.constrainDistance(this.pos, other.pos, function(dist) { 
                return Math.max(dist, minDist); 
            });
        }
    };
}

function Rope(from, to, maxDist) {
    this.from = from;
    this.to = to;

    this.draw = function() {
        ctx.beginPath();
        ctx.moveTo(this.from.pos.x, this.from.pos.y);
        ctx.lineTo(this.to.pos.x, this.to.pos.y);
        ctx.closePath();
        ctx.stroke();
    }

    this.move = function() {};

    this.constrain = function() {
        Point.constrainDistance(this.from.pos, this.to.pos, function(dist) { 
            if (dist < maxDist) return dist;
            return dist + (maxDist - dist) * Elastic;
        });
    };
    this.collide = function() {};
};
var scene = [];

function init1() {
    //scene = [new Static(80, 20)];
    scene = [new Mouse()];

    for (var i = 0; i < 10; ++i) {
        scene.push(new Circle(80 + 25 * i, 20 + 45 * i));
    }
    var numRopes = scene.length;
    for (var i = 1; i < numRopes; ++i) {
        scene.push(new Rope(scene[i-1], scene[i], 40));
    }
}

function init2() {
    scene = [new Circle(50, 50)];
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
    init1();
    tick();
    setInterval(tick, 8);
}


$(simulate);
