var w = 1024,
	h = 768,
	state;

var projection = d3.geo.albersUsa().scale(1280).translate([w/2, h/2]);
var path = d3.geo.path().projection(projection);

var svg = d3.select("#canvas").append("svg")
.attr("width", w)
.attr("height", h);

var g = svg.append("g").attr("id", "states");

var vertex_color = d3.interpolateHsl("#FF0000", "#00FF00");

queue()
	.defer(d3.json, "data/states_usa.topo.json")
	.defer(d3.json, "data/us-state-centroids.json")
	.defer(d3.json, "data/state-data-by-year-2005.json")
	.defer(d3.json, "data/state-data-by-year-2006.json")
	.defer(d3.json, "data/state-data-by-year-2007.json")
	.defer(d3.json, "data/state-data-by-year-2008.json")
	.defer(d3.json, "data/state-data-by-year-2009.json")
	.defer(d3.json, "data/state-data-by-year-2010.json")
	.defer(d3.json, "data/state-data-by-year-2011.json")
	.defer(d3.json, "data/state-data-by-year-2012.json")
	.defer(d3.json, "data/state-data-by-year-2013.json")
	.defer(d3.json, "data/state-data-by-year-2014.json")
	.defer(d3.json, "data/state-data-by-year-2014.json")
	.await(ready);

	function ready(error, us, centroid, us_2005, us_2006, us_2007,us_2008, us_2009, us_2010,us_2011,us_2012,us_2013,us_2014) {
		state = null;
		if (error) throw error;

		var countries = topojson.feature(us, us.objects.states).features,
			neighbors = topojson.neighbors(us.objects.states.geometries);

		var year = "2014";

		var dataset = {
			"2005": us_2005, 
			"2006": us_2006,
			"2007": us_2007,
			"2008": us_2008,
			"2009": us_2009,
			"2010": us_2010,
			"2011": us_2011,
			"2012": us_2012,
			"2013": us_2013,
			"2014": us_2014,
		
		};

		console.log(dataset);


		g.selectAll("states")
			.data(countries)
			.enter().insert("path", ".graticule")
			.attr("class", "states")
			.attr("d", path)
			.style("fill", function(d, i) { return "#CCC"; })
			.style("fill-opacity", function(d){ console.log(dataset["2014"][d.properties.name]) ;return 5*dataset["2014"][d.properties.name]["poverty-population"]/dataset["2014"][d.properties.name]["population"];})
			.on('mouseover', function(d, i) {
				var currentState = this;
				d3.select(this).style('fill-opacity', .7);

			})
		.on('mouseout', function(d, i) {
			d3.selectAll('path')
			.style("fill-opacity", function(d){ console.log(dataset["2014"][d.properties.name]) ;return 5*dataset["2014"][d.properties.name]["poverty-population"]/dataset["2014"][d.properties.name]["population"];});
		})
		.on('click', state_clicked);
		//svg.append("path")
		//	.attr("class", "states")
		//	.datum(topojson.feature(us, us.objects.states))
		//	.attr("d", path);

		var radius = d3.scale.sqrt()
			.domain([0, 1e6])
			.range([0, 10]);


		console.log(centroid);

		g.selectAll(".symbol")
			.data(centroid.features)
			//.data(centroid.features.sort(function(a, b) { return b.properties.population - a.properties.population; }))
			.enter().append("circle")
			.attr("class", "symbol")
			//.attr("d", path.pointRadius(function(d) { return radius(d.properties.population); }));
			.attr("cx", function(d) {console.log(d.properties.name); console.log(dataset["2014"][d.properties.name]);return path.centroid(d)[0]})
			.attr("cy", function(d) {return path.centroid(d)[1]})
			.attr("r", function(d) {return 0.7*radius(dataset["2014"][d.properties.name]["population"]); })
			.style("fill", "#233100");

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

function get_xyz(d) {
	var bounds = path.bounds(d);
	var w_scale = (bounds[1][0] - bounds[0][0]) / w;
	var h_scale = (bounds[1][1] - bounds[0][1]) / h;
	var z = .5 / Math.max(w_scale, h_scale);
	var x = (bounds[1][0] + bounds[0][0]) / 2;
	var y = (bounds[1][1] + bounds[0][1]) / 2 + (h / z / 6);
	return [x, y, z];
}

function state_clicked(d) {
	svg.selectAll("states").remove();

	console.log(d);

	if (d && state !== d) {
		state = d;
	var xyz = get_xyz(d);
	state = d;

	country_code = state.id.substring(0, 3).toLowerCase();
	state_name = state.properties.name;


	zoom(xyz);
	}else {
		    var xyz = [w / 2, h / 2, 1];
			    country = null;
				   zoom(xyz);
	 }
}

function zoom(xyz) {

	g.transition()
		.duration(750)
		.attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
		.selectAll(["#countries", "states", "#cities"])
		.style("stroke-width", 1.0 / xyz[2] + "px")
		.selectAll(".city")
		.attr("d", path.pointRadius(20.0 / xyz[2]));
}


