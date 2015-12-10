xdescribe('Component: Login,', function() {
    var scope,
        q,
        loginFactory,
        devLoginFactory,
        credentials = {
            Username: 'notarealusername',
            Password: 'notarealpassword'
        };
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope, LoginService, DevLoginService) {
        q = $q;
        scope = $rootScope.$new();
        loginFactory = LoginService;
        devLoginFactory = DevLoginService;
    }));

    describe('Factory: LoginService,', function() {
        var PasswordResetsFactory,
            client_id;
        beforeEach(inject(function(PasswordResets, clientid) {
            PasswordResetsFactory = PasswordResets;
            client_id = clientid;
        }));
        describe('SendVerificationCode', function() {
            var passwordResetRequest;
            beforeEach(inject(function($window) {
                var email = 'test@test.com';
                passwordResetRequest = {
                    Email: email,
                    ClientID: client_id,
                    URL: encodeURIComponent($window.location.href) + '{0}'
                };
                var deferred = q.defer();
                deferred.resolve(true);
                spyOn(PasswordResetsFactory, 'SendVerificationCode').and.returnValue(deferred.promise);
                loginFactory.SendVerificationCode(email);
            }));
            it ('should call the SendVerificationCode method of PasswordResets with the reset request object', function(){
                expect(PasswordResetsFactory.SendVerificationCode).toHaveBeenCalledWith(passwordResetRequest);
            });
        });

        describe('ResetPassword', function() {
            var creds = {
                ResetUsername: credentials.Username,
                NewPassword: credentials.Password,
                ConfirmPassword: credentials.Password
            };
            beforeEach(inject(function() {
                var deferred = q.defer();
                deferred.resolve(true);
                spyOn(PasswordResetsFactory, 'ResetPassword').and.returnValue(deferred.promise);
                loginFactory.ResetPassword(creds, 'code');
            }));
            it ('should call the ResetPassword method of the PasswordResets Service with a code and credentials', function() {
                expect(PasswordResetsFactory.ResetPassword).toHaveBeenCalledWith('code', {ClientID: client_id, Username: creds.ResetUsername, Password: creds.NewPassword});
            });
        });
    });

    describe('Controller: LoginCtrl,', function() {
        var loginCtrl;
        beforeEach(inject(function($controller, $state, Credentials, LoginService) {
            loginCtrl = $controller('LoginCtrl', {
                $scope: scope,
                LoginService: LoginService,
                Credentials: Credentials
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('form', function() {
            it ('should initialize to login', function() {
                expect(loginCtrl.form).toBe('login');
            });
        });

        describe('setForm', function() {
            it ('should change the value of form to the passed in value', function() {
                loginCtrl.setForm('reset');
                expect(loginCtrl.form).toBe('reset');
            });
        });

        describe('submit', function() {
            beforeEach(inject(function(Credentials) {
                var deferred = q.defer();
                deferred.resolve(true);
                spyOn(Credentials, 'Get').and.returnValue(deferred.promise);
                loginCtrl.credentials = credentials;
                loginCtrl.submit();
                scope.$digest();
            }));
            it ('should call the Credentials Get method with credentials', inject(function(Credentials) {
                expect(Credentials.Get).toHaveBeenCalledWith(credentials);
            }));
            it ('should enter the home state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.home');
            }));
        });

        describe('forgotPassword', function() {
            var email = 'test@test.com';
            beforeEach(function() {
                loginCtrl.credentials = {
                    Email: email
                };
                var deferred = q.defer();
                deferred.resolve(true);
                spyOn(loginFactory, 'SendVerificationCode').and.returnValue(deferred.promise);
                loginCtrl.forgotPassword();
                scope.$digest();
            });
            it ('should call the LoginService SendVerificationCode with the email', function() {
                expect(loginFactory.SendVerificationCode).toHaveBeenCalledWith(email);
            });
            it ('should set the form to verificationCodeSuccess', function() {
                expect(loginCtrl.form).toBe('verificationCodeSuccess');
            });
            it ('should set credentials.Email back to null', function() {
                expect(loginCtrl.credentials.Email).toBe(null);
            });
        });

        describe('resetPassword', function() {
            var creds = {
                ResetUsername: credentials.Username,
                NewPassword: credentials.Password,
                ConfirmPassword: credentials.Password
            };
            var token = 'reset';
            beforeEach(function() {
                loginCtrl.credentials = creds;
                loginCtrl.token = token;
                var deferred = q.defer();
                deferred.resolve(true);
                spyOn(loginFactory, 'ResetPassword').and.returnValue(deferred.promise);
                loginCtrl.resetPassword();
                scope.$digest();
            });
            it ('should call the ResetPassword method of the LoginService with credentials and token', function() {
                expect(loginFactory.ResetPassword).toHaveBeenCalledWith(creds, token);
            });
            it ('should set the form to resetSuccess', function() {
                expect(loginCtrl.form).toBe('resetSuccess');
            });
            it ('should set the token to null', function() {
                expect(loginCtrl.token).toBe(null);
            });
            it ('should set the credentials values to null', function() {
                for (key in loginCtrl.credentials) {
                    if (loginCtrl.credentials.hasOwnProperty(key)) {
                        expect(loginCtrl.credentials[key]).toBe(null);
                    }
                }
            });
        });
    });

    describe('Factory: DevLoginService,', function() {
        describe('LogInDev', function() {
            beforeEach(function() {
                devLoginFactory.LogInDev(credentials);
            });
            it('should call the $resource service', inject(function($httpBackend, apiurl) {
                expect($httpBackend.expectPOST(apiurl + '/v1/DevAppLogin'));
            }));
        });
    });

    describe('Controller: DevLoginCtrl,', function() {
        var devLoginCtrl;
        beforeEach(inject(function($controller, DevLoginService, Auth) {
            devLoginCtrl = $controller('DevLoginCtrl', {
                $scope: scope,
                DevLoginService: DevLoginService,
                Auth: Auth
            });
            devLoginCtrl.credentials = credentials;
        }));

        describe('submit', function() {
            var fakeReturn;
            beforeEach(inject(function(DevLoginService, Auth, $state) {
                fakeReturn = {
                    Items: [
                        {access_token: 'fake_token1'}
                    ]
                };
                var deferred = q.defer();
                var dfd = q.defer();
                deferred.resolve(true);
                spyOn(Auth, 'SetToken').and.returnValue(deferred.promise);
                dfd.resolve(fakeReturn);
                spyOn(DevLoginService, 'LogInDev').and.returnValue(dfd.promise);
                spyOn($state, 'go').and.returnValue(true);
                devLoginCtrl.submit();
                scope.$digest();
            }));
            it ('should call the LogInDev method of LoginService', function() {
                expect(devLoginFactory.LogInDev).toHaveBeenCalledWith(credentials);
            });
            it ('should call the SetToken method of the Auth Service', inject(function(Auth) {
                expect(Auth.SetToken).toHaveBeenCalledWith(fakeReturn.Items[0].access_token);
            }));
            it ('should enter the home state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.home');
            }));
        });
    });
});
