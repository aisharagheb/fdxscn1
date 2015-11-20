describe('Component: PriceSchedules,', function() {
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

    describe('State: Base.priceSchedules,', function() {
        var state;
        beforeEach(inject(function($state, PriceSchedules) {
            state = $state.get('base.priceSchedules');
            spyOn(PriceSchedules, 'List').and.returnValue(null);
        }));
        it('should resolve PriceScheduleList', inject(function ($injector, PriceSchedules) {
            $injector.invoke(state.resolve.PriceScheduleList);
            expect(PriceSchedules.List).toHaveBeenCalled();
        }));
    });

    describe('State: Base.priceScheduleEdit,', function() {
        var state;
        beforeEach(inject(function($state, PriceSchedules) {
            state = $state.get('base.priceScheduleEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(PriceSchedules, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedPriceSchedule', inject(function ($injector, $stateParams, PriceSchedules) {
            $injector.invoke(state.resolve.SelectedPriceSchedule);
            expect(PriceSchedules.Get).toHaveBeenCalledWith($stateParams.priceScheduleid);
        }));
    });


    describe('Controller: PriceScheduleEditCtrl,', function() {
        var priceScheduleEditCtrl;
        beforeEach(inject(function($state, $controller, PriceSchedules) {
            priceScheduleEditCtrl = $controller('PriceScheduleEditCtrl', {
                $scope: scope,
                PriceSchedules: PriceSchedules,
                SelectedPriceSchedule: priceSchedule
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('addPriceBreak', function() {
            beforeEach(inject(function(PriceBreak) {
                priceScheduleEditCtrl.priceSchedule = priceSchedule;
                var defer = q.defer();
                defer.resolve(priceSchedule);
                spyOn(PriceBreak, 'addPriceBreak').and.returnValue(defer.promise);
                priceScheduleEditCtrl.addPriceBreak();
                scope.$digest();
            }));
            it ('should call the PriceBreak addPriceBreak method', inject(function(PriceBreak) {
                expect(PriceBreak.addPriceBreak).toHaveBeenCalled();
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
                expect($state.go).toHaveBeenCalledWith('base.priceSchedules');
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
                expect($state.go).toHaveBeenCalledWith('base.priceSchedules');
            }));
        });
    });

    describe('Controller: PriceScheduleCreateCtrl,', function() {
        var priceScheduleCreateCtrl;
        beforeEach(inject(function($state, $controller, PriceSchedules) {
            priceScheduleCreateCtrl = $controller('PriceScheduleCreateCtrl', {
                $scope: scope,
                PriceSchedules: PriceSchedules
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('addPriceBreak', function() {
            beforeEach(inject(function(PriceBreak) {
                priceScheduleCreateCtrl.priceSchedule = priceSchedule;
                var defer = q.defer();
                defer.resolve(priceSchedule);
                spyOn(PriceBreak, 'addPriceBreak').and.returnValue(defer.promise);
                priceScheduleCreateCtrl.addPriceBreak();
                scope.$digest();
            }));
            it ('should call the PriceBreak addPriceBreak method', inject(function(PriceBreak) {
                expect(PriceBreak.addPriceBreak).toHaveBeenCalled();
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
                expect($state.go).toHaveBeenCalledWith('base.priceSchedules');
            }));
        });
    });
});



