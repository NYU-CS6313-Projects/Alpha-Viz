angular.module('alphaViz', [])
.directive('returnRate', function() {
    function link(scope, element, attr) {
        // d3 code
    }
    return {
        link: link,
        restrict: 'E',
        scope: {entity: '='}
    }
})