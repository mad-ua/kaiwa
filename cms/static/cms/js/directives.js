'use strict';

angular.module('JSONedit', ['ui.sortable'])
.directive('ngModelOnblur', function() {
    // override the default input to update on blur
    // from http://jsfiddle.net/cn8VF/
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attr, ngModelCtrl) {
            if (attr.type === 'radio' || attr.type === 'checkbox') return;
            
            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function() {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(elm.val());
                });         
            });
        }
    };
})
.directive('json', ["$compile", function($compile) {
  return {
    restrict: 'E',
    scope: {
      child: '=',
      type: '@',
      defaultCollapsed: '='
    },
    link: function(scope, element, attributes) {
        var stringName = "Text";
        var objectName = "Object";
        var arrayName = "Array";
        var refName = "Reference";
        var boolName = "Boolean";
        var numberName = "Number";
        var nodeName = "Node";
        var messageName = "Message";
        var optionName = "Option";
        var adviserName = "Adviser";


//        console.log("scope = ", scope, "elem = ", element, "attribs = ", attributes);

        scope.valueTypes = [stringName, objectName, arrayName, refName, boolName,
                            numberName, nodeName, messageName, optionName, adviserName];
        scope.sortableOptions = {
            axis: 'y'
        };
        if (scope.$parent.defaultCollapsed === undefined) {
            scope.collapsed = false;
        } else {
            scope.collapsed = scope.defaultCollapsed;
        }
        if (scope.collapsed) {
            scope.chevron = "glyphicon-chevron-right";
        } else {
            scope.chevron = "glyphicon-chevron-down";
        }
        

        //////
        // Helper functions
        //////

        var getType = function(obj) {
            var type = Object.prototype.toString.call(obj);
            if (type === "[object Object]") {
                return "Object";
            } else if(type === "[object Array]"){
                return "Array";
            } else if(type === "[object Boolean]"){
                return "Boolean";
            } else if(type === "[object Number]"){
                return "Number";
            } else {
                return "Literal";
            }
        };
        var isNumber = function(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        };
        scope.getType = function(obj) {
            return getType(obj);
        };
        scope.toggleCollapse = function() {
            if (scope.collapsed) {
                scope.collapsed = false;
                scope.chevron = "glyphicon-chevron-down";
            } else {
                scope.collapsed = true;
                scope.chevron = "glyphicon-chevron-right";
            }
        };
        scope.moveKey = function(obj, key, newkey) {
            //moves key to newkey in obj
            if (key !== newkey) {
                obj[newkey] = obj[key];
                delete obj[key];
            }
        };
        scope.deleteKey = function(obj, key) {
            if (getType(obj) == "Object") {
                if( confirm('Delete "'+key+'" and all it contains?') ) {
                    delete obj[key];
                }
            } else if (getType(obj) == "Array") {
                if( confirm('Delete "'+obj[key]+'"?') ) {
                    obj.splice(key, 1);
                }
            } else {
                console.error("object to delete from was " + obj);
            }
        };
        scope.addItem = function(obj) {
            if (getType(obj) == "Object") {
                // check input for key
                if (scope.keyName == undefined || scope.keyName.length == 0){
                    alert("Please fill in a name");
                } else if (scope.keyName.indexOf("$") == 0){
                    alert("The name may not start with $ (the dollar sign)");
                } else if (scope.keyName.indexOf("_") == 0){
                    alert("The name may not start with _ (the underscore)");
                } else {
                    if (obj[scope.keyName]) {
                        if( !confirm('An item with the name "'+scope.keyName
                            +'" exists already. Do you really want to replace it?') ) {
                            return;
                        }
                    }
                    if (scope.valueType == numberName && !isNumber(scope.valueName)){
                        alert("Please fill in a number");
                        return;
                    }
                    console.log(scope.valueType, obj);
                    // add item to object
                    switch(scope.valueType) {
                        case stringName: obj[scope.keyName] = scope.valueName ? scope.valueName : "";
                                        break;
                        case numberName: obj[scope.keyName] = scope.possibleNumber(scope.valueName);
                                         break;
                        case objectName:  obj[scope.keyName] = {};
                                        break;
                        case arrayName:   obj[scope.keyName] = [];
                                        break;
                        case refName: obj[scope.keyName] = {"Reference!!!!": "todo"};
                                        break;
                        case boolName: obj[scope.keyName] = false;
                                        break;
                        case messageName:
                            var maxT=0;
                            $.map(Object.keys(o), function(e){
                                var v = parseInt(e.slice(-1));
                                if (v > maxT) maxT=v;
                            })
                            valueName = maxT;
                            obj["Text" + (maxT + 1)] = scope.valueName ? scope.valueName : "Input message text here";
                                        break;
                    }
                    //clean-up
                    scope.keyName = "";
                    scope.valueName = "";
                    scope.showAddKey = false;
                }
            } else if (getType(obj) == "Array") {
                if (scope.valueType == numberName && !isNumber(scope.valueName)){
                    alert("Please fill in a number");
                    return;
                }
                console.log(scope.valueType, obj);
                // add item to array
                switch(scope.valueType) {
                    case stringName: obj.push(scope.valueName ? scope.valueName : "");
                                    break;
                    case numberName: obj.push(scope.possibleNumber(scope.valueName));
                                     break;
                    case objectName:  obj.push({});
                                    break;
                    case arrayName:   obj.push([]);
                                    break;
                    case boolName:   obj.push(false);
                                    break;
                    case refName: obj.push({"Reference!!!!": "todo"});
                                    break;
                }
                scope.valueName = "";
                scope.showAddKey = false;
            } else {
                console.error("object to add to was " + obj);
            }
        };
        scope.possibleNumber = function(val) {
            return isNumber(val) ? parseFloat(val) : val;
        };

        // this set of fields helps us to recognize where we are
        scope.rootFields = ['KC management', 'Nodes management', 'task_id'];
        scope.nodeFields = ['Answers', 'Messages'];
        scope.kcManagementFields = ['Name', 'Weight'];
        scope.optionFields = ['?Score', 'Target', 'Text'];
        scope.advisersManagementFields = ['Name', 'Avatar'];

        // list of fields which can not be deleted
        scope.noDelRootFields = ['CT Name', 'Advisers Management', 'KC management', 'Nodes management', 'task_id']
        scope.noDelNodeFields = ['Answers', 'Messages', 'KC', 'Weight'];

        scope.all = function(obj, keys){
            return $.map(keys, function(e){
                if(typeof(e) == "string" && e[0] == '?') { // this means not required field.
                    return
                }
                return obj[e] != undefined;
            }).indexOf(false) == -1
        };

        scope.isAdvisersManagementObject = function(object) {
            return scope.all(object, scope.advisersManagementFields);
        }

        scope.isRootObject = function(object) {
            return scope.all(object, scope.rootFields);
        };

        scope.isNodeObject = function(object) {
            return scope.all(object, scope.nodeFields);
        };

        scope.isKcManagementObject = function(object) {
            return scope.all(object, scope.kcManagementFields);
        };

        scope.isOptionObject = function(object) {
            return scope.all(object, scope.optionFields);
        };


        scope._showPlusButton = function(scope, child, key) {
//            console.log("_showPlusButton child = ", child, " key = ", key);
            var isRoot = scope.isRootObject(child);
            var isNode = scope.isNodeObject(child);
            var isKcManagement = scope.isKcManagementObject(child);
            var isOption = scope.isOptionObject(child);
            var isAdvisersManagement = scope.isAdvisersManagementObject(child);
            if (!isRoot && (isKcManagement || isAdvisersManagement || isOption || isNode || isRoot)) {return false};
            return true;
        };


        scope._canDeleteNode = function(scope, child, key) {
            /** Here will be a set of rules for deleting properties, objects in CTE.
            * We can not delete these properties:
            * CT Name
            * Advisers Management
            * KC Management
            * * KC -> Name and Weight
            * But we can delete KC Management -> KC !!!
            *
            * Nodes Management
            * Nodes Management -> Node -> Answers
            * Nodes Management -> Node -> Weight
            */
            var isRoot = scope.isRootObject(child);
            var isNode = scope.isNodeObject(child);
            var isKcManagement = scope.isKcManagementObject(child);
            var isOption = scope.isOptionObject(child);
            var isAdvisersManagement = scope.isAdvisersManagementObject(child);

//            if(typeof(child) == 'object'){
//                console.log("canDeleteNode IS ROOT ", isRoot, "child= ", child, "key = ", key);
//            }


            if (isRoot && scope.noDelRootFields.indexOf(key) != -1) {return false};
            if (!isRoot && isKcManagement && scope.kcManagementFields.indexOf(key) != -1) {return false};
            if (!isRoot && isOption && scope.optionFields.indexOf(key) != -1) {return false};
            if (!isRoot && isNode && scope.noDelNodeFields.indexOf(key) != -1) {return false};
            if (!isRoot && isAdvisersManagement && scope.advisersManagementFields.indexOf(key) != -1) {return false};
//            if (scope.isRootObject(child))
            return true;
        };

        //////
        // Template Generation
        //////

        // Note:
        // sometimes having a different ng-model and then saving it on ng-change
        // into the object or array is necessary for all updates to work
        
        // recursion
        var switchTemplate = 
            '<span ng-switch on="getType(val)" >'
                + '<json ng-switch-when="Object" child="val" type="object" default-collapsed="defaultCollapsed"></json>'
                + '<json ng-switch-when="Array" child="val" type="array" default-collapsed="defaultCollapsed"></json>'
                + '<span ng-switch-when="Boolean" type="boolean">'
                    + '<input type="checkbox" ng-model="val" ng-model-onblur ng-change="child[key] = val">'
                + '</span>'
                + '<span ng-switch-when="Number" type="number"><input type="text" ng-model="val" '
                    + 'placeholder="0" ng-model-onblur ng-change="child[key] = possibleNumber(val)"/>'
                + '</span>'
                + '<span ng-switch-default class="jsonLiteral"><input type="text" ng-model="val" '
                    + 'placeholder="Empty" ng-model-onblur ng-change="child[key] = val"/>'
                + '</span>'
            + '</span>';
        
        // display either "plus button" or "key-value inputs"
        var addItemTemplate = 
        '<div ng-switch on="showAddKey" class="block" >'
            + '<span ng-switch-when="true">';
                if (scope.type == "object"){
                   // input key
                    addItemTemplate += '<input ng-show="$parent.valueType != \''+ messageName +'\'" placeholder="Name" type="text" ui-keyup="{\'enter\':\'addItem(child)\'}" '
                        + 'class="form-control input-sm addItemKeyInput" ng-model="$parent.keyName" /> ';
                }
                addItemTemplate += 
                // value type dropdown
                '<select ng-model="$parent.valueType" ng-options="option for option in valueTypes" class="form-control input-sm"'
                    + 'ng-init="$parent.valueType=\''+stringName+'\'" ui-keydown="{\'enter\':\'addItem(child)\'}"></select>'
                // input value
                + '<span ng-show="$parent.valueType == \''+stringName+'\'"> : <input type="text" placeholder="Value" '
                    + 'class="form-control input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/></span> '
                + '<span ng-show="$parent.valueType == \''+numberName+'\'"> : <input type="text" placeholder="Value" '
                    + 'class="form-control input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/></span> '
                // Add button
                + '<button type="button" class="btn btn-primary btn-sm" ng-click="addItem(child)">Add</button> '
                + '<button type="button" class="btn btn-default btn-sm" ng-click="$parent.showAddKey=false">Cancel</button>'
            + '</span>'
            + '<span ng-switch-default>'
                // plus button
                + '<button type="button" class="addObjectItemBtn" ng-click="$parent.showAddKey = true" ng-show="$parent._showPlusButton($parent, child, key)"><i class="glyphicon glyphicon-plus"></i></button>'
            + '</span>'
        + '</div>';

        // start template
        if (scope.type == "object"){
            var template = '<i ng-click="toggleCollapse()" class="glyphicon" ng-class="chevron"></i>'
            + '<span class="jsonItemDesc">'+objectName+'</span>'
            + '<div class="jsonContents" ng-hide="collapsed">'
                // repeat
                + '<span class="block" ng-hide="key.indexOf(\'_\') == 0" ng-repeat="(key, val) in child">'
                    // object key
                    + '<span class="jsonObjectKey">'
                        + '<input class="keyinput" type="text" ng-model="newkey" ng-init="newkey=key" '
                            + 'ng-blur="moveKey(child, key, newkey)"/>'
                        // delete button
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-show="_canDeleteNode($parent, child, key)" ng-click="deleteKey(child, key)"></i>'
                    + '</span>'
                    // object value
                    + '<span class="jsonObjectValue">' + switchTemplate + '</span>'
                + '</span>'
                // repeat end
                + addItemTemplate
            + '</div>';
        } else if (scope.type == "array") {
            var template = '<i ng-click="toggleCollapse()" class="glyphicon"'
            + 'ng-class="chevron"></i>'
            + '<span class="jsonItemDesc">'+arrayName+'</span>'
            + '<div class="jsonContents" ng-hide="collapsed">'
                + '<ol class="arrayOl" ui-sortable="sortableOptions" ng-model="child">'
                    // repeat
                    + '<li class="arrayItem" ng-repeat="(key, val) in child track by $index">'
                        // delete button
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, $index)"></i>'
                        + '<i class="moveArrayItemBtn glyphicon glyphicon-align-justify"></i>'
                        + '<span>' + switchTemplate + '</span>'
                    + '</li>'
                    // repeat end
                + '</ol>'
                + addItemTemplate
            + '</div>';
        } else {
            console.error("scope.type was "+ scope.type);
        }

        var newElement = angular.element(template);
        $compile(newElement)(scope);
        element.replaceWith ( newElement );
    }
  };
}]);
