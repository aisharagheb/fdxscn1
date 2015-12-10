describe('Component: Base,', function() {
    var q,
        scope;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(module('ui.router'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
    }));
    describe('State: Base,', function() {
        var state;
        beforeEach(inject(function($state, Me) {
            state = $state.get('base');
            spyOn(Me, 'Get').and.returnValue(null);
        }));
        //Skipped this test because Base now resolves with Auth.IsAuthenticated and THEN do a Me.Get() to confirm the token will work
        xit('should resolve CurrentUser', inject(function ($injector, Me) {
            $injector.invoke(state.resolve.CurrentUser);
            expect(Me.Get).toHaveBeenCalled();
        }));
        it ('should resolve ComponentsList', inject(function($injector) {
            var components = $injector.invoke(state.resolve.ComponentList);
            expect(components.nonSpecific).not.toBe(null);
            expect(components.buyerSpecific).not.toBe(null);
        }));
    });

    describe('Controller: BaseCtrl,', function(){
        var baseCtrl,
            fake_user = {
                Username: 'notarealusername',
                Password: 'notarealpassword'
            };
        beforeEach(inject(function($controller) {
            baseCtrl = $controller('BaseCtrl', {
                CurrentUser: fake_user
            });
        }));
        it ('should initialize the currentUser into its scope', function() {
            expect(baseCtrl.currentUser).toBe(fake_user);
        });
    });

    describe('Controller: BaseLeftCtrl,', function(){
        var baseLeftCtrl,
            fake_components = {
                nonSpecific: ['test1', 'test2', 'test3'],
                buyerSpecific: ['test4', 'test5', 'test6']
            };
        beforeEach(inject(function($controller) {
            baseLeftCtrl = $controller('BaseLeftCtrl', {
                ComponentList: fake_components
            });
        }));
        it ('should initialize the components lists', function() {
            expect(baseLeftCtrl.catalogItems).toBe(fake_components.nonSpecific);
            expect(baseLeftCtrl.organizationItems).toBe(fake_components.buyerSpecific);
        });
        it ('should initialize isCollapsed to true', function() {
            expect(baseLeftCtrl.isCollapsed).toBe(true);
        });
    });

    describe('Controller: BaseTopCtrl,', function(){
        var baseTopCtrl;
        beforeEach(inject(function($controller) {
            baseTopCtrl = $controller('BaseTopCtrl', {});
        }));
        /* No tests needed */
    });
});
