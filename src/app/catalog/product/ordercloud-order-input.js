angular.module('orderCloud')

    .controller('OrderInputCtrl', OrderInputController)
    .directive('ordercloudOrderInput', OrderCloudOrderInputDirective)

;

function OrderCloudOrderInputDirective() {
    return {
        restrict: 'E',
        scope: {
            product: '=',
            order: '='
        },
        templateUrl: 'catalog/product/templates/order-input.tpl.html',
        controller: 'OrderInputCtrl',
        controllerAs: 'orderInput'
    }
}

function OrderInputController($state, $scope) {
    var vm = this;
    vm.currentState = $state.current.name;
    vm.price = null;
    vm.addToCart = AddToCart;

    $scope.$watch(function() {
        return vm.Quantity;
    }, function(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
            if (product.StandardPriceSchedule.RestrictedQuantity) {
                angular.forEach($scope.product.StandardPriceSchedule.PriceBreaks, function(PriceBreaks) {
                    if (vm.Quantity == PriceBreaks.Quantity) {
                        vm.price = PriceBreaks.Price * vm.Quantity;
                    }
                    else return null;
                });
            }
            else {
                //TODO: None restricted quantity
            }
        }
        else if (newValue === null) {
            vm.price = null;
        }
    });

    function AddToCart() {

    }
}
