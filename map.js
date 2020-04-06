// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var projection = d3.geoMercator()
    .scale(450)
    .translate([width * 2, height])

// Create data: coordinates of start and end
var link = {
    type: "LineString",
    coordinates: [
        [-99.133209, 19.432608],
        [-73.762909, 41.033985]
    ]
} // Change these data to see ho the great circle reacts

// A path generator
var path = d3.geoPath()
    .projection(projection)

// Load world shape
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", (data) => {

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "#fff")
        .style("stroke-width", 0);

    // Add the path
    svg.append("path")
        .attr("d", path(link))
        .style("fill", "none")
        .style("stroke", "orange")
        .style("stroke-width", 7)

})
