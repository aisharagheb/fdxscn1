angular.module( 'orderCloud' )

    .config( UserGroupsConfig )
    .controller( 'UserGroupsCtrl', UserGroupsController )
    .controller( 'UserGroupEditCtrl', UserGroupEditController )
    .controller( 'UserGroupCreateCtrl', UserGroupCreateController )
    .controller( 'UserGroupAssignCtrl', UserGroupAssignController )

;
//TODO: listing users and adding users to a group.!!!

function UserGroupsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.groups', {
            url: '/groups',
            templateUrl:'userGroups/templates/groups.tpl.html',
            controller:'UserGroupsCtrl',
            controllerAs: 'userGroups',
            data: {componentName: 'User Groups'},
            resolve: {
                UserGroupList: function(UserGroups) {
                    return UserGroups.List(null, 1, 20);
                }
            }
        })
        .state( 'base.groupEdit', {
            url: '/groups/:userGroupid/edit',
            templateUrl:'userGroups/templates/groupEdit.tpl.html',
            controller:'UserGroupEditCtrl',
            controllerAs: 'userGroupEdit',
            resolve: {
                SelectedUserGroup: function($stateParams, UserGroups) {
                    return UserGroups.Get($stateParams.userGroupid);
                }
            }
        })
        .state( 'base.groupCreate', {
            url: '/groups/create',
            templateUrl:'userGroups/templates/groupCreate.tpl.html',
            controller:'UserGroupCreateCtrl',
            controllerAs: 'userGroupCreate'
        })
        .state('base.groupAssign', {
            url: '/groups/:userGroupid/assign',
            templateUrl: 'userGroups/templates/groupAssign.tpl.html',
            controller: 'UserGroupAssignCtrl',
            controllerAs: 'userGroupAssign',
            resolve: {
                UserList: function (Users) {
                    return Users.List(null, 1, 20);
                },
                Assignments: function ($stateParams, UserGroups) {
                    return UserGroups.ListMemberAssignments(null, $stateParams.userGroupid);
                },
                SelectedUserGroup: function($stateParams, UserGroups) {
                    return UserGroups.Get($stateParams.userGroupid);
                }
            }
        })
}

function UserGroupsController( UserGroupList, $state) {
    var vm = this;
    vm.list = UserGroupList;

    vm.goToEdit = function(id) {
        $state.go('^.groupEdit', {'userGroupid': id});
    };
    vm.goToAssignments = function(id) {
        $state.go('^.groupAssign', {'userGroupid': id});
    };
}

function UserGroupEditController( $state, SelectedUserGroup, UserGroups ) {
    var vm = this,
        groupID = SelectedUserGroup.ID;
    vm.userGroupName = SelectedUserGroup.UserGroup;
    vm.userGroup = SelectedUserGroup;

    vm.Submit = function() {
        UserGroups.Update(groupID, vm.userGroup)
            .then(function() {
                $state.go('^.groups')
            });
    };

    vm.Delete = function() {
        UserGroups.Delete(SelectedUserGroup.ID)
            .then(function() {
                $state.go('^.groups')
            });
    }
}

function UserGroupCreateController($state, UserGroups) {
    var vm = this;

    vm.Submit = function() {
        UserGroups.Create(vm.userGroup)
            .then(function() {
                $state.go('^.groups')
            });
    }
}

function UserGroupAssignController( UserList, Assignments, SelectedUserGroup, UserGroups) {
    var vm = this;
    vm.list = UserList;
    vm.assignments = Assignments.Items;
    vm.group = SelectedUserGroup;
    setSelected(Assignments, UserList);

    vm.saveAssignments = function (form) {
        angular.forEach(UserList.Items, function (user, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (user.selected) {
                    var toSave = true;
                    angular.forEach(Assignments.Items, function (assignedUser) {
                        if (assignedUser.UserID === user.ID) {
                            toSave = false;
                        }
                    });
                    if (toSave) {
                        UserGroups.SaveMemberAssignment({UserGroupID: SelectedUserGroup.ID, UserID: user.ID});

                    }
                }
                else {
                    angular.forEach(Assignments.Items, function (assignedUser, index) {
                        if (assignedUser.UserID === user.ID) {
                            UserGroups.DeleteMemberAssignment(SelectedUserGroup.ID, user.ID);
                            Assignments.Items.splice(index, 1);
                            index = index - 1;
                        }
                    });
                }
            }
        });
        angular.forEach(Assignments.Items, function (assignedUser, index) {
            if (!assignedUser.UserID) {
                UserGroups.DeleteMemberAssignment(SelectedUserGroup.ID, assignedUser.ID);
                Assignments.Items.splice(index, 1);
                index = index - 1;
            }
        });
        form.$setPristine(true);
        setSelected(Assignments, UserList);
    }

    function setSelected(Assignments, UserList) {
        angular.forEach(UserList.Items, function (user) {
            angular.forEach(Assignments.Items, function (assignedUser) {
                if (assignedUser.UserID === user.ID) {
                    user.selected = true;
                }
            });
        });
    }

     vm.resetSelections = function(index, form) {
        var matched = false;
        angular.forEach(Assignments.Items, function(assignedUser) {
            if (assignedUser.UserID === UserList.Items[index].ID) {
                matched = true;
            }
        });
        if (matched && UserList.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
        else if (!matched && !UserList.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
    }
}