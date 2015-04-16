// Task: 1 - load data from .csv
//       2 - set $scope.entity
//       3 - set $scope.allData (contain all the info in csv)
//       4 - set $scope.entityData (filtered data: only data of 1 entity)
//       5 - set $scope.entityList (list contains distinct entity name, for later use)

angular.module('alphaViz', [])
.controller('MainController', function($scope){
  // config
  var file = "./data/daily_2014_final.csv"

  // user entered entity
  $scope.entity = 'AAPL' // by default in input box

  // load static CSV data from daily_2014_final.csv
  d3.csv(file, function(error, data){
    //error check
    if(error){
      console.warn(error)
      return
    }
    // apply data to $scope
    $scope.allData = data
    // Access in HTML -> {{ alldata[index].fieldName }}

    // filter by entity
    $scope.entityData = $scope.allData.filter(filterByEntity);
    function filterByEntity(obj) {
      if (obj.entity === $scope.entity)
        return true
      else
        return false;
    }

    // get entity list
    $scope.entityList = [];
    for (var i = 0; i < data.length; i++) {
        $scope.entityList.push(data[i].entity)
    }
    $scope.entityList = $scope.entityList.unique()

    // set entity from client side if user does
    $scope.customEntity = function(entity){
      $scope.entity = entity.toUpperCase()
      // update $scope.entityData
      $scope.entityData = $scope.allData.filter(filterByEntity);
    }
    
    // apply on $scope
    $scope.$apply();
  })
})