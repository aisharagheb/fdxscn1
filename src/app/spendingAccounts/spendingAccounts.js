angular.module( 'orderCloud' )

    .config( SpendingAccountsConfig )
    .controller( 'SpendingAccountsCtrl', SpendingAccountsController )
    .controller( 'SpendingAccountEditCtrl', SpendingAccountEditController )
    .controller( 'SpendingAccountCreateCtrl', SpendingAccountCreateController )
    .controller( 'SpendingAccountAssignGroupCtrl', SpendingAccountAssignGroupController )
    .controller( 'SpendingAccountAssignUserCtrl', SpendingAccountAssignUserController )
    .factory('SpendingAccountAssignment', SpendingAccountAssignment)

;

function SpendingAccountsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.spendingAccounts', {
            url: '/spendingAccounts',
            templateUrl:'spendingAccounts/templates/spendingAccounts.tpl.html',
            controller:'SpendingAccountsCtrl',
            controllerAs: 'spendingAccounts',
            data: {componentName: 'Spending Accounts'},
            resolve: {
                SpendingAccountList: function(SpendingAccounts) {
                    return SpendingAccounts.List();
                }
            }
        })
        .state( 'base.spendingAccountEdit', {
            url: '/spendingAccounts/:spendingAccountid/edit',
            templateUrl:'spendingAccounts/templates/spendingAccountEdit.tpl.html',
            controller:'SpendingAccountEditCtrl',
            controllerAs: 'spendingAccountEdit',
            resolve: {
                SelectedSpendingAccount: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.spendingAccountid);
                }
            }
        })
        .state( 'base.spendingAccountCreate', {
            url: '/spendingAccounts/create',
            templateUrl:'spendingAccounts/templates/spendingAccountCreate.tpl.html',
            controller:'SpendingAccountCreateCtrl',
            controllerAs: 'spendingAccountCreate'
        })
        .state( 'base.spendingAccountAssignGroup', {
            url: '/spendingAccounts/:spendingAccountid/assign',
            templateUrl: 'spendingAccounts/templates/spendingAccountAssignGroup.tpl.html',
            controller: 'SpendingAccountAssignGroupCtrl',
            controllerAs: 'spendingAccountAssignGroup',
            resolve: {
                UserGroupList: function(UserGroups) {
                    return UserGroups.List();
                },
                AssignmentList: function(SpendingAccounts) {
                    return SpendingAccounts.ListAssignments();
                },
                SpendingAccount: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.spendingAccountid);
                }
            }
        })
        .state( 'base.spendingAccountAssignUser', {
            url: '/spendingAccounts/:spendingAccountid/assign/user',
            templateUrl: 'spendingAccounts/templates/spendingAccountAssignUser.tpl.html',
            controller: 'SpendingAccountAssignUserCtrl',
            controllerAs: 'spendingAccountAssignUser',
            resolve: {
                UserList: function(Users) {
                    return Users.List();
                },
                AssignmentList: function(SpendingAccounts) {
                    return SpendingAccounts.ListAssignments();
                },
                SpendingAccount: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.spendingAccountid);
                }
            }
        });
}

function SpendingAccountsController( SpendingAccountList ) {
    var vm = this;
    vm.list = SpendingAccountList;
}

function SpendingAccountEditController( $exceptionHandler, $state, SelectedSpendingAccount, SpendingAccounts ) {
    var vm = this,
        spendingaccountid = SelectedSpendingAccount.ID;
    vm.spendingAccountName = SelectedSpendingAccount.Name;
    vm.spendingAccount = SelectedSpendingAccount;

    vm.Submit = function() {
        SpendingAccounts.Update(spendingaccountid, vm.spendingAccount)
            .then(function() {
                $state.go('^.spendingAccounts')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        SpendingAccounts.Delete(spendingaccountid)
            .then(function() {
                $state.go('^.spendingAccounts')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function SpendingAccountCreateController( $exceptionHandler, $state, SpendingAccounts ) {
    var vm = this;
    vm.spendingAccount = {};

    vm.Submit = function() {
        SpendingAccounts.Create(vm.spendingAccount)
            .then(function() {
                $state.go('^.spendingAccounts');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function SpendingAccountAssignGroupController($scope, UserGroupList, AssignmentList, SpendingAccount, SpendingAccountAssignment) {
    var vm = this;
    vm.list = UserGroupList;
    vm.assignments = AssignmentList;
    vm.spendingAccount = SpendingAccount;
    vm.pagingfunction = PagingFunction;
    vm.saveAssignments = SaveAssignments;

    $scope.$watchCollection(function() {
        return vm.list;
    }, function() {
        SpendingAccountAssignment.setSelected(vm.list.Items, vm.assignments.Items);
    });

    function SaveAssignments() {
        return SpendingAccountAssignment.saveAssignments(vm.spendingAccount.ID, vm.list.Items, vm.assignments.Items);
    }

    function PagingFunction() {
        return SpendingAccountAssignment.paging(vm.spendingAccount.ID, vm.list, vm.assignments);
    }
}

function SpendingAccountAssignUserController($scope, UserList, AssignmentList, SpendingAccount, SpendingAccountAssignment) {
    var vm = this;
    vm.list = UserList;
    vm.assignments = AssignmentList;
    vm.spendingAccount = SpendingAccount;
    vm.pagingfunction = PagingFunction;
    vm.saveAssignments = SaveAssignments;

    $scope.$watchCollection(function() {
        return vm.list;
    }, function() {
        SpendingAccountAssignment.setSelected(vm.list.Items, vm.assignments.Items, 'User');
    });

    function SaveAssignments() {
        return SpendingAccountAssignment.saveAssignments(vm.spendingAccount.ID, vm.list.Items, vm.assignments.Items, 'User');
    }

    function PagingFunction() {
        return SpendingAccountAssignment.paging(vm.spendingAccount.ID, vm.list, vm.assignments, 'User');
    }
}

function SpendingAccountAssignment($q, $state, $injector, Underscore, Assignments, SpendingAccounts) {
    return {
        saveAssignments: SaveAssignments,
        setSelected: SetSelected,
        paging: Paging
    };

    function SaveAssignments(SpendingAccountID, List, AssignmentList, Party) {
        var PartyID = (Party === 'User') ? 'UserID' : 'UserGroupID';
        var assigned = Underscore.pluck(AssignmentList, PartyID);
        var selected = Underscore.pluck(Underscore.where(List, {selected: true}), 'ID');
        var toAdd = Assignments.getToAssign(List, AssignmentList, PartyID);
        console.log(toAdd);
        var toUpdate = Underscore.intersection(selected, assigned);
        console.log(toUpdate);
        var toDelete = Assignments.getToDelete(List, AssignmentList, PartyID);
        var queue = [];
        var dfd = $q.defer();
        angular.forEach(List, function(item) {
            if (toAdd.indexOf(item.ID) > -1) {
                SaveAndUpdate(queue, SpendingAccountID, item, Party);
            }
            else if (toUpdate.indexOf(item.ID) > -1) {
                var AssignmentObject;
                if (Party === 'User') {
                    AssignmentObject = Underscore.where(AssignmentList, {UserID: item.ID})[0]; //should be only one
                }
                else {
                    AssignmentObject = Underscore.where(AssignmentList, {UserGroupID: item.ID})[0]; //should be only one
                }
                if (AssignmentObject.AllowExceed !== item.allowExceed) {
                    console.log(item.ID);
                    SaveAndUpdate(queue, SpendingAccountID, item, Party);
                }
            }
        });
        angular.forEach(toDelete, function(itemID) {
            if (Party === 'User') {
                queue.push(SpendingAccounts.DeleteAssignment(SpendingAccountID, itemID, null));
            }
            else queue.push(SpendingAccounts.DeleteAssignment(SpendingAccountID, null, itemID));
        });
        $q.all(queue).then(function() {
            dfd.resolve();
            $state.reload($state.current);
        });
        return dfd.promise;
    }

    function SaveAndUpdate(queue, SpendingAccountID, item, Party) {
        var assignment = {
            SpendingAccountID: SpendingAccountID,
            UserID: null,
            UserGroupID: null,
            AllowExceed: item.allowExceed
        };
        if (Party === 'User') {
            assignment.UserID = item.ID;
        }
        else assignment.UserGroupID = item.ID;
        queue.push(SpendingAccounts.SaveAssignment(assignment));
    }

    function SetSelected(List, AssignmentList, Party) {
        var PartyID = (Party === 'User') ? 'UserID' : 'UserGroupID';
        var assigned = Assignments.getAssigned(AssignmentList, PartyID);
        var exceed = Underscore.pluck(Underscore.where(AssignmentList, {AllowExceed: true}), PartyID);
        angular.forEach(List, function(item) {
            if (assigned.indexOf(item.ID) > -1) {
                item.selected = true;
                if (exceed.indexOf(item.ID) > -1) {
                    item.allowExceed = true;
                }
            }
        });
    }

    function Paging(SpendingAccountID, ListObjects, AssignmentObjects, Party) {
        var ServiceName = (Party === 'User') ? 'Users' : 'UserGroups';
        var Level = (Party === 'User') ? 'User' : 'Group';
        var Service = $injector.get(ServiceName);
        if (ListObjects.Meta.Page < ListObjects.Meta.TotalPages) {
            var queue = [];
            var dfd = $q.defer();
            queue.push(Service.List(null, ListObjects.Meta.Page + 1, ListObjects.Meta.PageSize));
            if (AssignmentObjects.Meta.Page < AssignmentObjects.Meta.TotalPages) {
                queue.push(SpendingAccounts.ListAssignments(SpendingAccountID, null, null, Level, AssignmentObjects.Meta.Page + 1, AssignmentObjects.Meta.PageSize));
            }
            $q.all(queue).then(function(results) {
                dfd.resolve();
                ListObjects.Meta = results[0].Meta;
                ListObjects.Items = [].concat(ListObjects.Items, results[0].Items);
                if (results[1]) {
                    AssignmentObjects.Meta = results[1].Meta;
                    AssignmentObjects.Items = [].concat(AssignmentObjects.Items, results[1].Items);
                }
                SetSelected(ListObjects.Items, AssignmentObjects.Items, Party);
            });
            return dfd.promise;
        }
        else return null;
    }
}
