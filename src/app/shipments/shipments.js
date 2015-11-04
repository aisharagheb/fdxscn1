angular.module( 'orderCloud' )

    .config( ShipmentsConfig )
    .controller( 'ShipmentsCtrl', ShipmentsController )
    .controller( 'ShipmentEditCtrl', ShipmentEditController )
    .controller( 'ShipmentCreateCtrl', ShipmentCreateController )

;

function ShipmentsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.shipments', {
            url: '/shipments',
            templateUrl:'shipments/templates/shipments.tpl.html',
            controller:'ShipmentsCtrl',
            controllerAs: 'shipments',
            data: {componentName: 'Shipments'},
            resolve: {
                ShipmentList: function(Shipments) {
                    return Shipments.List();
                }
            }
        })
        .state( 'base.shipmentEdit', {
            url: '/shipments/:shipmentid/edit',
            templateUrl:'shipments/templates/shipmentEdit.tpl.html',
            controller:'ShipmentEditCtrl',
            controllerAs: 'shipmentEdit',
            resolve: {
                SelectedShipment: function($stateParams, Shipments) {
                    return Shipments.Get($stateParams.shipmentid);
                },
                OrderList: function(Orders) {
                    return Orders.List('incoming');
                }
            }
        })
        .state( 'base.shipmentCreate', {
            url: '/shipments/create',
            templateUrl:'shipments/templates/shipmentCreate.tpl.html',
            controller:'ShipmentCreateCtrl',
            controllerAs: 'shipmentCreate',
            resolve: {
                OrderList: function(Orders) {
                    return Orders.List('incoming');
                }
            }
        })
}

function ShipmentsController( ShipmentList ) {
    var vm = this;
    vm.list = ShipmentList;
}

function ShipmentEditController( $exceptionHandler, $state, SelectedShipment, Shipments, OrderList, LineItems ) {
    var vm = this,
        shipmentid = SelectedShipment.ID;
    vm.ShipmentID = SelectedShipment.ID;
    vm.shipment = SelectedShipment;
    vm.list = OrderList;
    vm.OrderSelected = false;
    vm.listli = [];
    if (vm.shipment.DateShipped != null){
        vm.shipment.DateShipped = new Date(vm.shipment.DateShipped);
    }

    vm.goToLineItems = function(order) {
        LineItems.List(order.ID, 1, 20)
            .then(function(data){
                vm.listli = data;
                angular.forEach(vm.listli.Items, function(li) {
                    angular.forEach(vm.shipment.Items, function(shipli) {
                        if (shipli.LineItemId === li.ID) {
                            li.addToShipment = true;
                            li.disabled = true;

                        }
                    });
                });
            });
        vm.OrderSelected = true;
    }

    vm.deleteLineItem = function(index) {
        vm.shipment.Items.splice(index, 1);
        vm.listli.Items[index].addToShipment = false;
        vm.listli.Items[index].disabled = false;
    }

    vm.Submit = function() {
        angular.forEach(vm.listli.Items, function(li) {
            if (li.addToShipment && !li.disabled) {
                vm.shipment.Items.push({OrderID: li.OrderID, LineItemId: li.ID, QuantityShipped: li.QuantityShipped});
            }
        });
        Shipments.Update(shipmentid, vm.shipment)
            .then(function() {
                $state.go('^.shipments');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        Shipments.Delete(shipmentid, false)
            .then(function() {
                $state.go('^.shipments')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };
}

function ShipmentCreateController( $exceptionHandler, $state, Shipments, OrderList, LineItems) {
    var vm = this;
    vm.shipment = {};
    vm.list = OrderList;
    vm.OrderSelected = false;
    vm.shipment.Items = [];
    vm.listli = [];

    vm.goToLineItems = function(order) {
        LineItems.List(order.ID, 1, 20)
            .then(function(data){
                vm.listli = data;
                vm.OrderSelected = true;
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Submit = function() {
        angular.forEach(vm.listli.Items, function(li) {
            if(li.addToShipment){
                vm.shipment.Items.push({OrderID: li.OrderID, LineItemId: li.ID, QuantityShipped: li.QuantityShipped});
            }
        });
        Shipments.Create(vm.shipment)
            .then(function() {
                $state.go('^.shipments')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };
}