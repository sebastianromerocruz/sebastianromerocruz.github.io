const PROJ_SCALE = 550,
      PROJ_WIDTH_FACTOR = 2.6
const MEXICO_CITY_COORDS = [-99.133209, 19.432608],
      WHITE_PLAINS_COORDS = [-73.762909, 41.033985]
const MAP_TEXT_X = 60, 
      MAP_TEXT_Y = 170
const CITY_DOT_RADIUS = 5
const PLANE_POLYGON = "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z";

// The svg
let svg = d3.select("#d3-map"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
let projection = d3.geoMercator()
    .scale(550)
    .translate([width * PROJ_WIDTH_FACTOR, height])

// A path generator
let path = d3.geoPath()
    .projection(projection)

// Load world shape
d3.json("resources/countries.geo.json", (data) => {

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("class", "countries")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "#fff")
        .style("stroke-width", 0);

    // Plane
    let plane = svg.append("path")
        .attr("class", "plane")
        .attr("d", PLANE_POLYGON);

    // Path
    let route = svg.append("path")
        .datum({
            type: "LineString",
            coordinates: [
                MEXICO_CITY_COORDS,
                WHITE_PLAINS_COORDS
            ]
        })
        .attr("class", "route")
        .attr("d", path);

    // Path back to restart animation
    let routeBack = svg.append("path")
        .datum({
            type: "LineString",
            coordinates: [
                WHITE_PLAINS_COORDS,
                MEXICO_CITY_COORDS
            ]
        })
        .attr("class", "route")
        .attr("d", path);

    addMapHoverListener(plane, route, routeBack);

    svg.append("circle")
        .attr("class", "airports")
        .attr("cx", projection(MEXICO_CITY_COORDS)[0])
        .attr("cy", projection(MEXICO_CITY_COORDS)[1])
        .attr("r", CITY_DOT_RADIUS)
    svg.append("circle")
        .attr("class", "airports")
        .attr("cx", projection(WHITE_PLAINS_COORDS)[0])
        .attr("cy", projection(WHITE_PLAINS_COORDS)[1])
        .attr("r", CITY_DOT_RADIUS);

    svg.append("text")
        .attr("class", "map-text")
        .attr("x", (d) => {
            return projection(MEXICO_CITY_COORDS)[0] - 17;
        })
        .attr("y", (d) => {
            return projection(MEXICO_CITY_COORDS)[1] - 7;
        })
        .text("MEX");

    svg.append("text")
        .attr("class", "map-text")
        .attr("x", (d) => {
            return projection(WHITE_PLAINS_COORDS)[0] - 17;
        })
        .attr("y", (d) => {
            return projection(WHITE_PLAINS_COORDS)[1] - 7;
        })
        .text("JFK");

    svg.append("text")
        .attr("class", "map-text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("id", "hello")
        .text("17 YEARS AGO...")


    svg.append("rect")
        .attr("class", "map-screen")
        .attr("x", MAP_TEXT_X - 10)
        .attr("y", MAP_TEXT_Y - 25)
        .attr("width", 180)
        .attr("height", 85);

    svg.append("text")
        .attr("class", "location-text")
        .attr("x", MAP_TEXT_X)
        .attr("y", MAP_TEXT_Y)
        .attr("id", "location-text")
        .text("CURRENT LOCATION:");

    svg.append("text")
        .attr("class", "city-text")
        .attr("x", MAP_TEXT_X)
        .attr("y", MAP_TEXT_Y + 30)
        .attr("id", "city-text")
        .text("MEXICO CITY");

    svg.append("text")
        .attr("class", "coords-text")
        .attr("x", MAP_TEXT_X)
        .attr("y", MAP_TEXT_Y + 45)
        .attr("id", "coords-text")
        .text("(0.0, 0.0)");
})

function addMapHoverListener(plane, route, routeBack) {
    $("#moved").hover(() => {
        if (pageState === PageState.CLICK) {
            pageState = PageState.HOVER;
        }

        $(".landing-picture").first().addClass("d-none");
        $(".education").first().addClass("d-none");
        $(".technical-skills").first().addClass("d-none");
        $(".japanese").first().addClass("d-none");
        $(".map").first().removeClass("d-none");
        transition(plane, route, 2500, "NEW YORK");
    }, () => {
        $(".landing-picture").first().removeClass("d-none");
        $(".education").first().addClass("d-none");
        $(".technical-skills").first().addClass("d-none");
        $(".japanese").first().addClass("d-none");
        $(".map").first().addClass("d-none");
        transition(plane, routeBack, 1, "MEXICO CITY");
    });
}

// Plane animations
function transition(plane, route, speed, destinationName) {
    let l = route.node().getTotalLength();
    plane.transition()
        .duration(speed)
        .attrTween("transform", delta(route.node()))
        .on("end", () => {
            svg.select("#city-text")
                .text(destinationName);
        });
}

function delta(path) {
    let pathLength = path.getTotalLength();
    return (i) => {
        return (t) => {
            let p = path.getPointAtLength(t * pathLength);
            let t2 = Math.min(t + 0.05, 1);
            let p2 = path.getPointAtLength(t2 * pathLength);

            let x = p2.x - p.x;
            let y = p2.y - p.y;
            let rotation = 90 - Math.atan2(-y, x) * 180 / Math.PI;

            let coords = projection.invert([p.x, p.y]);

            svg.select("#coords-text")
                .text("[" + roundTo(coords[0], 5) + ", " + roundTo(coords[1], 5) + "]");

            let scale = Math.min(Math.sin(Math.PI * t) * 1.0, 1.0);
            return "translate(" + p.x + "," + p.y + ") scale(" + scale + ") rotate(" + rotation + ")";
        }
    }
}

function roundTo(value, precision) {
    let multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
