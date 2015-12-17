angular.module( 'orderCloud' )

    .config( UsersConfig )
    .controller( 'UsersCtrl', UsersController )
    .controller( 'UserEditCtrl', UserEditController )
    .controller( 'UserCreateCtrl', UserCreateController )

;

function UsersConfig( $stateProvider ) {
    $stateProvider
        .state( 'users', {
            parent: 'base',
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
        .state( 'users.edit', {
            url: '/:userid/edit',
            templateUrl:'users/templates/userEdit.tpl.html',
            controller:'UserEditCtrl',
            controllerAs: 'userEdit',
            resolve: {
                SelectedUser: function( $stateParams, Users) {
                    return Users.Get( $stateParams.userid);
                }
            }
        })
        .state( 'users.create', {
            url: '/create',
            templateUrl:'users/templates/userCreate.tpl.html',
            controller:'UserCreateCtrl',
            controllerAs: 'userCreate'
        })
}

function UsersController( UserList ) {
    var vm = this;
    vm.list = UserList;
}

function UserEditController( $exceptionHandler, $state, SelectedUser, Users ) {
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
                $state.go('users', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        Users.Delete(userid)
            .then(function() {
                $state.go('users', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function UserCreateController( $exceptionHandler, $state, Users ) {
    var vm = this;
    vm.user = {Email:"", Password:""};
    vm.Submit = function() {
        var today = new Date();
        vm.user.TermsAccepted = today;
        Users.Create( vm.user)
            .then(function() {
                $state.go('users', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}