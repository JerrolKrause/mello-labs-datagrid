import { Injectable } from '@angular/core';
import { Datagrid } from '../models/typings';

declare var require: any;
const startCase = require('lodash/startCase');
const toLower = require('lodash/toLower');

const memoize = require('fast-memoize');
const cacheStore = new Map;
const memoizeCache = {
    create() {
        const store = cacheStore;
        return {
            has(key:string) {
                return store.has(key)
            },
            get(key: string) {
                return store.get(key)
            },
            set(key: string, value:any) {
                store.set(key, value)
            }
        }
    }
}


@Injectable()
export class DataGridService {

    public memoized = {
        getVisibleRows: memoize(this.getVisibleRows, { cache: memoizeCache }),
        sortArray: memoize(this.sortArray, { cache: memoizeCache }),
        getVisibleColumns: memoize(this.getVisibleColumns, { cache: memoizeCache }),
        groupRows: memoize(this.groupRows, { cache: memoizeCache }),
        columnCalculations: memoize(this.columnCalculations, { cache: memoizeCache }),
        rowPositions: memoize(this.rowPositions, { cache: memoizeCache }),
        columnsResize: memoize(this.columnsResize, { cache: memoizeCache }),
        createStatuses: memoize(this.createStatuses, { cache: memoizeCache }),
        filterGlobal: memoize(this.filterGlobal, { cache: memoizeCache }),
        filterArray: memoize(this.filterArray, { cache: memoizeCache }),
    };

    constructor() { }

    /**
     * Clear memoized caches
     */
    public clearCaches() {
        cacheStore.clear();
    }

    /**
     * Maps external table/column/control properties to those needed by the datatable
     * @param array
     * @param mapObj
     */
    public mapPropertiesDown(array: any[], mapObj: any): any[] {
        return array.map(element => {
            for (const key in mapObj) {
                if (mapObj.hasOwnProperty(key)) {
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
    }

    /**
     * If external map properties are specified, map them back to the input types before emitting them up to the host component
     * @param array
     * @param mapObj
     */
    public mapPropertiesUp(array: any[], mapObj: any): any[] {
        // TODO: Cleaning up old properties isn't working for some reason, it deletes the wrong property even though the key is correct

        // console.warn('mapProperties', array, mapObj);

        return JSON.parse(JSON.stringify(array)).map((element: any) => {
            // console.warn(element);
            for (const key in mapObj) {
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
    }

    /**
     * Map the columns into an object based on its property name
     * @param columns
     */
    public mapColumns(columns: Datagrid.Column[]) {
        const columnMap: { [key: string]: any } = {};
        columns.forEach(column => (columnMap[column.prop] = column));
        return columnMap;
    }
    
    /**
     * Get the rows that should be visible in the scroll port based on the vertical scroll position
     * @param rows
     */
    public getVisibleRows(
        rows: any[],
        scrollProps: Datagrid.ScrollProps,
        rowsVisible: number,
        rowHeight: number,
    ): any[] {
        // console.log('getVisibleRowsoffSetRowsFromTop', rows, this.scrollProps, this.rowHeight, this.gridProps);
        const rowsNew = [...rows];
        let buffer = 5;
        if (window.navigator.userAgent.indexOf('Edge') > -1) {
            buffer = 15;
        }

        let offSetRowsFromTop = Math.floor(scrollProps.scrollTop / (rowHeight + 1));
        if (offSetRowsFromTop - buffer > 0) {
            offSetRowsFromTop -= buffer;
        }
        if (offSetRowsFromTop < buffer) {
            offSetRowsFromTop = 0;
        }

        let rowsEnd = offSetRowsFromTop + rowsVisible + buffer * 2;
        if (rowsEnd > rowsNew.length) {
            rowsEnd = rowsNew.length;
        }

        return rowsNew.slice(offSetRowsFromTop, rowsEnd);
    }

    /**
     * Create an object of columns that should be visible based on horizontal scroll width
     */
    public getVisibleColumns(columns: any[], scrollProps: Datagrid.ScrollProps, gridProps: Datagrid.Props) {
        const colsExternal = [];
        const buffer = 150;
        // let widthTotal = this.scrollProps.scrollLeft;
        let widthCurrent = 0;
        // Loop through column widths
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];

            // If current column width + all widths before this one is greater than the left scroll position
            // If total column widths is less than the width of the body minus the left scroll position
            if (
                column.$$width + widthCurrent + buffer > scrollProps.scrollLeft &&
                widthCurrent < gridProps.widthViewPort + scrollProps.scrollLeft + buffer
            ) {
                colsExternal.push(column);
            }
            // Update current width by adding the current column
            widthCurrent = widthCurrent + column.$$width;
        }
        return [...colsExternal];
        // this.columnsExternal = colsExternal;
    }

    /**
     * Filters based on the global object. Also creates the necessary filter structure.
     * @param array
     */
    public filterGlobal(array: any[], filterGlobal: Datagrid.FilterGlobal): any[] {

        // Loop through the existing props supplied and create the appropriate filter object
        const filters: any[] = [];
        filterGlobal.props.forEach(prop => {
            filters.push({
                operator: 'search',
                prop: prop,
                value: filterGlobal.term,
            });
        });

        return this.filterArray(array, filters);
    }

    /**
     * Filter an array of objects with an array of filters
     * @param array
     * @param filters
     */
    public filterArray(array: any[], filters: Datagrid.Filter[]): any[] {
        // console.warn('filterArray 1: ', array, filters );

        // Get number of contains filters
        const contains = filters.filter(filter => filter.operator === 'contains');
        // Get searches which as passed from the global search option
        const searches = filters.filter(filter => filter.operator === 'search');
        // Equals filters are an OR within the same field but an AND between different fields
        // Map down to dictionary with field as key so we can handle that difference
        const equals: { [key: string]: any } = {};
        filters.filter(filter => filter.operator === 'eq').forEach(filter => {
            if (!equals[filter.prop]) {
                equals[filter.prop] = [];
            }
            equals[filter.prop].push(filter);
        });
        // Perform filter and return
        return array.filter(row => {
            // Searches is an OR. If it does not contain, it should be filtered out
            if (searches.length) {
                let matches = false;
                for (let i = 0; i < searches.length; i++) {
                    const filter = searches[i];
                    // If this field isn't found on the row, return false
                    if (!row[filter.prop]) {
                        return false;
                    }

                    // Perform some cleanup on the strings
                    const rowValue = row[filter.prop]
                        .toString()
                        .toLowerCase()
                        .trim();
                    const filterValue = filter.value
                        .toString()
                        .toLowerCase()
                        .trim();

                    if (rowValue.indexOf(filterValue) !== -1) {
                        matches = true;
                        break;
                    }
                }
                // If this group does not have at least one match, return false
                if (!matches) {
                    return false;
                }
            }

            // Contains is an AND. If it does not contain, it should be filtered out
            if (contains.length) {
                let matches = false;
                for (let i = 0; i < contains.length; i++) {
                    const filter = contains[i];
                    // If this field isn't found on the row, return false
                    if (!row[filter.prop]) {
                        return false;
                    }
                    // console.warn(row[filter.prop], '-', filter.prop)
                    // Perform some cleanup on the strings
                    const rowValue = row[filter.prop]
                        .toString()
                        .toLowerCase()
                        .trim();
                    const filterValue = filter.value
                        .toString()
                        .toLowerCase()
                        .trim();

                    if (rowValue.indexOf(filterValue) !== -1) {
                        matches = true;
                        break;
                    }
                }
                // If this group does not have at least one match, return false
                if (!matches) {
                    return false;
                }
            }
            // Equals contains sets of rules groups. Each rule group is based on field and is an OR. Between rule groups it must be an AND
            // Results must contain at least one match within each field
            if (Object.keys(equals).length) {
                let allGroupMatches = 0;
                // Loop through all equals collections
                for (const key in equals) {
                    if (equals.hasOwnProperty(key)) {
                        // Within each field, only need 1 match to include in the collection
                        let matches = false;
                        for (let i = 0; i < equals[key].length; i++) {
                            const filter = equals[key][i];

                            // If this field isn't found on the row, return false
                            if (!row[filter.prop] && row[filter.prop] !== false) {
                                return false;
                            }

                            // If row property is an array of strings, see if the field value is in the array
                            if (
                                Array.isArray(row[filter.prop]) &&
                                row[filter.prop] &&
                                row[filter.prop].indexOf(filter.value.toString()) > -1
                            ) {
                                matches = true;
                                break;
                            }

                            // If the field value matches the filter value
                            if (row[filter.prop] === filter.value) {
                                matches = true;
                                break;
                            }

                            // If this is a boolean and needs to match true false
                            if (
                                (filter.value === 'True' && row[filter.prop] === true) ||
                                (filter.value === 'False' && row[filter.prop] === false)
                            ) {
                                matches = true;
                                break;
                            }
                        }
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
            return true;
        });
    }

    /**
     * Sort an array based on a property and direction
     * @param array
     * @param prop
     * @param sortType
     */
    public sortArray(array: any[], prop: string, sortType: string): any[] {
        // console.warn('sortRows', prop, sortType);
        const mapProp = (prop2: any) => {
            // If string, make lower case and remove special characters
            if (typeof prop2 === 'string') {
                return prop2.toLowerCase().replace(/[^a-z0-9]/gi, '');
            } else if (typeof prop2 === 'number') {
                // If number
                return prop2 * 1000;
            } else {
                // Make string
                if (prop2) {
                    return prop2.toString();
                }
                return '';
            }
        };

        if (sortType === 'asc') {
            return array.sort(
                (a, b) => (mapProp(a[prop]) !== mapProp(b[prop]) ? (mapProp(a[prop]) < mapProp(b[prop]) ? -1 : 1) : 0),
            );
        } else {
            return array.sort(
                (b, a) => (mapProp(a[prop]) !== mapProp(b[prop]) ? (mapProp(a[prop]) < mapProp(b[prop]) ? -1 : 1) : 0),
            );
        }
    }

    /**
     * Group rows by property. Grouping is essentially a multilevel sort
     * @param rows
     * @param columns
     * @param prop
     * @param sorts
     */
    public groupRows(
        rows: any[],
        columns: Datagrid.Column[],
        groups: Datagrid.Sorts[],
        sorts: Datagrid.Sorts[],
        options: Datagrid.Options,
    ): { rows: any[]; groups: Datagrid.Groupings } {
        // console.log('groupRows', groups, sorts);
        const newGroups: { [key: string]: any } = {};
        const group = groups[0];

        rows.forEach(row => {
            // If the row property is an array of strings, flatten it down to a string. Otherwise just use string
            let newProp = Array.isArray(row[group.prop]) ? row[group.prop].join() : row[group.prop];
            // If this is an empty array, set to null instead
            // if (Array.isArray(row[group.prop]) && !row[group.prop].length){
            //    newProp = row[group.prop] = null;
            // }

            if (!newProp || newProp === '') {
                newProp = 'No Value';
            }
            // Get current column
            const column = columns.filter(columnNew => columnNew.prop === group.prop);

            if (!newGroups[newProp]) {
                newGroups[newProp] = <Datagrid.Group>{
                    rows: [],
                    column: column && column[0] ? column[0] : null,
                    columnProp: group.prop,
                    columnLabel: '',
                    label: row[group.prop] || 'No Value',
                    visible: true,
                    type: 'group',
                };

                // let label = columns.filter(column => column.prop == group.prop);
                newGroups[newProp].columnLabel = column && column[0] ? column[0].label : 'No Value';
            }

            newGroups[newProp].rows.push(row);
        });

        // Now remap the object into an array
        let grouped = [];
        for (const key in newGroups) {
            if (newGroups.hasOwnProperty(key)) {
                grouped.push(newGroups[key]);
            }
        }

        // Sort the group
        grouped = this.memoized.sortArray(grouped, 'label', group.dir);

        let newRows: any[] = [];
        const groupsFinal: Datagrid.Groupings = {};
        // Sort the rows within the group
        grouped.forEach((group2: Datagrid.Group) => {
            if (sorts.length) {
                this.memoized.sortArray(group2.rows, sorts[0].prop, sorts[0].dir);
            }

            if (options.primaryKey) {
                // Create a primary key used for the trackRows method. 
                //           Group headers are treated as a row and need to have the same primary key as the rest
                (<any>group2)[options.primaryKey] = group2.label + '-' + group2.rows.length;
            }

            const currentLoc = newRows.length;
            groupsFinal[currentLoc] = group2;
            newRows = [...newRows, group2, ...group2.rows];
        });

        return { rows: newRows, groups: groupsFinal };
    }

    /**
     * Create the statuses/state of the controls (filtering/grouping/sorting)
     * @param state
     */
    public createStatuses(state: Datagrid.State, columns: Datagrid.Column[]): Datagrid.Status {
        // console.warn('createStatuses: ',JSON.parse(JSON.stringify(state)));
        const status: Datagrid.Status = {
            groups: {},
            sorts: {},
            filters: {}
        };
        // If groupings are found, create dictionary
        if (state.groups.length) {
            const newStatus: { [key: string]: any } = {};
            state.groups.forEach(group => {
                newStatus[group.prop] = group.dir;
            });
            status.groups = newStatus;
        } else {
            status.groups = {};
        }

        // If sortings are found, create dictionary
        if (state.sorts.length) {
            const newStatus: { [key: string]: any } = {};
            state.sorts.forEach(sort => {
                newStatus[sort.prop] = sort.dir;
            });
            status.sorts = newStatus;
        } else {
            status.sorts = {};
        }

        const newFilters: { [key: string]: any } = {};
        if (columns && columns.length) {
            columns.forEach(column => {
                newFilters[column.prop] = {
                    contains: '',
                    eq: {},
                };
            });
        }


        // If filters are found, create dictionary
        if (state.filters && typeof state.filters !== 'string' && state.filters.length) {

            state.filters.forEach(filter => {
                // Create field/property object
                if (!newFilters[filter.prop]) {
                    newFilters[filter.prop] = {
                        hasFilters: false,
                        contains: {},
                        eq: {},
                    };
                }

                // Operator is Contains
                if (filter.operator === 'contains') {
                    newFilters[filter.prop][filter.operator] = filter.value;
                    newFilters[filter.prop].hasFilters = true;
                } else {
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
        return status;
    }

    /**
     * Look through the rows and assemble a an array of terms
     * @param columnProp
     */
    public getDefaultTermsList(rows: any[], columns: Datagrid.Column[]) {
        // console.log('getDefaultTermsList');
        // console.time('getDefaultTermsList');
        const termsList: { [key: string]: any } = {};
        const uniques: { [key: string]: any } = {};

        // Loop through all the columns
        columns.forEach(column => {
            // If the column type is string and does not exist, create the dictionary and array
            if (!termsList[column.prop]) {
                // && column.columnType == 'string'
                termsList[column.prop] = [];
                uniques[column.prop] = {};
            }
        });

        // Find the unique values for each row
        rows.forEach(row => {
            for (const key in termsList) {
                if (termsList.hasOwnProperty(key)) {
                    if ((row[key] || row[key] === false) && uniques[key]) {
                        let keyNew = row[key];
                        // If boolean, convert key to string
                        if (typeof row[key] === 'boolean') {
                            keyNew = startCase(toLower(row[key].toString()));
                        }
                        uniques[key][keyNew] = true;
                    }
                }
            }
        });

        // Now push the uniques to the termslist
        for (const key in uniques) {
            if (uniques.hasOwnProperty(key)) {
                const foo = uniques[key];
                for (const key2 in foo) {
                    if (foo.hasOwnProperty(key2)) {
                        termsList[key].push(key2);
                    }
                }
            }
        }
        // Now sort terms in default order
        for (const key in termsList) {
            if (termsList.hasOwnProperty(key)) {
                // If boolean, have true be first
                if (termsList[key][0] === 'False' || termsList[key][0] === 'True') {
                    termsList[key] = ['True', 'False']; // TODO: Better method of handling boolean than hard coded
                } else {
                    termsList[key].sort();
                }
            }
        }
        // console.warn('getDefaultTermsList', termsList);
        // console.timeEnd('getDefaultTermsList');

        return termsList;
    }

    /**
     * Determine the horizontal position of grid cells
     */
    public columnCalculations(columns: Datagrid.Column[], offset: number = 0) {
        // console.log('columnCalculations', columns, offset);
        let leftOffset = offset;
        return columns.map((column, index) => {
            // If no width, set default to 150
            let width = column.width ? column.width : 150;
            // Ensure min width of 44
            if (width < 44) {
                width = 44;
            }
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
    }

    /**
     * If total combined width of grid cells is less than viewport, resize widths to match
     * @param columns
     * @param widthColumns
     * @param widthTable
     */
    public columnsResize(columns: Datagrid.Column[], widthColumns: number, widthTable: number) {
        let leftOffset = 0;
        const multiplier = Math.floor(widthTable / widthColumns * 100) / 100;
        return columns.map(column => {
            if (column.width) {
                column.$$width = Math.ceil(column.width * multiplier);
                column.$$leftOffset = leftOffset;
                leftOffset += column.$$width;
            }
            return { ...column };
        });
    }

    /**
     * Attach any templates to their respective columns
     * Not using map to update columns array because that would retrigger the column getter logic
     * @param columns
     * @param columnTemplates
     */
    public templatesAddToColumns(columns: Datagrid.Column[], columnTemplates: { [key: string]: any }) {
        // Loop through supplied columns, attach templates
        const templates: { [key: string]: any } = {};

        columns.forEach(column => {
            if (columnTemplates[column.prop]) {
                
                if (!templates[column.prop]){
                    templates[column.prop] = {};
                }

                // Cell Templates
                if (columnTemplates[column.prop].templateCell) {
                    templates[column.prop].templateCell = columnTemplates[column.prop].templateCell;
                }
                // Header Templates
                if (columnTemplates[column.prop].templateCell) {
                    templates[column.prop].templateHeader = columnTemplates[column.prop].templateHeader;
                }
            }
        });

        return templates;
    }

    /**
     * Map custom templates to a usable object for references
     * @param arr
     */
    public templatesMapColumns(arr: any[]) {

        const result: { [key: string]: any } = {};

        for (const temp of arr) {
            const col: any = {};

            const props = Object.getOwnPropertyNames(temp);
            for (const prop of props) {
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
    }

    /**
     * Calculate row properties such as visibility, y position and index
     * @param rows
     * @param rowHeight
     * @param makeVisible
     */
    public rowPositions(rows: any[], rowHeight: number, makeVisible: boolean = false) {

        let y = 0;
        return rows.filter((row, i) => {
            row.$$rowIndex = i; // Set rowIndex

            // If hidden prop is not set, set default to false
            if (typeof row.$$hidden === 'undefined' || makeVisible) {
                row.$$hidden = false;
            }
            // If visible
            if (row.$$hidden === false) {
                row.$$rowPosition = y; // Set y position
                y += rowHeight + 1;
                return true;
            } else {
                return false;
            }
        });
    }
}
