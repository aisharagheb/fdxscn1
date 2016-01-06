angular.module( 'orderCloud' )

    .config( SpecsConfig )
    .controller( 'SpecsCtrl', SpecsController )
    .controller( 'SpecEditCtrl', SpecEditController )
    .controller( 'SpecCreateCtrl', SpecCreateController )
    .controller( 'SpecAssignCtrl', SpecAssignController )

;

function SpecsConfig( $stateProvider ) {
    $stateProvider
        .state( 'specs', {
            parent: 'base',
            url: '/specs',
            templateUrl:'specs/templates/specs.tpl.html',
            controller:'SpecsCtrl',
            controllerAs: 'specs',
            data: {componentName: 'Specs'},
            resolve: {
                SpecList: function(Specs) {
                    return Specs.List();
                }
            }
        })
        .state( 'specs.edit', {
            url: '/:specid/edit',
            templateUrl:'specs/templates/specEdit.tpl.html',
            controller:'SpecEditCtrl',
            controllerAs: 'specEdit',
            resolve: {
                SelectedSpec: function($stateParams, Specs) {
                    return Specs.Get($stateParams.specid);
                }
            }
        })
        .state( 'specs.create', {
            url: '/create',
            templateUrl:'specs/templates/specCreate.tpl.html',
            controller:'SpecCreateCtrl',
            controllerAs: 'specCreate'
        })
        .state('specs.assign', {
            url: '/:specid/assign',
            templateUrl: 'specs/templates/specAssign.tpl.html',
            controller: 'SpecAssignCtrl',
            controllerAs: 'specAssign',
            resolve: {
                ProductList: function (Products) {
                    return Products.List(null, 1, 20);
                },
                ProductAssignments: function ($stateParams, Specs) {
                    return Specs.ListProductAssignments($stateParams.specid);
                },
                SelectedSpec: function ($stateParams, Specs) {
                    return Specs.Get($stateParams.specid);
                }
            }
        })
}

function SpecsController( SpecList ) {
    var vm = this;
    vm.list = SpecList;
}

function SpecEditController( $exceptionHandler, $state, SelectedSpec, Specs ) {
    var vm = this,
        specid = angular.copy(SelectedSpec.ID);
    vm.specName = angular.copy(SelectedSpec.Name);
    vm.spec = SelectedSpec;
    vm.Option = {};
    vm.Options = vm.spec.Options;

    vm.addSpecOpt = function() {
        if (vm.DefaultOptionID) {
            vm.spec.DefaultOptionID = vm.Option.ID;
        }
        Specs.CreateOption(specid, vm.Option)
            .then(function() {
                    vm.Option = null;
                })
            };

    vm.deleteSpecOpt = function($index) {
        if (vm.spec.DefaultOptionID == vm.spec.Options[$index].ID) {
            vm.spec.DefaultOptionID = null;
        }
        vm.Options.splice($index, 1);
        Specs.DeleteOption(specid, vm.spec.Options[$index].ID)
    };

    vm.Submit = function() {
        Specs.Update(specid, vm.spec)
            .then(function() {
                $state.go('specs', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        Specs.Delete(specid)
            .then(function() {
                $state.go('specs', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function SpecCreateController( $exceptionHandler, $q, $state, Specs) {
    var vm = this;
    vm.spec = {};
    vm.Options = [];
    var DefaultOptionID;

    vm.addSpecOpt = function() {
        vm.Options.push(vm.Option);
        if (vm.DefaultOptionID) {
            DefaultOptionID = vm.Option.ID;
        }
        vm.Option = null;
        vm.DefaultOptionID = null;
    };

    vm.deleteSpecOpt = function($index) {
        if (vm.spec.DefaultOptionID == vm.Options[$index].ID) {
            vm.spec.DefaultOptionID = null;
        }
        vm.Options.splice($index, 1);
    };

    vm.Submit = function() {
        Specs.Create(vm.spec)
            .then(function(spec) {
                var queue = [],
                    dfd = $q.defer();
                angular.forEach(vm.Options, function(opt) {
                    queue.push(Specs.CreateOption(spec.ID, opt));
                });
                $q.all(queue).then(function() {
                    dfd.resolve();
                    if(DefaultOptionID != null){
                        Specs.Patch(spec.ID, {DefaultOptionID: DefaultOptionID})
                    }
                    $state.go('specs', {}, {reload: true});
                })
                return dfd.promise;
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}
function SpecAssignController(Assignments, Paging, ProductList, ProductAssignments, SelectedSpec, Specs) {
    var vm = this;
    vm.Spec = SelectedSpec;
    vm.list = ProductList;
    vm.assignments = ProductAssignments;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return Specs.SaveProductAssignment({
            SpecID: vm.Spec.ID,
            ProductID: ItemID
        });
    }

    function DeleteFunc(ItemID) {
        return Specs.DeleteProductAssignment(vm.Spec.ID, ItemID);
    }

    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'ProductID');
    }

    function AssignmentFunc() {
        return Specs.ListProductAssignments(vm.Spec.ID, null, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Products', vm.assignments, AssignmentFunc);
    }
}
