angular.module('orderCloud')

    .config(CategoryConfig)
    .controller('CategoryCtrl', CategoryController)

;

function CategoryConfig($stateProvider) {
    $stateProvider
        .state('base.catalog.category', {
            url: '/category/:categoryid',
            templateUrl: 'catalog/category/templates/category.tpl.html',
            controller: 'CategoryCtrl',
            controllerAs: 'category',
            resolve: {
                Category: function(Categories, $stateParams) {
                    return Categories.Get($stateParams.categoryid);
                },
                CategoryList: function(Me, $stateParams) {
                    return Me.ListSubcategories($stateParams.categoryid);
                },
                ProductList: function(Me, $stateParams) {
                    return Me.ListProducts(null, $stateParams.categoryid);
                }
            }
        });
}

function CategoryController(Category, CategoryList, ProductList) {
    var vm = this;
    vm.category = Category;
    vm.categories = CategoryList;
    vm.products = ProductList;
}
