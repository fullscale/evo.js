/*
 * Area Chart 
 * Copyright (c) 2012 FullScale Labs, LLC
 */
angular.module('evo.graphing')
    .directive('evoArea', [function() {
        'use strict';

        return {
            // restrict this directive to being used as an element only
			restrict: 'E',

             // Sets up an isolate scope so that we don't clobber parent scope
            scope: {
                // evaluated instances (bound once at link time)
                onClick:     '=',
                width:       '=',
                height:      '=',
                data:        '=',
                // interpolated strings (bound to scope in watch fn)
                label:       '@',
                field:       '@',
                duration:    '@',
                delay:       '@',
                plot:        '@',
                pointRadius: '@' 
            },

            // angular directives return a link fn
			link: function(scope, element, attrs) {

				var margin = {
                    top: 20, 
                    right: 20, 
                    bottom: 30, 
                    left: 80
                };

                // default width/height - mainly to create aspect ratio since svg scales dynamically
                var width = scope.width || 1280;
                var height = scope.height || 300;

                // are we using interpolation
                var interpolate = attrs.interpolate || 'false';

                var label = attrs.label || 'Frequency';
                var klass = attrs.class || '';

                // add margins (make room for x,y labels)
				width = width - margin.left - margin.right;
				height = height - margin.top - margin.bottom;

                // create x,y sclaes (x is inferred as time)
				var x = d3.time.scale()
					.range([0, width]);

				var y = d3.scale.linear()
					.range([height, 0]);

                // create x,y axis 
				var xAxis = d3.svg.axis()
					.scale(x)
					.orient('bottom');

				var yAxis = d3.svg.axis()
					.scale(y)
					.orient('left');

                // create line generator 
                var line = d3.svg.line()
                    .x(function(d) { return x(d.time); })
                    .y(function(d) { return y(d.count); });

                // create area generator
				var area = d3.svg.area()
					.x(function(d) { return x(d.time); })
					.y0(height)
					.y1(function(d) { return y(d.count); });

                // enable interpolation if specified 
                if (attrs.interpolate == 'true') {
                    line.interpolate('cardinal');
                    area.interpolate('cardinal');
                }

                // create the root SVG node
				var svg = d3.select(element[0])
					.append('svg')
                        .attr('preserveAspectRatio', 'xMinYMin')
                        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
						.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                // generate the area. Data is empty at link time
                svg.append('path')
                    .datum([])
                    .attr('class', 'area fill ' + klass)
                    .attr('d', area);

                // insert the x axis (no data yet)
				svg.append('g')
					.attr('class', 'area x axis ' + klass)
					.attr('transform', 'translate(0,' + height + ')')
					.call(xAxis);

                // insert the x axis (no data yet)
				svg.append('g')
					.attr('class', 'area y axis ' + klass)
					.call(yAxis)
					    .append('text')
						    .attr('transform', 'rotate(-90)')
						    .attr('y', 6)
						    .attr('dy', '.71em')
						    .style('text-anchor', 'end')
						    .text(label);

                // generate the line. Data is empty at link time
	            svg.append('path')
		            .datum([])
                    .attr('class', 'area line ' + klass)
	                .attr("d", line);


                // main observer fn called when scope is updated. Data and scope vars are now bound
                scope.$watch('data', function(data) {

                    // pull info from scope
                    var duration = scope.duration || 0;
                    var delay = scope.delay || 0;
                    var dataPoints = scope.plot || 'true';
                    var pointRadius = scope.pointRadius || 8;
                    var field = scope.field || attrs.data.split('.').pop().toLowerCase();

                    // just because scope is bound doesn't imply we have data.
                    if (data) {

                        // pull the data array from the facet
                        data = data.entries || [];

                        // use that data to build valid x,y ranges
                        x.domain(d3.extent(data, function(d) { return d.time; }));
				        y.domain([0, d3.max(data, function(d) { return d.count; })]);

                        // create the transition 
                        var t = svg.transition().duration(duration);

                        // feed the current data to our area/line generators
                        t.select('.area').attr('d', area(data));
                        t.select('.line').attr('d', line(data));

                        // does the user want data points to be plotted
                        if (dataPoints == 'true') {

                            // create svg circle for each data point
                            // using Math.random as (optional) key fn ensures old
                            // data values are flushed and all new values inserted
      	                    var points = svg.selectAll('circle')
	                            .data(data.filter(function(d) { 
                                    return d.count; 
                                }), function(d) { 
                                    return Math.random(); 
                                });

                            // d3 enter fn binds each new value to a circle 
	                        points.enter()
                                .append('circle')
                                    .attr('class', 'area line points ' + klass)
                                    .attr('cursor', 'pointer')
                                    .attr("cx", line.x())
	                                .attr("cy", line.y())
                                    .style("opacity", 0)
                                    .transition()
                                        .duration(duration)
                                        .style("opacity", 1)
	                                    .attr("cx", line.x())
	                                    .attr("cy", line.y())
	                                    .attr("r", pointRadius);

                            // wire up any events (registers filter callback)
                            points.on('mousedown', function(d) { 
                                scope.$apply(function() {
                                    (scope.onClick || angular.noop)(field, d.time);
                                });
                            });

                            // d3 exit/remove flushes old values (removes old circles)
                            points.exit().remove();
                        }

                        // update our x,y axis based on new data values
                        t.select('.x').call(xAxis);
                        t.select('.y').call(yAxis);

			        }
                })
            }
        };
    }]);
