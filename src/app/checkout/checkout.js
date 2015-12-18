angular.module('orderCloud')
	.config(checkoutConfig)
	.controller('CheckoutCtrl', CheckoutController)
	.controller('OrderReviewCtrl', OrderReviewController)
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
				LineItemsList: function($q, Underscore, Products, LineItems, CurrentOrder) {
					var dfd = $q.defer();
					LineItems.Get(CurrentOrder.ID)
						.then(function(data) {
							var productQueue =[];
							var productIDs = Underscore.uniq(Underscore.pluck(data.Items, 'ProductID'));
							angular.forEach(productIDs, function(id) {
								productQueue.push(Products.Get(id));
							});
							$q.all(productQueue)
								.then(function(results) {
									angular.forEach(data.Items, function(li) {
										li.Product = angular.copy(Underscore.where(results, {ID:li.ProductID})[0]);
									});
									dfd.resolve(data);
								})
						});
					return dfd.promise;
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

function CheckoutController($q, CurrentOrder, LineItemsList, LineItems, Products, Underscore) {
	var vm = this;
	vm.lineItems = LineItemsList;
	vm.currentOrder = CurrentOrder;

	vm.pagingfunction = function() {
		if (vm.lineItems.Meta.Page < vm.lineItems.Meta.TotalPages) {
			var dfd = $q.defer();
			LineItems.List(CurrentOrder.ID, vm.lineItems.Meta.Page + 1, vm.lineItems.Meta.PageSize)
				.then(function(data) {
					vm.lineItems.Meta = data.Meta;
					var productQueue = [];
					var productIDs = Underscore.uniq(Underscore.pluck(data.Items, 'ProductID'));
					angular.forEach(productIDs, function(id) {
						productQueue.push(Products.Get(id));
					});
					$q.all(productQueue)
						.then(function(results) {
							angular.forEach(data.Items, function(li) {
								li.Product = angular.copy(Underscore.where(results, {ID:li.ProductID})[0]);
							});
							vm.lineItems.Items = [].concat(vm.lineItems.Items, data.Items);
						})
				});
			return dfd.promise;
		}
		else return null;
	}
}

function OrderReviewController() {
	var vm = this;
}

function OrderConfirmationController() {
	var vm = this;
}