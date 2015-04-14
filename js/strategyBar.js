angular.module('alphaViz', [])
.directive('strategyBar', function() {
    function link(scope, element, attr) {
        // d3 code
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=' }
    }
})