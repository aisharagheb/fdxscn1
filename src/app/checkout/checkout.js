angular.module('orderCloud')
	.config(checkoutConfig)
	.controller('CheckoutCtrl', CheckoutController)
	.controller('OrderSummaryCtrl', OrderReviewController)
	.controller('OrderConfirmationCtrl', OrderConfirmationController)
;

function checkoutConfig($stateProvider) {
	$stateProvider
		.state('checkout', {
			parent: 'base',
			url: '/checkout',
			templateUrl: 'checkout/templates/checkout.tpl.html',
			controller: 'CheckoutCtrl',
			controllerAs: 'checkout',
			resolve: {
				CurrentOrder: function($q, appname, $exceptionHandler, $localForage, Orders) {
					var dfd = $q.defer();
					$localForage.getItem(appname + '.CurrentOrderID')
						.then(function(id) {
							if (id) {
								dfd.resolve(Orders.Get(id));
							} else {
								$exceptionHandler({'message':'You have not started an order.'});
								dfd.reject();
							}
						});
					return dfd.promise;
				},
				LineItemsList: function(CurrentOrder, LineItems) {
					return LineItems.Get(CurrentOrder.ID);
				}
			}
		})
		.state('checkout.review', {
			url: '/review',
			views: {
				'@base': {
					templateUrl: 'checkout/templates/review.tpl.html',
					controller: 'OrderReviewCtrl',
					controllerAs: 'orderReview'
				}
			}
		})
		.state('checkout.confirmation', {
			url: '/confirmation',
			views: {
				'@base': {
					templateUrl: 'checkout/templates/confirmation.tpl.html',
					controller: 'OrderConfirmationCtrl',
					controllerAs: 'orderConfirmation'
				}
			}
		})
}

function CheckoutController(CurrentOrder, LineItemsList) {
	var vm = this;
	vm.currentOrder = CurrentOrder;
	vm.currentOrder.LineItems = LineItemsList;
}

function OrderReviewController() {
	var vm = this;
}

function OrderConfirmationController() {
	var vm = this;
}