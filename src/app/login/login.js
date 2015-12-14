angular.module( 'orderCloud' )

    .config( LoginConfig )
    .factory( 'LoginService', LoginService )
    .factory( 'DevLoginService', DevLoginService )
    .controller( 'LoginCtrl', LoginController )
    .controller( 'DevLoginCtrl', DevLoginController )

;

function LoginConfig( $stateProvider ) {
    $stateProvider
        .state( 'login', {
            url: '/login/:token',
            templateUrl:'login/templates/login.tpl.html',
            controller:'LoginCtrl',
            controllerAs: 'login'
        })
        .state( 'loginDev', {
            url: '/dev/login',
            templateUrl: 'login/templates/login.dev.tpl.html',
            controller: 'DevLoginCtrl',
            controllerAs: 'devLogin'
        });
}

function DevLoginService($resource, clientid, apiurl) {
    return {
        LogInDev: LogInDev
    };

    function LogInDev(credentials) {
        var data = {
            ClientID: clientid,
            Username: credentials.Username,
            Password: credentials.Password
        };
        return $resource(apiurl + '/v1/DevAppLogin', {}, { method: 'POST' }).save(data).$promise;
    }
}

function LoginService( $q, $window, PasswordResets, clientid ) {
    return {
        SendVerificationCode: _sendVerificationCode,
        ResetPassword: _resetPassword
    };

    function _sendVerificationCode(email) {
        var deferred = $q.defer();

        var passwordResetRequest = {
            Email: email,
            ClientID: clientid,
            URL: encodeURIComponent($window.location.href) + '{0}'
        };

        PasswordResets.SendVerificationCode(passwordResetRequest)
            .then(function() {
                deferred.resolve();
            })
            .catch(function(ex) {
                deferred.reject(ex);
            });

        return deferred.promise;
    }

    function _resetPassword(resetPasswordCredentials, verificationCode) {
        var deferred = $q.defer();

        var passwordReset = {
            ClientID: clientid,
            Username: resetPasswordCredentials.ResetUsername,
            Password: resetPasswordCredentials.NewPassword
        };

        PasswordResets.ResetPassword(verificationCode, passwordReset).
            then(function() {
                deferred.resolve();
            })
            .catch(function(ex) {
                deferred.reject(ex);
            });

        return deferred.promise;
    }
}

function LoginController( $state, $stateParams, $exceptionHandler, LoginService, Credentials ) {
    var vm = this;
    vm.token = $stateParams.token;
    vm.form = vm.token ? 'reset' : 'login';
    vm.setForm = function(form) {
        vm.form = form;
    };

    vm.submit = function() {
        Credentials.Get( vm.credentials ).then(
            function() {
                $state.go( 'base.home' );
            });
    };

    vm.forgotPassword = function() {
        LoginService.SendVerificationCode(vm.credentials.Email)
            .then(function() {
                vm.setForm('verificationCodeSuccess');
                vm.credentials.Email = null;
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.resetPassword = function() {
        LoginService.ResetPassword(vm.credentials, vm.token)
            .then(function() {
                vm.setForm('resetSuccess');
                vm.token = null;
                vm.credentials.ResetUsername = null;
                vm.credentials.NewPassword = null;
                vm.credentials.ConfirmPassword = null;
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
                vm.credentials.ResetUsername = null;
                vm.credentials.NewPassword = null;
                vm.credentials.ConfirmPassword = null;
            });
    };
}

function DevLoginController(DevLoginService, $state, Auth) {
    var vm = this;
    vm.submit = function() {
        DevLoginService.LogInDev(vm.credentials).then(
            function(data) {
                Auth.SetToken(data.Items[0].access_token);
                $state.go('base.home');
            }
        );
    }
}
