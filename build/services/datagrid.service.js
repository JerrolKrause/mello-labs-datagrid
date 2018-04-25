var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from "@angular/core";
import { Datagrid } from "../typings";
import * as _ from "lodash";
var DataGridService = /** @class */ (function () {
    function DataGridService() {
    }
    /**
     * Maps external table/column/control properties to those needed by the datatable
     * @param {?} array
     * @param {?} mapObj
     * @return {?}
     */
    DataGridService.prototype.mapPropertiesDown = /**
     * Maps external table/column/control properties to those needed by the datatable
     * @param {?} array
     * @param {?} mapObj
     * @return {?}
     */
    function (array, mapObj) {
        return array.map(function (element) {
            for (var /** @type {?} */ key in mapObj) {
                if (mapObj.hasOwnProperty(key)) {
                    // If the default property needed by the DT is NOT found in the object
                    // This avoids issues where the correct property is actually being passed in even though it is mapped
                    // If the default property needed by the DT is NOT found in the object
                    // This avoids issues where the correct property is actually being passed in even though it is mapped
                    if (!element[key]) {
                        // If mapping data, any column references will be camel case instead of title case. Remap to camel case
                        element[key] = element[mapObj[key]];
                        // delete element[mapObj[key]];
                    }
                }
            }
            return element;
        });
    };
    /**
     * If external map properties are specified, map them back to the input types before emitting them up to the host component
     * @param {?} array
     * @param {?} mapObj
     * @return {?}
     */
    DataGridService.prototype.mapPropertiesUp = /**
     * If external map properties are specified, map them back to the input types before emitting them up to the host component
     * @param {?} array
     * @param {?} mapObj
     * @return {?}
     */
    function (array, mapObj) {
        // TODO: Cleaning up old properties isn't working for some reason, it deletes the wrong property even though the key is correct
        // console.warn('mapProperties', array, mapObj);
        // TODO: Cleaning up old properties isn't working for some reason, it deletes the wrong property even though the key is correct
        // console.warn('mapProperties', array, mapObj);
        return JSON.parse(JSON.stringify(array)).map(function (element) {
            // console.warn(element);
            // console.warn(element);
            for (var /** @type {?} */ key in mapObj) {
                if (mapObj.hasOwnProperty(key)) {
                    // If the default property needed by the DT is NOT found in the object
                    // This avoids issues where the correct property is actually being passed in even though it is mapped
                    // if (!element[mapObj[key]]) {
                    element[mapObj[key]] = element[key];
                    // console.warn(element);
                    // }
                    // delete element[key];
                    // Possible related to mapping a property down
                }
            }
            return element;
        });
    };
    /**
     * Map the columns into an object based on its property name
     * @param {?} columns
     * @return {?}
     */
    DataGridService.prototype.mapColumns = /**
     * Map the columns into an object based on its property name
     * @param {?} columns
     * @return {?}
     */
    function (columns) {
        var /** @type {?} */ columnMap = {};
        columns.forEach(function (column) { return (columnMap[column.prop] = column); });
        return columnMap;
    };
    /**
     * Get the rows that should be visible in the scroll port based on the vertical scroll position
     * @param {?} rows
     * @param {?} scrollProps
     * @param {?} rowsVisible
     * @param {?} rowHeight
     * @return {?}
     */
    DataGridService.prototype.getVisibleRows = /**
     * Get the rows that should be visible in the scroll port based on the vertical scroll position
     * @param {?} rows
     * @param {?} scrollProps
     * @param {?} rowsVisible
     * @param {?} rowHeight
     * @return {?}
     */
    function (rows, scrollProps, rowsVisible, rowHeight) {
        // console.log('getVisibleRowsoffSetRowsFromTop', rows, this.scrollProps, this.rowHeight, this.gridProps);
        var /** @type {?} */ rowsNew = rows.slice();
        var /** @type {?} */ buffer = 5;
        if (window.navigator.userAgent.indexOf('Edge') > -1) {
            buffer = 15;
        }
        var /** @type {?} */ offSetRowsFromTop = Math.floor(scrollProps.scrollTop / (rowHeight + 1));
        if (offSetRowsFromTop - buffer > 0) {
            offSetRowsFromTop -= buffer;
        }
        if (offSetRowsFromTop < buffer) {
            offSetRowsFromTop = 0;
        }
        var /** @type {?} */ rowsEnd = offSetRowsFromTop + rowsVisible + buffer * 2;
        if (rowsEnd > rowsNew.length) {
            rowsEnd = rowsNew.length;
        }
        return rowsNew.slice(offSetRowsFromTop, rowsEnd);
    };
    /**
     * Create an object of columns that should be visible based on horizontal scroll width
     * @param {?} columns
     * @param {?} scrollProps
     * @param {?} gridProps
     * @return {?}
     */
    DataGridService.prototype.getVisibleColumns = /**
     * Create an object of columns that should be visible based on horizontal scroll width
     * @param {?} columns
     * @param {?} scrollProps
     * @param {?} gridProps
     * @return {?}
     */
    function (columns, scrollProps, gridProps) {
        var /** @type {?} */ colsExternal = [];
        var /** @type {?} */ buffer = 150;
        // let widthTotal = this.scrollProps.scrollLeft;
        var /** @type {?} */ widthCurrent = 0;
        // Loop through column widths
        // Loop through column widths
        for (var /** @type {?} */ i = 0; i < columns.length; i++) {
            var /** @type {?} */ column = columns[i];
            // If current column width + all widths before this one is greater than the left scroll position
            // If total column widths is less than the width of the body minus the left scroll position
            // If current column width + all widths before this one is greater than the left scroll position
            // If total column widths is less than the width of the body minus the left scroll position
            if (column.$$width + widthCurrent + buffer > scrollProps.scrollLeft &&
                widthCurrent < gridProps.widthViewPort + scrollProps.scrollLeft + buffer) {
                colsExternal.push(column);
            }
            // Update current width by adding the current column
            widthCurrent = widthCurrent + column.$$width;
        }
        return colsExternal.slice();
        // this.columnsExternal = colsExternal;
    };
    /**
     * Filters based on the global object. Also creates the necessary filter structure.
     * @param {?} array
     * @param {?} filterGlobal
     * @return {?}
     */
    DataGridService.prototype.filterGlobal = /**
     * Filters based on the global object. Also creates the necessary filter structure.
     * @param {?} array
     * @param {?} filterGlobal
     * @return {?}
     */
    function (array, filterGlobal) {
        // Loop through the existing props supplied and create the appropriate filter object
        var /** @type {?} */ filters = [];
        filterGlobal.props.forEach(function (prop) {
            filters.push({
                operator: 'search',
                prop: prop,
                value: filterGlobal.term,
            });
        });
        return this.filterArray(array, filters);
    };
    /**
     * Filter an array of objects with an array of filters
     * @param {?} array
     * @param {?} filters
     * @return {?}
     */
    DataGridService.prototype.filterArray = /**
     * Filter an array of objects with an array of filters
     * @param {?} array
     * @param {?} filters
     * @return {?}
     */
    function (array, filters) {
        // console.warn('filterArray 1: ', array, filters );
        // Get number of contains filters
        var /** @type {?} */ contains = filters.filter(function (filter) { return filter.operator === 'contains'; });
        // Get searches which as passed from the global search option
        var /** @type {?} */ searches = filters.filter(function (filter) { return filter.operator === 'search'; });
        // Equals filters are an OR within the same field but an AND between different fields
        // Map down to dictionary with field as key so we can handle that difference
        var /** @type {?} */ equals = {};
        filters.filter(function (filter) { return filter.operator === 'eq'; }).forEach(function (filter) {
            if (!equals[filter.prop]) {
                equals[filter.prop] = [];
            }
            equals[filter.prop].push(filter);
        });
        // Perform filter and return
        // Perform filter and return
        return array.filter(function (row) {
            // Searches is an OR. If it does not contain, it should be filtered out
            // Searches is an OR. If it does not contain, it should be filtered out
            if (searches.length) {
                var /** @type {?} */ matches = false;
                for (var /** @type {?} */ i = 0; i < searches.length; i++) {
                    var /** @type {?} */ filter = searches[i];
                    // If this field isn't found on the row, return false
                    // If this field isn't found on the row, return false
                    if (!row[filter.prop]) {
                        return false;
                    }
                    // Perform some cleanup on the strings
                    var /** @type {?} */ rowValue = row[filter.prop]
                        .toString()
                        .toLowerCase()
                        .trim();
                    var /** @type {?} */ filterValue = filter.value
                        .toString()
                        .toLowerCase()
                        .trim();
                    if (rowValue.indexOf(filterValue) !== -1) {
                        matches = true;
                        break;
                    }
                }
                // If this group does not have at least one match, return false
                // If this group does not have at least one match, return false
                if (!matches) {
                    return false;
                }
            }
            // Contains is an AND. If it does not contain, it should be filtered out
            // Contains is an AND. If it does not contain, it should be filtered out
            if (contains.length) {
                var /** @type {?} */ matches = false;
                for (var /** @type {?} */ i = 0; i < contains.length; i++) {
                    var /** @type {?} */ filter = contains[i];
                    // If this field isn't found on the row, return false
                    // If this field isn't found on the row, return false
                    if (!row[filter.prop]) {
                        return false;
                    }
                    // console.warn(row[filter.prop], '-', filter.prop)
                    // Perform some cleanup on the strings
                    var /** @type {?} */ rowValue = row[filter.prop]
                        .toString()
                        .toLowerCase()
                        .trim();
                    var /** @type {?} */ filterValue = filter.value
                        .toString()
                        .toLowerCase()
                        .trim();
                    if (rowValue.indexOf(filterValue) !== -1) {
                        matches = true;
                        break;
                    }
                }
                // If this group does not have at least one match, return false
                // If this group does not have at least one match, return false
                if (!matches) {
                    return false;
                }
            }
            // Equals contains sets of rules groups. Each rule group is based on field and is an OR. Between rule groups it must be an AND
            // Results must contain at least one match within each field
            // Equals contains sets of rules groups. Each rule group is based on field and is an OR. Between rule groups it must be an AND
            // Results must contain at least one match within each field
            if (Object.keys(equals).length) {
                var /** @type {?} */ allGroupMatches = 0;
                // Loop through all equals collections
                // Loop through all equals collections
                for (var /** @type {?} */ key in equals) {
                    if (equals.hasOwnProperty(key)) {
                        // Within each field, only need 1 match to include in the collection
                        var /** @type {?} */ matches = false;
                        for (var /** @type {?} */ i = 0; i < equals[key].length; i++) {
                            var /** @type {?} */ filter = equals[key][i];
                            // If this field isn't found on the row, return false
                            // If this field isn't found on the row, return false
                            if (!row[filter.prop] && row[filter.prop] !== false) {
                                return false;
                            }
                            // If row property is an array of strings, see if the field value is in the array
                            // If row property is an array of strings, see if the field value is in the array
                            if (Array.isArray(row[filter.prop]) &&
                                row[filter.prop] &&
                                row[filter.prop].indexOf(filter.value.toString()) > -1) {
                                matches = true;
                                break;
                            }
                            // If the field value matches the filter value
                            // If the field value matches the filter value
                            if (row[filter.prop] === filter.value) {
                                matches = true;
                                break;
                            }
                            // If this is a boolean and needs to match true false
                            // If this is a boolean and needs to match true false
                            if ((filter.value === 'True' && row[filter.prop] === true) ||
                                (filter.value === 'False' && row[filter.prop] === false)) {
                                matches = true;
                                break;
                            }
                        }
                        // If this group has a match, increment the group matcher
                        // If this group has a match, increment the group matcher
                        if (matches) {
                            allGroupMatches++;
                        }
                    }
                }
                if (allGroupMatches !== Object.keys(equals).length) {
                    return false;
                }
            }
            // If no filters failed, return true
            // If no filters failed, return true
            return true;
        });
    };
    /**
     * Sort an array based on a property and direction
     * @param {?} array
     * @param {?} prop
     * @param {?} sortType
     * @return {?}
     */
    DataGridService.prototype.sortArray = /**
     * Sort an array based on a property and direction
     * @param {?} array
     * @param {?} prop
     * @param {?} sortType
     * @return {?}
     */
    function (array, prop, sortType) {
        // console.warn('sortRows', prop, sortType);
        var /** @type {?} */ mapProp = function (prop2) {
            // If string, make lower case and remove special characters
            // If string, make lower case and remove special characters
            if (typeof prop2 === 'string') {
                return prop2.toLowerCase().replace(/[^a-z0-9]/gi, '');
            }
            else if (typeof prop2 === 'number') {
                // If number
                // If number
                return prop2 * 1000;
            }
            else {
                // Make string
                // Make string
                if (prop2) {
                    return prop2.toString();
                }
                return '';
            }
        };
        if (sortType === 'asc') {
            return array.sort(function (a, b) { return (mapProp(a[prop]) !== mapProp(b[prop]) ? (mapProp(a[prop]) < mapProp(b[prop]) ? -1 : 1) : 0); });
        }
        else {
            return array.sort(function (b, a) { return (mapProp(a[prop]) !== mapProp(b[prop]) ? (mapProp(a[prop]) < mapProp(b[prop]) ? -1 : 1) : 0); });
        }
    };
    /**
     * Group rows by property. Grouping is essentially a multilevel sort
     * @param {?} rows
     * @param {?} columns
     * @param {?} groups
     * @param {?} sorts
     * @param {?} options
     * @return {?}
     */
    DataGridService.prototype.groupRows = /**
     * Group rows by property. Grouping is essentially a multilevel sort
     * @param {?} rows
     * @param {?} columns
     * @param {?} groups
     * @param {?} sorts
     * @param {?} options
     * @return {?}
     */
    function (rows, columns, groups, sorts, options) {
        var _this = this;
        // console.log('groupRows', groups, sorts);
        var /** @type {?} */ newGroups = {};
        var /** @type {?} */ group = groups[0];
        rows.forEach(function (row) {
            // If the row property is an array of strings, flatten it down to a string. Otherwise just use string
            var /** @type {?} */ newProp = Array.isArray(row[group.prop]) ? row[group.prop].join() : row[group.prop];
            // If this is an empty array, set to null instead
            // if (Array.isArray(row[group.prop]) && !row[group.prop].length){
            //    newProp = row[group.prop] = null;
            // }
            // If this is an empty array, set to null instead
            // if (Array.isArray(row[group.prop]) && !row[group.prop].length){
            //    newProp = row[group.prop] = null;
            // }
            if (!newProp || newProp === '') {
                newProp = 'No Value';
            }
            // Get current column
            var /** @type {?} */ column = columns.filter(function (columnNew) { return columnNew.prop === group.prop; });
            if (!newGroups[newProp]) {
                newGroups[newProp] = /** @type {?} */ ({
                    rows: [],
                    column: column && column[0] ? column[0] : null,
                    columnProp: group.prop,
                    columnLabel: '',
                    label: row[group.prop] || 'No Value',
                    visible: true,
                    type: 'group',
                });
                // let label = columns.filter(column => column.prop == group.prop);
                newGroups[newProp].columnLabel = column && column[0] ? column[0].label : 'No Value';
            }
            newGroups[newProp].rows.push(row);
        });
        // Now remap the object into an array
        var /** @type {?} */ grouped = [];
        for (var /** @type {?} */ key in newGroups) {
            if (newGroups.hasOwnProperty(key)) {
                grouped.push(newGroups[key]);
            }
        }
        // Sort the group
        grouped = this.sortArray(grouped, 'label', group.dir);
        var /** @type {?} */ newRows = [];
        var /** @type {?} */ groupsFinal = {};
        // Sort the rows within the group
        grouped.forEach(function (group2) {
            if (sorts.length) {
                _this.sortArray(group2.rows, sorts[0].prop, sorts[0].dir);
            }
            if (options.primaryKey) {
                // Create a primary key used for the trackRows method.
                //           Group headers are treated as a row and need to have the same primary key as the rest
                // Create a primary key used for the trackRows method. 
                //           Group headers are treated as a row and need to have the same primary key as the rest
                (/** @type {?} */ (group2))[options.primaryKey] = group2.label + '-' + group2.rows.length;
            }
            var /** @type {?} */ currentLoc = newRows.length;
            groupsFinal[currentLoc] = group2;
            newRows = newRows.concat([group2], group2.rows);
        });
        return { rows: newRows, groups: groupsFinal };
    };
    /**
     * Create the statuses/state of the controls (filtering/grouping/sorting)
     * @param {?} state
     * @param {?} columns
     * @return {?}
     */
    DataGridService.prototype.createStatuses = /**
     * Create the statuses/state of the controls (filtering/grouping/sorting)
     * @param {?} state
     * @param {?} columns
     * @return {?}
     */
    function (state, columns) {
        // console.warn('createStatuses: ',JSON.parse(JSON.stringify(state)));
        var /** @type {?} */ status = {
            groups: {},
            sorts: {},
            filters: {}
        };
        // If groupings are found, create dictionary
        // If groupings are found, create dictionary
        if (state.groups.length) {
            var /** @type {?} */ newStatus_1 = {};
            state.groups.forEach(function (group) {
                newStatus_1[group.prop] = group.dir;
            });
            status.groups = newStatus_1;
        }
        else {
            status.groups = {};
        }
        // If sortings are found, create dictionary
        // If sortings are found, create dictionary
        if (state.sorts.length) {
            var /** @type {?} */ newStatus_2 = {};
            state.sorts.forEach(function (sort) {
                newStatus_2[sort.prop] = sort.dir;
            });
            status.sorts = newStatus_2;
        }
        else {
            status.sorts = {};
        }
        var /** @type {?} */ newFilters = {};
        if (columns && columns.length) {
            columns.forEach(function (column) {
                newFilters[column.prop] = {
                    contains: '',
                    eq: {},
                };
            });
        }
        // If filters are found, create dictionary
        // If filters are found, create dictionary
        if (state.filters && typeof state.filters !== 'string' && state.filters.length) {
            state.filters.forEach(function (filter) {
                // Create field/property object
                // Create field/property object
                if (!newFilters[filter.prop]) {
                    newFilters[filter.prop] = {
                        hasFilters: false,
                        contains: {},
                        eq: {},
                    };
                }
                // Operator is Contains
                // Operator is Contains
                if (filter.operator === 'contains') {
                    newFilters[filter.prop][filter.operator] = filter.value;
                    newFilters[filter.prop].hasFilters = true;
                }
                else {
                    // Everything else
                    // Create operator object inside field object
                    // Everything else
                    // Create operator object inside field object
                    if (!newFilters[filter.prop][filter.operator]) {
                        newFilters[filter.prop][filter.operator] = {};
                    }
                    newFilters[filter.prop][filter.operator][filter.value] = filter.value;
                    newFilters[filter.prop].hasFilters = true;
                }
            });
        }
        status.filters = newFilters;
        // console.warn('status 2: ', JSON.parse(JSON.stringify(status)));
        // console.warn('status 2: ', JSON.parse(JSON.stringify(status)));
        return status;
    };
    /**
     * Look through the rows and assemble a an array of terms
     * @param {?} rows
     * @param {?} columns
     * @return {?}
     */
    DataGridService.prototype.getDefaultTermsList = /**
     * Look through the rows and assemble a an array of terms
     * @param {?} rows
     * @param {?} columns
     * @return {?}
     */
    function (rows, columns) {
        // console.log('getDefaultTermsList');
        // console.time('getDefaultTermsList');
        var /** @type {?} */ termsList = {};
        var /** @type {?} */ uniques = {};
        // Loop through all the columns
        columns.forEach(function (column) {
            // If the column type is string and does not exist, create the dictionary and array
            // If the column type is string and does not exist, create the dictionary and array
            if (!termsList[column.prop]) {
                // && column.columnType == 'string'
                termsList[column.prop] = [];
                uniques[column.prop] = {};
            }
        });
        // Find the unique values for each row
        rows.forEach(function (row) {
            for (var /** @type {?} */ key in termsList) {
                if (termsList.hasOwnProperty(key)) {
                    if ((row[key] || row[key] === false) && uniques[key]) {
                        var /** @type {?} */ keyNew = row[key];
                        // If boolean, convert key to string
                        // If boolean, convert key to string
                        if (typeof row[key] === 'boolean') {
                            keyNew = _.startCase(_.toLower(row[key].toString()));
                        }
                        uniques[key][keyNew] = true;
                    }
                }
            }
        });
        // Now push the uniques to the termslist
        // Now push the uniques to the termslist
        for (var /** @type {?} */ key in uniques) {
            if (uniques.hasOwnProperty(key)) {
                var /** @type {?} */ foo = uniques[key];
                for (var /** @type {?} */ key2 in foo) {
                    if (foo.hasOwnProperty(key2)) {
                        termsList[key].push(key2);
                    }
                }
            }
        }
        // Now sort terms in default order
        // Now sort terms in default order
        for (var /** @type {?} */ key in termsList) {
            if (termsList.hasOwnProperty(key)) {
                // If boolean, have true be first
                // If boolean, have true be first
                if (termsList[key][0] === 'False' || termsList[key][0] === 'True') {
                    termsList[key] = ['True', 'False']; // TODO: Better method of handling boolean than hard coded
                }
                else {
                    termsList[key].sort();
                }
            }
        }
        // console.warn('getDefaultTermsList', termsList);
        // console.timeEnd('getDefaultTermsList');
        // console.warn('getDefaultTermsList', termsList);
        // console.timeEnd('getDefaultTermsList');
        return termsList;
    };
    /**
     * Determine the horizontal position of grid cells
     * @param {?} columns
     * @param {?=} offset
     * @return {?}
     */
    DataGridService.prototype.columnCalculations = /**
     * Determine the horizontal position of grid cells
     * @param {?} columns
     * @param {?=} offset
     * @return {?}
     */
    function (columns, offset) {
        if (offset === void 0) { offset = 0; }
        // console.log('columnCalculations', columns, offset);
        var /** @type {?} */ leftOffset = offset;
        return columns.map(function (column, index) {
            // If no width, set default to 150
            var /** @type {?} */ width = column.width ? column.width : 150;
            // Ensure min width of 44
            // Ensure min width of 44
            if (width < 44) {
                width = 44;
            }
            // If no width on the column, set a default property
            // If no width on the column, set a default property
            if (!column.width || !column.$$width) {
                column.width = width;
                column.$$width = width;
            }
            // If no column type, set default of string
            column.columnType = column.columnType ? column.columnType : 'string';
            // Ensure all column widths are divisible by 4, fixes a blurry text bug in chrome
            // column.width = Math.floor(column.width / 4) * 4;
            column.$$index = index;
            column.$$leftOffset = leftOffset;
            leftOffset += width;
            return column;
        });
    };
    /**
     * If total combined width of grid cells is less than viewport, resize widths to match
     * @param {?} columns
     * @param {?} widthColumns
     * @param {?} widthTable
     * @return {?}
     */
    DataGridService.prototype.columnsResize = /**
     * If total combined width of grid cells is less than viewport, resize widths to match
     * @param {?} columns
     * @param {?} widthColumns
     * @param {?} widthTable
     * @return {?}
     */
    function (columns, widthColumns, widthTable) {
        var /** @type {?} */ leftOffset = 0;
        var /** @type {?} */ multiplier = Math.floor(widthTable / widthColumns * 100) / 100;
        return columns.map(function (column) {
            if (column.width) {
                column.$$width = Math.ceil(column.width * multiplier);
                column.$$leftOffset = leftOffset;
                leftOffset += column.$$width;
            }
            return __assign({}, column);
        });
    };
    /**
     * Attach any templates to their respective columns
     * Not using map to update columns array because that would retrigger the column getter logic
     * @param {?} columns
     * @param {?} columnTemplates
     * @return {?}
     */
    DataGridService.prototype.templatesAddToColumns = /**
     * Attach any templates to their respective columns
     * Not using map to update columns array because that would retrigger the column getter logic
     * @param {?} columns
     * @param {?} columnTemplates
     * @return {?}
     */
    function (columns, columnTemplates) {
        // Loop through supplied columns, attach templates
        // Loop through supplied columns, attach templates
        for (var /** @type {?} */ i = 0; i < columns.length; i++) {
            // If custom cell templates were supplied, attach them to their appropriate column
            var /** @type {?} */ column = columns[i];
            if (columnTemplates[column.prop]) {
                // Cell Templates
                // Cell Templates
                if (columnTemplates[column.prop].templateCell) {
                    column.templateCell = columnTemplates[column.prop].templateCell;
                }
                // Header Templates
                // Header Templates
                if (columnTemplates[column.prop].templateCell) {
                    column.templateHeader = columnTemplates[column.prop].templateHeader;
                }
            }
        }
    };
    /**
     * Map custom templates to a usable object for references
     * @param {?} arr
     * @return {?}
     */
    DataGridService.prototype.templatesMapColumns = /**
     * Map custom templates to a usable object for references
     * @param {?} arr
     * @return {?}
     */
    function (arr) {
        var /** @type {?} */ result = {};
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var temp = arr_1[_i];
            var /** @type {?} */ col = {};
            var /** @type {?} */ props = Object.getOwnPropertyNames(temp);
            for (var _a = 0, props_1 = props; _a < props_1.length; _a++) {
                var prop = props_1[_a];
                col[prop] = temp[prop];
            }
            if (temp.headerTemplate) {
                col.templateHeader = temp.templateHeader;
            }
            if (temp.cellTemplate) {
                col.templateCell = temp.templateCell;
            }
            result[col.prop] = col;
        }
        return result;
    };
    /**
     * Calculate row properties such as visibility, y position and index
     * @param {?} rows
     * @param {?} rowHeight
     * @param {?=} makeVisible
     * @return {?}
     */
    DataGridService.prototype.rowPositions = /**
     * Calculate row properties such as visibility, y position and index
     * @param {?} rows
     * @param {?} rowHeight
     * @param {?=} makeVisible
     * @return {?}
     */
    function (rows, rowHeight, makeVisible) {
        if (makeVisible === void 0) { makeVisible = false; }
        var /** @type {?} */ y = 0;
        return rows.filter(function (row, i) {
            row.$$rowIndex = i; // Set rowIndex
            // If hidden prop is not set, set default to false
            // If hidden prop is not set, set default to false
            if (typeof row.$$hidden === 'undefined' || makeVisible) {
                row.$$hidden = false;
            }
            // If visible
            // If visible
            if (row.$$hidden === false) {
                row.$$rowPosition = y; // Set y position
                y += rowHeight + 1;
                return true;
            }
            else {
                return false;
            }
        });
    };
    return DataGridService;
}());
export { DataGridService };
function DataGridService_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    DataGridService.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    DataGridService.ctorParameters;
    /** @type {?} */
    DataGridService.prototype.uniqueId;
    /** @type {?} */
    DataGridService.prototype.cache;
}
