var w = 900,
	    h = 500;

var path = d3.geo.path();

var projection = path.projection();

var svg = d3.select("#canvas").append("svg")
		.attr("width", w)
		.attr("height", h);

    var color = d3.scale.category20();



queue()
.defer(d3.json, "data/us.json")
.defer(d3.json, "data/us-state-centroids.json")
.await(ready);

function ready(error, us, centroid) {
	if (error) throw error;

	var countries = topojson.feature(us, us.objects.states).features,
		neighbors = topojson.neighbors(us.objects.states.geometries);

	svg.selectAll("states")
		.data(countries)
		.enter().insert("path", ".graticule")
		.attr("class", "states")
		.attr("d", path)
		//.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0); })
		.style("fill", function(d, i) { return "#CCC"; })
		.on('mouseover', function(d, i) {
			var currentState = this;
			d3.select(this).style('fill-opacity', .7);
		})
	.on('mouseout', function(d, i) {
		d3.selectAll('path')
		.style({
			'fill-opacity':1
		});
	});
	//svg.append("path")
	//	.attr("class", "states")
	//	.datum(topojson.feature(us, us.objects.states))
	//	.attr("d", path);

	//var tf = us.transform,
	//	kx = tf.scale[0],
	//	ky = tf.scale[1],
	//	dx = tf.translate[0],
	//	dy = tf.translate[1];
	//svg.append("path")
	//	.datum(topojson.mesh(us))
	//	.attr("d", path);
	//svg.selectAll("circle")
	//	.data(us.arcs)
	//	.enter().append("circle")
	//	.attr("transform", function(d) { return "translate(" + projection([d[0][0] * kx + dx, d[0][1] * ky + dy]) + ")"; })
	//	.attr("r", 1.25);
	
	//var currentState = this;
	//d3.select(this).style('fill-opacity', 1);
	//var thoseStates = d3
		//                        .selectAll('path')[0]
		//                        .filter(function(state) {
		//                            return state !== currentState;
		//                        });

		//                d3.selectAll(thoseStates)
		//                        .style({
		//                            'fill-opacity':.5
		//                        });
		//                })
	//})
	//.on('mouseout', function(d, i) {
	//
	//	d3.selectAll('path')
	//	.style({
	//		'fill-opacity':.7
	//	});
	//});



}
