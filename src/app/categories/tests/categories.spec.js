describe('Component: Categories', function() {
    var scope,
        q,
        category;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        category = {
            ID: "TestCategory123456789",
            Name: "TestCategoryTest",
            Description: "Test Category Description",
            ListOrder: 1,
            Active: true
        };
    }));

    describe('State: categories', function() {
        var state;
        beforeEach(inject(function($state, Categories) {
            state = $state.get('categories');
            spyOn(Categories, 'List').and.returnValue(null);
        }));
        it('should resolve CategoryList', inject(function ($injector, Categories) {
            $injector.invoke(state.resolve.CategoryList);
            expect(Categories.List).toHaveBeenCalled();
        }));
    });

    describe('State: categories.edit', function() {
        var state;
        beforeEach(inject(function($state, Categories) {
            state = $state.get('categories.edit');
            var defer = q.defer();
            defer.resolve();
            spyOn(Categories, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedCategory', inject(function ($injector, $stateParams, Categories) {
            $injector.invoke(state.resolve.SelectedCategory);
            expect(Categories.Get).toHaveBeenCalledWith($stateParams.categoryid);
        }));
    });

    describe('State: categories.assignParty', function() {
        var state;
        beforeEach(inject(function($state, Categories, UserGroups) {
            state = $state.get('categories.assignParty');
            spyOn(UserGroups, 'List').and.returnValue(null);
            spyOn(Categories, 'ListAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(Categories, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve UserGroupList', inject(function ($injector, UserGroups) {
            $injector.invoke(state.resolve.UserGroupList);
            expect(UserGroups.List).toHaveBeenCalled();
        }));
        it('should resolve AssignedUserGroups', inject(function ($injector, $stateParams, Categories) {
            $injector.invoke(state.resolve.AssignedUserGroups);
            expect(Categories.ListAssignments).toHaveBeenCalledWith($stateParams.categoryid);
        }));
        it('should resolve SelectedCategory', inject(function ($injector, $stateParams, Categories) {
            $injector.invoke(state.resolve.SelectedCategory);
            expect(Categories.Get).toHaveBeenCalledWith($stateParams.categoryid);
        }));
    });

    describe('State: categories.assignProduct', function() {
        var state;
        beforeEach(inject(function($state, Categories, Products) {
            state = $state.get('categories.assignProduct');
            spyOn(Products, 'List').and.returnValue(null);
            spyOn(Categories, 'ListProductAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(Categories, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve ProductList', inject(function ($injector, Products) {
            $injector.invoke(state.resolve.ProductList);
            expect(Products.List).toHaveBeenCalled();
        }));
        it('should resolve ProductAssignments', inject(function ($injector, $stateParams, Categories) {
            $injector.invoke(state.resolve.ProductAssignments);
            expect(Categories.ListProductAssignments).toHaveBeenCalledWith($stateParams.categoryid);
        }));
        it('should resolve SelectedCategory', inject(function ($injector, $stateParams, Categories) {
            $injector.invoke(state.resolve.SelectedCategory);
            expect(Categories.Get).toHaveBeenCalledWith($stateParams.categoryid);
        }));
    });

    describe('Controller: CategoryEditCtrl', function() {
        var categoryEditCtrl;
        beforeEach(inject(function($state, $controller) {
            categoryEditCtrl = $controller('CategoryEditCtrl', {
                $scope: scope,
                SelectedCategory: category
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Categories) {
                categoryEditCtrl.category = category;
                categoryEditCtrl.categoryID = "TestCategory123456789";
                var defer = q.defer();
                defer.resolve(category);
                spyOn(Categories, 'Update').and.returnValue(defer.promise);
                categoryEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Categories Update method', inject(function(Categories) {
                expect(Categories.Update).toHaveBeenCalledWith(categoryEditCtrl.categoryID, categoryEditCtrl.category);
            }));
            it ('should enter the categories state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('categories', {}, {reload:true});
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(Categories) {
                var defer = q.defer();
                defer.resolve(category);
                spyOn(Categories, 'Delete').and.returnValue(defer.promise);
                categoryEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the Categories Delete method', inject(function(Categories) {
                expect(Categories.Delete).toHaveBeenCalledWith(category.ID);
            }));
            it ('should enter the categories state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('categories', {}, {reload:true});
            }));
        });
    });

    describe('Controller: CategoryCreateCtrl', function() {
        var categoryCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            categoryCreateCtrl = $controller('CategoryCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Categories) {
                categoryCreateCtrl.category = category;
                var defer = q.defer();
                defer.resolve(category);
                spyOn(Categories, 'Create').and.returnValue(defer.promise);
                categoryCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Categories Create method', inject(function(Categories) {
                expect(Categories.Create).toHaveBeenCalledWith(category);
            }));
            it ('should enter the categories state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('categories', {}, {reload:true});
            }));
        });
    });

    describe('Controller: CategoryTreeCtrl', function() {
        var categoryTreeCtrl;
        beforeEach(inject(function($state, $controller, CategoryTreeService) {
            categoryTreeCtrl = $controller('CategoryTreeCtrl', {
                $scope: scope,
                CategoryTreeService: CategoryTreeService,
                Catalog: {},
                Tree: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('treeOptions.dropped', function() {
            beforeEach(inject(function(CategoryTreeService) {
                spyOn(CategoryTreeService, 'UpdateCategoryNode').and.returnValue(null);
                categoryTreeCtrl.treeOptions.dropped();
            }));
            it ('should call the CategoryTreeService UpdateCategoryNode method', inject(function(CategoryTreeService) {
                expect(CategoryTreeService.UpdateCategoryNode).toHaveBeenCalled();
            }));
        });

        describe('toggle', function() {
            var test;
            beforeEach(inject(function() {
                var bool = {
                    toggle: function() {
                        test = true;
                    }
                };
                categoryTreeCtrl.toggle(bool);

            }));
            it ('should call scope toggle method', function() {
                expect(test).toBe(true);
            });
        });
    });

    describe('Controller: CategoryAssignPartyCtrl', function() {
        var categoryAssignCtrl;
        beforeEach(inject(function($state, $controller) {
            categoryAssignCtrl = $controller('CategoryAssignPartyCtrl', {
                $scope: scope,
                UserGroupList: [],
                AssignedUserGroups: [],
                SelectedCategory: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignment', function() {
            beforeEach(inject(function(Assignments) {
                spyOn(Assignments, 'saveAssignments').and.returnValue(null);
                categoryAssignCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('PagingFunction', function() {
            beforeEach(inject(function(Paging) {
                spyOn(Paging, 'paging').and.returnValue(null);
                categoryAssignCtrl.pagingfunction();
            }));
            it ('should call the Paging paging method', inject(function(Paging) {
                expect(Paging.paging).toHaveBeenCalled();
            }));
        });
    });

    describe('Controller: CategoryAssignProductCtrl', function() {
        var categoryAssignProductCtrl;
        beforeEach(inject(function($state, $controller) {
            categoryAssignProductCtrl = $controller('CategoryAssignProductCtrl', {
                $scope: scope,
                ProductList: [],
                ProductAssignments: [],
                SelectedCategory: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignment', function() {
            beforeEach(inject(function(Assignments) {
                spyOn(Assignments, 'saveAssignments').and.returnValue(null);
                categoryAssignProductCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('PagingFunction', function() {
            beforeEach(inject(function(Paging) {
                spyOn(Paging, 'paging').and.returnValue(null);
                categoryAssignProductCtrl.pagingfunction();
            }));
            it ('should call the Paging paging method', inject(function(Paging) {
                expect(Paging.paging).toHaveBeenCalled();
            }));
        });
    });

    describe('Factory: CategoryTreeService', function() {
        var treeService;
        beforeEach(inject(function(CategoryTreeService, Categories) {
            treeService = CategoryTreeService;
            var defer = q.defer();
            defer.resolve({Items: [], Meta: {}});
            spyOn(Categories, 'List').and.returnValue(defer.promise);
        }));

        describe('GetCategoryTree', function() {
            beforeEach(function() {
                treeService.GetCategoryTree();
            });

            it ('should call the Categories List method', inject(function(Categories) {
                expect(Categories.List).toHaveBeenCalledWith(null, 'all', 1, 100);
            }));
        });
    });
});

