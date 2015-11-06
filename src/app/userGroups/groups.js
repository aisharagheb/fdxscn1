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
                AssignedUsers: function ($stateParams, UserGroups) {
                    return UserGroups.ListMemberAssignments(null, $stateParams.userGroupid);
                },
                SelectedUserGroup: function($stateParams, UserGroups) {
                    return UserGroups.Get($stateParams.userGroupid);
                }
            }
        })
}

function UserGroupsController( UserGroupList, TrackSearch ) {
    var vm = this;
    vm.list = UserGroupList;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
    };
}

function UserGroupEditController( $exceptionHandler, $state, SelectedUserGroup, UserGroups ) {
    var vm = this,
        groupID = SelectedUserGroup.ID;
    vm.userGroupName = SelectedUserGroup.Name;
    vm.userGroup = SelectedUserGroup;

    vm.Submit = function() {
        UserGroups.Update(groupID, vm.userGroup)
            .then(function() {
                $state.go('^.groups')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        UserGroups.Delete(SelectedUserGroup.ID)
            .then(function() {
                $state.go('^.groups')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function UserGroupCreateController( $exceptionHandler, $state, UserGroups ) {
    var vm = this;

    vm.Submit = function() {
        UserGroups.Create(vm.userGroup)
            .then(function() {
                $state.go('^.groups')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function UserGroupAssignController(Assignments, Paging, UserList, AssignedUsers, SelectedUserGroup, UserGroups) {
    var vm = this;
    vm.UserGroup = SelectedUserGroup;
    vm.list = UserList;
    vm.assignments = AssignedUsers;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return UserGroups.SaveMemberAssignment({
            UserID: ItemID,
            UserGroupID: vm.UserGroup.ID
        });
    }

    function DeleteFunc(ItemID) {
        return UserGroups.DeleteMemberAssignment(vm.UserGroup.ID, ItemID);
    }

    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'UserID');
    }

    function AssignmentFunc() {
        return UserGroups.ListAssignments(vm.UserGroup.ID, null, vm.assignments.Meta.PageSize, 'UserID');
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Users', vm.assignments, AssignmentFunc);
    }
}