angular.module('orderCloud')

    .controller('OrderInputCtrl', OrderInputController)
    .directive('ordercloudOrderInput', OrderCloudOrderInputDirective)

;

function OrderCloudOrderInputDirective() {
    return {
        restrict: 'E',
        scope: {
            product: '=',
            validationform: '='
        },
        templateUrl: 'catalog/product/templates/order-input.tpl.html',
        controller: 'OrderInputCtrl',
        controllerAs: 'orderInput'
    };
}

function OrderInputController($state, appname, $scope, $rootScope, $localForage, Orders, LineItems) {
    var vm = this,
        orderid;
    vm.currentState = $state.current.name;
    vm.price = null;
    vm.addToCart = AddToCart;

    $localForage.getItem(appname + '.CurrentOrderID').then(function(data) {
        orderid = data;
    });

    $scope.$on('$stateChangeSuccess', function(event, toState) {
        vm.currentState = toState.name;
    });

    $scope.$watch(function() {
        return vm.Quantity;
    }, function(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
            var max_quantity = 0;
            angular.forEach($scope.product.StandardPriceSchedule.PriceBreaks, function(PriceBreaks) {
                if (vm.Quantity >= PriceBreaks.Quantity && PriceBreaks.Quantity > max_quantity) {
                    max_quantity = PriceBreaks.Quantity;
                    vm.price = PriceBreaks.Price * vm.Quantity;
                }
                else return null;
            });
        }
        else if (!newValue) {
            vm.price = null;
        }
    });

    function AddToCart() {
        if (orderid) {
            Orders.Get(orderid).then(function(order) {
                AddLineItem(order, $scope.product);
            });
        }
        else {
            Orders.Create({}).then(function(order) {
                AddLineItem(order, $scope.product);
                $localForage.setItem(appname + '.CurrentOrderID', order.ID);
            });
        }
    }

    function AddLineItem(order, product) {
        LineItems.Create(order.ID, {
            ProductID: product.ID,
            Quantity: vm.Quantity,
            Specs: SetSpecs(product.Specs)
        }).then(function(lineItem) {
            $rootScope.$broadcast('event:lineitemAddedToCart', order.ID, lineItem);
        });
    }

    function SetSpecs(specs) {
        var results = [];
        angular.forEach(specs, function(spec) {
            var spec_to_push = {SpecID: spec.ID};
            if (spec.Options.length > 0) {
                if (spec.DefaultOptionID) {
                    spec_to_push.OptionID = spec.DefaultOptionID;
                }
                if (spec.Value) {
                    angular.forEach(spec.Options, function(option) {
                        if (option.Value === spec.Value) {
                            spec_to_push.Value = spec.Value;
                            spec_to_push.OptionID = spec.OptionID;
                        }
                    });
                }
                else if (spec.OptionID) {
                    spec_to_push.OptionID = spec.OptionID;
                }
            }
            else {
                spec_to_push.Value = spec.Value || spec.DefaultValue || null;
            }
            if (spec_to_push.Value || spec_to_push.OptionID) {
                results.push(spec_to_push);
            }
        });
        return results;
    }
}
