angular.module('ordercloud-assignments', []);
angular.module('ordercloud-assignments')

    .factory( 'Assignments', AssignmentsFactory )

;

function AssignmentsFactory($injector) {
    var service = {
        saveAssignments: saveAssignments,
        resetSelections: resetSelections
    };
    return service;

    function saveAssignments(servicename, serviceid, assignBuyer, userGroups, assignedUserGroups, form) {
        var assignmentService = $injector.get(servicename),
            serviceidname = servicename.replace(/es+$/, '').replace(/s+$/, '') + 'ID',
            assignObject = {};
        if (assignBuyer) {
            assignObject[serviceidname] = serviceid
            assignmentService.SaveAssignment(buyerid, assignObject);
        }
        else {
            angular.forEach(userGroups.Items, function(group, index) {
                if (form['assignCheckbox' + index].$dirty) {
                    if (group.selected) {
                        var toSave = true;
                        angular.forEach(assignedUserGroups, function(assignedGroup) {
                            if (assignedGroup.UserGroupID === group.ID) {
                                toSave = false;
                            }
                        });
                        if (toSave) {
                            assignObject = {
                                UserID: null,
                                UserGroupID: group.ID
                            };
                            assignObject[serviceidname] = serviceid;
                            assignmentService.SaveAssignment(assignObject);
                            assignedUserGroups.Items.push(assignObject);
                        }
                    }
                    else {
                        angular.forEach(assignedUserGroups.Items, function(assignedGroup, index) {
                            if (assignedGroup.UserGroupID === group.ID) {
                                assignmentService.DeleteAssignment(serviceid, null, group.ID);
                                assignedUserGroups.Items.splice(index, 1);
                                index = index - 1;
                            }
                        });
                    }
                }
            });
            angular.forEach(assignedUserGroups.Items, function(assignedGroup, index) {
                if (!assignedGroup.UserGroupID && !assignedGroup.UserID && assignedGroup.CostCenterID) {
                    assignmentService.DeleteAssignment(buyerid, serviceid, null, null);
                    assignedUserGroups.Items.splice(index, 1);
                    index = index - 1;
                }
            });
            form.$setPristine(true);
        }
    }

    function resetSelections(index, assignedUserGroups, userGroups, form) {
        var matched = false;
        angular.forEach(assignedUserGroups.Items, function(assignedGroup) {
            if (assignedGroup.UserGroupID === userGroups.Items[index].ID) {
                matched = true;
            }
        });
        if (matched && userGroups.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
        else if (!matched && !userGroups.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
    }
}