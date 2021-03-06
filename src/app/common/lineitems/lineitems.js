angular.module('ordercloud-lineitems', [])

    .factory('LineItemHelpers', LineItemFactory)
    .controller('LineItemModalCtrl', LineItemModalController)

;

function LineItemFactory($q, $state, CurrentOrder, Orders, LineItems, $uibModal, $rootScope, Products, Addresses, Underscore) {
    return {
        SpecConvert: SpecConverter,
        RemoveItem: DeleteLineItem,
        UpdateQuantity: UpdateQuantity,
        GetProductInfo: GetProductInformation,
        ClearShipper: ClearShipping,
        CustomShipping: CustomShipping,
        UpdateShipping: UpdateShipping
    };

    function DeleteLineItem(Order, LineItem) {
        LineItems.Delete(Order.ID, LineItem.ID)
            .then(function() {
                // If all line items are removed delete the order.
                LineItems.List(Order.ID)
                    .then(function(data) {
                        if (!data.Items.length) {
                            CurrentOrder.Remove();
                            Orders.Delete(Order.ID).then(function() {
                                $state.reload();
                            });
                        }
                        else {
                            $state.reload();
                        }
                    });
            });
    }

    function UpdateQuantity(Order, LineItem) {
        if (LineItem.Quantity > 0) {
            LineItems.Patch(Order.ID, LineItem.ID, {Quantity: LineItem.Quantity})
                .then(function() {
                    $rootScope.$broadcast('OC:UpdateOrder', Order.ID);
                });
        }
    }

    function ClearShipping(Order, LineItem) {

    }

    function GetProductInformation(LineItems) {
        var li = LineItems.Items || LineItems;
        var productIDs = Underscore.uniq(Underscore.pluck(li, 'ProductID'));
        var dfd = $q.defer();
        var queue = [];
        angular.forEach(productIDs, function(productid) {
            queue.push(Products.Get(productid));
        });
        $q.all(queue)
            .then(function(results) {
                angular.forEach(li, function(item) {
                    item.Product = angular.copy(Underscore.where(results, {ID: item.ProductID})[0]);
                });
                dfd.resolve(li);
            });
        return dfd.promise;
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
                address.ID = Math.floor(Math.random() * 1000000).toString();
                LineItems.SetShippingAddress(Order.ID, LineItem.ID, address)
                    .then(function() {
                        $rootScope.$broadcast('LineItemAddressUpdated', LineItem.ID, address);
                    });
            });
    }

    function UpdateShipping(Order, LineItem, AddressID) {
        Addresses.Get(AddressID)
            .then(function(address) {
                LineItems.SetShippingAddress(Order.ID, LineItem.ID, address);
                $rootScope.$broadcast('LineItemAddressUpdated', LineItem.ID, address);
            });
    }
}

function SpecConverter(specs) {
    var results = [];
    angular.forEach(specs, function (spec) {
        var spec_to_push = {SpecID: spec.ID};
        if (spec.Options.length > 0) {
            if (spec.DefaultOptionID) {
                spec_to_push.OptionID = spec.DefaultOptionID;
            }
            if (spec.OptionID) {
                spec_to_push.OptionID = spec.OptionID;
            }
            if (spec.Value) {
                spec_to_push.Value = spec.Value;
            }
        }
        else {
            spec_to_push.Value = spec.Value || spec.DefaultValue || null;
        }
        results.push(spec_to_push);
    });
    return results;
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
