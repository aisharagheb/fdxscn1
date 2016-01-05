angular.module('ordercloud-lineitems', [])

    .factory('LineItemHelpers', LineItemFactory)
    .controller('LineItemModalCtrl', LineItemModalController)

;

function LineItemFactory($state, CurrentOrder, Orders, LineItems, $uibModal) {
    return {
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
                    $state.reload();
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
