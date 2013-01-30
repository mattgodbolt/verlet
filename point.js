function Point(x, y) {
    this.x = x;
    this.y = y;
};

Point.prototype.plus = function(p) { return new Point(this.x + p.x, this.y + p.y); };

Point.prototype.minus = function(p) { return new Point(this.x - p.x, this.y - p.y); };

Point.prototype.scale = function(scale) { return new Point(this.x * scale, this.y * scale); };

Point.prototype.assign = function(p) { this.x = p.x; this.y = p.y; };

Point.prototype.distanceTo = function(p) {
    var xDist = this.x - p.x;
    var yDist = this.y - p.y;
    return Math.sqrt(xDist * xDist + yDist * yDist);
}

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
