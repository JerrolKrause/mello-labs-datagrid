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
import { Component, OnInit, OnDestroy, OnChanges, Input, Output, ViewChild, ChangeDetectionStrategy, EventEmitter, ChangeDetectorRef, ViewEncapsulation, AfterViewInit, ElementRef, ContentChildren, QueryList, NgZone, AfterContentInit, } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromEvent";
import { DataGridService } from "../services/datagrid.service";
import { DataTableColumnDirective } from "../directives/column.directive";
import { Actions } from "../datagrid.props";
import { Datagrid } from "../typings";
import * as _ from "lodash";
import { BodyComponent } from "./body/body.component";
/**
 * Documentation and scaffolding available in this folder in datatable.scaffold.ts *
 */
var /**
 * Documentation and scaffolding available in this folder in datatable.scaffold.ts *
 */
DataGridComponent = /** @class */ (function () {
    function DataGridComponent(dgSvc, ref, zone) {
        this.dgSvc = dgSvc;
        this.ref = ref;
        this.zone = zone;
    }
    Object.defineProperty(DataGridComponent.prototype, "columns", {
        get: /**
         * @return {?}
         */
        function () {
            return this._columns && this._columns.length ? this._columns.slice() : [];
        },
        set: /**
         * @param {?} columns
         * @return {?}
         */
        function (columns) {
            if (columns && columns.length) {
                var /** @type {?} */ slug_1 = Math.floor(Math.random() * 1000000); // Create a random number slug so if different columns are passed a new instance is created every time
                // Create custom track property and new reference for each column
                columns = columns.map(function (column, i) {
                    column.$$track = slug_1 + '-' + i;
                    return __assign({}, column);
                });
                // If columnMap object is supplied, remap column props to what the datatable needs
                // If columnMap object is supplied, remap column props to what the datatable needs
                if (this.options && this.options.columnMap) {
                    columns = this.dgSvc.mapPropertiesDown(columns, this.options.columnMap);
                }
                // If column templates supplied, map those to the column. This instance only fires if the columns are changed after initial load
                // If column templates supplied, map those to the column. This instance only fires if the columns are changed after initial load
                if (this.columnTemplates && Object.keys(this.columnTemplates).length && columns) {
                    this.dgSvc.templatesAddToColumns(columns, this.columnTemplates);
                }
            }
            this._columns = columns;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGridComponent.prototype, "rows", {
        get: /**
         * @return {?}
         */
        function () {
            return this._rows && this._rows.length ? this._rows.slice() : [];
        },
        set: /**
         * @param {?} rows
         * @return {?}
         */
        function (rows) {
            if (rows && rows.length) {
                var /** @type {?} */ slug_2 = Math.floor(Math.random() * 1000000); // Create a random number slug so if different rows are passed a new instance is created every time
                rows.forEach(function (row, i) {
                    row.$$track = slug_2 + '-' + i;
                    row.$$selected = false;
                }); // Add the unique ID which is slug + index
            }
            this._rows = rows;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGridComponent.prototype, "state", {
        get: /**
         * @return {?}
         */
        function () {
            return this._state;
        },
        set: /**
         * @param {?} state
         * @return {?}
         */
        function (state) {
            // If no state passed down, set a default and empty state object
            var /** @type {?} */ stateNew = state ? state : {};
            if (!stateNew.filters) {
                stateNew.filters = [];
            }
            if (!stateNew.sorts) {
                stateNew.sorts = [];
            }
            if (!stateNew.groups) {
                stateNew.groups = [];
            }
            if (!stateNew.info) {
                stateNew.info = {};
            }
            this._state = stateNew;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGridComponent.prototype, "columnTemplates", {
        get: /**
         * @return {?}
         */
        function () {
            return this._columnTemplates;
        },
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) {
            var /** @type {?} */ arr = val.toArray();
            if (arr.length) {
                this._columnTemplates = this.dgSvc.templatesMapColumns(arr);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    DataGridComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () { };
    // Check when change detection is run
    /**
     * @return {?}
     */
    DataGridComponent.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    DataGridComponent.prototype.ngAfterContentInit = /**
     * @return {?}
     */
    function () {
        // After all content has been projected into this component, attach templates to columns
        // Has to be in this lifecycle hook because all input data isn't available at the same time for getter/setters
        // After all content has been projected into this component, attach templates to columns
        // Has to be in this lifecycle hook because all input data isn't available at the same time for getter/setters
        if (this.columnTemplates && Object.keys(this.columnTemplates).length && this.columns) {
            this.dgSvc.templatesAddToColumns(this.columns, this.columnTemplates);
        }
    };
    /**
     * @param {?} model
     * @return {?}
     */
    DataGridComponent.prototype.ngOnChanges = /**
     * @param {?} model
     * @return {?}
     */
    function (model) {
        var _this = this;
        // console.log('ngOnChanges');
        // Clear all memoized caches anytime new data is loaded into the grid
        this.dgSvc.cache.sortArray.cache.clear();
        this.dgSvc.cache.groupRows.cache.clear();
        // If filter global is set or updated
        // If filter global is set or updated
        if (model.filterGlobal && this.filterGlobal && this.filterGlobal.term) {
            _.throttle(function () { return _this.viewCreate(); }, 500, { trailing: true, leading: true });
        }
        // If columns are passed
        // If columns are passed
        if (this.columns) {
            // If columnMap object is supplied, remap column props to what the datatable needs
            var /** @type {?} */ columns = this.options.columnMap
                ? this.dgSvc.mapPropertiesDown(this.columns, this.options.columnMap)
                : this.columns;
            var /** @type {?} */ columnsPinnedLeft = columns.filter(function (column) { return (column.pinnedLeft ? true : false); });
            this.columnsPinnedLeft = columns.length ? this.dgSvc.columnCalculations(columnsPinnedLeft) : [];
            // Get un-pinned columns
            var /** @type {?} */ columnsInternal = columns.filter(function (column) { return (!column.pinnedLeft ? true : false); });
            this.columnsInternal = columns.length ? this.dgSvc.columnCalculations(columnsInternal) : [];
            // Determine total width of internal columns
            this.columnWidthsInternal = this.columnsInternal.reduce(function (a, b) { return b.width ? a + b.width : 0; }, 0);
            // Create a column map
            this.columnsMapped = this.dgSvc.mapColumns(this.columns);
        }
        // If state is passed
        // If state is passed
        if (this.state) {
            // If controls map is specified, map state property to appropriate fields
            this.state.groups =
                this.state.groups && this.state.groups.length && this.options.controlsMap
                    ? this.dgSvc.mapPropertiesDown(this.state.groups, this.options.controlsMap)
                    : this.state.groups;
            this.state.sorts =
                this.state.sorts && this.state.sorts.length && this.options.controlsMap
                    ? this.dgSvc.mapPropertiesDown(this.state.sorts, this.options.controlsMap)
                    : this.state.sorts;
            this.state.filters =
                this.state.filters && this.state.filters.length && this.options.controlsMap
                    ? this.dgSvc.mapPropertiesDown(this.state.filters, this.options.controlsMap)
                    : this.state.filters;
            this.state.info = {
                initial: true,
            };
        }
        // If state and columns are present, check to make sure state has valid fields
        // If state and columns are present, check to make sure state has valid fields
        if (this.state && this.columns) {
            // Loop through each element in the state object and verify that the columns exist
            // Delete columns that are referenced in state that don't exist. Helps protect against corrupt states
            // Loop through each element in the state object and verify that the columns exist
            // Delete columns that are referenced in state that don't exist. Helps protect against corrupt states
            if (this.state.sorts &&
                this.state.sorts.length &&
                this.state.sorts[0].prop &&
                !this.columnsMapped[this.state.sorts[0].prop]) {
                this.state.sorts = [];
                console.error("Sorting option is for a column that doesn't exist. Sort option has been removed.");
            }
            if (this.state.groups && this.state.groups.length && !this.columnsMapped[this.state.groups[0].prop]) {
                this.state.groups = [];
                console.error("Grouping option is for a column that doesn't exist. Group option has been removed.");
            }
            if (this.state.filters && this.state.filters.length) {
                var _loop_1 = function (i) {
                    if (!this_1.columnsMapped[this_1.state.filters[i].prop]) {
                        this_1.state.filters = this_1.state.filters.filter(function (_filter, index) { return i !== index; });
                        console.error("Filter option is for a column that doesn't exist. Filter option has been removed.");
                    }
                };
                var this_1 = this;
                for (var /** @type {?} */ i = this.state.filters.length - 1; i >= 0; i--) {
                    _loop_1(i);
                }
            }
        }
        if (this.columns && this.rows) {
            // On any column or row changes, unselect rows
            this.rows.forEach(function (row) { return (row.$$selected = false); });
            this.filterTerms = this.dgSvc.getDefaultTermsList(this.rows, this.columns); // Generate a list of default filter terms
            this.createRowStyles(); // Create row styles
            this.createRowClasses(); // Create row classes
            // Only on initial load, set app ready. This prevents the app from hanging on a route change
            this.appReady = true;
            this.dataGridReady();
            // Emit the state change to the parent component now that the first initial view has been created
            this.emitState(this.state);
        }
    };
    /**
     * @return {?}
     */
    DataGridComponent.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        setTimeout(function () {
            _this.domReady = true;
            _this.dataGridReady();
        });
    };
    /**
     * Determine the conditions for when the datagrid is ready to render to the dom
     * TODO: Set max iterations to check to avoid infinite loop
     * @return {?}
     */
    DataGridComponent.prototype.dataGridReady = /**
     * Determine the conditions for when the datagrid is ready to render to the dom
     * TODO: Set max iterations to check to avoid infinite loop
     * @return {?}
     */
    function () {
        var _this = this;
        // If appdata and DOM are ready
        // If appdata and DOM are ready
        if (this.appReady && this.domReady) {
            // Make sure that the datagrid is visible on the DOM so that the width can be extracted
            // Make sure that the datagrid is visible on the DOM so that the width can be extracted
            if (this.dataGrid && this.dataGrid.nativeElement) {
                this.gridProps.widthViewPort = Math.floor(this.dataGrid.nativeElement.getBoundingClientRect().width);
            }
            // If width is available, create the view and render the dom
            // If width is available, create the view and render the dom
            if (this.gridProps.widthViewPort) {
                this.viewCreate();
                this.ref.detectChanges();
            }
            else {
                // If for some reason the DOM is not available, check every 100 seconds until it is
                setTimeout(function () {
                    _this.dataGridReady();
                }, 50);
            }
        }
    };
    /**
     * When the datatable is scrolled
     * @param {?} scrollPropsNew
     * @return {?}
     */
    DataGridComponent.prototype.onScroll = /**
     * When the datatable is scrolled
     * @param {?} scrollPropsNew
     * @return {?}
     */
    function (scrollPropsNew) {
        var _this = this;
        // console.log('onScroll', scrollPropsNew);
        var /** @type {?} */ scrollPropsOld = __assign({}, this.scrollProps);
        // this.ref.detach();
        this.scrollProps = scrollPropsNew;
        // Update rows only if rows have changed
        // Update rows only if rows have changed
        if (scrollPropsOld.scrollTop !== this.scrollProps.scrollTop) {
            var /** @type {?} */ rowsVisible = Math.ceil(this.gridProps.heightTotal / this.rowHeight);
            var /** @type {?} */ rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, rowsVisible, this.rowHeight);
            if (!this.rowsIndexes ||
                (rowsExternal[0] &&
                    rowsExternal[0].$$track !== this.rowsIndexes.start &&
                    rowsExternal[rowsExternal.length - 1].$$track !== this.rowsIndexes.end)) {
                this.rowsExternal = rowsExternal;
                this.rowsIndexes.start = rowsExternal[0].$$track;
                this.rowsIndexes.end = rowsExternal[rowsExternal.length - 1].$$track;
            }
        }
        // Update columns only if columns have changed
        // Update columns only if columns have changed
        if (scrollPropsOld.scrollLeft !== this.scrollProps.scrollLeft) {
            var /** @type {?} */ columnsExternal = this.dgSvc.getVisibleColumns(this.columnsInternal, this.scrollProps, this.gridProps);
            if (!this.columnIndexes ||
                (columnsExternal[0] &&
                    columnsExternal[0].$$track !== this.columnIndexes.start &&
                    columnsExternal[columnsExternal.length - 1].$$track !== this.columnIndexes.end)) {
                this.columnsExternal = columnsExternal;
                this.columnIndexes.start = columnsExternal[0].$$track;
                this.columnIndexes.end = columnsExternal[columnsExternal.length - 1].$$track;
            }
        }
        // Not ideal but row updates aren't as seamless without the zone.run
        this.zone.run(function () {
            _this.ref.detectChanges();
        });
    };
    /**
     * Create the view by assembling everything that modifies the state
     * @return {?}
     */
    DataGridComponent.prototype.viewCreate = /**
     * Create the view by assembling everything that modifies the state
     * @return {?}
     */
    function () {
        // TODO Fix issues with memoization with group and sorting
        // console.warn('createView', this.state, this.status, this.filterTerms );
        // console.time('Creating View');
        // Set manual change detection
        this.ref.detach();
        var /** @type {?} */ newRows = this.rows;
        // console.log('Total Rows', newRows.length)
        // If global filter option is set filter
        // console.log('Total Rows', newRows.length)
        // If global filter option is set filter
        if (this.filterGlobal && this.filterGlobal.term) {
            newRows = this.dgSvc.filterGlobal(newRows, this.filterGlobal);
        }
        // If custom filters are specified
        // If custom filters are specified
        if (this.state && this.state.filters && this.state.filters.length) {
            newRows = this.dgSvc.filterArray(newRows, this.state.filters);
        }
        // If grouped
        // If grouped
        if (this.state && this.state.groups && this.state.sorts && this.state.groups.length) {
            // Create groups
            this.dgSvc.uniqueId =
                newRows.length + '-' + this.columns.length + '-' + this.state.groups[0].prop + '-' + this.state.groups[0].dir;
            if (this.state.sorts && this.state.sorts.length) {
                this.dgSvc.uniqueId += '-' + this.state.sorts[0].prop + '-' + this.state.sorts[0].dir;
            }
            // let groupings = this.dgSvc.cache.groupRows(newRows, this.columns, this.state.groups, this.state.sorts);
            // Non memoized
            var /** @type {?} */ groupings = this.dgSvc.groupRows(newRows, this.columns, this.state.groups, this.state.sorts, this.options);
            newRows = groupings.rows;
            this.groups = groupings.groups;
        }
        else {
            // If NOT grouped
            this.groups = null;
            // If sorts
            // If sorts
            if (this.state &&
                this.state.sorts &&
                this.state.sorts.length &&
                this.state.sorts[0] &&
                this.state.sorts[0].prop &&
                this.state.sorts !== undefined) {
                // Sort rows and use memoize function to cache results
                this.dgSvc.uniqueId = this.state.sorts[0].prop + this.state.sorts[0].dir + newRows.length;
                // newRows = this.dgSvc.cache.sortArray(newRows, this.state.sorts[0].prop, this.state.sorts[0].dir);
                // Non memoized
                newRows = this.dgSvc.sortArray(newRows, this.state.sorts[0].prop, this.state.sorts[0].dir);
            }
        }
        // Generate row vertical positions
        newRows = this.dgSvc.rowPositions(newRows, this.rowHeight);
        this.updateGridProps();
        // Set updated columns
        this.columnsPinnedLeft = this.columnsPinnedLeft.length ? this.dgSvc.columnCalculations(this.columnsPinnedLeft) : [];
        this.columnsInternal = this.columnsInternal.length ? this.dgSvc.columnCalculations(this.columnsInternal) : [];
        // If the total width of the columns is less than the viewport, resize columns to fit
        // If the total width of the columns is less than the viewport, resize columns to fit
        if (this.dataGrid &&
            this.dataGrid.nativeElement &&
            this.columnWidthsInternal < this.dataGrid.nativeElement.getBoundingClientRect().width) {
            // Resize columns to fit available space
            this.columnsInternal = this.dgSvc.columnsResize(this.columnsInternal, this.columnWidthsInternal, this.gridProps.widthViewPort - this.gridProps.widthPinned);
            this.gridProps.widthFixed = true;
        }
        else {
            // Reset widths
            this.columnsInternal = this.columnsInternal.map(function (column) {
                column.$$width = column.width;
                return column;
            });
            this.gridProps.widthFixed = false;
        }
        this.updateGridProps();
        // Update internal modified rows
        this.rowsInternal = newRows;
        // Update columns to go to the DOM
        this.columnsExternal = this.dgSvc.getVisibleColumns(this.columnsInternal, this.scrollProps, this.gridProps);
        // Updated rows to go to the DOM
        var /** @type {?} */ rowsVisible = Math.ceil(this.gridProps.heightTotal / this.rowHeight);
        this.rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, rowsVisible, this.rowHeight);
        if (this.state.info) {
            // Add stats and info to be emitted
            this.state.info.rowsTotal = this.rows.length;
            this.state.info.rowsVisible = this.rowsInternal.filter(function (row) { return !row.type; }).length; // Filter out any group columns
        }
        this.status = this.dgSvc.createStatuses(this.state, this.columnsInternal);
        // console.warn('this.status', this.status);
        this.state = __assign({}, this.state);
        // Emit the state change to the parent component
        this.emitState(this.state);
        // Turn change detection back on
        this.ref.reattach();
        // console.timeEnd('Creating View');
    };
    /**
     * When a group is toggled
     * @return {?}
     */
    DataGridComponent.prototype.groupToggled = /**
     * When a group is toggled
     * @return {?}
     */
    function () {
        this.viewCreate();
    };
    /**
     * When the datatable state is changed, usually via a control such as group/filter/sort etc
     * @param {?} stateChange
     * @return {?}
     */
    DataGridComponent.prototype.onStateUpdated = /**
     * When the datatable state is changed, usually via a control such as group/filter/sort etc
     * @param {?} stateChange
     * @return {?}
     */
    function (stateChange) {
        // console.warn('changeState ', stateChange);
        this.ref.detach();
        var /** @type {?} */ newState = __assign({}, this.state);
        // Legacy support for previous states of the grid. Ensure all arrays exist to prevent errors
        // Legacy support for previous states of the grid. Ensure all arrays exist to prevent errors
        if (!newState.filters || !Array.isArray(newState.filters)) {
            newState.filters = [];
        }
        if (!newState.sorts) {
            newState.sorts = [];
        }
        if (!newState.groups) {
            newState.groups = [];
        }
        if (!newState.info) {
            newState.info = {};
        }
        newState.info.initial = false;
        // If the global filter is set
        // if (this.filterGlobal && this.filterGlobal.term) {
        // newRows = this.dgSvc.filterGlobal(newRows, this.filterGlobal);
        // }
        // ### Update Sorting ###
        // If the global filter is set
        // if (this.filterGlobal && this.filterGlobal.term) {
        // newRows = this.dgSvc.filterGlobal(newRows, this.filterGlobal);
        // }
        // ### Update Sorting ###
        if (stateChange.action === Actions.sort) {
            newState.sorts = stateChange.data.dir ? [stateChange.data] : [];
        }
        else if (stateChange.action === Actions.group) {
            // ### Update Grouping ###
            newState.groups = stateChange.data.dir ? [stateChange.data] : [];
        }
        else if (stateChange.action === Actions.filter) {
            // ### Update Filtering ###
            var /** @type {?} */ newFilter = stateChange.data.filter;
            if (stateChange.data.filterAction === 'change') {
                var /** @type {?} */ index = 0;
                for (var /** @type {?} */ i = 0; i < newState.filters.length; i++) {
                    if (newFilter.prop === newState.filters[i].prop && newFilter.operator === newState.filters[i].operator) {
                        index = i;
                        break;
                    }
                }
                newState.filters[index] = newFilter;
            }
            else if (stateChange.data.filterAction === 'add') {
                newState.filters.push(newFilter);
            }
            else if (stateChange.data.filterAction === 'remove') {
                var /** @type {?} */ index = 0;
                for (var /** @type {?} */ i = 0; i < newState.filters.length; i++) {
                    // If this is a contains filter, only match against field and operator
                    // If this is a contains filter, only match against field and operator
                    if (newFilter.operator === 'contains' &&
                        newFilter.prop === newState.filters[i].prop &&
                        newFilter.operator === newState.filters[i].operator) {
                        index = i;
                        break;
                    }
                    else if (newFilter.prop === newState.filters[i].prop &&
                        newFilter.operator === newState.filters[i].operator &&
                        newFilter.value === newState.filters[i].value) {
                        // If not a contains filter, match against all 3 fields
                        index = i;
                        break;
                    }
                }
                newState.filters.splice(index, 1);
            }
            else if (stateChange.data.filterAction === 'clear') {
                newState.filters = newState.filters.filter(function (item) { return item.prop !== stateChange.data.filter.prop; });
                // console.warn('Clearing filters', newState.filters);
            }
        }
        else if (stateChange.action === Actions.reset) {
            // ### Reset everything ###
            // newRows = [...this.rows];
        }
        else if (stateChange.action === Actions.column) {
            // ### Column Changes ###
            // Deletion
            // ### Column Changes ###
            // Deletion
            if (stateChange.data.action === 'delete') {
                this.columnsInternal = this.columnsInternal.filter(function (column) { return column.$$index !== stateChange.data.columnIndex; });
                this.columns = this.columns.filter(function (column) { return column.$$index !== stateChange.data.columnIndex; });
                // Update total width of internal columns
                this.columnWidthsInternal = this.columnsInternal.reduce(function (a, b) { return b.width ? a + b.width : 0; }, 0);
                this.emitColumns();
            }
        }
        else if (stateChange.action === Actions.pinLeft) {
            // ### Pinning ###
            // ### Pinning ###
            if (stateChange.data.isPinned) {
                // Get column being unpinned
                var /** @type {?} */ colNew = this.columnsPinnedLeft[stateChange.data.index];
                delete colNew.pinnedLeft; // Delete pinned prop
                // Remove from pinned array
                this.columnsPinnedLeft = this.columnsPinnedLeft.filter(function (_col, index) { return stateChange.data.index !== index; });
                // Add to main array
                this.columnsInternal = [colNew].concat(this.columnsInternal);
            }
            else {
                // console.warn('Pinning to left', stateChange.data);
                // Get pinned column
                var /** @type {?} */ newCol = this.columnsInternal.filter(function (col) { return col.prop === stateChange.data.prop; })[0];
                newCol.pinnedLeft = true;
                this.columnsPinnedLeft = this.columnsPinnedLeft.concat([newCol]);
                // Update non pinned columns
                this.columnsInternal = this.columnsInternal.filter(function (col) { return col.prop !== stateChange.data.prop; });
            }
            // Update total width of internal columns
            this.columnWidthsInternal = this.columnsInternal.reduce(function (a, b) { return b.width ? a + b.width : 0; }, 0);
            this.emitColumns();
        }
        this.state = newState;
        // Now create the view and update the DOM
        this.viewCreate();
    };
    /**
     * When columns are modified from a lower component
     * @param {?} columnData
     * @return {?}
     */
    DataGridComponent.prototype.columnsUpdated = /**
     * When columns are modified from a lower component
     * @param {?} columnData
     * @return {?}
     */
    function (columnData) {
        // console.log('columnsUpdated', columnData);
        // If this is a resize column event
        // console.log('columnsUpdated', columnData);
        // If this is a resize column event
        if (columnData && columnData.columnIndex) {
            if (columnData.action === 'resize') {
                // Determine if updating pinned or regular columns
                // Determine if updating pinned or regular columns
                if (columnData.type === 'pinnedLeft') {
                    this.columnsPinnedLeft[columnData.columnIndex].width = columnData.width;
                    this.columnsPinnedLeft[columnData.columnIndex] = __assign({}, this.columnsPinnedLeft[columnData.columnIndex]);
                    // this.columnsPinnedLeft = [...this.columnsPinnedLeft];
                }
                else {
                    this.columnsInternal[columnData.columnIndex].width = columnData.width;
                    this.columnsInternal[columnData.columnIndex] = __assign({}, this.columnsInternal[columnData.columnIndex]);
                    // this.columnsInternal = [...this.columnsInternal];
                }
            }
            else if (columnData.action === 'reorder') {
                // If this is a reorder columns event
                // If this is a reorder columns event
                if (columnData.type === 'pinnedLeft') {
                    var /** @type {?} */ colOld = this.columnsPinnedLeft.filter(function (column) { return column.prop === columnData.prop; })[0]; // Get column being moved
                    var /** @type {?} */ colsNew = this.columnsPinnedLeft.filter(function (column) { return column.prop !== columnData.prop; }); // Get new array without that column
                    colsNew.splice(columnData.columnIndex, 0, colOld); // Insert into index location
                    this.columnsPinnedLeft = colsNew; // Update reference
                }
                else {
                    var /** @type {?} */ colOld = this.columnsInternal.filter(function (column) { return column.prop === columnData.prop; })[0]; // Get column being moved
                    var /** @type {?} */ colsNew = this.columnsInternal.filter(function (column) { return column.prop !== columnData.prop; }); // Get new array without that column
                    colsNew.splice(columnData.columnIndex, 0, colOld); // Insert into index location
                    this.columnsInternal = colsNew; // Update reference
                }
            }
            // Update total width of internal columns
            this.columnWidthsInternal = this.columnsInternal.reduce(function (a, b) { return b.width ? a + b.width : 0; }, 0);
            this.emitColumns();
            this.viewCreate();
        }
    };
    /**
     * Global properties needed by grid to draw itself
     * @return {?}
     */
    DataGridComponent.prototype.updateGridProps = /**
     * Global properties needed by grid to draw itself
     * @return {?}
     */
    function () {
        var /** @type {?} */ gridProps = __assign({}, this.gridProps);
        // Get width of DOM viewport
        // Get width of DOM viewport
        if (this.dataGrid && this.dataGrid.nativeElement.getBoundingClientRect().width) {
            gridProps.widthViewPort = Math.floor(this.dataGrid.nativeElement.getBoundingClientRect().width) || 0;
        }
        // Get width of pinned columns
        gridProps.widthPinned = this.columnsPinnedLeft.length
            ? this.columnsPinnedLeft.reduce(function (a, b) { return b.$$width ? a + b.$$width : 0; }, 0) : 0;
        // Get width of non-pinned columns
        gridProps.widthMain = this.columnsInternal.reduce(function (a, b) { return b.$$width ? a + b.$$width : 0; }, 0) || 0;
        // Get width of internal columns plus pinned columns
        gridProps.widthTotal = gridProps.widthMain + gridProps.widthPinned;
        // Get height of grid
        // Get height of grid
        if (this.options.heightMax) {
            gridProps.heightTotal = /** @type {?} */ (this.options.heightMax);
        }
        else if (this.options.fullScreen) {
            var /** @type {?} */ height = this.dataGrid.nativeElement.getBoundingClientRect().height;
            var /** @type {?} */ newHeight = height - 2 - this.rowHeight; // Add offsets for table header and bottom scrollbar
            // Check if the info bar is showing, deduct from total height
            // Check if the info bar is showing, deduct from total height
            if (this.options.showInfo &&
                (this.state.sorts.length || this.state.groups.length || this.state.filters.length)) {
                newHeight -= this.rowHeight;
            }
            gridProps.heightTotal = newHeight;
        }
        else {
            // Set default height if non specified
            gridProps.heightTotal = 300;
        }
        // gridProps.rowsVisible = Math.ceil(gridProps.heightTotal / this.rowHeight); // Get max visible rows
        // gridProps.rowsVisible = Math.ceil(gridProps.heightTotal / this.rowHeight); // Get max visible rows
        if (this.rowsInternal && this.rowsInternal.length) {
            gridProps.heightBody = this.rowsInternal.length * this.rowHeight;
        }
        else if (this.rows && this.rows.length) {
            gridProps.heightBody = this.rows.length * this.rowHeight;
        }
        else {
            gridProps.heightBody = 300;
        }
        this.gridProps = gridProps;
    };
    /**
     * On a global mouse down event
     * @param {?} event
     * @return {?}
     */
    DataGridComponent.prototype.handleMouseDown = /**
     * On a global mouse down event
     * @param {?} event
     * @return {?}
     */
    function (event) {
        // console.warn('handleMouseDown 1', event, this.dataGridBody)
        // Set the default starting position of the initial click and also get the bounding box of the datatable
        var /** @type {?} */ draggingPos = __assign({ startX: event.pageX, startY: event.pageY, bounding: this.dataGridBody.body.getBoundingClientRect() }, this.draggingPos);
        // Only drag on left mouse click
        // Make sure the drag starts within the datatable bounding box
        // Only drag on left mouse click
        // Make sure the drag starts within the datatable bounding box
        if (event.which === 1 &&
            draggingPos.startY > draggingPos.bounding.top &&
            draggingPos.startY < draggingPos.bounding.bottom &&
            draggingPos.startX > draggingPos.bounding.left &&
            draggingPos.startX < draggingPos.bounding.right) {
            this.draggingPos = draggingPos;
            this.dragging = true;
        }
    };
    /**
     * Global mouse up event
     * @param {?} event
     * @return {?}
     */
    DataGridComponent.prototype.handleMouseUp = /**
     * Global mouse up event
     * @param {?} event
     * @return {?}
     */
    function (event) {
        // console.warn('handleMouseUp', event.pageY, this.dataGridBody.nativeElement.getBoundingClientRect().top);
        // Sometimes the mouse scrolls too fast to register the last hovered row. If the mouseup position is higher than the datatable top, set lasthovered to 0
        // console.warn('handleMouseUp', event.pageY, this.dataGridBody.nativeElement.getBoundingClientRect().top);
        // Sometimes the mouse scrolls too fast to register the last hovered row. If the mouseup position is higher than the datatable top, set lasthovered to 0
        if (this.dragging && this.draggingPos && this.draggingPos.bounding && event.pageY < this.draggingPos.bounding.top) {
            this.rowHoveredLast = 0;
        }
        // If a drag event ended NOT on a row, fire the onrowmouseup event with the last hovered row
        // If a drag event ended NOT on a row, fire the onrowmouseup event with the last hovered row
        if (this.dragging && this.rowHoveredLast !== null) {
            this.onRowMouseEvent({ type: 'mouseup', rowIndex: this.rowHoveredLast, event: event });
            // this.onRowMouseUp(this.rowHoveredLast, event);
            // Unselect all text after drag to prevent weird selection issues
            // this.onRowMouseUp(this.rowHoveredLast, event);
            // Unselect all text after drag to prevent weird selection issues
            if (document.getSelection) {
                document.getSelection().removeAllRanges();
            }
            else if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }
        }
        this.dragging = false;
    };
    /**
     * On Global mouse move
     * @param {?} event
     * @return {?}
     */
    DataGridComponent.prototype.handleMouseMove = /**
     * On Global mouse move
     * @param {?} event
     * @return {?}
     */
    function (event) {
        var /** @type {?} */ draggingPos = __assign({ hasMinSize: false }, this.draggingPos);
        if (draggingPos &&
            draggingPos.bounding &&
            draggingPos.bounding.top &&
            draggingPos.bounding.bottom &&
            draggingPos.bounding.left &&
            draggingPos.bounding.right &&
            draggingPos.height &&
            draggingPos.top &&
            draggingPos.startY &&
            draggingPos.startX) {
            // Set to local reference so they can be changed
            var /** @type {?} */ pageY = event.pageY;
            var /** @type {?} */ pageX = event.pageX;
            // Set top boundary
            // Set top boundary
            if (pageY < draggingPos.bounding.top) {
                pageY = draggingPos.bounding.top;
            }
            // Set bottom boundary
            // Set bottom boundary
            if (pageY > draggingPos.bounding.bottom) {
                pageY = draggingPos.bounding.bottom;
            }
            // Set left boundary
            // Set left boundary
            if (pageX < draggingPos.bounding.left) {
                pageX = draggingPos.bounding.left;
            }
            // Set right boundary
            // Set right boundary
            if (pageX > draggingPos.bounding.right) {
                pageX = draggingPos.bounding.right;
            }
            // Determine if this is a right to left drag or a left to right
            // Determine if this is a right to left drag or a left to right
            if (pageX >= draggingPos.startX) {
                draggingPos.width = pageX - draggingPos.startX - 2;
                draggingPos.left = draggingPos.startX;
            }
            else {
                draggingPos.width = draggingPos.startX - pageX;
                draggingPos.left = pageX + 2;
            }
            // Only allow height and top changes if the drag is within the horizontal bounding box
            // This prevents the drag selection continuing to draw vertically even though the mouse is off the datagrid which would give the user the impression
            // they are selecting rows even though their mouse is not on the grid and won't record the row mouse up event
            // Only allow height and top changes if the drag is within the horizontal bounding box
            // This prevents the drag selection continuing to draw vertically even though the mouse is off the datagrid which would give the user the impression
            // they are selecting rows even though their mouse is not on the grid and won't record the row mouse up event
            if (pageX < draggingPos.bounding.right && pageX > draggingPos.bounding.left) {
                // Determine if this is a top down or bottom up drag
                // Determine if this is a top down or bottom up drag
                if (pageY >= draggingPos.startY) {
                    draggingPos.height = pageY - draggingPos.startY - 2;
                    draggingPos.top = draggingPos.startY;
                }
                else {
                    draggingPos.height = draggingPos.startY - pageY;
                    draggingPos.top = pageY + 2;
                }
            }
            // Make sure there's a minimum size so there isn't a FOUC
            // Make sure there's a minimum size so there isn't a FOUC
            if (draggingPos.width > 10 && draggingPos.height > 10) {
                draggingPos.hasMinSize = true;
            }
            // Make sure the top is lower than the bounding box, don't allow it to be dragged outside the box
            // Make sure the top is lower than the bounding box, don't allow it to be dragged outside the box
            if (draggingPos.top < draggingPos.bounding.top) {
                draggingPos.top = draggingPos.bounding.top;
            }
            // Make sure the top is lower than the bounding box, don't allow it to be dragged outside the box
            // Make sure the top is lower than the bounding box, don't allow it to be dragged outside the box
            if (draggingPos.height > draggingPos.bounding.top) {
                // draggingPos.top = draggingPos.bounding.top;
            }
            // Update DOM
            this.draggingPos = draggingPos;
        }
    };
    /**
     * Handle keyboard events
     * @param {?} event
     * @return {?}
     */
    DataGridComponent.prototype.handleKeyboardEvents = /**
     * Handle keyboard events
     * @param {?} event
     * @return {?}
     */
    function (event) {
        // console.warn('handleKeyboardEvents 1');
        // Ignore keyboard repeat events
        // console.warn('handleKeyboardEvents 1');
        // Ignore keyboard repeat events
        if (event.repeat === false) {
            this.keyPressed = event.type === 'keydown' ? event.key : null;
            // If this is a keydown event, add it to the dictionary
            // If this is a keydown event, add it to the dictionary
            if (event.type === 'keydown') {
                this.keysPressed[event.key.toString().toLowerCase()] = true;
            }
            else if (event.type === 'keyup') {
                // If this is a key up event, remove from dictionary
                // If this is a key up event, remove from dictionary
                delete this.keysPressed[event.key.toString().toLowerCase()];
            }
            // If control + a is pressed, select all
            // If control + a is pressed, select all
            if (this.keysPressed['a'] && this.keysPressed['Control']) {
                this.selectRowsAll();
                event.preventDefault();
                event.stopPropagation();
            }
            // console.log('handleKeyboardEvents 1', event.type, this.keysPressed);
        }
    };
    /**
     * Select all rows
     * @return {?}
     */
    DataGridComponent.prototype.selectRowsAll = /**
     * Select all rows
     * @return {?}
     */
    function () {
        if (this.rows.length) {
            this.rowsInternal.forEach(function (row) { return (row.$$selected = true); });
            this.emitSelectedRows(this.rowsInternal);
        }
    };
    /**
     * When a mouse event has happend on a body row
     * @param {?} action
     * @return {?}
     */
    DataGridComponent.prototype.onRowMouseEvent = /**
     * When a mouse event has happend on a body row
     * @param {?} action
     * @return {?}
     */
    function (action) {
        if (action.type !== 'mouseenter') {
            // console.log('onRowMouseEvent', action);
        }
        var /** @type {?} */ row = this.rowsInternal.filter(function (row2) { return row2.$$rowIndex === action.rowIndex; })[0]; // this.rowsInternal[action.rowIndex];
        switch (action.type) {
            case 'click':
                this.selectRow(row, action.rowIndex, false);
                break;
            case 'contextmenu':
                this.selectRow(row, action.rowIndex, true);
                this.onRightClickMenu.emit(event); // Emit right click event up to the parent
                break;
            case 'mousedown':
                this.handleMouseDown(action.event);
                if (action.event.which === 1) {
                    // Only function when the left mouse button is clicked
                    this.rowClickDrag.rowIndex = action.rowIndex;
                }
                break;
            case 'mouseup':
                // Only function when the left mouse button is clicked
                // Only function when the left mouse button is clicked
                if (action.event.which === 1 && action.rowIndex !== this.rowClickDrag.rowIndex) {
                    // Check if the drag was top to bottom or bottom to top for ROWS. Always start at the lowest index
                    var /** @type {?} */ rowStart = this.rowClickDrag.rowIndex <= action.rowIndex ? this.rowClickDrag.rowIndex : action.rowIndex;
                    var /** @type {?} */ rowEnd = this.rowClickDrag.rowIndex >= action.rowIndex ? this.rowClickDrag.rowIndex : action.rowIndex;
                    this.rowsInternal.forEach(function (rowNew) { return (rowNew.$$selected = false); });
                    for (var /** @type {?} */ j = rowStart; j <= rowEnd; j++) {
                        this.rowsInternal[j].$$selected = true;
                    }
                    var /** @type {?} */ selectedRows = this.rowsInternal.filter(function (rowNew) { return rowNew.$$selected; });
                    this.rowsSelectedCount = selectedRows.length;
                    this.emitSelectedRows(selectedRows);
                }
                break;
            case 'mouseenter':
                this.rowHoveredLast = action.rowIndex;
                break;
            case 'dblclick':
                this.rowHoveredLast = null;
                this.rowSelectedLast = null;
                break;
            default:
                console.warn('An unknown mouse event was passed to onRowMouseEvent');
        }
    };
    /**
     * Manage row selection. Includes single and multiple click by pressing control and shift
     * @param {?} row - The row object
     * @param {?} rowIndex - The index of the currently selected row
     * @param {?=} isRightClick
     * @param {?=} elementRef
     * @return {?}
     */
    DataGridComponent.prototype.selectRow = /**
     * Manage row selection. Includes single and multiple click by pressing control and shift
     * @param {?} row - The row object
     * @param {?} rowIndex - The index of the currently selected row
     * @param {?=} isRightClick
     * @param {?=} elementRef
     * @return {?}
     */
    function (row, rowIndex, isRightClick, elementRef) {
        // console.warn('selectRow', this.keysPressed, row, rowIndex, isRightClick, elementRef);
        // Only allow row selection if set
        // console.warn('selectRow', this.keysPressed, row, rowIndex, isRightClick, elementRef);
        // Only allow row selection if set
        if (this.options.selectionType) {
            var /** @type {?} */ newRows = this.rowsInternal.slice();
            // If control is pressed while clicking
            // If control is pressed while clicking
            if (this.keysPressed['control'] && this.options.selectionType === 'multi') {
                row.$$selected = row.$$selected ? false : true;
            }
            else if (this.keysPressed['shift'] && this.options.selectionType === 'multi' && this.rowSelectedLast) {
                // If shift is pressed while clicking
                // Unset all selected flags
                newRows.forEach(function (rowNew) { return (rowNew.$$selected = false); });
                // Figure out if the selection goes top to bottom or bottom to top
                var /** @type {?} */ startIndex = rowIndex > this.rowSelectedLast ? this.rowSelectedLast : rowIndex;
                var /** @type {?} */ endIndex = rowIndex < this.rowSelectedLast ? this.rowSelectedLast : rowIndex;
                // Loop through the lowest index and set all selected flags
                // Loop through the lowest index and set all selected flags
                for (var /** @type {?} */ i = startIndex; i < endIndex + 1; i++) {
                    if (newRows[i]) {
                        newRows[i].$$selected = true;
                    }
                }
            }
            else if (!row.$$selected && !isRightClick) {
                // If just regular click
                // Disable all other selected flags
                newRows.forEach(function (rowNew) { return (rowNew.$$selected = false); });
                row.$$selected = true;
                // this.rowsSelected = row;
            }
            else {
                // If this is a right click row, don't do anything special
                // If this is a right click row, don't do anything special
                if (isRightClick) {
                    if (!row.$$selected) {
                        newRows.forEach(function (rowNew) { return (rowNew.$$selected = false); });
                        row.$$selected = true;
                    }
                }
                else if (this.rowsSelectedCount > 1) {
                    // If multiple rows are already selected
                    // Reset all and set current row to selected
                    newRows.forEach(function (rowNew) { return (rowNew.$$selected = false); });
                    row.$$selected = true;
                }
                else {
                    // Just untoggle this row
                    row.$$selected = false;
                }
            }
            var /** @type {?} */ selectedRows = newRows.filter(function (rowNew) { return rowNew.$$selected; });
            this.rowSelectedLast = rowIndex;
            this.rowsSelectedCount = selectedRows.length;
            this.emitSelectedRows(selectedRows);
            this.onElementRef.emit(elementRef);
        }
    };
    /**
     * Create row css classes based on callback function in options
     * @param {?} row - Table row
     * @return {?}
     */
    DataGridComponent.prototype.getRowClasses = /**
     * Create row css classes based on callback function in options
     * @param {?} row - Table row
     * @return {?}
     */
    function (row) {
        if (!this.options.rowClass) {
            return null;
        }
        var /** @type {?} */ classes = '';
        var /** @type {?} */ results = this.options.rowClass(row);
        for (var /** @type {?} */ key in results) {
            if (results.hasOwnProperty(key)) {
                if (results[key]) {
                    classes += key + ' ';
                }
            }
        }
        if (classes !== '') {
            return classes;
        }
    };
    /**
     * Create a dictionary of row css classes based on inputs from options.rowClass
     * @return {?}
     */
    DataGridComponent.prototype.createRowClasses = /**
     * Create a dictionary of row css classes based on inputs from options.rowClass
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ rowClasses = {};
        if (this.options.rowClass) {
            this.rows.forEach(function (row) {
                if (_this.options.primaryKey && row[_this.options.primaryKey] && _this.options.rowClass) {
                    var /** @type {?} */ results = _this.options.rowClass(row);
                    var /** @type {?} */ classes = '';
                    for (var /** @type {?} */ key in results) {
                        if (results[key]) {
                            classes += key + ' ';
                        }
                    }
                    rowClasses[row[_this.options.primaryKey]] = classes.length ? classes : null;
                }
            });
        }
        this.rowClasses = rowClasses;
    };
    /**
     * Create inline css styles for rows
     * @return {?}
     */
    DataGridComponent.prototype.createRowStyles = /**
     * Create inline css styles for rows
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ rowStyles = {};
        // Only create row styles if supplied by options
        // Only create row styles if supplied by options
        if (!this.options.rowStyle) {
            this.rowStyles = rowStyles;
            return false;
        }
        var /** @type {?} */ primaryKey = this.options.primaryKey ? this.options.primaryKey : '';
        if (!this.options.primaryKey) {
            console.log('Please specify a primary key to use rowStyles');
        }
        // let primaryKey = this.options.primaryKey || '';
        /*
                    // If row height is set in options, set it in row styles
                    if (this.options.rowHeight) {
                  this.rows.forEach((row, index) => {
                    rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]] || {},{'line-height': this.options.rowHeight + 'px'});
                  });
                }
                    */
        var /** @type {?} */ stylesWithModels = [];
        var /** @type {?} */ stylesNoModels = [];
        // Sort styles that have observable models and those that don't
        this.options.rowStyle.forEach(function (style) { return (style.model ? stylesWithModels.push(style.model) : stylesNoModels.push(style.rules)); });
        // If no models
        // If no models
        if (stylesNoModels.length && primaryKey) {
            // Loop through all rows
            this.rows.forEach(function (row) {
                // Loop through all styles without rules
                stylesNoModels.forEach(function (rule) {
                    // Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
                    rowStyles[row[primaryKey]] = Object.assign(rowStyles[row[primaryKey]], rule(row));
                });
            });
        }
        // If models/observables were supplied
        // This class method is NOT fired everytime observables update so it needs to be self contained within the subscribe in order to update everything at once
        // Includes styles with no models in order to accomodate styles with mixed observables and non observables
        // If models/observables were supplied
        // This class method is NOT fired everytime observables update so it needs to be self contained within the subscribe in order to update everything at once
        // Includes styles with no models in order to accomodate styles with mixed observables and non observables
        if (stylesWithModels.length) {
            // Create a single combine latest observable that will update when any of the inputs are updated
            var /** @type {?} */ subscription = Observable.combineLatest(stylesWithModels).subscribe(function (models) {
                // Row styles needs to be complete refreshed everytime an observable changes
                rowStyles = {};
                /*
                                // If row height is set in options, set it in row styles
                                if (this.options.rowHeight) {
                                  this.rows.forEach((row, index) => {
                                    rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]] || {}, {'line-height': this.options.rowHeight + 'px'});
                                  });
                                }
                                        */
                // If no models
                /*
                // If row height is set in options, set it in row styles
                if (this.options.rowHeight) {
                  this.rows.forEach((row, index) => {
                    rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]] || {}, {'line-height': this.options.rowHeight + 'px'});
                  });
                }
                        */
                // If no models
                if (stylesNoModels.length && primaryKey) {
                    // Loop through all rows
                    // Loop through all rows
                    _this.rows.forEach(function (row) {
                        // Loop through all styles without rules
                        stylesNoModels.forEach(function (rule) {
                            // Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
                            rowStyles[row[primaryKey]] = Object.assign(rowStyles[row[primaryKey]] || {}, rule(row));
                        });
                    });
                }
                // Loop through all rays
                // Loop through all rays
                _this.rows.forEach(function (row) {
                    // Now loop through each result of data returned from the observable
                    models.forEach(function (model, index) {
                        if (_this.options &&
                            _this.options.rowStyle &&
                            _this.options.rowStyle[index] &&
                            _this.options.rowStyle[index].rules) {
                            // Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
                            // Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
                            if (_this.options.rowStyle &&
                                _this.options.rowStyle[index] &&
                                _this.options.rowStyle[index].rules) {
                                rowStyles[row[primaryKey]] = __assign({}, rowStyles[row[primaryKey]] || {}, (/** @type {?} */ (_this.options.rowStyle[index])).rules(row, model));
                            }
                        }
                    });
                });
                // Update row styles
                // Update row styles
                _this.rowStyles = rowStyles;
                // Tell DOM to updated after observable is done udpated
                // Tell DOM to updated after observable is done udpated
                _this.ref.detectChanges();
            });
            this.subscriptions.push(subscription);
        }
        this.rowStyles = rowStyles;
    };
    /**
     * Emit changed columns up to the parent component
     * @return {?}
     */
    DataGridComponent.prototype.emitColumns = /**
     * Emit changed columns up to the parent component
     * @return {?}
     */
    function () {
        // TODO: Mapping properties back up isn't seamless and needs work, commenting out for now
        // let remapColumns = this.dgSvc.mapPropertiesUp([...columns], this.options.columnMap);
        // Remove templates and emit new column references up. Templates have a circulate reference which blows up json usage
        var /** @type {?} */ columnsNew = this.columnsPinnedLeft.concat(this.columnsInternal);
        var /** @type {?} */ columnsEmitted = columnsNew.map(function (column) {
            var /** @type {?} */ columnNew = __assign({}, column);
            columnNew.locked = columnNew.pinnedLeft ? true : false;
            delete columnNew.templateCell;
            delete columnNew.templateHeader;
            return columnNew;
        });
        // Emit data back up
        this.onColumnsUpdated.emit(columnsEmitted);
    };
    /**
     * Emit state changes up to the parent component
     * @param {?} state
     * @return {?}
     */
    DataGridComponent.prototype.emitState = /**
     * Emit state changes up to the parent component
     * @param {?} state
     * @return {?}
     */
    function (state) {
        // User columns has a circular reference somewhere so create new instance and remove that property before emitting up
        var /** @type {?} */ stateNew = __assign({}, state);
        delete (/** @type {?} */ (stateNew)).usersColumns;
        // Create a new memory reference for the state and then remap all properties up into the layout
        var /** @type {?} */ remapProps = JSON.parse(JSON.stringify(stateNew));
        remapProps.groups =
            remapProps.groups && remapProps.groups.length
                ? this.dgSvc.mapPropertiesUp(remapProps.groups, this.options.controlsMap)
                : [];
        remapProps.sorts =
            remapProps.sorts && remapProps.sorts.length
                ? this.dgSvc.mapPropertiesUp(remapProps.sorts, this.options.controlsMap)
                : [];
        remapProps.filters =
            remapProps.filters && remapProps.filters.length
                ? this.dgSvc.mapPropertiesUp(remapProps.filters, this.options.controlsMap)
                : [];
        this.onStateChange.emit(remapProps);
    };
    /**
     * When a row was edited
     * @param {?} event
     * @return {?}
     */
    DataGridComponent.prototype.rowUpdated = /**
     * When a row was edited
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this.onRowUpdated.emit(event);
    };
    /**
     * Pass selected rows up to the parent component after cleaning up any DT2 properties
     * @param {?} rows
     * @return {?}
     */
    DataGridComponent.prototype.emitSelectedRows = /**
     * Pass selected rows up to the parent component after cleaning up any DT2 properties
     * @param {?} rows
     * @return {?}
     */
    function (rows) {
        /** //Removed for now, we need the instance passed up so the parent can manipulate the rows
                  // Loop through all the selected rows and remove any $$ properties
                  let newRows = rows.map(row => {
                    // Return new instance
                    let newRow = Object.assign({}, row);
                    // Loop through all keys in object
                    for (let key in newRow) {
                      // Remove any keys with $$ present
                      if (key.indexOf('$$') != -1){
                        delete newRow[key];
                      }
                    }
                    return newRow;
                  });
                  */
        this.onRowsSelected.emit(rows.slice());
    };
    /**
     * Perform an action on the main datatable that was requested by lower component
     * @param {?} action
     * @return {?}
     */
    DataGridComponent.prototype.onUpdateDatatable = /**
     * Perform an action on the main datatable that was requested by lower component
     * @param {?} action
     * @return {?}
     */
    function (action) {
        // Update datatable
        // Update datatable
        if (action === 'update') {
            this.viewCreate();
        }
        else if (action === 'reset') {
            // Reset datatable
            this.reset();
        }
    };
    /**
     * Emit a custom link event response up to the parent component
     * @param {?} data
     * @return {?}
     */
    DataGridComponent.prototype.customLinkEvent = /**
     * Emit a custom link event response up to the parent component
     * @param {?} data
     * @return {?}
     */
    function (data) {
        this.onCustomLinkEvent.emit(data);
    };
    /**
     * Reset all datatable controls, filters sorts groups etc
     * @param {?=} resetType
     * @return {?}
     */
    DataGridComponent.prototype.reset = /**
     * Reset all datatable controls, filters sorts groups etc
     * @param {?=} resetType
     * @return {?}
     */
    function (resetType) {
        this.ref.detach();
        // Reset State
        // Reset State
        if (resetType && resetType === 'groups') {
            this.state.groups = [];
        }
        else if (resetType && resetType === 'sorts') {
            this.state.sorts = [];
        }
        else if (resetType && resetType === 'filters') {
            this.state.filters = [];
        }
        else {
            this.state.groups = [];
            this.state.filters = [];
            this.state.sorts = [];
        }
        this.state.info = {};
        // Reset Columns
        this.columnsInternal = this.columnsInternal.map(function (column) {
            column.pinnedLeft = false;
            column.locked = false;
            return __assign({}, column);
        });
        if (this.filterGlobal) {
            this.filterGlobal.term = '';
        }
        this.emitColumns();
        this.onStateUpdated({ action: Actions.reset, data: null });
        this.ref.reattach();
    };
    /**
     * On window resize
     * @return {?}
     */
    DataGridComponent.prototype.onWindowResize = /**
     * On window resize
     * @return {?}
     */
    function () {
        if (this.columnsInternal && this.columnsInternal.length && this.rowsInternal && this.rowsInternal.length) {
            this.viewCreate();
        }
    };
    /**
     * @return {?}
     */
    DataGridComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        // Unsub from all subscriptions
        this.subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    return DataGridComponent;
}());
/**
 * Documentation and scaffolding available in this folder in datatable.scaffold.ts *
 */
export { DataGridComponent };
function DataGridComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    DataGridComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    DataGridComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    DataGridComponent.propDecorators;
    /**
     * Self reference
     * @type {?}
     */
    DataGridComponent.prototype.dataGrid;
    /** @type {?} */
    DataGridComponent.prototype.dataGridBody;
    /**
     * Columns
     * @type {?}
     */
    DataGridComponent.prototype._columns;
    /**
     * Rows
     * @type {?}
     */
    DataGridComponent.prototype._rows;
    /**
     * State. Set default if state is not passed down from parent
     * @type {?}
     */
    DataGridComponent.prototype._state;
    /**
     * Holds custom DOM templates passed from parent
     * @type {?}
     */
    DataGridComponent.prototype._columnTemplates;
    /** @type {?} */
    DataGridComponent.prototype.options;
    /** @type {?} */
    DataGridComponent.prototype.filterGlobal;
    /**
     * Outputs
     * @type {?}
     */
    DataGridComponent.prototype.onColumnsUpdated;
    /** @type {?} */
    DataGridComponent.prototype.onRowsSelected;
    /** @type {?} */
    DataGridComponent.prototype.onStateChange;
    /** @type {?} */
    DataGridComponent.prototype.onRightClickMenu;
    /** @type {?} */
    DataGridComponent.prototype.action;
    /** @type {?} */
    DataGridComponent.prototype.onCustomLinkEvent;
    /** @type {?} */
    DataGridComponent.prototype.onElementRef;
    /** @type {?} */
    DataGridComponent.prototype.onRowUpdated;
    /**
     * Columns that are sent to the DOM after any modification is done
     * @type {?}
     */
    DataGridComponent.prototype.columnsInternal;
    /**
     * Columns that are sent to the DOM after any modification is done
     * @type {?}
     */
    DataGridComponent.prototype.columnsExternal;
    /**
     * Columns that are pinned
     * @type {?}
     */
    DataGridComponent.prototype.columnsPinnedLeft;
    /**
     * Columns that are pinned
     * @type {?}
     */
    DataGridComponent.prototype.columnsPinnedRight;
    /**
     * Rows that are sent to the DOM after any modification is done
     * @type {?}
     */
    DataGridComponent.prototype.rowsInternal;
    /**
     * Rows that are sent to the DOM after any modification is done
     * @type {?}
     */
    DataGridComponent.prototype.rowsExternal;
    /**
     * Properties and info about the grid itself, IE formatting such as width and scroll area
     * @type {?}
     */
    DataGridComponent.prototype.gridProps;
    /**
     * Properties related to scrolling of the main grid
     * @type {?}
     */
    DataGridComponent.prototype.scrollProps;
    /**
     * Holds custom templates for cells
     * @type {?}
     */
    DataGridComponent.prototype.templatesCell;
    /**
     * A dictionary of columns based on primary key, used for lookups
     * @type {?}
     */
    DataGridComponent.prototype.columnsMapped;
    /**
     * Last row that was selected
     * @type {?}
     */
    DataGridComponent.prototype.rowSelectedLast;
    /**
     * How many rows are selected
     * @type {?}
     */
    DataGridComponent.prototype.rowsSelectedCount;
    /**
     * Keep track of which row was hovered over last during a drag operation. Used to select all rows when a drag operation does not end on a row
     * @type {?}
     */
    DataGridComponent.prototype.rowHoveredLast;
    /**
     * A list of default selectable terms to filter each column by
     * @type {?}
     */
    DataGridComponent.prototype.filterTerms;
    /**
     * A dictionary that holds css CLASSES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowClass
     * @type {?}
     */
    DataGridComponent.prototype.rowClasses;
    /**
     * A dictionary that holds css STYLES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowStyle
     * @type {?}
     */
    DataGridComponent.prototype.rowStyles;
    /**
     * Does the datatable have the data it needs to draw the dom?
     * @type {?}
     */
    DataGridComponent.prototype.appReady;
    /**
     * Does the datatable have the data it needs to draw the dom?
     * @type {?}
     */
    DataGridComponent.prototype.domReady;
    /**
     * Is the user dragging with the mouse
     * @type {?}
     */
    DataGridComponent.prototype.dragging;
    /** @type {?} */
    DataGridComponent.prototype.draggingPos;
    /**
     * Currently pressed key
     * @type {?}
     */
    DataGridComponent.prototype.keyPressed;
    /**
     * A dictionary of currently pressed keys
     * @type {?}
     */
    DataGridComponent.prototype.keysPressed;
    /**
     * Hold the rowindex and group index when a row is clicked and dragged
     * @type {?}
     */
    DataGridComponent.prototype.rowClickDrag;
    /**
     * The sum of the current column widths. Used to determine if column resize is necessary
     * @type {?}
     */
    DataGridComponent.prototype.columnWidthsInternal;
    /**
     * The height of the row. Necessary for virtual scroll calculation. Needs to be an odd number to prevent partial pixel problems. Has 1px border added
     * @type {?}
     */
    DataGridComponent.prototype.rowHeight;
    /**
     * Keep track of which indexes are visible to prevent the component tree from being updated unless actually changed
     * @type {?}
     */
    DataGridComponent.prototype.rowsIndexes;
    /** @type {?} */
    DataGridComponent.prototype.columnIndexes;
    /**
     * Throttle the window resize event
     * @type {?}
     */
    DataGridComponent.prototype.onWindowResizeThrottled;
    /**
     * Hold subs for future unsub
     * @type {?}
     */
    DataGridComponent.prototype.subscriptions;
    /** @type {?} */
    DataGridComponent.prototype.rowGroups;
    /** @type {?} */
    DataGridComponent.prototype.groups;
    /** @type {?} */
    DataGridComponent.prototype.status;
    /** @type {?} */
    DataGridComponent.prototype.dgSvc;
    /** @type {?} */
    DataGridComponent.prototype.ref;
    /** @type {?} */
    DataGridComponent.prototype.zone;
}
