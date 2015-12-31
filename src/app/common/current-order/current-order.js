angular.module('ordercloud-current-order', [])

    .factory('CurrentOrder', CurrentOrderService)

;

function CurrentOrderService($q, appname, ImpersonationService, $localForage, Orders, Me) {
    var StorageName = appname + '.CurrentOrderID';
    return {
        Get: getOrder,
        GetID: getOrderID,
        Set: setOrderID,
        Remove: removeOrder
    };

    function getOrder() {
        var dfd = $q.defer();
        getOrderID()
            .then(function(OrderID) {
                Orders.Get(OrderID)
                    .then(function(order) {
                        dfd.resolve(order);
                    })
                    .catch(function() {
                        // If method fails clear out saved order
                        removeOrder();
                        dfd.resolve(null);
                    })
            })
            .catch(function() {
                // Double check for an open order
                ImpersonationService.Impersonation(Me.Get)
                    .then(function(me) {
                        ImpersonationService.Impersonation(function() {
                            return Orders.List('outgoing', null, null, null, null, null, null, null, {'FromUserID': me.ID})
                                .then(function(orders) {
                                    if (orders.Items.length >= 1) {
                                        $localForage.setItem(StorageName, orders.Items[0].ID);
                                        dfd.resolve(orders.Items[0]);
                                    }
                                    else dfd.resolve(null);
                                })
                                .catch(function() {
                                    dfd.resolve(null);
                                })
                        });
                    })
                    .catch(function(error) {
                        dfd.reject(error);
                    });
            });
        return dfd.promise;
    }

    function getOrderID() {
        var dfd = $q.defer();
        $localForage.getItem(StorageName)
            .then(function(orderID) {
                if (orderID)
                    dfd.resolve(orderID);
                else dfd.reject(null);
            })
            .catch(function() {
                dfd.reject(null);
            });
        return dfd.promise;
    }

    function setOrderID(OrderID) {
        $localForage.setItem(StorageName, OrderID)
            .then(function(data) {
                return data;
            })
            .catch(function(error) {
                return error;
            });
    }

    function removeOrder() {
        return $localForage.removeItem(StorageName);
    }
}