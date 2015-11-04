angular.module('ordercloud-search', []);
angular.module('ordercloud-search')

    .directive( 'ordercloudSearch', ordercloudSearch)
    .controller( 'ordercloudSearchCtrl', ordercloudSearchCtrl)
;

function ordercloudSearch () {
    return {
        scope: {
            servicename: "@",
            controlleras: "="
        },
        restrict: 'E',
        templateUrl: 'common/search/templates/search.tpl.html',
        controller: 'ordercloudSearchCtrl',
        controllerAs: 'ocSearch',
        replace: true
    }
}

function ordercloudSearchCtrl($scope, $injector, $state) {
    var Service = $injector.get($scope.servicename);
    $scope.SearchView = false;
    $scope.getSearchResults = function(searchTerm){
        Service.List(searchTerm, 1, 20)
            .then(function (data){
                $scope.controlleras.list = data;
            });
        $scope.SearchView = true;
    };

    $scope.stateReload = function() {
        $state.go($state.current, {}, {reload: true});
    }
}
