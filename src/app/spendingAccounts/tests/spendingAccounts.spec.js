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

    describe('State: spendingAccounts', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts) {
            state = $state.get('spendingAccounts');
            spyOn(SpendingAccounts, 'List').and.returnValue(null);
        }));
        it('should resolve SpendingAccountList', inject(function ($injector, SpendingAccounts) {
            $injector.invoke(state.resolve.SpendingAccountList);
            expect(SpendingAccounts.List).toHaveBeenCalledWith(null, null, null, null, null, {'RedemptionCode': '!*'});
        }));
    });

    describe('State: spendingAccounts.edit', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts) {
            state = $state.get('spendingAccounts.edit');
            spyOn(SpendingAccounts, 'Get').and.returnValue(null);
        }));
        it('should resolve SelectedSpendingAccount', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.SelectedSpendingAccount);
            expect(SpendingAccounts.Get).toHaveBeenCalledWith($stateParams.spendingAccountid);
        }));
    });

    describe('State: spendingAccounts.assignGroup', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts, UserGroups) {
            state = $state.get('spendingAccounts.assignGroup');
            spyOn(UserGroups, 'List').and.returnValue(null);
            spyOn(SpendingAccounts, 'ListAssignments').and.returnValue(null);
            spyOn(SpendingAccounts, 'Get').and.returnValue(null);
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

    describe('State: spendingAccounts.assignUser', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts, Users) {
            state = $state.get('spendingAccounts.assignUser');
            spyOn(Users, 'List').and.returnValue(null);
            spyOn(SpendingAccounts, 'Get').and.returnValue(null);
            spyOn(SpendingAccounts, 'ListAssignments').and.returnValue(null);
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
                expect($state.go).toHaveBeenCalledWith('spendingAccounts', {}, {reload:true});
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
                expect($state.go).toHaveBeenCalledWith('spendingAccounts', {}, {reload:true});
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
                expect(SpendingAccounts.Create).toHaveBeenCalledWith(spendingAccountCreateCtrl.spendingAccount);
            }));
            it ('should enter the spendingAccounts state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('spendingAccounts', {}, {reload:true});
            }));
        });
    });

    describe('Controller: SpendingAccountAssignGroupCtrl', function() {
        var spendingAccountAssignGroupCtrl;
        beforeEach(inject(function($state, $controller) {
            spendingAccountAssignGroupCtrl = $controller('SpendingAccountAssignGroupCtrl', {
                $scope: scope,
                UserGroupList: [],
                AssignedUserGroups: [],
                SelectedSpendingAccount: {}

            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignments', function() {
            beforeEach(inject(function(SpendingAccountAssignment) {
                spyOn(SpendingAccountAssignment, 'saveAssignments').and.returnValue(null);
                spendingAccountAssignGroupCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(SpendingAccountAssignment) {
                expect(SpendingAccountAssignment.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('pagingfunction', function() {
            beforeEach(inject(function(SpendingAccountAssignment) {
                spyOn(SpendingAccountAssignment, 'paging').and.returnValue(null);
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
        beforeEach(inject(function($state, $controller) {
            spendingAccountAssignUserCtrl = $controller('SpendingAccountAssignUserCtrl', {
                $scope: scope,
                UserList: [],
                AssignedUsers: [],
                SelectedSpendingAccount: {},

            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignments', function() {
            beforeEach(inject(function(SpendingAccountAssignment) {
                spyOn(SpendingAccountAssignment, 'saveAssignments').and.returnValue(null);
                spendingAccountAssignUserCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(SpendingAccountAssignment) {
                expect(SpendingAccountAssignment.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('pagingfunction', function() {
            beforeEach(inject(function(SpendingAccountAssignment) {
                spyOn(SpendingAccountAssignment, 'paging').and.returnValue(null);
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

    describe('Factory: SpendingAccountAssignment', function(){
       var spendingAccountAssignment, sampleList, assignments;
        beforeEach(inject(function(SpendingAccountAssignment, Assignments, $state){
            spendingAccountAssignment = SpendingAccountAssignment;
            sampleList = [{ID: 1, selected: true}, {ID: 2, selected: false}, {ID: 3}];
            assignments = Assignments;
            spyOn($state, 'reload').and.returnValue(true);
        }));
        it('getAssigned should return a list of IDs', function() {
            var result = assignments.getAssigned(sampleList, 'ID');
            expect(result).toEqual([1, 2, 3]);
        });
        it('getSelected should return a list of IDs that also have selected set to true', function() {
            var result = assignments.getSelected(sampleList, 'ID');
            expect(result).toEqual([1]);
        });
        it('getUnselected should return a list of IDs where selected is false or undefined', function() {
            var result = assignments.getUnselected(sampleList, 'ID');
            expect(result).toEqual([2, 3]);
        });
        it('getToAssign should return a list of IDs that are different between the two lists', function() {
            var result = assignments.getToAssign(sampleList, [], 'ID');
            expect(result).toEqual([1]);
        });
        it('getToDelete should return a list of IDs that are the same between the two lists', function() {
            var result = assignments.getToDelete(sampleList, [{ID: 2}], 'ID');
            expect(result).toEqual([2]);
        });

        describe('saveAssignments', function() {
            var state,
                saveFunc,
                deleteFunc,
                saveCount, deleteCount;
            beforeEach(inject(function($state) {
                state = $state;
                saveCount = deleteCount = 0;
                saveFunc = function() {
                    saveCount++;
                };
                deleteFunc = function() {
                    deleteCount++;
                };
                assignments.saveAssignments(
                    [{ID: 1, selected: true}, {ID: 2, selected: true}, {ID: 3, selected: false}, {ID: 4, selected: false}],
                    [{ID: 3}, {ID: 4}],
                    saveFunc, deleteFunc, 'ID');
                scope.$digest();
            }));
            it('should call the saveFunc twice', function() {
                expect(saveCount).toBe(2);
            });
            it('should call the deleteFunc twice', function() {
                expect(deleteCount).toBe(2);
            });
            it('should call the state reload function on the current state', function() {
                expect(state.reload).toHaveBeenCalledWith(state.current);
            });
        });
    });

});

