describe('Component: OrderHistory', function() {
    var scope,
        q,
        order,
        lineItemList,
        product,
        spendingAccount;
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
            TaxCost: null,
            LineItems: [
                {
                    "OrderID": "TestOrder123456789",
                    "ID": "TestLineItem123456789",
                    "ProductID": "TestProduct1234",
                    "Quantity": 1,
                    "LineTotal": 1.0,
                    "Product": {
                        "ID": "TestProduct1234",
                        "Name": "TestProduct1234",
                        "Description": "TestProduct1234",
                        "QuantityMultiplier": 1,
                        "Active": true
                    }
                }
            ],
            SpendingAccount: {
                "Name": "TestSpendingAccount1234",
                "ID": "TestSpendingAccount1234",
                "ActionOnExceed": "None",
                "AllowExceed": false,
                "AutoRenew": false,
                "AutoRenewAmount": null,
                "AutoRenewRollOverBalance": false,
                "AutoRenewDays": null,
                "HideWhenUnavailable": false,
                "MaxPercentOfTotal": 0,
                "AllowAsPaymentMethod": false,
                "Balance": 0.0,
                "AssignedUserID": "TestUser1234"
            }
        };
        lineItemList = {
            Items: [
                {
                    "OrderID": "TestOrder123456789",
                    "ID": "TestLineItem123456789",
                    "ProductID": "TestProduct1234",
                    "Quantity": 1,
                    "LineTotal": 1.0,
                    "Product": {
                        "ID": "TestProduct1234",
                        "Name": "TestProduct1234",
                        "Description": "TestProduct1234",
                        "QuantityMultiplier": 1,
                        "Active": true
                    }
                }
            ],
            Meta: {
                Page: 1,
                PageSize: 1,
                TotalCount: 1,
                TotalPages: 1,
                ItemRange: [0, 1]
            }
        };
        product = {
            "ID": "TestProduct1234",
            "Name": "TestProduct1234",
            "Description": "TestProduct1234",
            "QuantityMultiplier": 1,
            "Active": true
        };
        spendingAccount = {
            "Name": "TestSpendingAccount1234",
            "ID": "TestSpendingAccount1234",
            "ActionOnExceed": "None",
            "AllowExceed": false,
            "AutoRenew": false,
            "AutoRenewAmount": null,
            "AutoRenewRollOverBalance": false,
            "AutoRenewDays": null,
            "HideWhenUnavailable": false,
            "MaxPercentOfTotal": 0,
            "AllowAsPaymentMethod": false,
            "Balance": 0.0,
            "AssignedUserID": "TestUser1234"
        };
    }));

    describe('State: orderHistory', function() {
        var state;
        beforeEach(inject(function($state, Orders) {
            state = $state.get('orderHistory');
            spyOn(Orders, 'List').and.returnValue(null);
        }));
        it('should resolve OrderList', inject(function($injector, Orders) {
            $injector.invoke(state.resolve.OrderList);
            expect(Orders.List).toHaveBeenCalledWith('incoming');
        }));
    });

    describe('State: orderHistory.detail', function() {
        var state;
        beforeEach(inject(function($state, OrderHistoryFactory) {
            state = $state.get('orderHistory.detail');
            spyOn(OrderHistoryFactory, 'GetOrderDetails').and.returnValue(null);
        }));
        it('should resolve SelectedOrder', inject(function($injector, $stateParams, OrderHistoryFactory) {
            $injector.invoke(state.resolve.SelectedOrder);
            expect(OrderHistoryFactory.GetOrderDetails).toHaveBeenCalledWith($stateParams.orderid);
        }));
    });

    describe('State: orderHistory.detail.lineItem', function() {
        var state;
        beforeEach(inject(function($state, OrderHistoryFactory) {
            state = $state.get('orderHistory.detail.lineItem');
            spyOn(OrderHistoryFactory, 'GetLineItemDetails').and.returnValue(null);
        }));
        it('should resolve SelectedLineItem', inject(function($injector, $stateParams, OrderHistoryFactory) {
            $injector.invoke(state.resolve.SelectedLineItem);
            expect(OrderHistoryFactory.GetLineItemDetails).toHaveBeenCalledWith($stateParams.orderid, $stateParams.lineitemid);
        }));
    });


    describe('Factory: OrderHistoryFactory', function() {
        var orderHistoryService, orderID, productID;
        beforeEach(inject(function(OrderHistoryFactory, Orders, LineItems, Products, SpendingAccounts) {
            orderHistoryService = OrderHistoryFactory;
            var orderDefer = q.defer();
            var lineItemDefer = q.defer();
            var productDefer = q.defer();
            var spendingAccountDefer = q.defer();
            orderDefer.resolve(order);
            lineItemDefer.resolve(lineItemList);
            productDefer.resolve(product);
            spendingAccountDefer.resolve(spendingAccount);
            spyOn(Orders, 'Get').and.returnValue(orderDefer.promise);
            spyOn(LineItems, 'List').and.returnValue(lineItemDefer.promise);
            spyOn(Products, 'Get').and.returnValue(productDefer.promise);
            spyOn(SpendingAccounts, 'Get').and.returnValue(spendingAccountDefer.promise);
            //scope.$digest();
        }));

        describe('GetOrderDetails', function() {
            beforeEach(function() {
                orderID = "TestOrder123456789";
                productID = "TestProduct1234";
                orderHistoryService.GetOrderDetails(orderID);
                scope.$digest();
            });
            it ('should call an Order Get', inject(function(Orders) {
                expect(Orders.Get).toHaveBeenCalledWith(orderID);
            }));
            it ('should call a Line Item List', inject(function(LineItems) {
                expect(LineItems.List).toHaveBeenCalledWith(orderID, 1, 100);
            }));
            it ('should call a Product Get', inject(function(Products) {
                expect(Products.Get).toHaveBeenCalledWith(productID);
            }));
        });
    });
});