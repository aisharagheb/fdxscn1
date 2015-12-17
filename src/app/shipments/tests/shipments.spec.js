describe('Component: Shipments', function() {
    var scope,
        q,
        shipment;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        shipment = {
            ID: "TestShipment123456789",
            Shipper: "USPS",
            DateShipped: null,
            Cost: 7,
        Items: [
                {
                    OrderID: "TestOrder123456789",
                    LineItemId: "TestLineItem123456789",
                    QuantityShipped: 2
                }
            ]
        };
    }));

    describe('State: shipments', function() {
        var state;
        beforeEach(inject(function($state, Shipments) {
            state = $state.get('shipments');
            spyOn(Shipments, 'List').and.returnValue(null);
        }));
        it('should resolve ShipmentList', inject(function ($injector, Shipments) {
            $injector.invoke(state.resolve.ShipmentList);
            expect(Shipments.List).toHaveBeenCalled();
        }));
    });

    describe('State: shipments.edit', function() {
        var state;
        beforeEach(inject(function($state, Shipments, Orders) {
            state = $state.get('shipments.edit');
            spyOn(Shipments, 'Get').and.returnValue(null);
            spyOn(Orders, 'List').and.returnValue(null);
        }));
        it('should resolve SelectedShipment', inject(function ($injector, $stateParams, Shipments) {
            $injector.invoke(state.resolve.SelectedShipment);
            expect(Shipments.Get).toHaveBeenCalledWith($stateParams.shipmentid);
        }));
        it('should resolve OrderList', inject(function ($injector, $stateParams, Orders) {
            $injector.invoke(state.resolve.OrderList);
            expect(Orders.List).toHaveBeenCalledWith('incoming');
        }));
    });

    describe('State: shipments.create', function() {
        var state;
        beforeEach(inject(function($state, Orders) {
            state = $state.get('shipments.create');
            spyOn(Orders, 'List').and.returnValue(null);
        }));
        it('should resolve OrderList', inject(function ($injector, $stateParams, Orders) {
            $injector.invoke(state.resolve.OrderList);
            expect(Orders.List).toHaveBeenCalledWith('incoming');
        }));
    });

    describe('Controller: ShipmentEditCtrl', function() {
        var shipmentEditCtrl, order;
        beforeEach(inject(function($state, $controller) {
            shipmentEditCtrl = $controller('ShipmentEditCtrl', {
                $scope: scope,
                SelectedShipment: shipment,
                OrderList: [],
                lineitems: {
                    list: {
                        Items: [
                            {
                                addToShipment: false,
                                disabled: false
                            }
                        ]
                    }
                },
                OrderSelected: true
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('unselectOrder', function() {
           beforeEach(inject(function() {
               shipmentEditCtrl.lineitems.list = [1, 2, 3];
               shipmentEditCtrl.OrderSelected = true;
               shipmentEditCtrl.unselectOrder();
           }));
            it('should make OrderSelected false', inject(function () {
                expect(shipmentEditCtrl.OrderSelected).toEqual(false);
            }));
            it('should empty list', inject(function () {
                expect(shipmentEditCtrl.lineitems.list.length).toEqual(0);
            }));
        });

        describe('deleteLineItem', function() {
            beforeEach(inject(function(Shipments) {
                spyOn(Shipments, 'Patch').and.returnValue(null);
                shipmentEditCtrl.OrderSelected = false;
                shipmentEditCtrl.lineitems.list.Items = [
                            {
                                addToShipment: true,
                                disabled: true
                            }
                ];
                var index = 0;
                shipmentEditCtrl.shipment = shipment;
                shipmentEditCtrl.deleteLineItem(index);
            }));
            it('should call the Shipments Patch method', inject(function (Shipments) {
                expect(Shipments.Patch).toHaveBeenCalledWith(shipment.ID, {Items: shipmentEditCtrl.shipment.Items});
            }));
            it('should make addToShipment false', inject(function () {
                expect(shipmentEditCtrl.lineitems.list.Items[0].addToShipment).toEqual(false);
            }));
            it('should make disabled false', inject(function () {
                expect(shipmentEditCtrl.lineitems.list.Items[0].disabled).toEqual(false);
            }));
            it('should empty shipment list', inject(function () {
                expect(shipmentEditCtrl.shipment.Items.length).toEqual(0);
            }));
        });

        describe('goToLineItems', function() {
            beforeEach(inject(function(LineItems) {
                order = {
                    ID: 'TestOrder123456789'
                }
                var defer = q.defer();
                defer.resolve(shipment);
                spyOn(LineItems, 'List').and.returnValue(defer.promise);
                shipmentEditCtrl.goToLineItems(order);
                scope.$digest();
            }));
            it('should call the LineItems List method', inject(function (LineItems) {
                expect(LineItems.List).toHaveBeenCalledWith(order.ID, 1, 20);
            }));
        });

        describe('Submit', function() {
            beforeEach(inject(function(Shipments) {
                shipmentEditCtrl.shipment = shipment;
                shipmentEditCtrl.shipmentID = "TestShipment123456789";
                var defer = q.defer();
                defer.resolve(shipment);
                spyOn(Shipments, 'Update').and.returnValue(defer.promise);
                shipmentEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Shipments Update method', inject(function(Shipments) {
                expect(Shipments.Update).toHaveBeenCalledWith(shipmentEditCtrl.shipmentID, shipmentEditCtrl.shipment);
            }));
            it ('should enter the shipments state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('shipments', {}, {reload:true});
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(Shipments) {
                var defer = q.defer();
                defer.resolve(shipment);
                spyOn(Shipments, 'Delete').and.returnValue(defer.promise);
                shipmentEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the Shipments Delete method', inject(function(Shipments) {
                expect(Shipments.Delete).toHaveBeenCalledWith(shipment.ID, false);
            }));
            it ('should enter the shipments state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('shipments', {}, {reload:true});
            }));
        });

        describe('pagingfunction', function() {
            beforeEach(inject(function(LineItems) {
                spyOn(LineItems, 'List').and.returnValue(null);
                shipmentEditCtrl.lineitems.list = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                shipmentEditCtrl.lineitems.pagingfunction();
            }));
            it ('should call the LineItems List method', inject(function(LineItems) {
                expect(LineItems.List).toHaveBeenCalledWith(false, shipmentEditCtrl.lineitems.list.Meta.Page +1, shipmentEditCtrl.lineitems.list.Meta.PageSize);
            }));
        });
    });

    describe('Controller: ShipmentCreateCtrl', function() {
        var shipmentCreateCtrl, order;
        beforeEach(inject(function($state, $controller) {
            shipmentCreateCtrl = $controller('ShipmentCreateCtrl', {
                $scope: scope,
                OrderList: []
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('goToLineItems', function() {
            beforeEach(inject(function(LineItems) {
                order = {
                    ID: 'TestOrder123456789'
                }
                var defer = q.defer();
                defer.resolve(shipment);
                spyOn(LineItems, 'List').and.returnValue(defer.promise);
                shipmentCreateCtrl.goToLineItems(order);
                scope.$digest();
            }));
            it('should call the LineItems List method', inject(function (LineItems) {
                expect(LineItems.List).toHaveBeenCalledWith(order.ID, 1, 20);
            }));
        });

        describe('unselectOrder', function() {
            beforeEach(inject(function() {
                shipmentCreateCtrl.lineitems.list = [1, 2, 3];
                shipmentCreateCtrl.OrderSelected = true;
                shipmentCreateCtrl.unselectOrder();
            }));
            it('should make OrderSelected false', inject(function () {
                expect(shipmentCreateCtrl.OrderSelected).toEqual(false);
            }));
            it('should empty list', inject(function () {
                expect(shipmentCreateCtrl.lineitems.list.length).toEqual(0);
            }));
        });

        describe('Submit', function() {
            beforeEach(inject(function(Shipments) {
                shipmentCreateCtrl.shipment = shipment;
                var defer = q.defer();
                defer.resolve(shipment);
                spyOn(Shipments, 'Create').and.returnValue(defer.promise);
                shipmentCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Shipments Create method', inject(function(Shipments) {
                expect(Shipments.Create).toHaveBeenCalledWith(shipment);
            }));
            it ('should enter the shipments state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('shipments', {}, {reload:true});
            }));
        });
    });
});

