const d = {
    "Bass": 9,
    "Guitar": 7.5,
    "Ukulele": 6.5,
    "Piano": 7,
    "Drums": 3
};

const dOrigin = {
    "Bass": 0.0,
    "Guitar": 0.0,
    "Ukulele": 0.0,
    "Piano": 0.0,
    "Drums": 0.0
};

const features = Object.keys(d);
const spiderWidth = 500;
const spiderHeight = 500;

const radialScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, 167]);
const ticks = [2, 4, 6, 8, 10];

function angleToCoordinate(angle, value, scale) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {
        "x": spiderWidth / 2 + x,
        "y": spiderHeight / 2 - y
    };
}

function getPathCoordinates(dataPoint) {
    var coordinates = [];
    var source = 0;
    for (var i = 0; i < features.length; i++) {
        var featureName = features[i];
        var angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);

        if (i === 0) {
            source = angle;
        }

        coordinates.push(angleToCoordinate(angle, dataPoint[featureName]));
    }

    coordinates.push(angleToCoordinate(source, dataPoint[features[0]]));

    return coordinates;
}

function drawSpiderWeb(container) {
    ticks.forEach(t =>
        container.append("circle")
        .attr("cx", spiderWidth / 2)
        .attr("cy", spiderHeight / 2)
        .attr("fill", "none")
        .attr("stroke", () => {
            return t === 10 ? "#010a43" : "#C0C0C0";
        })
        .attr("stroke-width", 2)
        .attr("r", radialScale(t))
    );

    for (var i = 0; i < features.length; i++) {
        var featureName = features[i];
        var angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        var lineCoordinate = angleToCoordinate(angle, 10);
        var labelCoordinate = angleToCoordinate(angle, 10.50);

        //draw axis line
        container.append("line")
            .attr("x1", spiderWidth / 2)
            .attr("y1", spiderHeight / 2)
            .attr("x2", lineCoordinate.x)
            .attr("y2", lineCoordinate.y)
            .attr("stroke", "#010a43")
            .attr("stroke-width", 2);

        //draw axis label
        container.append("text")
            .attr("x", () => {
                // TODO: FIX X POSITION OF TEXT TO BE VARIABLE

                return labelCoordinate.x >= spiderWidth / 2 ? labelCoordinate.x : labelCoordinate.x - (
                    spiderWidth / 8.5
                );
            })
            .attr("y", labelCoordinate.y)
            .text(featureName);
    }
}

function getSkillPath(container) {
    var line = d3.line()
        .x(d => d.x)
        .y(d => d.y);
    var spiderColour = "#ffc2c2";
    var spiderBorderColour = "#56476D";

    let coordinatesZero = getPathCoordinates(dOrigin);
    let coordinates = getPathCoordinates(d);

    //draw the path element
    let spiderPath = container.append("path")
        .datum(coordinates)
        .attr("d", line)
        .attr("stroke-width", 3)
        .attr("stroke", spiderBorderColour)
        .attr("fill", spiderColour)
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.75)
        .attr("fill-opacity", 0.0);

    return spiderPath;
}

function animateSkillPath(path) {
    let totalLength = path.node().getTotalLength();

    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
            path.transition().style("fill-opacity", 0.75).duration(500);
        });
}

function drawSpiderChart() {
    // Create spider chart SVG
    var spiderSVG = d3.select("#d3-spider")
        .attr("width", spiderWidth)
        .attr("height", spiderHeight);

    // Draws spider web
    drawSpiderWeb(spiderSVG);

    // Get spider skill path
    var skillPath = getSkillPath(spiderSVG)

    // Animate skill path
    animateSkillPath(skillPath);
}

drawSpiderChart();
