
class InfluenceRect
{
    constructor(element, x, y, w, h, r, g, b, power) {
        this.element = element;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.r = r;
        this.g = g;
        this.b = b;
        this.power = power;
        this.min = { x: x-w/2, y: y-h/2 };
        this.max = { x: x+w/2, y: y+h/2 };
    }

    updateBounds() {
        this.min.x = this.x-this.w / 2;
        this.min.y = this.y-this.h / 2;
        this.max.x = this.x + this.w / 2;
        this.max.y = this.y + this.h / 2;
    }

    distance(x, y) {
        var dx = Math.max(this.min.x - x, 0, x - this.max.x);
        var dy = Math.max(this.min.y - y, 0, y - this.max.y);

        if(dx == 0 && dy == 0) {
            return 0;
        } else {
            return Math.sqrt(dx*dx + dy*dy);
        }
    }
}

class InfluencePoint {
    constructor(element, x, y, r, g, b, power) {
        this.element = element;
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
        this.power = power;
    }

    updateBounds() {}

    distance(x, y) {
        let deltaX = this.x - x;
        let deltaY = this.y - y;
        let distanceSquared = deltaX * deltaX + deltaY * deltaY;

        if (distanceSquared == 0) {
            return 0;
        } else {
            return Math.sqrt(distanceSquared);
        }
    }
}

class FreeformGradientGenerator
{
    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.ctx = this.canvas.getContext("2d");

        let _this = this;

        this.canvas.onmousedown = function(e) { _this.handleMouseDown(e); };
        this.canvas.onmousemove = function(e) { _this.handleMouseMove(e); };
        this.canvas.onmouseup   = function(e) { _this.handleMouseUp(e);   };
        this.canvas.onmouseout  = function(e) { _this.handleMouseOut(e);  };
        window.onscroll = function(e) { _this.reOffset(); }
        window.onresize = function(e) { _this.reOffset(); }
        canvas.onresize = function(e) { _this.reOffset(); }

        this.points = [];
        this.pointElements = [];
        this.offsetX = 0;
        this.offsetY = 0;

        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;

        this.selectedPoint = null;

        this.shouldShowPoints = true;
        this.lastImageData = null;

        this.imageOverlay = null;

        this.reOffset();
    }

    // used to calc canvas position relative to window
    reOffset() {
        var BB=canvas.getBoundingClientRect();
        this.offsetX=BB.left;
        this.offsetY=BB.top;
    }

    // given mouse X & Y (mx & my) and shape object
    // return true/false whether mouse is inside the shape
    isMouseInShape(mx, my, point)
    {
        if (point instanceof InfluencePoint)
        {
            var l=point.x * this.canvas.width - 10;
            var r=point.x * this.canvas.width + 10;
            var t=point.y * this.canvas.height - 10;
            var b=point.y * this.canvas.height + 10;

            return mx > l &&
                   mx < r &&
                   my > t &&
                   my < b;
        }
        else if (point instanceof InfluenceRect)
        {
            var l=point.min.x * this.canvas.width;
            var r=point.max.x * this.canvas.width;
            var t=point.min.y * this.canvas.height;
            var b=point.max.y * this.canvas.height;

            return mx > l &&
                   mx < r &&
                   my > t &&
                   my < b;
        }
    }

    handleMouseDown(e)
    {
        e.preventDefault();
        e.stopPropagation();

        this.startX = parseInt(e.clientX - this.offsetX);
        this.startY = parseInt(e.clientY - this.offsetY);

        for (const point of this.points)
        {
            if (this.isMouseInShape(this.startX, this.startY, point))
            {
                this.selectedPoint = point;
                this.isDragging = true;
                return;
            }
        }
    }

    handleMouseUp(e)
    {
        if (!this.isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        this.isDragging = false;

        this.makeGradient(this.pointElements, this.shouldShowPoints, this.imageOverlay);
    }

    handleMouseOut(e)
    {
        if (!this.isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        this.isDragging = false;

        this.makeGradient(this.pointElements, this.shouldShowPoints, this.imageOverlay);
    }

    handleMouseMove(e)
    {
        if (!this.isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        var mouseX = parseInt(e.clientX - this.offsetX);
        var mouseY = parseInt(e.clientY - this.offsetY);

        var dx = mouseX - this.startX;
        var dy = mouseY - this.startY;

        // move the selected shape by the drag distance
        this.movePointScreenPosition(this.selectedPoint, dx, dy);

        // Update
        this.makeGradient(this.pointElements, this.shouldShowPoints, this.imageOverlay);

        // update the starting drag position (== the current mouse position)
        this.startX = mouseX;
        this.startY = mouseY;
    }

    makeGradient(pointElementArray, shouldShowPoints, imageOverlay)
    {
        this.points = [];
        this.pointElements = pointElementArray;
        this.shouldShowPoints = shouldShowPoints;
        this.imageOverlay = imageOverlay;

        for (const point of pointElementArray)
        {
            const element = document.getElementById(point);
            const x = parseFloat(element.dataset.x);
            const y = parseFloat(element.dataset.y);
            const w = parseFloat(element.dataset.w);
            const h = parseFloat(element.dataset.h);
            const power = -parseFloat(element.dataset.power || 1.0);
            const colour = element.value;
            let r=0;
            let g=0;
            let b=0;

            if (colour.length == 7)
            {
                r = parseInt(colour.substr(1,2), 16);
                g = parseInt(colour.substr(3,2), 16);
                b = parseInt(colour.substr(5,2), 16);
            }

            if (w == 0 && h == 0)
            {
                this.points.push(new InfluencePoint(element, x, y, r, g, b, power));
            }
            else
            {
                this.points.push(new InfluenceRect(element, x, y, w, h, r, g, b, power));
            }
        }

        const drawGradient = !this.isDragging;
        if (drawGradient)
        {
            var imgData = this.ctx.createImageData(this.canvas.width, this.canvas.height);

            const maxPowerValue = -2;

            let maxDistance = Math.pow(Math.sqrt(2), maxPowerValue);

            for (let cy=0; cy < this.canvas.height; cy++)
            {
                let rowIndex = cy * (this.canvas.width * 4);
                let y = 1.0 / this.canvas.height * cy;

                for(let cx=0; cx < this.canvas.width; cx++)
                {
                    let columnIndex = rowIndex + cx * 4;
                    let x = 1.0 / this.canvas.width * cx;

                    let totalInfluence = 0;

                    for (const point of this.points)
                    {
                        const rawDistance = point.distance(x, y);
                        let distance = rawDistance > 0 ? Math.pow(rawDistance, point.power) : 0;
                        totalInfluence += Math.abs(maxDistance - distance);
                    }

                    for (const point of this.points)
                    {
                        const rawDistance = point.distance(x, y);
                        let distance = rawDistance > 0 ? Math.pow(rawDistance, point.power) : 0;
                        let influence = Math.abs(maxDistance - distance);
                        let weighting = (1.0 / totalInfluence * influence);

                        if(distance == 0) {
                            weighting = 1.0;
                        }

                        imgData.data[columnIndex+0] += point.r * weighting;
                        imgData.data[columnIndex+1] += point.g * weighting;
                        imgData.data[columnIndex+2] += point.b * weighting;

                        imgData.data[columnIndex+3] = 255;
                    }
                }
            }

            // Stamp the rect points over the final image as we don't want their centres being
            // influenced by any other colours.
            for (const point of this.points)
            {
                if (point instanceof InfluenceRect)
                {
                    const startX = Math.max(0, Math.floor(point.min.x * this.canvas.width));
                    const startY = Math.max(0, Math.floor(point.min.y * this.canvas.height));
                    const endX = Math.min(this.canvas.width-1, Math.floor(point.max.x * this.canvas.width));
                    const endY = Math.min(this.canvas.height-1, Math.floor(point.max.y * this.canvas.height));

                    for (let cy=startY; cy <= endY; cy++)
                    {
                        let rowIndex = cy * (this.canvas.width * 4);

                        for(let cx=startX; cx <= endX; cx++)
                        {
                            let columnIndex = rowIndex + cx * 4;

                            imgData.data[columnIndex+0] = point.r;
                            imgData.data[columnIndex+1] = point.g;
                            imgData.data[columnIndex+2] = point.b;
                        }
                    }
                }
                else if (point instanceof InfluencePoint)
                {
                    const cx = Math.floor(point.x * this.canvas.width);
                    const cy = Math.floor(point.y * this.canvas.height);

                    let rowIndex = cy * (this.canvas.width * 4);
                    let columnIndex = rowIndex + cx * 4;

                    imgData.data[columnIndex+0] = point.r;
                    imgData.data[columnIndex+1] = point.g;
                    imgData.data[columnIndex+2] = point.b;
                }
            }

            this.lastImageData = imgData;
            this.ctx.putImageData(imgData, 0, 0);
        }
        else
        {
            this.ctx.putImageData(this.lastImageData, 0, 0);
        }

        if(this.imageOverlay) {
            this.ctx.drawImage(this.imageOverlay, 0, 0, this.canvas.width, this.canvas.height);
        }

        if (this.shouldShowPoints || this.isDragging)
        {
            this.drawPoints();
        }

    }

    drawPoints()
    {
        for (const point of this.points)
        {
            if (point instanceof InfluencePoint)
            {
                this.ctx.beginPath();
                this.ctx.arc(point.x * this.canvas.width,
                             point.y * this.canvas.height,
                             10, 0, 2 * Math.PI);
                this.ctx.strokeStyle = "black";
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(point.x * this.canvas.width,
                             point.y * this.canvas.height,
                             11, 0, 2 * Math.PI);
                this.ctx.strokeStyle = "white";
                this.ctx.stroke();
            }
            else if (point instanceof InfluenceRect)
            {
                this.ctx.beginPath();

                this.ctx.rect(point.min.x * this.canvas.width,
                              point.min.y * this.canvas.height,
                              point.w * this.canvas.width,
                              point.h * this.canvas.height);
                this.ctx.strokeStyle = "black";
                this.ctx.stroke();

                this.ctx.rect(point.min.x * this.canvas.width - 1,
                              point.min.y * this.canvas.height - 1,
                              point.w * this.canvas.width + 2,
                              point.h * this.canvas.height + 2);
                this.ctx.strokeStyle = "white";
                this.ctx.stroke();
            }
        }
    }

    movePointScreenPosition(point, dx, dy)
    {
        const unitX = 1.0 / this.canvas.width * dx;
        const unitY = 1.0 / this.canvas.height * dy;

        point.x += unitX;
        point.y += unitY;
        point.element.dataset.x = point.x;
        point.element.dataset.y = point.y;

        if (point instanceof InfluenceRect)
        {
            point.updateBounds();
        }
    }
}

