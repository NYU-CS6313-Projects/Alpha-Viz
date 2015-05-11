angular.module('alphaViz')
.directive('returnRate', function() {
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
      // calculating return rate on each day
      var capital = 1000000
      var invested = 0
      var strategyLog = []
      var symbol = data[0].entity
      for (var i = 0; i < data.length; ++i) {
        if (data[i].avgASenti >= senti && data[i].avgImpSc >= impact) {
          getStock({ stock: symbol, startDate: data[i].date, endDate: data[i].date }, 'historicaldata', function(err, data) {
            var price = data.quote
            // string to Int
            price.forEach(function(d) {
              d.Date = Date.parse(d.Date)
              d.Close = parseInt(d.Close)
              d.High = parseInt(d.High)
              d.Low = parseInt(d.Low)
              d.Open = parseInt(d.Open)
            })
            // buy with capital
            var sharePrice = price[0].Close
            var numShare = Math.floor(capital/sharePrice)
            invested = numShare * sharePrice
            capital -= invested
            // push into returnRate array
            insert(strategyLog, data[i].date, capital, invested, sharePrice)
          })
        }
        else {
          getStock({ stock: symbol, startDate: data[i].date, endDate: data[i].date }, 'historicaldata', function(err, data) {
            var price = data.quote
            // string to Int
            price.forEach(function(d) {
              d.Date = Date.parse(d.Date)
              d.Close = parseInt(d.Close)
              d.High = parseInt(d.High)
              d.Low = parseInt(d.Low)
              d.Open = parseInt(d.Open)
            })
            // sell stock
            if (strategyLog.length > 0) {
              var sharePrice = price[0].Close
              var numShare = Math.floor(capital/sharePrice)
              invested = numShare * sharePrice
              capital -= invested
              // push into returnRate array
              insert(strategyLog, data[i].date, capital, invested, sharePrice)
            }
          })
        }
      }
      returnRate["date"] = "2014-10-10"
      returnRate["rate"] = 1.5
      console.log(returnRate.rate)

      // add graph title
      svg.selectAll('text').remove()
      svg.append("text")
              .attr("x", (width / 2))             
              .attr("y", 0 - (margin.top / 2 - 7))
              .attr("text-anchor", "middle")  
              .style("font-size", "16px")  
              .text(data[0].entity)

      // clear previous svg
      svg.selectAll('g.xaxis').remove()
      svg.selectAll('g.yaxis').remove()
      svg.selectAll('path').remove()
      svg.selectAll('rect').remove()

      // update domains based on data
      x.domain([new Date("2014-01-01"), d3.time.day.offset(new Date("2015-01-01"), 1)])
      // NEED TO BE CALCULATE FIRST
      y.domain(["sell","buy"])

      // X, Y
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
      // rotate xtext
      svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
        .attr("transform", function(d) {
           return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height*+1.5 + ")rotate(-45)";
        });

      // path redraw
      var valueline = d3.svg.line()
        .x(function(d) { return x("??????????????") })
        .y(function(d) { return y("??????????????") })
      svg.append("path")
        .attr("d", valueline("??????returnRate?????"))
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