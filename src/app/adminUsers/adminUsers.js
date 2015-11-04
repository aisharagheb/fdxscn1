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
            data: {componentName: 'Admin Users'},
            resolve: {
                AdminUsersList: function( AdminUsers) {
                    return AdminUsers.List(null, 1, 5);
                }
            }
        })
        .state( 'base.adminUsersEdit', {
            url: '/adminUsers/:adminuserid/edit',
            templateUrl:'adminUsers/templates/adminUserEdit.tpl.html',
            controller:'AdminUserEditCtrl',
            controllerAs: 'adminUserEdit',
            resolve: {
                SelectedAdminUser: function( $stateParams, AdminUsers) {
                    return AdminUsers.Get( $stateParams.adminuserid);
                }
            }
        })
        .state( 'base.adminUsersCreate', {
            url: '/adminUsers/create',
            templateUrl:'adminUsers/templates/adminUserCreate.tpl.html',
            controller:'AdminUserCreateCtrl',
            controllerAs: 'adminUserCreate'
        })
}

function AdminUsersController( AdminUsersList ) {
    var vm = this;
    vm.list = AdminUsersList;
}

function AdminUserEditController( $exceptionHandler, $state, SelectedAdminUser, AdminUsers ) {
    var vm = this,
        adminUserId = SelectedAdminUser.ID;
    vm.adminUserName = SelectedAdminUser.Username;
    vm.adminUser = SelectedAdminUser;
    if(vm.adminUser.TermsAccepted != null) {
        vm.TermsAccepted = true;
    }

    vm.Submit = function() {
        var today = new Date();
        vm.adminUser.TermsAccepted = today;
        AdminUsers.Update(adminUserId, vm.adminUser)
            .then(function() {
                $state.go('^.adminUsers')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        AdminUsers.Delete(adminUserId)
            .then(function() {
                $state.go('^.adminUsers')
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
        var today = new Date();
        vm.adminUser.TermsAccepted = today;
        AdminUsers.Create( vm.adminUser)
            .then(function() {
                $state.go('^.adminUsers')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}