angular.module('ordercloud-current-order', [])

    .factory('CurrentOrder', CurrentOrderService)

;

function CurrentOrderService($q, appname, ImpersonationService, $localForage, Orders) {
    var StorageName = appname + '.CurrentOrderID';
    return {
        Get: getOrder,
        GetID: getOrderID,
        Set: setOrderID
    };

    function getOrder() {
        var dfd = $q.defer();
        getOrderID()
            .then(function(OrderID) {
                if (OrderID !== null) {
                    Orders.Get(OrderID).then(function(order) {
                        dfd.resolve(order);
                    })
                }
                else {
                    // Double check for an open order
                    ImpersonationService.Impersonate(Me.Get())
                        .then(function(me) {
                            ImpersonationService.Impersonate(function() {
                                return Orders.List('outgoing', null, null, null, null, null, null, null, {'FromUserID': me.ID})
                                    .then(function(order) {
                                        if (order && order.ID) {
                                            dfd.resolve(order);
                                            $localForage.setItem(StorageName, order.ID);
                                        }
                                    })
                            });
                        })
                        .catch(function(error) {
                            dfd.resolve(error);
                        });
                }
            })
            .catch(function() {
                dfd.resolve(null);
            });
        return dfd.promise;
    }

    function getOrderID() {
        var dfd = $q.defer();
        $localForage.getItem(StorageName)
            .then(function(orderID) {
                dfd.resolve(orderID);
            })
            .catch(function() {
                dfd.resolve(null);
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
}