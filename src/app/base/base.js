angular.module( 'orderCloud' )

	.config( BaseConfig )
	.controller( 'BaseCtrl', BaseController )
    .controller( 'BaseLeftCtrl', BaseLeftController )
    .controller( 'BaseTopCtrl', BaseTopController )

;

function BaseConfig( $stateProvider ) {
	$stateProvider
		.state( 'base', {
			url: '',
			abstract: true,
			templateUrl:'base/templates/base.tpl.html',
			data:{
				limitAccess: true //Whether or not to require authentication on this state, this also affects any child states.
				/*TODO: make the '$stateChangeStart event' in _app.js accept a function so users can control the redirect from here.*/
			},
            views: {
                '': {
                    templateUrl: 'base/templates/base.tpl.html',
                    controller: 'BaseCtrl',
                    controllerAs: 'base'
                },
                'top@base': {
                    templateUrl: 'base/templates/base.top.tpl.html',
                    controller: 'BaseTopCtrl',
                    controllerAs: 'baseTop'
                },
                'left@base': {
                    templateUrl: 'base/templates/base.left.tpl.html',
                    controller: 'BaseLeftCtrl',
                    controllerAs: 'baseLeft'
                }
            },
            resolve: {
                Buyer: function(BuyerID, Buyers) {
                    return Buyers.Get(BuyerID.Get());
                },
                BuyerList: function(Buyers) {
                    return Buyers.List();
                },
                ComponentList: function($state, $q) {
                    var deferred = $q.defer();
                    var nonSpecific = ['Products', 'Specs', 'Price Schedules'];
                    var components = {
                        nonSpecific: [],
                        buyerSpecific: []
                    };
                    angular.forEach($state.get(), function(state) {
                        if (!state.data || !state.data.componentName) return;
                        if (nonSpecific.indexOf(state.data.componentName) > -1) {
                            components.nonSpecific.push({
                                Display: state.data.componentName,
                                StateRef: state.name
                            })
                        } else {
                            components.buyerSpecific.push({
                                Display: state.data.componentName,
                                StateRef: state.name
                            })
                        }
                    });
                    deferred.resolve(components);
                    return deferred.promise;
                }
            }
		});
}

function BaseController() {
	var vm = this;
}

function BaseLeftController(Buyer, BuyerList, Buyers, BuyerID, ComponentList) {
    var vm = this,
        page = 1;
    vm.navItems = ComponentList.buyerSpecific;
    vm.buyer = Buyer;
    vm.isCollapsed = true;
    vm.buyerList = BuyerList;
    vm.changeBuyer = function(buyer) {
        vm.buyer = buyer;
        BuyerID.Set(buyer.ID);
        vm.isCollapsed = true;
    };
    vm.PagingFunction = function() {
        page += 1;
        if (page <= vm.buyerList.Meta.TotalPages) {
            Buyers.List(null, page)
                .then(function(data) {
                    vm.buyerList.Meta = data.Meta;
                    vm.buyerList.Items = [].concat(vm.buyerList.Items, data.Items);
                });
        }
    };
}

function BaseTopController(ComponentList) {
    var vm = this;
    vm.navItems = ComponentList.nonSpecific;
    vm.StateList = [];
    vm.toggleMenu = function() {
        angular.element(document.querySelector('#wrapper')).toggleClass('toggled');
    }
}
