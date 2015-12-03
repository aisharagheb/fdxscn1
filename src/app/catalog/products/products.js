angular.module('orderCloud')

    .config(ProductListConfig)
    .controller('ProductListCtrl', ProductListController)

;

function ProductListConfig($stateProvider) {
    $stateProvider
        .state('base.catalog.products', {
            url: '/products',
            templateUrl: 'catalog/templates/products.tpl.html',
            controller: 'ProductListCtrl',
            controllerAs: 'products'
        });
}

function ProductListController() {

}
