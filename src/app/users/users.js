angular.module( 'orderCloud' )

    .config( UsersConfig )
    .controller( 'UsersCtrl', UsersController )
    .controller( 'UserEditCtrl', UserEditController )
    .controller( 'UserCreateCtrl', UserCreateController )

;

function UsersConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.users', {
            url: '/users',
            templateUrl:'users/templates/users.tpl.html',
            controller:'UsersCtrl',
            controllerAs: 'users',
            data: {componentName: 'Users'},
            resolve: {
                UserList: function( Users) {
                    return Users.List();
                }
            }
        })
        .state( 'base.userEdit', {
            url: '/users/:userid/edit',
            templateUrl:'users/templates/userEdit.tpl.html',
            controller:'UserEditCtrl',
            controllerAs: 'userEdit',
            resolve: {
                SelectedUser: function( $stateParams, Users) {
                    return Users.Get( $stateParams.userid);
                }
            }
        })
        .state( 'base.userCreate', {
            url: '/users/create',
            templateUrl:'users/templates/userCreate.tpl.html',
            controller:'UserCreateCtrl',
            controllerAs: 'userCreate'
        })
}

function UsersController( UserList ) {
    var vm = this;
    vm.list = UserList;
}

function UserEditController(  $state, SelectedUser, Users ) {
    var vm = this,
        userid = SelectedUser.ID;
    vm.userName = SelectedUser.Username;
    vm.user = SelectedUser;
    if(vm.user.TermsAccepted != null) {
        vm.TermsAccepted = true;
    }

    vm.Submit = function() {
        var today = new Date();
        vm.user.TermsAccepted = today;
        Users.Update(userid, vm.user)
            .then(function() {
                $state.go('^.users')
            });
    };

    vm.Delete = function() {
        Users.Delete(userid)
            .then(function() {
                $state.go('^.users')
            });
    }
}

function UserCreateController( $state, Users) {
    var vm = this;
    vm.user = {Email:"", Password:""};
    vm.Submit = function() {
        var today = new Date();
        vm.user.TermsAccepted = today;
        Users.Create( vm.user)
            .then(function() {
                $state.go('^.users')
            });
    }
}