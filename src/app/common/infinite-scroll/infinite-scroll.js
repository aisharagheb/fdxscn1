angular.module('ordercloud-infinite-scroll', ['ordercloud-search', 'ordercloud-paging-helpers']);
angular.module('ordercloud-infinite-scroll')

    .directive( 'ordercloudInfiniteScroll', InfiniteScrollDirective )
    .controller( 'InfiniteScrollCtrl', InfiniteScrollController )
;

function InfiniteScrollDirective(Paging) {
    return {
        restrict: 'A',
        scope: {
            pagingfunction: '&',
            servicename: '@',
            currentid: '@',
            listobjects: '=',
            threshold: '@',
            assignmentobjects: '='
        },
        controller: 'InfiniteScrollCtrl',
        controllerAs: 'InfiniteScroll',
        link: function(scope, element) {
            var threshold = scope.threshold || 0;
            var ele = element[0];
            element.bind('scroll', function () {
                if (ele.scrollTop + ele.offsetHeight + threshold >= ele.scrollHeight) {
                    if (scope.servicename && scope.listobjects) {
                        Paging.paging(scope.listobjects, scope.servicename);
                    }
                    else if (scope.pagingfunction != undefined && typeof(scope.pagingfunction) == 'function') {
                        scope.pagingfunction();
                    }
                    /* Else display a console error */
                    else {
                        console.log('Error: Infinite scroll directive not fully defined.');
                    }
                }
            });
        }
    }
}

function InfiniteScrollController($scope, Paging, TrackSearch) {
    TrackSearch.SetTerm(null);
    Paging.setSelected($scope.listobjects === undefined ? [] : $scope.listobjects.Items, $scope.assignmentobjects === undefined ? [] : $scope.assignmentobjects.Items, 'UserGroupID');
}
