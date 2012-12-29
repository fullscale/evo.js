"use strict";

angular.module('evo.graphing')
    .directive('evoArea', [function() {
        return {
			restrict: 'E',
            /**
             * Sets up an isolate scope so that we don't inherent from parent.
             */
            scope: {
                fontSize: '=',
                onClick: '=',
                width: '=',
                height: '=',
                data: '='
            },
			link: function(scope, element, attrs) {

				var margin = {top: 20, right: 20, bottom: 30, left: 50};
                var width = scope.width || 960;
                var height = scope.height || 500;
                var color = attrs.color || '#e5f3f9';
                var fontColor = attrs.fontColor || '#000';
                var fontSize = scope.fontSize || 14;
                var format = d3.time.format('%m/%d');
                var interpolate = attrs.interpolate || 'false';
                var label = attrs.label || 'Frequency';

				width = width - margin.left - margin.right;
				height = height - margin.top - margin.bottom;

				var x = d3.time.scale()
					.range([0, width]);

				var y = d3.scale.linear()
					.range([height, 0]);

				var xAxis = d3.svg.axis()
					.scale(x)
					.orient('bottom');

				var yAxis = d3.svg.axis()
					.scale(y)
					.orient('left');

                var line = d3.svg.line()
	                //.interpolate('cardinal')
                    .x(function(d) { return x(d.time); })
                    .y(function(d) { return y(d.count); });

				var area = d3.svg.area()
					//.interpolate('cardinal')
					.x(function(d) { return x(d.time); })
					.y0(height)
					.y1(function(d) { return y(d.count); });

                if (attrs.interpolate == 'true') {
                    line.interpolate('cardinal');
                    area.interpolate('cardinal');
                }

				var svg = d3.select(element[0])
					.append('svg')
                        .attr('preserveAspectRatio', 'xMinYMin')
                        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
						//.attr('width', width + margin.left + margin.right)
						//.attr('height', height + margin.top + margin.bottom)
						.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


                scope.$watch('data', function(data) {

                    if (data) {
                        data = data.entries || [];

                        svg.selectAll('*').remove();
				
                        x.domain(d3.extent(data, function(d) { return d.time; }));
				        y.domain([0, d3.max(data, function(d) { return d.count; })]);

				        svg.append('path')
					        .datum(data)
					        .attr('fill', color)
					        .attr('d', area);

				        svg.append('g')
                            .attr('fill', fontColor)
                            .attr('font-size', fontSize)
					        .attr('class', 'x axis')
					        .attr('transform', 'translate(0,' + height + ')')
					        .call(xAxis);

				        svg.append('g')
					        .attr('class', 'y axis')
                            .attr('font-size', fontSize)
                            .attr('fill', fontColor)
					        .call(yAxis)
					        .append('text')
						        .attr('transform', 'rotate(-90)')
						        .attr('y', 6)
						        .attr('dy', '.71em')
						        .style('text-anchor', 'end')
						        .text(label);

                        /* draw the line on top of the area */
	                    svg.append("path")
		                    .datum(data)
                            .attr('fill', 'none')
                            .attr('stroke', '#058dc7')
                            .attr('stroke-width', 3.5)
	                        .attr("d", line);

	                    svg.selectAll(".dot")
	                        .data(data.filter(function(d) { return d.count; }))
	                        .enter()
                                .append("circle")
                                    .attr('fill', '#058dc7')
	                                .attr("cx", line.x())
	                                .attr("cy", line.y())
	                                .attr("r", 5.5)
                                    .on('mousedown', function(d) { 
                                        scope.$apply(function() {
                                            (scope.onClick || angular.noop)(attrs.field, d.time);
                                        });
                                    });

			        }
                })
            }
        };
    }]);
