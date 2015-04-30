angular.module('alphaViz')
.directive('stockPlot', function() {
  function link(scope, element, attr) {
    // --------------------------------
    // SVG Setup
    // --------------------------------
    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = 1300 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
    var svg = d3.select(element[0]).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    // scale
    var x = d3.time.scale().range([0, width - margin.left - margin.right])
    var y = d3.scale.linear().range([height - margin.top - margin.bottom, 0]) 
    // XY Axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%x'))
        .tickSize(3)
        .tickPadding(8)
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(5)
        .tickPadding(8)
    // --------------------------------
    // scope.render function to refresh
    // --------------------------------
    scope.render = function(entity) {
      // get the stock price
      var symbol = entity
      // query YQL
      getStock({ stock: symbol, startDate: '2014-01-01', endDate: '2014-12-31' }, 'historicaldata', function(err, data) {
        var price = data.quote /* Access by price[index].{Close, Date, High, Low, Open, Symbol, Volume}*/
        // string to Int
        price.forEach(function(d) {
          d.Date = Date.parse(d.Date)
          d.Close = parseInt(d.Close)
          d.High = parseInt(d.High)
          d.Low = parseInt(d.Low)
          d.Open = parseInt(d.Open)
        })
        // clear previous svg
        svg.selectAll('g.xaxis').remove()
        svg.selectAll('g.yaxis').remove()
        svg.selectAll('path').remove()
        // update domains
        x.domain([new Date("2014-01-01"), d3.time.day.offset(new Date("2015-01-01"), 1)])
        // x.domain(d3.extent(price, function(d){ return d.Date }))
        y.domain([d3.min(price, function(d){ return d.Low }), d3.max(price, function(d){ return d.High })])
        // XY redraw
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
        // path redraw
        var valueline = d3.svg.line()
          .x(function(d) { return x(d.Date) })
          .y(function(d) { return y(d.Close) })
        svg.append("path")
          .attr("d", valueline(price))
          .attr("style", "fill:none;stroke:steelblue;stroke-width:2;")
      })
    }
    // --------------------------------
    // watch on entity
    // --------------------------------
    scope.$watch('entity', function() {
      scope.render(scope.entity)
    }, true)
  }
  return {
    link: link,
    restrict: 'E',
    scope: {entity: '='}
  }
})