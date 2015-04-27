angular.module('alphaViz')
.directive('stockPlot', function() {
  function link(scope, element, attr) {
    // Get the stock price
    var symbol = scope.entity
    console.log(scope)
    console.log(symbol)
    // Query YQL
    getStock({ stock: symbol, startDate: '2014-01-01', endDate: '2014-12-31' }, 'historicaldata', function(err, data) {
      var price = data.quote
      /* Access by price[index].{Close, Date, High, Low, Open, Symbol, Volume}*/
      

      price.forEach(function(d) {
        d.Date = Date.parse(d.Date)
        d.Close = parseInt(d.Close)
        d.High = parseInt(d.High)
        d.Low = parseInt(d.Low)
        d.Open = parseInt(d.Open)
      })

      console.log(price)

      // D3 code in getStock()
      var margin = { top: 40, right: 40, bottom: 40, left: 100 },
          width = 1300 - margin.left - margin.right,
          height = 250 - margin.top - margin.bottom;

      var x = d3.time.scale()
          .domain(d3.extent(price, function(d){ return d.Date }))
          .range([0, width - margin.left - margin.right])

      var y = d3.scale.linear()
          .domain([d3.min(price, function(d){ return d.Low }), d3.max(price, function(d){ return d.High })])
          //.domain([0,500])
          .range([height - margin.top - margin.bottom, 0]) 
        console.log(y.domain())
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .ticks(d3.time.days, 31)
          .tickFormat(d3.time.format('%x'))
          .tickSize(3)
          .tickPadding(8)
      var yAxis = d3.svg.axis()
          .tickValues([90,150,200,250])
          .scale(y)
          .orient('left')
          .tickPadding(8)

      var valueline = d3.svg.line()
          .x(function(d) { return x(d.Date) })
          .y(function(d) { return y(d.Close) })

      var svg = d3.select(element[0]).append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.append("path")        // Add the valueline path.
        .attr("d", valueline(price))
        .attr("style", "fill:none;stroke:black;")
      
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

    })
  }
  return {
    link: link,
    restrict: 'E',
    scope: {entity: '='}
  }
})