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
                StateList: function($state) {
                    var StateList = [];
                    var stateName = '';

                    angular.forEach($state.get(), function(state) {
                        if (state.name.match(/base./) && !state.name.match(/(home|Edit|Create|Assign|Tree)/)) {
                            stateName = state.name.replace('base.', '');
                            stateName = stateName.substr(0, 1).toUpperCase() + stateName.substr(1);
                            StateList.push({Name: stateName, Link: state.name});
                        }
                    });
                    return StateList;
                }
            }
		});
}

function BaseController() {
	var vm = this;
}

function BaseLeftController(Buyer, BuyerList, Buyers, BuyerID, StateList) {
    var vm = this,
        page = 1;
    vm.buyer = Buyer;
    vm.isCollapsed = true;
    vm.buyerList = BuyerList;
    vm.changeBuyer = function(buyer) {
        vm.buyer = buyer;
        BuyerID.Set(buyer.ID);
        vm.isCollapsed = true;
    }
    vm.PagingFunction = function() {
        page += 1;
        if (page <= vm.buyerList.Meta.TotalPages) {
            Buyers.List(null, page)
                .then(function(data) {
                    vm.buyerList.Meta = data.Meta;
                    vm.buyerList.Items = [].concat(vm.buyerList.Items, data.Items);
                });
        }
    }

    vm.StateList = [];
    angular.forEach(StateList, function(state) {
        if (!state.Name.match(/(Products|Price Schedules|Specs)/)) {
            vm.StateList.push(state);
        }
    });
}

function BaseTopController(StateList) {
    var vm = this;
    vm.StateList = [];
    angular.forEach(StateList, function(state) {
        if (state.Name.match(/(Products|Price Schedules|Specs)/)) {
            vm.StateList.push(state);
        }
    });
    vm.toggleMenu = function() {
        angular.element(document.querySelector('#wrapper')).toggleClass('toggled');
    }
}
