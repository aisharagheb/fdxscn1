angular.module('orderCloud')

    .config(ProductConfig)
    .controller('ProductCtrl', ProductController)

;

function ProductConfig($stateProvider) {
    $stateProvider
        .state('base.catalog.product', {
            url: '/product/:productid',
            templateUrl: 'catalog/product/templates/product.tpl.html',
            controller: 'ProductCtrl',
            controllerAs: 'product'
        });
}

function ProductController() {

}
