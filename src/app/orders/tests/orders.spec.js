describe('Component: Orders,', function() {
    var scope,
        q,
        order;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        order = {
            ID: "TestOrder123456789",
            Type: "Standard",
            FromUserID: "TestUser123456789",
            BillingAddressID: "TestAddress123456789",
            ShippingAddressID: "TestAddress123456789",
            SpendingAccountID: null,
            Comments: null,
            PaymentMethod: null,
            CreditCardID: null,
            ShippingCost: null,
            TaxCost: null
        };
    }));

    describe('State: Base.orders,', function() {
        var state;
        beforeEach(inject(function($state, Orders) {
            state = $state.get('base.orders');
            spyOn(Orders, 'List').and.returnValue(null);
        }));
        it('should resolve OrderList', inject(function ($injector, Orders) {
            $injector.invoke(state.resolve.OrderList);
            expect(Orders.List).toHaveBeenCalledWith('incoming');
        }));
    });

    describe('State: Base.orderEdit,', function() {
        var state;
        beforeEach(inject(function($state, Orders, LineItems) {
            state = $state.get('base.orderEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(Orders, 'Get').and.returnValue(defer.promise);
            spyOn(LineItems, 'List').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedOrder', inject(function ($injector, $stateParams, Orders) {
            $injector.invoke(state.resolve.SelectedOrder);
            expect(Orders.Get).toHaveBeenCalledWith($stateParams.orderid);
        }));
        it('should resolve LineItemList', inject(function ($injector, $stateParams, LineItems) {
            $injector.invoke(state.resolve.LineItemList);
            expect(LineItems.List).toHaveBeenCalledWith($stateParams.orderid);
        }));
    });
    

    describe('Controller: OrderEditCtrl,', function() {
        var orderEditCtrl, lineItem;
        beforeEach(inject(function($state, $controller, Orders) {
            orderEditCtrl = $controller('OrderEditCtrl', {
                $scope: scope,
                Orders: Orders,
                SelectedOrder: order,
                LineItemList: []
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('deleteLineItem', function() {
            beforeEach(inject(function(LineItems) {
                var defer = q.defer();
                defer.resolve(null);
                spyOn(LineItems, 'Delete').and.returnValue(defer.promise);
                lineItem = {
                    ID: 'potato'
                }
                orderEditCtrl.deleteLineItem(lineItem);
                scope.$digest();
            }));
            it ('should call the LineItems Delete method', inject(function(LineItems) {
                expect(LineItems.Delete).toHaveBeenCalledWith(orderEditCtrl.orderID, lineItem.ID);
            }));
        });

        describe('goToProduct', function() {
            beforeEach(inject(function() {
                var defer = q.defer();
                defer.resolve(null);
                defer.resolve(null);
                lineItem = {
                    ProductID: 'potato'
                }
                orderEditCtrl.goToProduct(lineItem);
                scope.$digest();
            }));
            it ('should enter the productEdit state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.productEdit', {'productid': lineItem.ProductID});
            }));
        });

        describe('Submit', function() {
            beforeEach(inject(function(Orders) {
                orderEditCtrl.order = order;
                orderEditCtrl.orderID = "TestOrder123456789";
                var defer = q.defer();
                defer.resolve(order);
                spyOn(Orders, 'Update').and.returnValue(defer.promise);
                orderEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Orders Update method', inject(function(Orders) {
                expect(Orders.Update).toHaveBeenCalledWith(orderEditCtrl.orderID, orderEditCtrl.order);
            }));
            it ('should enter the orders state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.orders');
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(Orders) {
                var defer = q.defer();
                defer.resolve(order);
                spyOn(Orders, 'Delete').and.returnValue(defer.promise);
                orderEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the Orders Delete method', inject(function(Orders) {
                expect(Orders.Delete).toHaveBeenCalledWith(order.ID);
            }));
            it ('should enter the orders state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.orders');
            }));
        });

        describe('pagingfunction', function() {
            beforeEach(inject(function(LineItems) {
                var defer = q.defer();
                defer.resolve(null);
                spyOn(LineItems, 'List').and.returnValue(defer.promise);
                scope.$digest();
                orderEditCtrl.order = order;
                orderEditCtrl.list = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                orderEditCtrl.pagingfunction();
            }));
            it ('should call the LineItems List method', inject(function(LineItems) {
                expect(LineItems.List).toHaveBeenCalledWith(orderEditCtrl.order.ID, orderEditCtrl.list.Meta.Page +1, orderEditCtrl.list.Meta.PageSize);
            }));
        });
    });
});

