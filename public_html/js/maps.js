var w = 1440,
	h = 800,
	state;

var projection = d3.geo.albersUsa().scale(1440).translate([w/2, h/2.5]);
var path = d3.geo.path().projection(projection);

var svg = d3.select("#glyph").append("svg")
.attr("width", w)
.attr("height", h)
.attr("id", "mainsvg");



var vertex_color = d3.interpolateHsl("#FF0000", "#00FF00");

var g = svg.append("g").attr("id", "states");

var map_explorer = queue()
	.defer(d3.json, "data/states_usa.topo.json")
	.defer(d3.json, "data/us-state-centroids.json")
	.defer(d3.json, "data/max-min-by-year.json")
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
	.await(ready);

var explorer={};
var year_range,us_data, centroid_data, countries, neighbors, dataset, year;

function ready(error, us, centroid, yr ,us_2005, us_2006, us_2007,us_2008, us_2009, us_2010,us_2011,us_2012,us_2013,us_2014) {
		state = null;
		if (error) throw error;

		countries = topojson.feature(us, us.objects.states).features;
		neighbors = topojson.neighbors(us.objects.states.geometries);

		year_range = yr;
		dataset = {
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

		us_data = us;
		centroid_data = centroid;
		explorer.init();
		return explorer.update(2014);                                      
}

explorer.init = function() {
		g.selectAll("states")
			.data(countries)
			.enter().insert("path", ".graticule")
			.attr("class", "states")
			.attr("d", path)
			.style("fill", function(d, i) { return "#CCC"; })
			.style("fill-opacity", function(d){return 5*dataset["2014"][d.properties.name]["poverty-population"]/dataset["2014"][d.properties.name]["population"];})
			.on('mouseover', function(d, i) {
				var currentState = this;
				d3.select(this).style('fill-opacity', .7);

			})
		.on('mouseout', function(d, i) {
			//console.log(d.properties.name);
			d3.selectAll('path')
			.style("fill-opacity", function(d){ console.log(d); return 5*dataset["2014"][d.properties.name]["poverty-population"]/dataset["2014"][d.properties.name]["population"];});
		})
		.on('click', state_clicked);
		return explorer;
	}

explorer.update = function(_year) {


		var radius = d3.scale.sqrt()
			.domain([0, 1e6])
			.range([0, 10]);

		g.selectAll(".vertex").remove();

		var glyph = g.selectAll(".vertex")
			.data(centroid_data.features)                  
			.enter()                       
			.append("g")                   
			.attr("id", function(d) {      
				return d.properties.name.split(/[ ,]+/).join('_');})     
			.attr("class", "vertex")       
			.style("opacity", "1");        


		console.log(_year);

			//.data(centroid.features.sort(function(a, b) { return b.properties.population - a.properties.population; }))
		glyph.append("circle")
			.attr("class", "symbol")
			//.attr("d", path.pointRadius(function(d) { return radius(d.properties.population); }));
			.attr("cx", function(d) {return path.centroid(d)[0]})
			.attr("cy", function(d) {return path.centroid(d)[1]})
			.attr("r", function(d) {return 0.7*radius(dataset[_year][d.properties.name]["population"]); })
			.style('fill-opacity', .9)
			.style("fill", function(d) {
				    return vertex_color((dataset[_year][d.properties.name]["GDP"] - year_range[_year]["min_GDP"])/(year_range[_year]["max_GDP"]-year_range[_year]["min_GDP"]));
			});
                                                                     
		centroid_data.features.forEach(function(d)                                            
				{                                                                     
					var cur_state = d.properties.name;
                                                         
					var d2 = [                                                        
			[                                                                 
		{axis:"income",value:(dataset[_year][cur_state]["income"] - year_range[_year]["min_income"])/(year_range[_year]["max_income"]-year_range[_year]["min_income"])},                                          
		{axis:"house value",value:(dataset[_year][cur_state]["median-house-value"] - year_range[_year]["min_house"])/(year_range[_year]["max_house"]-year_range[_year]["min_house"])},                                          
		{axis:"expenditure",value:(dataset[_year][cur_state]["pce"] - year_range[_year]["min_pce"])/(year_range[_year]["max_pce"]-year_range[_year]["min_pce"])}                                         
			]                                                                 
			];                                                                


		//Options for the Radar chart, other than default                 
		var mycfg = {                                                     
			w: 2*radius(d.properties.population),                                                        
			h: 2*radius(d.properties.population),                                                        
			maxValue: 1,                                                  
			levels: 0,                                                    
		};                                                
                                                 
		RadarChart.draw("#" + cur_state.split(/[ ,]+/).join('_'), d2, mycfg, [path.centroid(d)[0]-radius(d.properties.population), path.centroid(d)[1]-radius(d.properties.population)]);     
				}                                                                     
		);       

		return explorer;
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
		    var xyz = [w / 2, h / 2.5, 1];
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

function drawcolorbar() {
			var _line = d3.svg.line()
			    .interpolate("basis");


			var lineFunction = d3.svg.line()                 
			.x(function(d) { console.log(d.x); return d.x; })
			.y(function(d) { return d.y; })                  
			.interpolate("linear");                          

			var colorbar_g = d3.select("#mainsvg").append("g")
				.attr("transform", "translate(-200,0)");

			colorbar_g                                  
			.selectAll("path")
			.data(linepath(sample(_line([[300,0], [500,0]]), 1)))   
			.enter()
			.append("path")                                
			.style("fill", function(d) { return vertex_color(d.t); })     
			.style("stroke", function(d) { return vertex_color(d.t); })   
			.style("stroke-width", "50")                           
			.attr("d", function(d) { return lineFunction(d.line)});
			                                                       
			colorbar_g                                                    
			.append("text")                                        
			.attr("id", "lower_income_bar")                        
			.attr("fill", "red")                                   
			.attr("x", 200)                                        
			.attr("y", 20)                                         
			.text("Lower GDP");                                 
			                                                       
			colorbar_g                                                    
			.append("text")                                        
			.attr("id", "higher_income_bar")                       
			.attr("fill", "#00FF00")                               
			.attr("x", 510)                                        
			.attr("y", 20)                                         
			.text("Higher GDP");

			function sample(d, precision) {                                    
				var path = document.createElementNS(d3.ns.prefix.svg, "path"); 

				path.setAttribute("d", d);                                     

				var n = path.getTotalLength(), t = [0], i = 0, dt = precision; 
				while ((i += dt) < n) t.push(i);                               
				t.push(n);                                                     

				return t.map(function(t) {                                     
					var p = path.getPointAtLength(t), a=[];                    
					a.point = {'x':p.x, 'y':p.y};                              
					a.t = t / n;                                               
					return a;                                                  
				});                                                            
			}                                                                  


			function linepath(d) {
				var result = [];
				for(var i=1; i< d.length; i++) {
					result.push({'t':d[i-1].t, 'line':[d[i-1].point, d[i].point]});
				}
				return result;

			}


}

