describe('Component: Login ::', function() {
    var scope,
        q,
        ctrl,
        factory;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope, LoginService, $controller, $state, Credentials) {
        q = $q;
        scope = $rootScope.$new();
        factory = LoginService;
        ctrl = $controller('LoginCtrl', {
            $scope: scope,
            LoginService: LoginService,
            Credentials: Credentials
        });
        spyOn($state, 'go').and.callThrough();
        spyOn(Credentials, 'Get').and.callThrough();
    }));

    describe('Factory: LoginService ::', function() {

    });

    describe('Controller: LoginCtrl ::', function() {
        describe('form', function() {
            it ('should initialize to login', function() {
                expect(ctrl.form).toBe('login');
            });
        });

        describe('setForm', function() {
            it ('should change the value of form to the passed in value', function() {
                ctrl.setForm('reset');
                expect(ctrl.form).toBe('reset');
            });
        });

        describe('submit', function() {
            var creds = {
                Username: 'notarealusername',
                Password: 'notarealpassword'
            };
            beforeEach(function() {
                ctrl.credentials = creds;
                ctrl.submit();
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
                ctrl.credentials = {
                    Email: email
                };
                var deferred = q.defer();
                deferred.resolve(true);
                spyOn(factory, 'SendVerificationCode').and.returnValue(deferred.promise);
                ctrl.forgotPassword();
                scope.$digest();
            });
            it ('should call the LoginService SendVerificationCode with the email', function() {
                expect(factory.SendVerificationCode).toHaveBeenCalledWith(email);
            });
            it ('should set the form to verificationCodeSuccess', function() {
                expect(ctrl.form).toBe('verificationCodeSuccess');
            });
            it ('should set credentials.Email back to null', function() {
                expect(ctrl.credentials.Email).toBe(null);
            });
        });

        describe('resetPassword', function() {

        });
    });
});
