angular.module('alphaViz')
.directive('strategyBar', function() {
  function link(scope, element, attrs) {
    // --------------------------------
    // SVG Setup
    // --------------------------------
    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = element.context.offsetParent.offsetWidth - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
    
    var svg = d3.select(element[0]).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  

    var x = d3.time.scale().range([0, width - margin.left - margin.right])
    var y = d3.scale.ordinal().range([height - margin.top - margin.bottom, 0]) 

    var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .ticks(d3.time.days, 31)
          .tickFormat(d3.time.format('%x'))
          .tickSize(2)
          .tickPadding(8)
    var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .tickPadding(8)
          .tickSize(2)
    // --------------------------------
    // Render based on data
    // --------------------------------
    scope.render = function(data, senti, impact) {
      // add graph title
      svg.selectAll('text').remove()
      svg.append("text")
              .attr("x", (width / 2))             
              .attr("y", 0 - (margin.top / 2 - 7))
              .attr("text-anchor", "middle")  
              .style("font-size", "16px")  
              .text(data[0].entity)
      // set domains based on data
      var start = function(data){ return data[0].date }
      var end = function(data){ return data[data.length - 1].date }
      x.domain([new Date(start(data)), d3.time.day.offset(new Date(end(data)), 1)])
      y.domain(["sell","buy"])
      // redraw axis
      svg.selectAll('g.xaxis').remove()
      svg.selectAll('g.yaxis').remove()
      svg.selectAll('rect').remove()
      // X, Y
      svg.append('g').attr('class', 'xaxis')
        .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
        .attr("style", "fill:none;stroke:black;shape-rendering: crispEdges;")
        .call(xAxis)
      svg.append('g')
        .attr('class', 'yaxis')
        .attr("style", "fill:none;stroke:black;shape-rendering: crispEdges;")
        .call(yAxis)
      // X Axis text style
      svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
        .attr('style', "fill:black")
        .attr("transform", function(d) {
           return "translate(" + this.getBBox().height*-3.5 + "," + this.getBBox().height*+3 + ")rotate(-45)";
       })

      // Draw bar
      var bars = svg.selectAll('rect')
          .data(data).enter()
          .append('rect')
          .attr('x', function(data) { return x(new Date(data.date)) })
          .attr('y', function(data){
            if (data.avgASenti >= senti && data.avgImpSc >= impact)
              return 0
            else
              return height - margin.top - margin.bottom
          })
          .attr('width', 3)
          .attr('height', function(data){
            if (data.avgASenti >= senti && data.avgImpSc >= impact)
              return height - margin.top - margin.bottom
            else
              return 0
          })
          .style('fill', 'steelblue')
          .on('mouseover', function() {
            d3.select(this).style('fill', 'red')
          })
          .on('mouseout', function(){
            d3.select(this).style('fill', 'steelblue')
          })
    }
    // -----------------------------------------------------------
    // Watch 'data', 'senti', 'impact' and run scope.render(x,y,z)
    // -----------------------------------------------------------
    scope.$watchGroup(['data', 'senti', 'impact'], function(newVals, oldVals) {
      scope.render(newVals[0], newVals[1], newVals[2])
    }, true)
  }
  return {
      link: link,
      restrict: 'E',
      scope: { data: '=', senti: '=', impact: '='}
  }
})