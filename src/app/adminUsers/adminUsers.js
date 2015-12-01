angular.module( 'orderCloud' )

    .config( AdminUsersConfig )
    .controller( 'AdminUsersCtrl', AdminUsersController )
    .controller( 'AdminUserEditCtrl', AdminUserEditController )
    .controller( 'AdminUserCreateCtrl', AdminUserCreateController )

;

function AdminUsersConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.adminUsers', {
            url: '/adminUsers',
            templateUrl:'adminUsers/templates/adminUsers.tpl.html',
            controller:'AdminUsersCtrl',
            controllerAs: 'adminUsers',
            resolve: {
                AdminUsersList: function(AdminUsers) {
                    return AdminUsers.List();
                }
            }
        })
        .state( 'base.adminUserEdit', {
            url: '/adminUsers/:adminuserid/edit',
            templateUrl:'adminUsers/templates/adminUserEdit.tpl.html',
            controller:'AdminUserEditCtrl',
            controllerAs: 'adminUserEdit',
            resolve: {
                SelectedAdminUser: function($stateParams, AdminUsers) {
                    return AdminUsers.Get($stateParams.adminuserid);
                }
            }
        })
        .state( 'base.adminUserCreate', {
            url: '/adminUsers/create',
            templateUrl:'adminUsers/templates/adminUserCreate.tpl.html',
            controller:'AdminUserCreateCtrl',
            controllerAs: 'adminUserCreate'
        })
}

function AdminUsersController( AdminUsersList, TrackSearch ) {
    var vm = this;
    vm.list = AdminUsersList;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
    };
}

function AdminUserEditController( $exceptionHandler, $state, SelectedAdminUser, AdminUsers ) {
    var vm = this,
        adminuserid = SelectedAdminUser.ID;
    vm.adminUserName = SelectedAdminUser.Username;
    vm.adminUser = SelectedAdminUser;
    if(vm.adminUser.TermsAccepted != null) {
        vm.TermsAccepted = true;
    }

    vm.Submit = function() {
        AdminUsers.Update(adminuserid, vm.adminUser)
            .then(function() {
                $state.go('base.adminUsers')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        AdminUsers.Delete(adminuserid)
            .then(function() {
                $state.go('base.adminUsers')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function AdminUserCreateController( $exceptionHandler, $state, AdminUsers ) {
    var vm = this;
    vm.adminUser = {Email:"", Password:""};
    vm.Submit = function() {
        AdminUsers.Create( vm.adminUser)
            .then(function() {
                $state.go('base.adminUsers')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}