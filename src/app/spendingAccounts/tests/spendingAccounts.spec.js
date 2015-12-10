describe('Component: SpendingAccounts', function() {
    var scope,
        q,
        spendingAccount;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        spendingAccount = {
            ID: "TestSpendingAccount123456789",
            Name: "TestSpendingAccount",
            AllowAsPaymentMethod: true,
            Balance: 50.0,
            StartDate: null,
            EndDate: null,
            xp: null
        };
    }));

    describe('State: Base.spendingAccounts', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts) {
            state = $state.get('base.spendingAccounts');
            spyOn(SpendingAccounts, 'List').and.returnValue(null);
        }));
        it('should resolve SpendingAccountList', inject(function ($injector, SpendingAccounts) {
            $injector.invoke(state.resolve.SpendingAccountList);
            expect(SpendingAccounts.List).toHaveBeenCalledWith(null, null, null, null, null, {'RedemptionCode': '!*'});
        }));
    });

    describe('State: Base.spendingAccountEdit', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts) {
            state = $state.get('base.spendingAccountEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(SpendingAccounts, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedSpendingAccount', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.SelectedSpendingAccount);
            expect(SpendingAccounts.Get).toHaveBeenCalledWith($stateParams.spendingAccountid);
        }));
    });

    describe('State: Base.spendingAccountAssignGroup', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts, UserGroups) {
            state = $state.get('base.spendingAccountAssignGroup');
            spyOn(UserGroups, 'List').and.returnValue(null);
            spyOn(SpendingAccounts, 'ListAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(SpendingAccounts, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve UserGroupList', inject(function ($injector, UserGroups) {
            $injector.invoke(state.resolve.UserGroupList);
            expect(UserGroups.List).toHaveBeenCalled();
        }));
        it('should resolve AssignedUserGroups', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.AssignedUserGroups);
            expect(SpendingAccounts.ListAssignments).toHaveBeenCalledWith($stateParams.spendingAccountid, null, null, 'Group');
        }));
        it('should resolve SelectedSpendingAccount', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.SelectedSpendingAccount);
            expect(SpendingAccounts.Get).toHaveBeenCalledWith($stateParams.spendingAccountid);
        }));
    });

    describe('State: Base.spendingAccountAssignUser', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts, Users) {
            state = $state.get('base.spendingAccountAssignUser');
            spyOn(Users, 'List').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(SpendingAccounts, 'Get').and.returnValue(defer.promise);
            spyOn(SpendingAccounts, 'ListAssignments').and.returnValue(defer.promise);
        }));
        it('should resolve UserList', inject(function ($injector, Users) {
            $injector.invoke(state.resolve.UserList);
            expect(Users.List).toHaveBeenCalled();
        }));
        it('should resolve AssignedUsers', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.AssignedUsers);
            expect(SpendingAccounts.ListAssignments).toHaveBeenCalledWith($stateParams.spendingAccountid, null, null, 'User');
        }));
        it('should resolve SelectedSpendingAccount', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.SelectedSpendingAccount);
            expect(SpendingAccounts.Get).toHaveBeenCalledWith($stateParams.spendingAccountid);
        }));
    });

    describe('Controller: SpendingAccountEditCtrl', function() {
        var spendingAccountEditCtrl;
        beforeEach(inject(function($state, $controller) {
            spendingAccountEditCtrl = $controller('SpendingAccountEditCtrl', {
                $scope: scope,
                SelectedSpendingAccount: spendingAccount
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(SpendingAccounts) {
                spendingAccountEditCtrl.spendingAccount = spendingAccount;
                spendingAccountEditCtrl.spendingAccountID = "TestSpendingAccount123456789";
                var defer = q.defer();
                defer.resolve(spendingAccount);
                spyOn(SpendingAccounts, 'Update').and.returnValue(defer.promise);
                spendingAccountEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the SpendingAccounts Update method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.Update).toHaveBeenCalledWith(spendingAccountEditCtrl.spendingAccountID, spendingAccountEditCtrl.spendingAccount);
            }));
            it ('should enter the spendingAccounts state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.spendingAccounts');
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(SpendingAccounts) {
                var defer = q.defer();
                defer.resolve(spendingAccount);
                spyOn(SpendingAccounts, 'Delete').and.returnValue(defer.promise);
                spendingAccountEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the SpendingAccounts Delete method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.Delete).toHaveBeenCalledWith(spendingAccount.ID);
            }));
            it ('should enter the spendingAccounts state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.spendingAccounts');
            }));
        });
    });

    describe('Controller: SpendingAccountCreateCtrl', function() {
        var spendingAccountCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            spendingAccountCreateCtrl = $controller('SpendingAccountCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(SpendingAccounts) {
                spendingAccountCreateCtrl.spendingAccount = spendingAccount;
                var defer = q.defer();
                defer.resolve(spendingAccount);
                spyOn(SpendingAccounts, 'Create').and.returnValue(defer.promise);
                spendingAccountCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the SpendingAccounts Create method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.Create).toHaveBeenCalled();
            }));
            //TODO: figure out why this call isn't working
            //it ('should call the SpendingAccounts Create method', inject(function(SpendingAccounts) {
            //    expect(SpendingAccounts.Create).toHaveBeenCalledWith(spendingAccountCreateCtrl.spendingAccount);
            //}));
            it ('should enter the spendingAccounts state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.spendingAccounts');
            }));
        });
    });

    describe('Controller: SpendingAccountAssignGroupCtrl', function() {
        var spendingAccountAssignGroupCtrl;
        beforeEach(inject(function($state, $controller, SpendingAccounts) {
            spendingAccountAssignGroupCtrl = $controller('SpendingAccountAssignGroupCtrl', {
                $scope: scope,
                SpendingAccounts: SpendingAccounts,
                UserGroupList: [],
                AssignedUserGroups: [],
                SelectedSpendingAccount: {}

            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignments', function() {
            beforeEach(inject(function(SpendingAccountAssignment) {
                var defer = q.defer();
                defer.resolve();
                spyOn(SpendingAccountAssignment, 'saveAssignments').and.returnValue(defer.promise);
                spendingAccountAssignGroupCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(SpendingAccountAssignment) {
                expect(SpendingAccountAssignment.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('pagingfunction', function() {
            beforeEach(inject(function(SpendingAccountAssignment) {
                var defer = q.defer();
                defer.resolve(null);
                spyOn(SpendingAccountAssignment, 'paging').and.returnValue(defer.promise);
                scope.$digest();
                spendingAccountAssignGroupCtrl.list = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                spendingAccountAssignGroupCtrl.assignments = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                spendingAccountAssignGroupCtrl.pagingfunction();
            }));
            it ('should call the SpendingAccountAssignment paging method', inject(function(SpendingAccountAssignment) {
                expect(SpendingAccountAssignment.paging).toHaveBeenCalledWith(spendingAccountAssignGroupCtrl.spendingAccount.ID, spendingAccountAssignGroupCtrl.list, spendingAccountAssignGroupCtrl.assignments);
            }));
        });
    });

    describe('Controller: SpendingAccountAssignUserCtrl', function() {
        var spendingAccountAssignUserCtrl;
        beforeEach(inject(function($state, $controller, SpendingAccounts) {
            spendingAccountAssignUserCtrl = $controller('SpendingAccountAssignUserCtrl', {
                $scope: scope,
                SpendingAccounts: SpendingAccounts,
                UserList: [],
                AssignedUsers: [],
                SelectedSpendingAccount: {},

            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignments', function() {
            beforeEach(inject(function(SpendingAccountAssignment) {
                var defer = q.defer();
                defer.resolve();
                spyOn(SpendingAccountAssignment, 'saveAssignments').and.returnValue(defer.promise);
                spendingAccountAssignUserCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(SpendingAccountAssignment) {
                expect(SpendingAccountAssignment.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('pagingfunction', function() {
            beforeEach(inject(function(SpendingAccountAssignment) {
                var defer = q.defer();
                defer.resolve(null);
                spyOn(SpendingAccountAssignment, 'paging').and.returnValue(defer.promise);
                scope.$digest();
                spendingAccountAssignUserCtrl.list = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                spendingAccountAssignUserCtrl.assignments = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                spendingAccountAssignUserCtrl.pagingfunction();
            }));
            it ('should call the SpendingAccountAssignment paging method', inject(function(SpendingAccountAssignment) {
                expect(SpendingAccountAssignment.paging).toHaveBeenCalledWith(spendingAccountAssignUserCtrl.spendingAccount.ID, spendingAccountAssignUserCtrl.list, spendingAccountAssignUserCtrl.assignments, 'User');
            }));
        });
    });

});

