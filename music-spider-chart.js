const INSTRUMENT_PROFICIENCY = {
    "Bass": 9.5,
    "Guitar": 8.0,
    "Ukulele": 7.0,
    "Piano": 7.5,
    "Drums": 4
};
const INSTRUMENT_ORIGIN = {
    "Bass": 0.0,
    "Guitar": 0.0,
    "Ukulele": 0.0,
    "Piano": 0.0,
    "Drums": 0.0
};
const INSTRUMENT_FEATURES = Object.keys(INSTRUMENT_PROFICIENCY);
const SPIDER_WIDTH = 500,
      SPIDER_HEIGHT = 500;
const RADIAL_SCALE = d3.scaleLinear()
    .domain([0, 10])
    .range([0, 167]);
const TICKS = [2, 4, 6, 8, 10];
const TICK_TAGS = {
    2: "Not very good",
    4: "Alright",
    6: "Decent",
    8: "Pretty comfortable",
    10: "Let's start a band"
};
const Y_OFFSET = 40;

function angleToCoordinate(angle, value, scale) {
    let x = Math.cos(angle) * RADIAL_SCALE(value);
    let y = Math.sin(angle) * RADIAL_SCALE(value);
    return {
        "x": SPIDER_WIDTH / 2 + x,
        "y": SPIDER_HEIGHT / 2 - y - Y_OFFSET
    };
}

function getPathCoordinates(dataPoint) {
    let coordinates = [];
    let source = 0;
    for (let i = 0; i < INSTRUMENT_FEATURES.length; i++) {
        let featureName = INSTRUMENT_FEATURES[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / INSTRUMENT_FEATURES.length);

        if (i === 0) {
            source = angle;
        }

        coordinates.push(angleToCoordinate(angle, dataPoint[featureName]));
    }

    coordinates.push(angleToCoordinate(source, dataPoint[INSTRUMENT_FEATURES[0]]));

    return coordinates;
}

function drawSpiderWeb(container) {
    TICKS.forEach(t =>
        container.append("circle")
        .attr("cx", SPIDER_WIDTH / 2)
        .attr("cy", SPIDER_HEIGHT / 2 - Y_OFFSET)
        .attr("fill", "none")
        .attr("stroke", () => {
            return t === 10 ? "#010a43" : "#C0C0C0";
        })
        .attr("stroke-width", 2)
        .attr("r", RADIAL_SCALE(t))
    );

    for (let i = 0; i < INSTRUMENT_FEATURES.length; i++) {
        let featureName = INSTRUMENT_FEATURES[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / INSTRUMENT_FEATURES.length);
        let lineCoordinate = angleToCoordinate(angle, 10);
        let labelCoordinate = angleToCoordinate(angle, 10.50);

        //draw axis line
        container.append("line")
            .attr("x1", SPIDER_WIDTH / 2)
            .attr("y1", SPIDER_HEIGHT / 2 - Y_OFFSET)
            .attr("x2", lineCoordinate.x)
            .attr("y2", lineCoordinate.y)
            .attr("stroke", "#010a43")
            .attr("stroke-width", 2);

        //draw axis label
        container.append("text")
            .attr("x", () => {
                // TODO: FIX X POSITION OF TEXT TO BE letIABLE

                if (labelCoordinate.x > SPIDER_WIDTH / 2) {
                    return labelCoordinate.x + (SPIDER_WIDTH / 100);
                } else if (labelCoordinate.x < SPIDER_WIDTH / 2) {
                    return labelCoordinate.x - (SPIDER_WIDTH / 10);
                }

                return labelCoordinate.x - 10;
            })
            .attr("y", () => {
                if (labelCoordinate.y > SPIDER_HEIGHT / 2) {
                    return labelCoordinate.y + (SPIDER_HEIGHT / 50) + 5;
                }

                return labelCoordinate.y - (SPIDER_HEIGHT / 60) + 5;
            })
            .style('fill', '#010a43')
            .style('font-weight', 'bold')
            .text(featureName);
    }
}

function getSkillPath(container) {
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);
    let spiderColour = "#ffc2c2";
    let spiderBorderColour = "#56476D";

    let coordinatesZero = getPathCoordinates(INSTRUMENT_ORIGIN);
    let coordinates = getPathCoordinates(INSTRUMENT_PROFICIENCY);

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

function drawTickMarkLables(container) {
    TICKS.forEach(t =>
        container.append("text")
        .attr("x", SPIDER_WIDTH / 2 + 2.5)
        .attr("y", SPIDER_HEIGHT / 2 - 1 - RADIAL_SCALE(t) - Y_OFFSET)
        .attr("font-size", "0.5rem")
        .attr("fill", "#56476D")
        .attr("font-weight", "bold")
        .text(" ↙ " + TICK_TAGS[t])
    );
}

function addLabels(container) {
    container.append("text")
        .attr("x", 50)
        .attr("y", SPIDER_HEIGHT - Y_OFFSET - 50)
        .attr("font-size", "0.5rem")
        .attr("fill", "#010a43")
        .text("*Ranking based solely on self-perception, and not on any officially recognised qualification system.");
}

function addSpiderChartHoverListener(container) {
    $("#music").hover(() => {
        if (pageState === PageState.CLICK) {
            pageState = PageState.HOVER;
        }

        $(".landing-picture").first().addClass("d-none");
        $(".education").first().addClass("d-none");
        $(".technical-skills").first().addClass("d-none");
        $(".japanese").first().addClass("d-none");
        $(".map").first().addClass("d-none");
        $(".music").first().removeClass("d-none");

        let spiderSVG = d3.select("#d3-spider")
            .attr("width", SPIDER_WIDTH)
            .attr("height", SPIDER_HEIGHT);

        // Draw spider web
        drawSpiderWeb(spiderSVG);

        // Add tick mark labels
        drawTickMarkLables(spiderSVG);

        // Get spider skill path
        let skillPath = getSkillPath(spiderSVG)

        // Animate skill path
        animateSkillPath(skillPath);

        // Add labels
        addLabels(spiderSVG);
    }, () => {
        $(".landing-picture").first().removeClass("d-none");
        $(".education").first().addClass("d-none");
        $(".technical-skills").first().addClass("d-none");
        $(".japanese").first().addClass("d-none");
        $(".map").first().addClass("d-none");
        $(".music").first().addClass("d-none");

        $("#d3-spider").empty();
    });
}

addSpiderChartHoverListener();
