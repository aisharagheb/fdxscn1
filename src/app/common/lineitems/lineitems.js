angular.module('ordercloud-lineitems', [])

    .factory('LineItemHelpers', LineItemFactory)
    .controller('LineItemModalCtrl', LineItemModalController)

;

function LineItemFactory($state, CurrentOrder, Orders, LineItems, $uibModal, $rootScope) {
    return {
        SpecConvert: SpecConverter,
        RemoveItem: DeleteLineItem,
        UpdateQuantity: UpdateQuantity,
        ClearShipper: ClearShipping,
        CustomShipper: CustomShipping
    };

    function DeleteLineItem(Order, LineItem) {
        LineItems.Delete(Order.ID, LineItem.ID)
            .then(function() {
                // If all line items are removed delete the order.
                LineItems.List(Order.ID)
                    .then(function(data) {
                        if (!data.Items.length) {
                            Orders.Delete(Order.ID);
                            CurrentOrder.Remove();
                        }
                        $state.reload();
                    });
            });
    }

    function UpdateQuantity(Order, LineItem) {
        if (LineItem.Quantity > 0) {
            LineItems.Patch(Order.ID, LineItem.ID, {Quantity: LineItem.Quantity})
                .then(function() {
                    $rootScope.$broadcast('LineItemQuantityUpdated');
                });
        }
    }

    function ClearShipping(Order, LineItem) {

    }

    function CustomShipping(Order, LineItem) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'common/lineitems/templates/shipping.tpl.html',
            controller: 'LineItemModalCtrl',
            controllerAs: 'liModal',
            size: 'lg'
        });

        modalInstance.result
            .then(function(address) {
                LineItems.SetShippingAddress(Order.ID, LineItem.ID, address)
                    .then(function() {
                        $state.reload();
                    });
            });
    }

    function SpecConverter(specs) {
        var results = [];
        angular.forEach(specs, function(spec) {
            var spec_to_push = {SpecID: spec.ID};
            if (spec.Options.length > 0) {
                if (spec.DefaultOptionID) {
                    spec_to_push.OptionID = spec.DefaultOptionID;
                }
                if (spec.Value) {
                    spec_to_push.Value = spec.Value;
                }
                else if (spec.OptionID) {
                    spec_to_push.OptionID = spec.OptionID;
                }
            }
            else {
                spec_to_push.Value = spec.Value || spec.DefaultValue || null;
            }
            results.push(spec_to_push);
        });
        return results;
    }
}

function LineItemModalController($uibModalInstance) {
    var vm = this;
    vm.address = {};

    vm.submit = function() {
        $uibModalInstance.close(vm.address);
    };

    vm.cancel = function() {
        vm.address = {};
        $uibModalInstance.dismiss('cancel');
    };
}
