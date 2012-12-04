"use strict";

angular.module('evo.graphing')
    .directive('evoPie', function() {
        return {
            restrict: 'E',
            /**
             * Sets up an isolate scope so that we don't inherent from parent.
             */
            scope: {
                outerRadius: '=',
                innerRadius: '=',
                fontSize: '=',
                domain: '=',
                colorMap: '=',
                onClick: '=',
                data: '='
            },
            link: function(scope, element, attrs) {

                /**
                 * Setup default parameters.
                 */
                var outerRadius = scope.outerRadius || 200;
                var innerRadius = scope.innerRadius || 0;
                var fontSize = scope.fontSize || 14;
                var fontColor = attrs.fontColor || "#fff";
                var color = undefined;

                /* if no field param is set, use the facet name but normalize the case */
                if (attrs.field == undefined) {
                    attrs.field = attrs.data.split('.').pop().toLowerCase();
                }

                /**
                 * User can define a color-map so use look for one.
                 * If none is found, then use built-in color pallete
                 * but see if user has defined a domain of values.
                 */
                if (scope.colorMap == undefined) {
                    color = d3.scale.category20c();
                    if (scope.domain !== undefined) {
                        color.domain(scope.domain);
                    }
                } else {
                    color = function(term) {
                        return scope.colorMap[term];
                    }
                }

                var arc = d3.svg.arc()
                    .outerRadius(outerRadius - 10)
                    .innerRadius(innerRadius);

                /* create the function for drawing the pie */
                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d.count; });

                /* create the root svg element */
                var svg = d3.select(element[0])
                    .append('svg')
                        .attr('preserveAspectRatio', 'xMinYMin meet')
                        .attr('viewBox', '0 0 ' + outerRadius*2 + ' ' + outerRadius*2)
                        .append('g')
                            .attr('transform', 'translate(' + 
                                outerRadius + ',' + outerRadius + ') rotate(180) scale(-1, -1)');

                /**
                 * Wrap the main drawing logic in an Angular watch function.
                 * This will get called whenever our data attribute changes.
                 */
                scope.$watch('data', function(data) {
                    
                    data = data.terms || [];
                    svg.selectAll('*').remove();

                    var g = svg.selectAll('.arc')
                        .data(pie(data))
                        .enter()
                            .append('g')
                                .attr('class', 'arc')
                                .on('mousedown', function(d) {
                                    scope.$apply(function() {
                                        (scope.onClick || angular.noop)(attrs.field, d.data.term);
                                    });
                                });

                        g.append('path')
                            .attr('d', arc)
                            .style('fill', function(d) {
                                return color(d.data.term); 
                            });

                        g.append('text')
                            .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                            .attr('dy', '.55em')
                            .style('text-anchor', 'middle')
                            .attr('fill', fontColor)
                            .attr('font-size', fontSize)
                            .text(function(d) { 
                                return d.data.term; 
                            }); 
                })

            }
        };
    });