var canvas = null;
var ctx = null;

const Height = 480;
const Width = 640;
const Gravity = new Point(0, 0.18);
const AirFriction = 0.9995;
const GroundFriction = 0.8;
const Elastic = 0.994;
const Bounce = 0.9;
const MouseSnap = 0.3;

var Base = {
    pos: new Point(0, 0),
    draw: function() {},
    move: function() {},
    constrain: function() {},
    collide: function() {}
};

function Static(xPos, yPos) {
    return $.extend({}, Base, {
        pos: new Point(xPos, yPos),
        move: function() {
            this.pos.x = xPos;
            this.pos.y = yPos;
        }
    });
};

function Mouse() {
    var mousePos = new Point(0,0);
    canvas.addEventListener('mousemove', function(evt) {
        var rect = canvas.getBoundingClientRect();
        mousePos.x = evt.clientX - rect.left;
        mousePos.y = evt.clientY - rect.top;
    });

    return $.extend({}, Base, {
        move: function() {
            var diff = mousePos.minus(this.pos);
            this.pos.assign(this.pos.plus(diff.scale(MouseSnap)));
        }
    });
};

function Circle(xPos, yPos, radius) {
    return $.extend({}, Base, {
        pos: new Point(xPos, yPos),
        radius: radius,
        oldPos: new Point(xPos, yPos),
        draw: function() {
            ctx.fillStyle = "#a22";
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        },
       move: function() {
           var velocity = this.pos.minus(this.oldPos).plus(Gravity).scale(AirFriction);
           this.oldPos.assign(this.pos);
           this.pos = this.pos.plus(velocity);
       },
       constrain: function() {
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
       },
       collide:  function(other) {
           if (other.radius !== undefined) {
               var minDist = this.radius + other.radius;
               Point.constrainDistance(this.pos, other.pos, function(dist) { 
                   return Math.max(dist, minDist); 
               });
           }
       }
    });
}

function Rope(from, to, maxDist) {
    return $.extend({}, Base, {
        from: from,
        to: to,
        draw: function() {
            ctx.beginPath();
            ctx.moveTo(this.from.pos.x, this.from.pos.y);
            ctx.lineTo(this.to.pos.x, this.to.pos.y);
            ctx.closePath();
            ctx.stroke();
        },
       constrain: function() {
           Point.constrainDistance(this.from.pos, this.to.pos, function(dist) { 
               if (dist < maxDist) return dist;
               return dist + (maxDist - dist) * Elastic;
           });
       }
    });
};
var scene = [];

function init1() {
    //scene = [new Static(80, 20)];
    scene = [new Mouse()];

    for (var i = 0; i < 12; ++i) {
        scene.push(new Circle(80 + 25 * i, 20 + 45 * i, 20));
    }
    var numRopes = scene.length;
    for (var i = 1; i < numRopes; ++i) {
        scene.push(new Rope(scene[i-1], scene[i], 40));
    }
}

function init2() {
    scene = [new Circle(50, 50, 20)];
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
