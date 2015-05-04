// TO DO: Need to dynamic modify cretiria using slide
angular.module('alphaViz')
.directive('strategyBar', function() {
  function link(scope, element, attrs) {
    // attrs.$observe('key', function(value){  console.log('key=', value); })

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
    scope.render = function(data) {
      console.log("render func called")
      sentiBar = 0.1
      impactBar = 60
      // // set domains based on data
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
        .attr("transform", function(d) {
           return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height*+1.5 + ")rotate(-45)";
       })
      // Draw bar
      var bars = svg.selectAll('rect')
          .data(data).enter()
          .append('rect')
          .attr('x', function(data) { return x(new Date(data.date)) })
          .attr('y', function(data){
            if (data.avgASenti >= sentiBar && data.avgImpSc >= impactBar)
              return 0
            else
              return height - margin.top - margin.bottom
          })
          .attr('width', 3)
          .attr('height', function(data){
            if (data.avgASenti >= sentiBar && data.avgImpSc >= impactBar)
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
    // --------------------------------
    // Watch 'data' and run scope.render(newVal)
    // --------------------------------
    scope.$watch('data', function(newVals, oldVals) {
      scope.render(newVals)
      console.log(newVals)
    }, true)
  }
  return {
      link: link,
      restrict: 'E',
      scope: { data: '=', sentiBar: '@', impactBar: '@' }
  }
})