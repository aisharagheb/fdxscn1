angular.module('ordercloud-paging-helpers', ['ordercloud-assignment-helpers'])

    .factory('Paging', PagingHelpers)

;

function PagingHelpers($q, $injector, Assignments) {
    return {
        setSelected: setSelected,
        paging: pagingFunction
    };

    function setSelected(ListArray, AssignmentsArray, ID_Name) {
        if (!ListArray || !AssignmentsArray || !ID_Name) return;
        var assigned = Assignments.getAssigned(AssignmentsArray, ID_Name);
        angular.forEach(ListArray, function(item) {
            if (assigned.indexOf(item.ID) > -1) {
                item.selected = true;
            }
        });
    }

    function pagingFunction(ListObject, ServiceName, AssignmentObjects, AssignmentFunc, ID_Name) {
        var Service = $injector.get(ServiceName);
        if (Service && ListObject.Meta.Page < ListObject.Meta.TotalPages) {
            var queue = [];
            var dfd = $q.defer();
            queue.push(Service.List(null, ListObject.Meta.Page + 1, ListObject.Meta.PageSize));
            if (AssignmentFunc !== undefined) {
                queue.push(AssignmentFunc());
            }
            $q.all(queue).then(function(results) {
                dfd.resolve();
                ListObject.Meta = results[0].Meta;
                ListObject.Items = [].concat(ListObject.Items, results[0].Items);
                if (results[1]) {
                    AssignmentObjects.Meta = results[1].Meta;
                    AssignmentObjects.Items = [].concat(AssignmentObjects.Items, results[1].Items);
                }
                if (AssignmentFunc !== undefined) {
                    setSelected(ListObject.Items, AssignmentObjects.Items, ID_Name);
                }
            });
            return dfd.promise;
        }
        else return null;
    }
}
