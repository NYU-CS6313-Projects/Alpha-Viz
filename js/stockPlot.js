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
    // add the tooltip area to the webpage
    var tooltip = d3.select(element[0]).append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

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
          .attr("style", "fill:none;stroke:black;shape-rendering: crispEdges;")
          .call(xAxis)
          svg.append('g')
          .attr('class', 'yaxis')
          .attr("style", "fill:none;stroke:black;shape-rendering: crispEdges;")
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
        
        // signal line and tooltip
        svg.append("path")
          .attr("class","mouseLine")  
          .style("stroke","red")
          .style("stroke-width", "1px")
          .style("opacity", "0");

        svg.append('svg:rect') // append a rect to catch mouse movements on canvas
          .attr('width', width) // can't catch mouse events on a g element
          .attr('height', height)
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on('mouseout', function(){ // on mouse out hide line, circles and text
            d3.select(".mouseLine")
              .style("opacity", "0");
            // d3.selectAll(".mouseCircle circle")
            //   .style("opacity", "0");
            // d3.selectAll(".mouseCircle text")
            //   .style("opacity", "0");
          })
          .on('mouseover', function(){ // on mouse in show line, circles and text
            d3.select(".mouseLine")
              .style("opacity", "1");
            //  d3.selectAll(".mouseCircle circle")
            //   .style("opacity", "1");
            // d3.selectAll(".mouseCircle text")
            //   .style("opacity", "1");
          })
          .on('mousemove', function() { // mouse moving over canvas
            d3.select(".mouseLine")
            .attr("d", function(){
              yRange = y.range(); // range of y axis
              var xCoor = d3.mouse(this)[0]; // mouse position in x
              var xDate = x.invert(xCoor); // date corresponding to mouse x 
              // d3.selectAll('.mouseCircle') // for each circle group
              //   .each(function(d,i){
              //    var rightIdx = bisect(data[1].values, xDate); // find date in data that right off mouse
              //    var interSect = get_line_intersection(xCoor,  // get the intersection of our vertical line and the data line
              //       yRange[0], 
              //       xCoor, 
              //       yRange[1],
              //       x(data[i].values[rightIdx-1].YEAR),
              //       y(data[i].values[rightIdx-1].VALUE),
              //       x(data[i].values[rightIdx].YEAR),
              //       y(data[i].values[rightIdx].VALUE));
              
              //   d3.select(this) // move the circle to intersection
              //     .attr('transform', 'translate(' + interSect.x + ',' + interSect.y + ')');
                  
              //   d3.select(this.children[1]) // write coordinates out
              //     .text(xDate.toLocaleDateString() + "," + y.invert(interSect.y).toFixed(0));
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
