describe('Component: Login,', function() {
    var scope,
        q,
        loginFactory;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope, LoginService) {
        q = $q;
        scope = $rootScope.$new();
        loginFactory = LoginService;
    }));

    describe('Factory: LoginService,', function() {

    });

    describe('Controller: LoginCtrl,', function() {
        var loginCtrl;
        beforeEach(inject(function($controller, $state, Credentials, LoginService) {
            loginCtrl = $controller('LoginCtrl', {
                $scope: scope,
                LoginService: LoginService,
                Credentials: Credentials
            });
            spyOn($state, 'go').and.callThrough();
            spyOn(Credentials, 'Get').and.callThrough();
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
            var creds = {
                Username: 'notarealusername',
                Password: 'notarealpassword'
            };
            beforeEach(function() {
                loginCtrl.credentials = creds;
                loginCtrl.submit();
            });
            it ('should call the Credentials Get method with credentials', inject(function(Credentials) {
                expect(Credentials.Get).toHaveBeenCalledWith(creds);
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

        });
    });
});
