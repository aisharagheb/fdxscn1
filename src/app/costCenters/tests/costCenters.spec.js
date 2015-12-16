describe('Component: CostCenters', function() {
    var scope,
        q,
        costCenter;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        costCenter = {
            ID: "TestCostCenter123456789",
            Name: "TestCostCenterTest",
            Description: "Test Cost Center Description"
        };
    }));

    describe('State: costCenters', function() {
        var state;
        beforeEach(inject(function($state, CostCenters) {
            state = $state.get('costCenters');
            spyOn(CostCenters, 'List').and.returnValue(null);
        }));
        it('should resolve CostCenterList', inject(function ($injector, CostCenters) {
            $injector.invoke(state.resolve.CostCenterList);
            expect(CostCenters.List).toHaveBeenCalled();
        }));
    });

    describe('State: costCenters.edit', function() {
        var state;
        beforeEach(inject(function($state, CostCenters) {
            state = $state.get('costCenters.edit');
            var defer = q.defer();
            defer.resolve();
            spyOn(CostCenters, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedCostCenter', inject(function ($injector, $stateParams, CostCenters) {
            $injector.invoke(state.resolve.SelectedCostCenter);
            expect(CostCenters.Get).toHaveBeenCalledWith($stateParams.costCenterid);
        }));
    });

    describe('State: costCenters.assign', function() {
        var state;
        beforeEach(inject(function($state, CostCenters, UserGroups, Buyers) {
            state = $state.get('costCenters.assign');
            spyOn(Buyers, 'Get').and.returnValue(null);
            spyOn(UserGroups, 'List').and.returnValue(null);
            spyOn(CostCenters, 'ListAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(CostCenters, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve Buyer', inject(function ($injector, Buyers) {
            $injector.invoke(state.resolve.Buyer);
            expect(Buyers.Get).toHaveBeenCalled();
        }));
        it('should resolve UserGroupList', inject(function ($injector, UserGroups) {
            $injector.invoke(state.resolve.UserGroupList);
            expect(UserGroups.List).toHaveBeenCalled();
        }));
        it('should resolve AssignmentsList', inject(function ($injector, $stateParams, CostCenters) {
            $injector.invoke(state.resolve.AssignedUserGroups);
            expect(CostCenters.ListAssignments).toHaveBeenCalledWith($stateParams.costCenterid);
        }));
        it('should resolve SelectedCostCenter', inject(function ($injector, $stateParams, CostCenters) {
            $injector.invoke(state.resolve.SelectedCostCenter);
            expect(CostCenters.Get).toHaveBeenCalledWith($stateParams.costCenterid);
        }));
    });

    describe('Controller: CostCenterEditCtrl', function() {
        var costCenterEditCtrl;
        beforeEach(inject(function($state, $controller) {
            costCenterEditCtrl = $controller('CostCenterEditCtrl', {
                $scope: scope,
                SelectedCostCenter: costCenter
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(CostCenters) {
                costCenterEditCtrl.costCenter = costCenter;
                costCenterEditCtrl.costCenterID = "TestCostCenter123456789";
                var defer = q.defer();
                defer.resolve(costCenter);
                spyOn(CostCenters, 'Update').and.returnValue(defer.promise);
                costCenterEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the CostCenters Update method', inject(function(CostCenters) {
                expect(CostCenters.Update).toHaveBeenCalledWith(costCenterEditCtrl.costCenterID, costCenterEditCtrl.costCenter);
            }));
            it ('should enter the costCenters state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('costCenters', {}, {reload:true});
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(CostCenters) {
                var defer = q.defer();
                defer.resolve(costCenter);
                spyOn(CostCenters, 'Delete').and.returnValue(defer.promise);
                costCenterEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the CostCenters Delete method', inject(function(CostCenters) {
                expect(CostCenters.Delete).toHaveBeenCalledWith(costCenter.ID);
            }));
            it ('should enter the costCenters state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('costCenters', {}, {reload:true});
            }));
        });
    });

    describe('Controller: CostCenterCreateCtrl', function() {
        var costCenterCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            costCenterCreateCtrl = $controller('CostCenterCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(CostCenters) {
                costCenterCreateCtrl.costCenter = costCenter;
                var defer = q.defer();
                defer.resolve(costCenter);
                spyOn(CostCenters, 'Create').and.returnValue(defer.promise);
                costCenterCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the CostCenters Create method', inject(function(CostCenters) {
                expect(CostCenters.Create).toHaveBeenCalledWith(costCenter);
            }));
            it ('should enter the costCenters state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('costCenters', {}, {reload:true});
            }));
        });
    });

    describe('Controller: CostCenterAssignCtrl', function() {
        var costCenterAssignCtrl;
        beforeEach(inject(function($state, $controller) {
            costCenterAssignCtrl = $controller('CostCenterAssignCtrl', {
                $scope: scope,
                UserGroupList: [],
                AssignedUserGroups: [],
                SelectedCostCenter: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignment', function() {
            beforeEach(inject(function(Assignments) {
                var defer = q.defer();
                defer.resolve();
                spyOn(Assignments, 'saveAssignments').and.returnValue(defer.promise);
                costCenterAssignCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('PagingFunction', function() {
            beforeEach(inject(function(Paging) {
                spyOn(Paging, 'paging').and.returnValue(null);
                costCenterAssignCtrl.pagingfunction();
            }));
            it ('should call the Paging paging method', inject(function(Paging) {
                expect(Paging.paging).toHaveBeenCalled();
            }));
        });
    });
});

