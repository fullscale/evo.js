"use strict";

angular.module('evo.graphing')
    .directive('evoArea', function() {
        return {
			restrict: 'E',
            /**
             * Sets up an isolate scope so that we don't inherent from parent.
             */
            scope: {
                //fontSize: '=',
                //onClick: '=',
                //data: '='
            },
			link: function(scope, element, attrs) {

				// "_type" : "date_histogram"

				var data = [{
        			"time" : 1341100800000,
        			"count" : 9
      			}, {
        			"time" : 1343779200000,
        			"count" : 32
      			}, {
        			"time" : 1346457600000,
        			"count" : 78
      			}, {
        			"time" : 1349049600000,
        			"count" : 45
      			}, {
        			"time" : 1351728000000,
        			"count" : 134
      			}];

      			//var data=[{time: 1341100800000, count : [10,100]},{time: 1343779200000, count: [20, 150]}, {time: 1346457600000, count: [30, 120]}];
      			var xx = [
      				[{time: 1341100800000, count:9},{time: 1343779200000, count:32}],
      				[{time: 1343779200000, count:32},{time: 1346457600000, count:78}],
      				[{time: 1346457600000, count:78},{time: 1349049600000, count:45}],
      				[{time: 1349049600000, count:45},{time: 1351728000000, count:134}]
      			];

				var margin = {
					top: 20,
					right: 20,
					bottom: 30,
					left: 50
				}
				var width = 960 - margin.left - margin.right;
				var height = 500 - margin.top - margin.bottom;

				//var parseDate = d3.time.format('%d-%b-%y').parse;

				var x = d3.time.scale()
					//.domain();
					//.domain([1341100800000, 1343779200000, 1346457600000, 1349049600000, 1351728000000]);
					.range([0, width]);
				//var x = d3.scale()

				var y = d3.scale.linear()
					.range([height, 0]);

				var xAxis = d3.svg.axis()
					.scale(x)
					//.scale(function(d) {return scale(d.time); })
					.orient('bottom');

				var yAxis = d3.svg.axis()
					.scale(y)
					.orient('left');

var line = d3.svg.line()
	.interpolate('cardinal')
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.count); });

				var area = d3.svg.area()
					.interpolate('cardinal')
					.x(function(d) { return x(d.time); })
					.y0(height)
					.y1(function(d) { return y(d.count); });

				var svg = d3.select(element[0])
					.append('svg')
						.attr('width', width + margin.left + margin.right)
						.attr('height', height + margin.top + margin.bottom)
						.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

				x.domain(d3.extent(data, function(d) { return d.time; }));
				y.domain([0, d3.max(data, function(d) { return d.count; })]);

		for (var i=0; i < xx.length; i++) {
				svg.append('path')
					//.datum(data)
					.datum(xx[i])
					//.attr('class', 'area')
					.attr('fill', 'steelBlue')
					.attr('d', area);
		}

				svg.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + height + ')')
					.call(xAxis);

				svg.append('g')
					.attr('class', 'y axis')
					.call(yAxis)
					.append('text')
						.attr('transform', 'rotate(-90)')
						.attr('y', 6)
						.attr('dy', '.71em')
						.style('text-anchor', 'end')
						.text('Price ($)');

	svg.append("path")
		.datum(data)
	    .attr("class", "line")
	    .attr("d", line);

	svg.selectAll(".dot")
	    .data(data.filter(function(d) { return d.count; }))
	  .enter().append("circle")
	    .attr("class", "dot")
	    .attr("cx", line.x())
	    .attr("cy", line.y())
	    .attr("r", 3.5);

				/*scope.$watch('data', function(data) {

					data = data.terms || [];
                    svg.selectAll('*').remove();
				}*/
			}
        }
    });