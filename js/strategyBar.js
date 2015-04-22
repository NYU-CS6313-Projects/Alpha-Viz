// TO DO: 1. Need to solve data refresh problem (refreashed by click need to implement)
//        2. Need to dynamic modify cretiria using slide
angular.module('alphaViz')
.directive('strategyBar', function() {
  function link(scope, element, attr) {
    // D3.js code
    console.log(scope)
    console.log(scope.data)  // ???? why undefinced, but actually show in scope.data? need parse?
    // critieria of strategy
    // TO DO: slide to dynamic modify them
    var sentiBar = 0.1
    var impactBar = 70

    var margin = { top: 40, right: 40, bottom: 40, left: 50 },
        width = 1300 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
    
    var svg = d3.select(element[0]).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // draw
    scope.$watch('data', function(data) {
      // scale
      var x = d3.time.scale()
          .domain([new Date(data[0].date), d3.time.day.offset(new Date(data[data.length - 1].date), 1)])
          .range([0, width - margin.left - margin.right])
      var y = d3.scale.ordinal()
          .domain(["sell","buy"])
          .range([height - margin.top - margin.bottom, 0])  
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .ticks(d3.time.days, 31)
          .tickFormat(d3.time.format('%x'))
          .tickSize(3)
          .tickPadding(8)
      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .tickPadding(8)

      var bars = svg.selectAll('rect')
        .data(data)
        .enter()

        bars.append('rect')
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

      svg.append('g').attr('class', 'xaxis')
        .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
        .call(xAxis)
        svg.append('g')
        .attr('class', 'yaxis')
        .call(yAxis)
      
      // rotate xtext
      svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
        .attr("transform", function(d) {
           return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height*+1.5 + ")rotate(-45)";
       });
    }, true)
  }
  return {
      link: link,
      restrict: 'E',
      scope: { data: '=' }
  }
})