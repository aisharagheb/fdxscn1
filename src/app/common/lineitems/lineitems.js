angular.module('ordercloud-lineitem', [])

    .factory('LineItemHelpers', LineItemFactory)

;

function LineItemFactory($state, CurrentOrder, Orders, LineItems) {
    return {
        RemoveItem: DeleteLineItem,
        UpdateQuantity: UpdateQuantity
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

    function UpdateQuantity(LineItem) {
        if (LineItem.Quantity > 0) {
            LineItems.Patch(vm.order.ID, LineItem.ID, {Quantity: LineItem.Quantity})
                .then(function() {
                    $state.reload();
                });
        }
    }
}