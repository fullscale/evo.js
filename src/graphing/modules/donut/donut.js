/*
 * Pie Chart 
 * Copyright (c) 2012 FullScale Labs, LLC
 */
angular.module('evo.graphing')
    .directive('evoDonut', function() {
        'use strict';

        return {
            restrict: 'E',

            // sets up the isolate scope so that we don't clobber parent scope
            scope: {
                // evaluated instances (bound once at link time)
                outerRadius: '=',
                innerRadius: '=',
                fontSize: '=',
                domain: '=',
                colorMap: '=',
                onClick: '=',
                data: '='
            },

            // angular directives return a link fn
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
                if (scope.colorMap === undefined) {
                    color = d3.scale.category20c();
                    if (scope.domain !== undefined) {
                        color.domain(scope.domain);
                    }
                } else {
                    color = function(term) {
                        return scope.colorMap[term];
                    }
                }

                var w = (outerRadius * 3) + 30;
                var h = outerRadius * 3;

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
                        .attr('viewBox', '0 0 ' + w + ' ' + h);

                var arcs = svg.append('g')
                                .attr('transform', 'translate(' + 
                                    w/2 + ',' + h/2 + ') rotate(180) scale(-1, -1)');

                var label_group = svg.append("g")
                    .attr("class", "label_group")
                    .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");


                // Wrap the main drawing logic in an Angular watch function.
                // This will get called whenever our data attribute changes.
                scope.$watch('data', function(data) {

                    // handles tweeing of arcs
                    function arcTween(d, i) {
                        var i = d3.interpolate(this._current, d);
                        this._current = i(0);
                        return function(t) {
                            return arc(i(t));
                        };
                    }
        
                    // handles tweening of labels/text
                    function textTween(d, i) {
                        var a = (this._current.startAngle + this._current.endAngle - Math.PI)/2;
                        var b = (d.startAngle + d.endAngle - Math.PI)/2;

                        var fn = d3.interpolateNumber(a, b);
                        return function(t) {
                            var val = fn(t);
                            return "translate(" + 
                                Math.cos(val) * (outerRadius + textOffset) + "," + 
                                Math.sin(val) * (outerRadius + textOffset) + ")";
                        };
                    }

                    // identifies the anchor point for labels
                    var findAnchor = function(d) {
                        if ((d.startAngle + d.endAngle)/2 < Math.PI ) {
                            return "beginning";
                        } else {
                            return "end";
                        }
                    };

                    var textOffset = 14;

                    if (data) { 
                        data = data.terms || [];

                        var sum = 0;
                        for (var ii=0; ii < data.length; ii++) {
                            sum += data[ii].count;
                        }

                        // if the facet has values
                        if (sum > 0) {

                            // update the arcs
                            var path = arcs.selectAll('path').data(pie(data));
                            path.enter()
                                .append('path') 
                                    .attr('d', arc)
                                    .style('fill', function(d) { return color(d.data.term); })
                                    .each(function(d) { this._current = d; })
                                    .on('mousedown', function(d) {
                                        scope.$apply(function() {
                                            (scope.onClick || angular.noop)(attrs.field, d.data.term);
                                        });
                                    });

                            path.transition().duration(750).attrTween('d', arcTween);

                            // draw the label ticks
                            var lines = label_group.selectAll('line').data(pie(data));
                            lines.enter().append('line')
                                .attr('x1', 0)
                                .attr('x2', 0)
                                .attr('y1', -outerRadius-3)
                                .attr('y2', -outerRadius-8)
                                .attr('stroke', 'grey')
                                .attr('stroke-width', 2.0)
                                .attr('transform', function(d) {
                                    return 'rotate(' + (d.startAngle + d.endAngle)/2 * (180/Math.PI) + ')';
                                })
                                .each(function(d) {this._current = d;});

                            lines.transition()
                                .duration(750)
                                .attr("transform", function(d) {
                                    return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
                            });
                            lines.exit().remove();

                            // Draw the percent labels
                            var valueLabels = label_group.selectAll("text.value").data(pie(data))
                                .attr("dy", function(d) {
                                    if ((d.startAngle + d.endAngle)/2 > Math.PI/2 && (d.startAngle + d.endAngle)/2 < Math.PI*1.5 ) {
                                        return 17;
                                    } else {
                                        return -17;
                                    }
                                })
                                .attr('text-anchor', findAnchor)
                                .text(function(d) {
                                    var percentage = (d.value/sum)*100;
                                    return percentage.toFixed(1) + "%";
                                });

                            valueLabels.enter().append("text")
                                .attr("class", "value")
                                .attr('font-size', 20)
                                .attr('font-weight', 'bold')
                                .attr("transform", function(d) {
                                    return "translate(" + 
                                        Math.cos(((d.startAngle + d.endAngle - Math.PI)/2)) * (outerRadius + textOffset) + "," + 
                                        Math.sin((d.startAngle + d.endAngle - Math.PI)/2) * (outerRadius + textOffset) + ")";
                                })
                                .attr("dy", function(d) {
                                    if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle + d.endAngle)/2 < Math.PI*1.5 ) {
                                        return 17;
                                    } else {
                                        return -17;
                                    }
                                })
                                .attr('text-anchor', findAnchor)
                                .text(function(d){
                                    var percentage = (d.value/sum)*100;
                                    return percentage.toFixed(1) + "%";
                                })
                                .each(function(d) {this._current = d;});
                           
                            valueLabels.transition().duration(750).attrTween("transform", textTween); 
                            valueLabels.exit().remove();

                            // Draw the value labels 
                            var nameLabels = label_group.selectAll("text.units").data(pie(data))
                                .attr("dy", function(d){
                                    if ((d.startAngle + d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
                                        return 36;
                                    } else {
                                        return 2;
                                    }
                                })
                                .attr("text-anchor", function(d){
                                    if ((d.startAngle + d.endAngle)/2 < Math.PI ) {
                                        return "beginning";
                                    } else {
                                        return "end";
                                    }
                                }).text(function(d) {
                                    if (d.data.term === 'T') {
                                        return 'TRUE';
                                    } else if (d.data.term === 'F') {
                                        return 'FALSE';
                                    } else {
                                        return d.data.term;
                                    }
                                });

                            nameLabels.enter().append("text")
                                .attr("class", "units")
                                .attr('font-size', 16)
                                .attr('stroke', 'none')
                                .attr('fill', '#000')
                                .attr("transform", function(d) {
                                    return "translate(" + 
                                        Math.cos(((d.startAngle + d.endAngle - Math.PI)/2)) * (outerRadius + textOffset) + "," + 
                                        Math.sin((d.startAngle + d.endAngle - Math.PI)/2) * (outerRadius + textOffset) + ")";
                                })
                                .attr("dy", function(d){
                                    if ((d.startAngle + d.endAngle)/2 > Math.PI/2 && (d.startAngle + d.endAngle)/2 < Math.PI*1.5 ) {
                                        return 36;
                                    } else {
                                        return 2;
                                    }
                                })
                                .attr('text-anchor', findAnchor)
                                .text(function(d){
                                    if (d.data.term === 'T') {
                                        return 'TRUE';
                                    } else if (d.data.term === 'F') {
                                        return 'FALSE';
                                    } else {
                                        return d.data.term;
                                    }
                                })
                                .each(function(d) {this._current = d;});

                                nameLabels.transition().duration(750).attrTween("transform", textTween);
                                nameLabels.exit().remove();

                        } else {
                            svg.selectAll('path').remove();
                            label_group.selectAll('line').remove();
                            label_group.selectAll("text.value").remove();
                            label_group.selectAll("text.units").remove();
                        }

                    }
                })

            }
        };
    });
