angular.module('alphaViz', [])
.controller('MainController', function($scope){
  // config
  var file = "./data/daily_2014_final.csv"
  // user entered entity
  $scope.entity = 'AAPL' // by default in input box
  $scope.customEntity = function(entity){
    $scope.entity = entity
  }

  // load static CSV data from daily_2014_final.csv
  d3.csv(file, function(error, data){
    //error check
    if(error){
      console.warn(error)
      return
    }
    // apply data to $scope
    $scope.data = data
    $scope.$apply();
    // Access -> data[index]."fieldName"
    console.log(data[0])
  })

})