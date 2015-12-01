describe('Component: Specs,', function() {
    var scope,
        q,
        spec;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        spec = {
            ID: "TestSpec123456789",
            Name: "TestSpecTest",
            ListOrder: 1,
            Required: false,
            DefinesVariant: false,
            AllowOpenText: false,
            Options: [
                {
                    ID: "TestSpecOpt123456789",
                    Value: "1",
                    ListOrder: 0,
                    IsOpenText: false,
                    PriceMarkupType: null,
                    PriceMarkup: null,
                }
            ]
        };
    }));

    describe('State: Base.specs,', function() {
        var state;
        beforeEach(inject(function($state, Specs) {
            state = $state.get('base.specs');
            spyOn(Specs, 'List').and.returnValue(null);
        }));
        it('should resolve SpecList', inject(function ($injector, Specs) {
            $injector.invoke(state.resolve.SpecList);
            expect(Specs.List).toHaveBeenCalled();
        }));
    });

    describe('State: Base.specEdit,', function() {
        var state;
        beforeEach(inject(function($state, Specs) {
            state = $state.get('base.specEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(Specs, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedSpec', inject(function ($injector, $stateParams, Specs) {
            $injector.invoke(state.resolve.SelectedSpec);
            expect(Specs.Get).toHaveBeenCalledWith($stateParams.specid);
        }));
    });

    describe('State: Base.specAssign,', function() {
        var state;
        beforeEach(inject(function($state, Specs, Products) {
            state = $state.get('base.specAssign');
            spyOn(Products, 'List').and.returnValue(null);
            spyOn(Specs, 'ListProductAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(Specs, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve ProductList', inject(function ($injector, $stateParams, Products) {
            $injector.invoke(state.resolve.ProductList);
            expect(Products.List).toHaveBeenCalledWith(null, 1, 20);
        }));
        it('should resolve ProductAssignments', inject(function ($injector, $stateParams, Specs) {
            $injector.invoke(state.resolve.ProductAssignments);
            expect(Specs.ListProductAssignments).toHaveBeenCalledWith($stateParams.specid);
        }));
        it('should resolve SelectedSpec', inject(function ($injector, $stateParams, Specs) {
            $injector.invoke(state.resolve.SelectedSpec);
            expect(Specs.Get).toHaveBeenCalledWith($stateParams.specid);
        }));
    });

    describe('Controller: SpecEditCtrl,', function() {
        var specEditCtrl;
        beforeEach(inject(function($state, $controller, Specs) {
            specEditCtrl = $controller('SpecEditCtrl', {
                $scope: scope,
                Specs: Specs,
                SelectedSpec: spec
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Specs) {
                specEditCtrl.spec = spec;
                specEditCtrl.specID = "TestSpec123456789";
                var defer = q.defer();
                defer.resolve(spec);
                spyOn(Specs, 'Update').and.returnValue(defer.promise);
                specEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Specs Update method', inject(function(Specs) {
                expect(Specs.Update).toHaveBeenCalledWith(specEditCtrl.specID, specEditCtrl.spec);
            }));
            it ('should enter the specs state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.specs');
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(Specs) {
                var defer = q.defer();
                defer.resolve(spec);
                spyOn(Specs, 'Delete').and.returnValue(defer.promise);
                specEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the Specs Delete method', inject(function(Specs) {
                expect(Specs.Delete).toHaveBeenCalledWith(spec.ID);
            }));
            it ('should enter the specs state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.specs');
            }));
        });
    });

    describe('Controller: SpecCreateCtrl,', function() {
        var specCreateCtrl;
        beforeEach(inject(function($state, $controller, Specs) {
            specCreateCtrl = $controller('SpecCreateCtrl', {
                $scope: scope,
                Specs: Specs
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Specs) {
                specCreateCtrl.spec = spec;
                var defer = q.defer();
                defer.resolve(spec);
                spyOn(Specs, 'Create').and.returnValue(defer.promise);
                specCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Specs Create method', inject(function(Specs) {
                expect(Specs.Create).toHaveBeenCalledWith(spec);
            }));
            it ('should enter the specs state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.specs');
            }));
        });
    });
    
    describe('Controller: SpecAssignCtrl,', function() {
        var specAssignCtrl;
        beforeEach(inject(function($state, $controller, Specs) {
            specAssignCtrl = $controller('SpecAssignCtrl', {
                $scope: scope,
                Specs: Specs,
                ProductList: [],
                ProductAssignments: [],
                SelectedSpec: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignment', function() {
            beforeEach(inject(function(Assignments) {
                var defer = q.defer();
                defer.resolve();
                spyOn(Assignments, 'saveAssignments').and.returnValue(defer.promise);
                specAssignCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('PagingFunction', function() {
            beforeEach(inject(function(Paging) {
                var defer = q.defer();
                defer.resolve();
                spyOn(Paging, 'paging').and.returnValue(defer.promise);
                specAssignCtrl.pagingfunction();
            }));
            it ('should call the Paging paging method', inject(function(Paging) {
                expect(Paging.paging).toHaveBeenCalled();
            }));
        });
    });
});

