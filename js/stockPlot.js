angular.module('alphaViz')
.directive('stockPlot', function() {
  function link(scope, element, attr) {
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
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    // scale
    var x = d3.time.scale().range([0, width - margin.left - margin.right])
    var y = d3.scale.linear().range([height - margin.top - margin.bottom, 0]) 
    // XY Axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%x'))
        .tickSize(2)
        .tickPadding(8)
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(5)
        .tickSize(2)
        .tickPadding(8)

    // --------------------------------
    // scope.render function to refresh
    // --------------------------------
    scope.render = function(entity) {
      // add graph title
      svg.selectAll('text').remove()
      svg.append("text")
              .attr("x", (width / 2))             
              .attr("y", 0 - (margin.top / 2 - 7))
              .attr("text-anchor", "middle")  
              .style("font-size", "16px")  
              .text(entity)
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
        svg.selectAll('rect').remove()
        // update domains
        x.domain([new Date("2014-01-01"), d3.time.day.offset(new Date("2015-01-01"), 1)])
        y.domain([d3.min(price, function(d){ return d.Low }), d3.max(price, function(d){ return d.High })])
        // XY redraw
        svg.append('g').attr('class', 'xaxis')
            .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
            .attr("style", "fill:none;stroke:black;shape-rendering: crispEdges;")
            .call(xAxis)
        svg.append('g')
            .attr('class', 'yaxis')
            .attr("style", "fill:none;stroke:black;shape-rendering: crispEdges;")
            .call(yAxis)
           .append('text')
            .attr("transform", "rotate(-90)")
            .attr('dy', '0.99em')
            .style('text-anchor', 'end')
            .text("Price")
        // X Axis text style
        svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
          .attr('style', "fill:black")
          .attr("transform", function(d) {
             return "translate(" + this.getBBox().height*-3.5 + "," + this.getBBox().height*+3 + ")rotate(-45)";
         })

        // path redraw
        var valueline = d3.svg.line()
          .x(function(d) { return x(d.Date) })
          .y(function(d) { return y(d.Close) })
        svg.append("path")
          .attr("d", valueline(price))
          .attr("style", "fill:none;stroke:steelblue;stroke-width:2;")
        
        // signal line and tooltip
        svg.append("path")
          .attr("class","mouseLine")  
          .style("stroke","red")
          .style("stroke-width", "1px")
          .style("opacity", "0");

        // invisible bar to show tip
        var bars = svg.selectAll('rect')
          .data(price).enter()
          .append('rect')
          .attr('x', function(d) { return x(new Date(d.Date)) })
          .attr('y', function(d){
              return y(d.Close)
          })
          .attr('width', 1)
          .attr('height', function(d){
            return height - margin.top - margin.bottom - y(d.Close)
          })
          .attr("style", "fill:steelblue;opacity:0.2")

        svg.append('svg:rect') // append a rect to catch mouse movements on canvas
          .attr('width', width) // can't catch mouse events on a g element
          .attr('height', height)
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on('mouseout', function(){ // on mouse out hide line, circles and text
            d3.select(".mouseLine")
              .style("opacity", "0");
          })
          .on('mouseover', function(){ // on mouse in show line, circles and text
            d3.select(".mouseLine")
              .style("opacity", "1");
          })
          .on('mousemove', function() { // mouse moving over canvas
            d3.select(".mouseLine")
            .attr("d", function(){
              yRange = y.range(); // range of y axis
              var xCoor = d3.mouse(this)[0]; // mouse position in x
              return "M"+ xCoor +"," + yRange[0] + "L" + xCoor + "," + yRange[1]; // position vertical line
            });
          });
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
