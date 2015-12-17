describe('Component: PriceSchedules', function() {
    var scope,
        q,
        priceSchedule;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        priceSchedule = {
            ID: "TestPriceSchedule123456789",
            Name: "TestPriceSchedule123456789",
            ApplyTax: true,
            ApplyShipping: false,
            MinQuantity: null,
            MaxQuantity: null,
            UseCumulativeQuantity: false,
            RestrictedQuantity: false,
            OrderType: "Standard",
        PriceBreaks: [
                {
                    Quantity: 1,
                    Price: 5.0
                }
            ]
        };
    }));

    describe('State: priceSchedules', function() {
        var state;
        beforeEach(inject(function($state, PriceSchedules) {
            state = $state.get('priceSchedules');
            spyOn(PriceSchedules, 'List').and.returnValue(null);
        }));
        it('should resolve PriceScheduleList', inject(function ($injector, PriceSchedules) {
            $injector.invoke(state.resolve.PriceScheduleList);
            expect(PriceSchedules.List).toHaveBeenCalled();
        }));
    });

    describe('State: priceSchedules.edit', function() {
        var state;
        beforeEach(inject(function($state, PriceSchedules) {
            state = $state.get('priceSchedules.edit');
            spyOn(PriceSchedules, 'Get').and.returnValue(null);
        }));
        it('should resolve SelectedPriceSchedule', inject(function ($injector, $stateParams, PriceSchedules) {
            $injector.invoke(state.resolve.SelectedPriceSchedule);
            expect(PriceSchedules.Get).toHaveBeenCalledWith($stateParams.priceScheduleid);
        }));
    });


    describe('Controller: PriceScheduleEditCtrl', function() {
        var priceScheduleEditCtrl;
        beforeEach(inject(function($state, $controller) {
            priceScheduleEditCtrl = $controller('PriceScheduleEditCtrl', {
                $scope: scope,
                SelectedPriceSchedule: priceSchedule
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('addPriceBreak', function() {
            var quantity;
            var price;
            beforeEach(inject(function(PriceBreak) {
                priceScheduleEditCtrl.priceSchedule = priceSchedule;
                priceScheduleEditCtrl.quantity = quantity;
                priceScheduleEditCtrl.quantity = price;
                spyOn(PriceBreak, 'addPriceBreak').and.returnValue(null);
                priceScheduleEditCtrl.addPriceBreak();
            }));
            it ('should call the PriceBreak addPriceBreak method', inject(function(PriceBreak) {
                expect(PriceBreak.addPriceBreak).toHaveBeenCalledWith(priceSchedule, price, quantity);
            }));
        });

        describe('Submit', function() {
            beforeEach(inject(function(PriceSchedules) {
                priceScheduleEditCtrl.priceSchedule = priceSchedule;
                priceScheduleEditCtrl.priceScheduleID = "TestPriceSchedule123456789";
                var defer = q.defer();
                defer.resolve(priceSchedule);
                spyOn(PriceSchedules, 'Update').and.returnValue(defer.promise);
                priceScheduleEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the PriceSchedules Update method', inject(function(PriceSchedules) {
                expect(PriceSchedules.Update).toHaveBeenCalledWith(priceScheduleEditCtrl.priceScheduleID, priceScheduleEditCtrl.priceSchedule);
            }));
            it ('should enter the priceSchedules state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('priceSchedules', {}, {reload:true});
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(PriceSchedules) {
                var defer = q.defer();
                defer.resolve(priceSchedule);
                spyOn(PriceSchedules, 'Delete').and.returnValue(defer.promise);
                priceScheduleEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the PriceSchedules Delete method', inject(function(PriceSchedules) {
                expect(PriceSchedules.Delete).toHaveBeenCalledWith(priceSchedule.ID);
            }));
            it ('should enter the priceSchedules state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('priceSchedules', {}, {reload:true});
            }));
        });
    });

    describe('Controller: PriceScheduleCreateCtrl', function() {
        var priceScheduleCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            priceScheduleCreateCtrl = $controller('PriceScheduleCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('addPriceBreak', function() {
            var quantity;
            var price;
            beforeEach(inject(function(PriceBreak) {
                priceScheduleCreateCtrl.priceSchedule = priceSchedule;
                priceScheduleCreateCtrl.quantity = quantity;
                priceScheduleCreateCtrl.quantity = price;
                spyOn(PriceBreak, 'addPriceBreak').and.returnValue(null);
                priceScheduleCreateCtrl.addPriceBreak();
            }));
            it ('should call the PriceBreak addPriceBreak method', inject(function(PriceBreak) {
                expect(PriceBreak.addPriceBreak).toHaveBeenCalledWith(priceSchedule, price, quantity);
            }));
        });

        describe('Submit', function() {
            beforeEach(inject(function(PriceSchedules) {
                priceScheduleCreateCtrl.priceSchedule = priceSchedule;
                var defer = q.defer();
                defer.resolve(priceSchedule);
                spyOn(PriceSchedules, 'Create').and.returnValue(defer.promise);
                priceScheduleCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the PriceSchedules Create method', inject(function(PriceSchedules) {
                expect(PriceSchedules.Create).toHaveBeenCalledWith(priceSchedule);
            }));
            it ('should enter the priceSchedules state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('priceSchedules', {}, {reload:true});
            }));
        });
    });
});



