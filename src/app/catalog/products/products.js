angular.module('orderCloud')

    .config(ProductListConfig)
    .controller('ProductListCtrl', ProductListController)

;

function ProductListConfig($stateProvider) {
    $stateProvider
        .state('base.catalog.products', {
            url: '/products',
            templateUrl: 'catalog/products/templates/products.tpl.html',
            controller: 'ProductListCtrl',
            controllerAs: 'products'
        });
}

function ProductListController($q, Me, ImpersonationService) {
    var vm = this;
    vm.list = {
        Meta: {},
        Items: []
    };
    vm.searchfunction = Search;
    console.log('test');

    function Search(searchTerm) {
        var dfd = $q.defer();
        Me.ListProducts(searchTerm)
            .then(function(data) {
                dfd.resolve(data);
            }, function(response) {
                ImpersonationService.impersonate(response)
                    .then(function() {
                        dfd.resolve(Me.As().ListProducts(searchTerm));
                    });
            });
        return dfd.promise;
    }
}
