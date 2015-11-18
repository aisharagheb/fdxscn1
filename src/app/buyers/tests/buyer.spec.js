describe('Component: Buyers,', function() {
    var scope,
        q,
        buyer;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        buyer = {
            ID: "TestBuyer123456789",
            Name: "TestBuyerTest",
            Active: true
        };
    }));

    describe('State: Base.buyers,', function() {
        var state;
        beforeEach(inject(function($state, Buyers) {
            state = $state.get('base.buyers');
            spyOn(Buyers, 'List').and.returnValue(null);
        }));
        it('should resolve BuyerList', inject(function ($injector, Buyers) {
            $injector.invoke(state.resolve.BuyerList);
            expect(Buyers.List).toHaveBeenCalled();
        }));
    });

    describe('State: Base.buyerEdit,', function() {
        var state;
        beforeEach(inject(function($state, Buyers) {
            state = $state.get('base.buyerEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(Buyers, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedBuyer', inject(function ($injector, $stateParams, Buyers) {
            $injector.invoke(state.resolve.SelectedBuyer);
            expect(Buyers.Get).toHaveBeenCalledWith($stateParams.buyerid);
        }));
    });

    describe('Controller: BuyerEditCtrl,', function() {
        var buyerEditCtrl;
        beforeEach(inject(function($state, $controller, Buyers) {
            buyerEditCtrl = $controller('BuyerEditCtrl', {
                $scope: scope,
                Buyers: Buyers,
                SelectedBuyer: buyer
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Buyers) {
                buyerEditCtrl.buyer = buyer;
                var defer = q.defer();
                defer.resolve(buyer);
                spyOn(Buyers, 'Update').and.returnValue(defer.promise);
                buyerEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Buyers Update method', inject(function(Buyers) {
                expect(Buyers.Update).toHaveBeenCalledWith(buyerEditCtrl.buyer);
            }));
            it ('should enter the buyers state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.buyers');
            }));
        });
    });

    describe('Controller: BuyerCreateCtrl,', function() {
        var buyerCreateCtrl;
        beforeEach(inject(function($state, $controller, Buyers) {
            buyerCreateCtrl = $controller('BuyerCreateCtrl', {
                $scope: scope,
                Buyers: Buyers
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Buyers) {
                buyerCreateCtrl.buyer = buyer;
                var defer = q.defer();
                defer.resolve(buyer);
                spyOn(Buyers, 'Create').and.returnValue(defer.promise);
                buyerCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Buyers Create method', inject(function(Buyers) {
                expect(Buyers.Create).toHaveBeenCalledWith(buyer);
            }));
            it ('should enter the buyers state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.buyers');
            }));
        });
    });
});

