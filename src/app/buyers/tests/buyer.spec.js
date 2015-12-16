describe('Component: Buyers', function() {
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

    describe('State: buyers', function() {
        var state;
        beforeEach(inject(function($state, Buyers) {
            state = $state.get('buyers');
            spyOn(Buyers, 'List').and.returnValue(null);
        }));
        it('should resolve BuyerList', inject(function ($injector, Buyers) {
            $injector.invoke(state.resolve.BuyerList);
            expect(Buyers.List).toHaveBeenCalled();
        }));
    });

    describe('State: buyers.edit', function() {
        var state;
        beforeEach(inject(function($state, Buyers) {
            state = $state.get('buyers.edit');
            var defer = q.defer();
            defer.resolve();
            spyOn(Buyers, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedBuyer', inject(function ($injector, $stateParams, Buyers) {
            $injector.invoke(state.resolve.SelectedBuyer);
            expect(Buyers.Get).toHaveBeenCalledWith($stateParams.buyerid);
        }));
    });

    describe('Controller: BuyerEditCtrl', function() {
        var buyerEditCtrl;
        beforeEach(inject(function($state, $controller) {
            buyerEditCtrl = $controller('BuyerEditCtrl', {
                $scope: scope,
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
                expect($state.go).toHaveBeenCalledWith('buyers', {}, {reload:true});
            }));
        });
    });

    describe('Controller: BuyerCreateCtrl', function() {
        var buyerCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            buyerCreateCtrl = $controller('BuyerCreateCtrl', {
                $scope: scope
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
                expect($state.go).toHaveBeenCalledWith('buyers', {}, {reload:true});
            }));
        });
    });
});

