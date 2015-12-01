angular.module( 'orderCloud' )

    .config( SpecsConfig )
    .controller( 'SpecsCtrl', SpecsController )
    .controller( 'SpecEditCtrl', SpecEditController )
    .controller( 'SpecCreateCtrl', SpecCreateController )
    .controller( 'SpecAssignCtrl', SpecAssignController )

;

function SpecsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.specs', {
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
        .state( 'base.specEdit', {
            url: '/specs/:specid/edit',
            templateUrl:'specs/templates/specEdit.tpl.html',
            controller:'SpecEditCtrl',
            controllerAs: 'specEdit',
            resolve: {
                SelectedSpec: function($stateParams, Specs) {
                    return Specs.Get($stateParams.specid);
                }
            }
        })
        .state( 'base.specCreate', {
            url: '/specs/create',
            templateUrl:'specs/templates/specCreate.tpl.html',
            controller:'SpecCreateCtrl',
            controllerAs: 'specCreate'
        })
        .state('base.specAssign', {
            url: '/specs/:specid/assign',
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

    vm.addSpecOpt = function() {
        vm.spec.Options.push({ID: vm.SpecOptID, Value: vm.SpecOptValue, PriceMarkup: vm.SpecOptMarkup, PriceMarkupType: vm.SpecOptMarkupType, IsOpenText: vm.SpecOptOpen, ListOrder: vm.SpecOptListOrder});
        if (vm.SpecOptDefault) {
            vm.spec.DefaultOptionID = vm.SpecOptID;
        }
        vm.SpecOptID = null;
        vm.SpecOptValue = null;
        vm.SpecOptMarkup = null;
        vm.SpecOptMarkupType = null;
        vm.SpecOptOpen = false;
        vm.SpecOptListOrder = null;
        vm.SpecOptDefault = false;
    };

    vm.deleteSpecOpt = function($index) {
        if (vm.spec.DefaultOptionID == vm.spec.Options[$index].ID) {
            vm.spec.DefaultOptionID = null;
        }
        vm.spec.Options.splice($index, 1);
    };

    vm.Submit = function() {
        Specs.Update(specid, vm.spec)
            .then(function() {
                $state.go('base.specs')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        Specs.Delete(specid)
            .then(function() {
                $state.go('base.specs')
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function SpecCreateController( $exceptionHandler, $state, Specs) {
    var vm = this;
    vm.spec = {};
    vm.spec.Options = new Array;

    vm.addSpecOpt = function() {
        vm.spec.Options.push({ID: vm.SpecOptID, Value: vm.SpecOptValue, PriceMarkup: vm.SpecOptMarkup, PriceMarkupType: vm.SpecOptMarkupType, IsOpenText: vm.SpecOptOpen, ListOrder: vm.SpecOptListOrder});
        if (vm.SpecOptDefault) {
            vm.spec.DefaultOptionID = vm.SpecOptID;
        }
        vm.SpecOptID = null;
        vm.SpecOptValue = null;
        vm.SpecOptMarkup = null;
        vm.SpecOptMarkupType = null;
        vm.SpecOptOpen = false;
        vm.SpecOptListOrder = null;
        vm.SpecOptDefault = false;
    };

    vm.deleteSpecOpt = function($index) {
        if (vm.spec.DefaultOptionID == vm.spec.Options[$index].ID) {
            vm.spec.DefaultOptionID = null;
        }
        vm.spec.Options.splice($index, 1);
    };

    vm.Submit = function() {
        Specs.Create(vm.spec)
            .then(function() {
                $state.go('base.specs')
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
        return Specs.DeleteProductAssignment(vm.Spec.ID, null, ItemID);
    }

    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc);
    }

    function AssignmentFunc() {
        return Specs.ListProductAssignments(vm.Spec.ID, null, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Products', vm.assignments, AssignmentFunc);
    }
}

//function SpecAssignController(ProductList, Assignments, SelectedSpec, Specs) {
//    var vm = this;
//    vm.list = ProductList;
//    vm.assignments = Assignments.Items;
//    vm.spec = SelectedSpec;
//    setSelected(Assignments, ProductList);
//
//    vm.saveAssignments = function(form) {
//        angular.forEach(ProductList.Items, function(product, index) {
//            if (form['assignCheckbox' + index].$dirty) {
//                if (product.selected) {
//                    var toSave = true;
//                    angular.forEach(Assignments.Items, function(assignedProduct) {
//                        if (assignedProduct.ProductID === product.ID) {
//                            toSave = false;
//                        }
//                    });
//                    if (toSave) {
//                        Specs.SaveAssignment({SpecID: SelectedSpec.ID, ProductID: product.ID});
//
//                    }
//                }
//                else {
//                    angular.forEach(Assignments.Items, function(assignedProduct, index) {
//                        if (assignedProduct.ProductID === product.ID) {
//                            Specs.DeleteAssignment(SelectedSpec.ID, product.ID);
//                            Assignments.Items.splice(index, 1);
//                            index = index - 1;
//                        }
//                    });
//                }
//            }
//        });
//        angular.forEach(Assignments.Items, function(assignedProduct, index) {
//            if (!assignedProduct.ProductID) {
//                Specs.DeleteAssignment(SelectedSpec.ID, assignedProduct.ID);
//                Assignments.Items.splice(index, 1);
//                index = index - 1;
//            }
//        });form.$setPristine(true);
//        setSelected(Assignments, ProductList);
//    }
//
//    function setSelected(Assignments, ProductList) {
//        angular.forEach(ProductList.Items, function(product) {
//            angular.forEach(Assignments.Items, function(assignedProduct) {
//                if (assignedProduct.ProductID === product.ID) {
//                    product.selected = true;
//                }
//            });
//        });
//    }
//    vm.resetSelections = function(index, form) {
//        var matched = false;
//        angular.forEach(Assignments.Items, function(assignedProduct) {
//            if (assignedProduct.ProductID === ProductList.Items[index].ID) {
//                matched = true;
//            }
//        });
//        if (matched && ProductList.Items[index].selected) {
//            form['assignCheckbox' + index].$setPristine(true);
//        }
//        else if (!matched && !ProductList.Items[index].selected) {
//            form['assignCheckbox' + index].$setPristine(true);
//        }
//    }
//}
