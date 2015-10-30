angular.module( 'orderCloud' )

    .config( SpendingAccountsConfig )
    .controller( 'SpendingAccountsCtrl', SpendingAccountsController )
    .controller( 'SpendingAccountEditCtrl', SpendingAccountEditController )
    .controller( 'SpendingAccountCreateCtrl', SpendingAccountCreateController )
    .controller( 'SpendingAccountAssignCtrl', SpendingAccountAssignController )
    //.directive( 'ordercloudInfiniteScroll', InfiniteScrollDirective )

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
        .state( 'base.spendingAccountAssign', {
            url: '/spendingAccounts/:spendingAccountid/assign',
            templateUrl: 'spendingAccounts/templates/spendingAccountAssign.tpl.html',
            controller: 'SpendingAccountAssignCtrl',
            controllerAs: 'spendingAccountAssign',
            resolve: {
                Buyer: function(Buyers) {
                    return Buyers.Get();
                },
                UserGroupList: function(UserGroups) {
                    return UserGroups.List(null, 1, 20);
                },
                AssignedUserGroups: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.ListAssignments($stateParams.spendingAccountid);
                },
                SelectedSpendingAccount: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.spendingAccountid);
                }
            }
        })
}

function SpendingAccountsController( $state, SpendingAccountList, SpendingAccounts ) {
    var vm = this,
        page = 1;
    vm.list = SpendingAccountList;
}

function SpendingAccountEditController( $state, SelectedSpendingAccount, SpendingAccounts ) {
    var vm = this,
        spendingaccountid = SelectedSpendingAccount.ID;
    vm.spendingAccountName = SelectedSpendingAccount.SpendingAccountName;
    vm.spendingAccount = SelectedSpendingAccount;

    vm.Submit = function() {
        SpendingAccounts.Update(spendingaccountid, vm.spendingAccount)
            .then(function() {
                $state.go('^.spendingAccounts')
            });
    };

    vm.Delete = function() {
        SpendingAccounts.Delete(spendingaccountid)
            .then(function() {
                $state.go('^.spendingAccounts')
            });
    }
}

function SpendingAccountCreateController($state, SpendingAccounts) {
    var vm = this;
    vm.spendingAccount = {};

    vm.Submit = function() {
        SpendingAccounts.Create(vm.spendingAccount)
            .then(function() {
                $state.go('^.spendingAccounts')
            });
    }
}

function SpendingAccountAssignController($scope, Buyer, UserGroups, UserGroupList, AssignedUserGroups, SelectedSpendingAccount, SpendingAccounts) {
    var vm = this,
        page = 1;
    vm.buyer = Buyer;
    vm.assignBuyer = false;
    vm.scrollDisabled = false;
    vm.userGroups = UserGroupList.Items;
    vm.assignedUserGroups = AssignedUserGroups.Items;
    vm.spendingAccount = SelectedSpendingAccount;
    vm.resetSelections = resetSelections;
    vm.pagingFunction = pagingFunction;
    vm.saveAssignments = saveAssignments;

    function setSelected() {
        angular.forEach(vm.userGroups, function(group) {
            angular.forEach(vm.assignedUserGroups, function (assignedGroup) {
                if (!assignedGroup.UserGroupID && !assignedGroup.UserID && assignedGroup.SpendingAccountID) {
                    vm.assignBuyer = true;
                }
                if (assignedGroup.UserGroupID === group.ID) {
                    group.selected = true;
                }
            });
        });
    }
    setSelected();

    function resetSelections(index) {
        var matched = false;
        angular.forEach(vm.assignedUserGroups, function(assignedGroup) {
            if (assignedGroup.UserGroupID === vm.userGroups[index].ID) {
                matched = true;
            }
        });
        if (matched && vm.userGroups[index].selected) {
            $scope.assignmentsTable['assignCheckbox' + index].$setPristine(true);
        }
        else if (!matched && !vm.userGroups[index].selected) {
            $scope.assignmentsTable['assignCheckbox' + index].$setPristine(true);
        }
    }

    function pagingFunction() {
        page += 1;
        if (page <= UserGroupList.Meta.TotalPages) {
            UserGroups.List(null, page, 20)
                .then(function(groups) {
                    if (groups.Items && groups.Items.length > 0) {
                        vm.userGroups = [].concat(vm.userGroups, groups.Items)
                    }
                    if (page <= AssignedUserGroups.Meta.TotalPages) {
                        SpendingAccounts.ListAssignments(SelectedSpendingAccount.ID, null, null, page, 20).then(function(assignedGroups) {
                            vm.assignedUserGroups = [].concat(vm.assignedUserGroups, assignedGroups.Items);
                            setSelected();
                        });
                    }
                    else {
                        setSelected();
                    }
                });
        }
    }

    function saveAssignments() {
        if (vm.assignBuyer) {
            SpendingAccounts.SaveAssignment({SpendingAccountID: vm.spendingAccount.ID});
        }
        else {
            angular.forEach(vm.userGroups, function(group, index) {
                if ($scope.assignmentsTable['assignCheckbox' + index].$dirty) {
                    if (group.selected) {
                        var toSave = true;
                        angular.forEach(vm.assignedUserGroups, function(assignedGroup) {
                            if (assignedGroup.UserGroupID === group.ID) {
                                toSave = false;
                            }
                        });
                        if (toSave) {
                            SpendingAccounts.SaveAssignment({UserGroupID: group.ID, SpendingAccountID: vm.spendingAccount.ID});
                            vm.assignedUserGroups.push({
                                UserID: null,
                                UserGroupID: group.ID,
                                SpendingAccountID: vm.spendingAccount.ID
                            });
                        }
                    }
                    else {
                        angular.forEach(vm.assignedUserGroups, function(assignedGroup, index) {
                            if (assignedGroup.UserGroupID === group.ID) {
                                SpendingAccounts.DeleteAssignment(vm.spendingAccount.ID, null, group.ID);
                                vm.assignedUserGroups.splice(index, 1);
                                index = index - 1;
                            }
                        });
                    }
                }
            });
            angular.forEach(vm.assignedUserGroups, function(assignedGroup, index) {
                if (!assignedGroup.UserGroupID && !assignedGroup.UserID && assignedGroup.SpendingAccountID) {
                    SpendingAccounts.DeleteAssignment(vm.spendingAccount.ID, null, null);
                    vm.assignedUserGroups.splice(index, 1);
                    index = index - 1;
                }
            });
            $scope.assignmentsTable.$setPristine(true);
        }
    }
}

//function InfiniteScrollDirective() {
//    return {
//        restrict: 'A',
//        scope: {
//            pagingfunction: '&',
//            threshold: '@'
//        },
//        link: function(scope, element, attrs) {
//            var threshold = scope.threshold || 0;
//            var ele = element[0];
//            element.bind('scroll', function () {
//                if (ele.scrollTop + ele.offsetHeight + threshold >= ele.scrollHeight) {
//                    scope.pagingfunction();
//                }
//            });
//        }
//    }
//}
