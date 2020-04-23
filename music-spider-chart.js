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

var width = 400;
var height = 400;

var spiderSVG = d3.select("#d3-spider")
    .attr("width", width)
    .attr("height", height);

var radialScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, 167]);
var ticks = [2, 4, 6, 8, 10];

ticks.forEach(t =>
    spiderSVG.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("fill", "none")
    .attr("stroke", () => {
        return t === 10 ? "#010a43" : "#C0C0C0";
    })
    .attr("r", radialScale(t))
);

for (var i = 0; i < features.length; i++) {
    var featureName = features[i];
    var angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    var lineCoordinate = angleToCoordinate(angle, 10);
    var labelCoordinate = angleToCoordinate(angle, 10.50);

    //draw axis line
    spiderSVG.append("line")
        .attr("x1", width / 2)
        .attr("y1", height / 2)
        .attr("x2", lineCoordinate.x)
        .attr("y2", lineCoordinate.y)
        .attr("stroke", "#010a43");

    //draw axis label
    spiderSVG.append("text")
        .attr("x", labelCoordinate.x)
        .attr("y", labelCoordinate.y)
        .text(featureName);
}

var line = d3.line()
    .x(d => d.x)
    .y(d => d.y);
var spiderColour = "#ffc2c2";
var spiderBorderColour = "#56476D";

let coordinatesZero = getPathCoordinates(dOrigin);
let coordinates = getPathCoordinates(d);

//draw the path element
spiderSVG.append("path")
    .datum(coordinates)
    .attr("d", line)
    .attr("stroke-width", 3)
    .attr("stroke", spiderBorderColour)
    .attr("fill", spiderColour)
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5);

// update();

function angleToCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {
        "x": width / 2 + x,
        "y": height / 2 - y
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

function update() {
    var t = d3.transition()
      .duration(750);

    var text = g.selectAll("text")
      .data(data, function(d) { return d; });

    spiderSVG.transition()
        .ease(d3.easeLinear)
        .duration(2000)
        .datum(coordinates);
}
