import * as paper from 'paper'

const body = document.querySelector('body') as HTMLElement;
const canvas = document.createElement('canvas');
const scope: paper.PaperScope = new paper.PaperScope();

let rect: paper.Path.Rectangle;

const setup = () => {
    canvas.setAttribute('resize', '');
    body.appendChild(canvas);
    scope.setup(canvas);
    new paper.Tool().activate();

    rect = new paper.Path.Rectangle(new paper.Point(0, 0), new paper.Size(canvas.width, canvas.height));
    rect.fillColor = new paper.Color('red');
    scope.project.activeLayer.addChild(rect);
};

let removeSegments = false;
let removeCircles = false;
let mousePressed = false;

const blendModes = ['multiply', 'screen', 'soft-light', 'color-dodge', 'difference', 'exclusion', 'negation', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy'];
const maxCircles = 50;
const maxSegments = 50;
const maxPathLength = 100;

window.onload = () => {
    setup();

    scope.tool.minDistance = 10;
    scope.tool.maxDistance = 50;

    const path = new paper.Path();
    path.strokeColor = rect.fillColor;
    path.strokeWidth = 4;
    path.strokeCap = 'round';

    const group = new paper.Group();
    group.blendMode = 'difference';
    group.fillColor = rect.fillColor;

    scope.project.activeLayer.addChild(group);

    scope.view.onFrame = () => {
        // @ts-ignore
        rect.fillColor.hue++;

        group.fillColor = rect.fillColor;

        // @ts-ignore
        group.fillColor.hue = rect.fillColor.hue - 20;

        if (path.length > maxPathLength) {
            removeSegments = true
        }

        if (removeSegments) {
            path.firstSegment && path.firstSegment.remove()
        }

        if (removeCircles) {
            group.firstChild && group.firstChild.remove()
        }
    };

    scope.tool.onMouseDown = () => {
        mousePressed = true;
    };

    scope.tool.onMouseUp = () => {
        mousePressed = false;
    };

    scope.tool.onKeyDown = (event: paper.KeyEvent) => {
        switch (event.key) {
            case 'd':
                group.rotate(1);
                break;

            case 'a':
                group.rotate(-1);
                break;

            case 'w':
                group.blendMode = blendModes[Math.floor(Math.random() * blendModes.length)];
                console.log(group.blendMode);
                break;
        }
    };

    scope.tool.onMouseMove = (event: paper.ToolEvent) => {
        // @ts-ignore
        rect.fillColor.hue += event.delta.length;
        path.strokeWidth = event.delta.length;

        if (path.segments.length < maxSegments) {
            path.add(event.point);
        }

        path.smooth();

        // @ts-ignore
        path.strokeColor.hue = rect.fillColor.hue / 2;

        if (mousePressed) {
            if (group.children.length <= maxCircles) {
                let point = paper.Point.random();
                point.x = point.x * scope.view.size.width;
                point.y = point.y * scope.view.size.height;

                let circle = new paper.Path.Circle(point, (event.count % 100) + 10);
                circle.fillColor = rect.fillColor;
                // @ts-ignore
                circle.fillColor.hue -= 20;
                group.addChild(circle);
            }

            if (group.children.length > 25) {
                removeCircles = true
            }
        }
    }
};
