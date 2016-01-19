describe('Component: Checkout', function() {
    var scope,
        q,
        order;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function ($q, $rootScope) {
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
            PaymentMethod: "CreditCard",
            CreditCardID: null,
            ShippingCost: null,
            TaxCost: null
        };
    }));

    describe('State: checkout', function () {
        var state;
        beforeEach(inject(function ($state, CurrentOrder, ImpersonationService) {
            state = $state.get('checkout');
            var defer = q.defer();
            defer.resolve();
            spyOn(CurrentOrder, 'Get').and.returnValue(defer.promise);
            spyOn(ImpersonationService, 'Impersonation').and.returnValue(defer.promise);
        }));
        it('should resolve Order', inject(function ($injector, CurrentOrder) {
            $injector.invoke(state.resolve.Order);
            expect(CurrentOrder.Get).toHaveBeenCalled();
        }));
        it('should resolve ShippingAddresses', inject(function ($injector, ImpersonationService) {
            $injector.invoke(state.resolve.ShippingAddresses);
            expect(ImpersonationService.Impersonation).toHaveBeenCalled();
        }));
    });

    describe('State: orderReview', function () {
        var state;
        beforeEach(inject(function ($state, Orders) {
            state = $state.get('orderReview');
            var defer = q.defer();
            defer.resolve();
            spyOn(Orders, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SubmittedOrder', inject(function ($injector, $stateParams, Orders) {
            $injector.invoke(state.resolve.SubmittedOrder);
            expect(Orders.Get).toHaveBeenCalledWith($stateParams.orderid);
        }));
    });

    describe('Controller: OrderConfirmationCtrl', function () {
        var orderConfirmationCtrl;
        beforeEach(inject(function ($state, $controller) {
            orderConfirmationCtrl = $controller('OrderConfirmationCtrl', {
                $scope: scope,
                Order: order
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('submitOrder', function () {
            beforeEach(inject(function (Orders, CurrentOrder) {
                orderConfirmationCtrl.currentOrder = order;
                var defer = q.defer();
                defer.resolve(order);
                spyOn(Orders, 'Submit').and.returnValue(defer.promise);
                spyOn(CurrentOrder, 'Remove').and.returnValue(defer.promise);
                orderConfirmationCtrl.submitOrder();
                scope.$digest();
            }));
            it('should call the Orders Submit method', inject(function (Orders) {
                expect(Orders.Submit).toHaveBeenCalledWith(orderConfirmationCtrl.currentOrder.ID);
            }));
            it('should call the CurrentOrder Remove method', inject(function (CurrentOrder) {
                expect(CurrentOrder.Remove).toHaveBeenCalled();
            }));
            it('should enter the orderReview state', inject(function ($state) {
                expect($state.go).toHaveBeenCalledWith('orderReview', {orderid: orderConfirmationCtrl.currentOrder.ID});
            }));
        });
    });

    describe('Controller: OrderReviewCtrl', function () {
        var orderReviewCtrl;
        beforeEach(inject(function ($state, $controller, LineItemHelpers, LineItems) {
            var defer = q.defer();
            var lidefer = q.defer();
            lidefer.resolve({
                Meta: {
                    Page: 1,
                    TotalPages: 2,
                    PageSize: 20
                },
                Items: []
            })
            defer.resolve(order);
            spyOn(LineItems, 'List').and.returnValue(lidefer.promise);
            spyOn(LineItemHelpers, 'GetProductInfo').and.returnValue(defer.promise);
            orderReviewCtrl = $controller('OrderReviewCtrl', {
                $scope: scope,
                SubmittedOrder: order
            });
            orderReviewCtrl.orderReviewCtrl = {
                Meta: {
                    Page: 1,
                    TotalPages: 2,
                    PageSize: 20
                },
                Items: []
            };
            orderReviewCtrl.submittedOrder = order;
        }));
        it ('should call the LineItemHelpers GetProductInfo method', inject(function(LineItemHelpers) {
            scope.$digest();
            expect(LineItemHelpers.GetProductInfo).toHaveBeenCalledWith(orderReviewCtrl.orderReviewCtrl.Items);
        }));
        it ('should call the LineItems List method', inject(function(LineItems) {
            expect(LineItems.List).toHaveBeenCalledWith(orderReviewCtrl.submittedOrder.ID);
        }));

        describe('print', function () {
            beforeEach(inject(function () {
                spyOn(window, 'print').and.returnValue(null);
                orderReviewCtrl.print();
            }));
            it('should call the window.print method', inject(function () {
                expect(window.print).toHaveBeenCalled();
            }));
        });
    });

    describe('Controller: CheckoutLineItemsCtrl', function () {
        var checkoutLICtrl;
        beforeEach(inject(function ($state, $controller) {
            checkoutLICtrl = $controller('CheckoutLineItemsCtrl', {
                $scope: scope
            });
        }));
        describe('pagingfunction', function() {
            beforeEach(inject(function(LineItems, LineItemHelpers) {
                scope.order = order;
                var defer = q.defer();
                defer.resolve(order);
                spyOn(LineItems, 'List').and.returnValue(defer.promise);
                spyOn(LineItems, 'Get').and.returnValue(defer.promise);
                spyOn(LineItemHelpers, 'GetProductInfo').and.returnValue(defer.promise);
                scope.$digest();
                checkoutLICtrl.lineItems = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    },
                    Items: []
                };
                checkoutLICtrl.pagingfunction();
            }));
            it ('should call the LineItems Get method', inject(function(LineItems) {
                expect(LineItems.Get).toHaveBeenCalledWith(scope.order.ID);
            }));
            it ('should call the LineItemHelpers GetProductInfo method', inject(function(LineItemHelpers) {
                scope.$digest();
                expect(LineItemHelpers.GetProductInfo).toHaveBeenCalledWith(checkoutLICtrl.lineItems.Items);
            }));
            it ('should call the LineItems List method', inject(function(LineItems) {
                expect(LineItems.List).toHaveBeenCalledWith(scope.order.ID, checkoutLICtrl.lineItems.Meta.Page +1, checkoutLICtrl.lineItems.Meta.PageSize);
            }));
        });
    });

    describe('Controller: ConfirmationLineItemsCtrl', function () {
        var confirmationLICtrl;
        beforeEach(inject(function ($state, $controller) {
            confirmationLICtrl = $controller('CheckoutLineItemsCtrl', {
                $scope: scope
            });
        }));
        describe('pagingfunction', function() {
            beforeEach(inject(function(LineItems, LineItemHelpers) {
                scope.order = order;
                var defer = q.defer();
                defer.resolve(order);
                spyOn(LineItems, 'List').and.returnValue(defer.promise);
                spyOn(LineItems, 'Get').and.returnValue(defer.promise);
                spyOn(LineItemHelpers, 'GetProductInfo').and.returnValue(defer.promise);
                scope.$digest();
                confirmationLICtrl.lineItems = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    },
                    Items: []
                };
                confirmationLICtrl.pagingfunction();
            }));
            it ('should call the LineItems Get method', inject(function(LineItems) {
                expect(LineItems.Get).toHaveBeenCalledWith(scope.order.ID);
            }));
            it ('should call the LineItemHelpers GetProductInfo method', inject(function(LineItemHelpers) {
                scope.$digest();
                expect(LineItemHelpers.GetProductInfo).toHaveBeenCalledWith(confirmationLICtrl.lineItems.Items);
            }));
            it ('should call the LineItems List method', inject(function(LineItems) {
                expect(LineItems.List).toHaveBeenCalledWith(scope.order.ID, confirmationLICtrl.lineItems.Meta.Page +1, confirmationLICtrl.lineItems.Meta.PageSize);
            }));
        });
    });

});

