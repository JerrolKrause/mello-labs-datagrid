import {
    Component,
    OnInit,
    OnDestroy,
    OnChanges,
    Input,
    Output,
    ViewChild,
    ChangeDetectionStrategy,
    EventEmitter,
    ChangeDetectorRef,
    ViewEncapsulation,
    AfterViewInit,
    ElementRef,
    ContentChildren,
    QueryList,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromEvent';

declare var require: any;
const throttle = require('lodash/throttle');
import { measure } from 'helpful-decorators';
import { DataGridService } from '../services/datagrid.service';
import { DataTableColumnDirective } from '../directives/column.directive';
import { Actions } from '../datagrid.props';
import { Datagrid } from '../models/typings';

import { BodyComponent } from './body/body.component';

/**
TODOS:
- Column option for centering content
- Move keymanagement outside zone
- Better condition management for rendering the initial view
- Allow configurable options for resize: Min column width, max column width
- Move row height calculations from the SCSS file into inline so custom row heights will be supported
- Only generate filter terms on demand
- Drill down filter terms so only visible ones are present. Also should counts of each
- Better handling/performance of initial load. Should also have null value for rows to avoid FOUC of 'no rows found'
- Datatable is not properly cleaning up after itself when emitting data up to parent. Need to remove props added by DT, either directly or by mapping. Look in dgSvc map props up
- Update scaffolding
- Add css classes where appropriate for more control over styling
- Drag select box works wonky inside modal windows, only seems to work well for fullsize datatables
*/

/** Documentation and scaffolding available in this folder in datatable.scaffold.ts **/
@Component({
    selector: 'datagrid',
    templateUrl: './datagrid.component.html',
    styleUrls: ['../datagrid.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:keydown)': 'handleKeyboardEvents($event)',
        '(document:keyup)': 'handleKeyboardEvents($event)',
        // '(document:mousedown )': 'handleMouseDown($event)',
        // '(document:mouseup)': 'handleMouseUp($event)',
        // '(document:mousemove)': 'handleMouseMove($event)',
        '(window:resize)': 'onWindowResizeThrottled($event)',
    },
})
export class DataGridComponent
    implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    /** Self reference */
    @ViewChild('dataGrid') dataGrid: ElementRef;
    @ViewChild('dataGridBody') dataGridBody: BodyComponent;

    /** Columns */
    private _columns: Datagrid.Column[];
    @Input()
    set columns(columns: Datagrid.Column[]) {
        if (columns && columns.length) {
            const slug = Math.floor(Math.random() * 1000000); // Create a random number slug so if different columns are passed a new instance is created every time
            // Create custom track property and new reference for each column
            columns = columns.map((column, i) => {
              column.$$track = slug + '-' + i;
                return { ...column };
            });

            // If columnMap object is supplied, remap column props to what the datatable needs
            if (this.options && this.options.columnMap) {
                columns = this.dgSvc.mapPropertiesDown(columns, this.options.columnMap);
            }
        }
        this._columns = columns;
    }
    get columns(): Datagrid.Column[] {
        return this._columns && this._columns.length ? [...this._columns] : [];
    }
    
    /** Rows */
    private _rows: any[];
    @Input()
    set rows(rows: any[]) {
        if (rows && rows.length) {
            const slug = Math.floor(Math.random() * 1000000); // Create a random number slug so if different rows are passed a new instance is created every time
            rows.forEach((row, i) => {
                row.$$track = slug + '-' + i;
                row.$$selected = false;
            }); // Add the unique ID which is slug + index
        }
        this._rows = rows;
    }
    get rows(): any[] {
        return this._rows && this._rows.length ? [...this._rows] : [];
    }

    /** State. Set default if state is not passed down from parent */
    private _state: Datagrid.State = {
        filters: [],
        sorts: [],
        groups: [],
        info: {},
    };
    @Input()
    set state(state: Datagrid.State) {
        // If no state passed down, set a default and empty state object
        const stateNew: any = state ? state : {};

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

        // If controls map is specified, map state property to appropriate fields
        stateNew.groups =
            stateNew.groups && stateNew.groups.length && this.options.controlsMap
            ? this.dgSvc.mapPropertiesDown(stateNew.groups, this.options.controlsMap)
            : stateNew.groups;
        stateNew.sorts =
            stateNew.sorts && stateNew.sorts.length && this.options.controlsMap
            ? this.dgSvc.mapPropertiesDown(stateNew.sorts, this.options.controlsMap)
            : stateNew.sorts;
        stateNew.filters =
            stateNew.filters && stateNew.filters.length && this.options.controlsMap
            ? this.dgSvc.mapPropertiesDown(stateNew.filters, this.options.controlsMap)
            : stateNew.filters;

        stateNew.info = {
            initial: true,
        };

        this._state = stateNew;
    }
    get state(): Datagrid.State {
        return this._state;
    }

    /** Holds custom DOM templates passed from parent */
    private _columnTemplates: any;
    @ContentChildren(DataTableColumnDirective)
    set columnTemplates(val: QueryList<DataTableColumnDirective>) {
        const arr = val.toArray();
        if (arr.length) {
            this._columnTemplates = this.dgSvc.templatesMapColumns(arr);
        }
    }
    get columnTemplates(): QueryList<DataTableColumnDirective> {
        return this._columnTemplates;
    }

    @Input() options: Datagrid.Options;
    @Input() filterGlobal: Datagrid.FilterGlobal;

    /** Outputs */
    @Output() onColumnsUpdated: EventEmitter<any> = new EventEmitter();
    @Output() onRowsSelected: EventEmitter<any> = new EventEmitter();
    @Output() onStateChange: EventEmitter<any> = new EventEmitter();
    @Output() onRightClickMenu: EventEmitter<any> = new EventEmitter();
    @Output() action: EventEmitter<any> = new EventEmitter();
    @Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();
    @Output() onElementRef: EventEmitter<any> = new EventEmitter();
    @Output() onRowUpdated: EventEmitter<any> = new EventEmitter();

    /** Columns that are sent to the DOM after any modification is done */
    public columnsInternal: Datagrid.Column[];
    /** Columns that are sent to the DOM after any modification is done */
    public columnsExternal: Datagrid.Column[];
    /** Columns that are pinned */
    public columnsPinnedLeft: Datagrid.Column[] = [];
    /** Columns that are pinned */
    public columnsPinnedRight: Datagrid.Column[] = [];
    /** Rows that are sent to the DOM after any modification is done */
    public rowsInternal: any[];
    /** Rows that are sent to the DOM after any modification is done */
    public rowsExternal: any[];
    /** Custom html templates for headers & cells */
    public templates: Datagrid.Templates;
    /** Properties and info about the grid itself, IE formatting such as width and scroll area */
    public gridProps: Datagrid.Props = {
        widthTotal: 0,
        widthPinned: 0,
        widthMain: 0,
        heightTotal: 0,
        heightBody: 0,
        widthViewPort: 0,
        widthFixed: true,
    };
    /** Properties related to scrolling of the main grid */
    public scrollProps: Datagrid.ScrollProps = { scrollTop: 0, scrollLeft: 0 };
    /** Holds custom templates for cells */
    public templatesCell: { [key: string]: ElementRef } = {};
    // private scrollDebounce$: BehaviorSubject<Datagrid.ScrollProps> = new BehaviorSubject(this.scrollProps);
    /** A dictionary of columns based on primary key, used for lookups */
    public columnsMapped: { [key: string]: Datagrid.Column } = {};
    /** Last row that was selected */
    public rowSelectedLast: number | null;
    /** How many rows are selected */
    public rowsSelectedCount: number;
    /** Keep track of which row was hovered over last during a drag operation. Used to select all rows when a drag operation does not end on a row */
    public rowHoveredLast: number | null;
    /** A list of default selectable terms to filter each column by */
    public filterTerms: any;
    /** A dictionary that holds css CLASSES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowClass */
    public rowClasses = {};
    /** A dictionary that holds css STYLES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowStyle */
    public rowStyles = {};
    /** Does the datatable have the data it needs to draw the dom? */
    public appReady = false;
    /** Does the datatable have the data it needs to draw the dom? */
    public domReady = false;
    /** Is the user dragging with the mouse */
    public dragging = false;
    public draggingPos: Datagrid.DragSelect = {
        hasMinSize: false,
        startX: 0,
        startY: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        bounding: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        }
    };
    /** Currently pressed key */
    public keyPressed: string | null;
    /** A dictionary of currently pressed keys */
    private keysPressed: { [key: string]: any } = {};
    /** Hold the rowindex and group index when a row is clicked and dragged */
    private rowClickDrag: any = {
        rowIndex: 0,
        groupIndex: 0,
    };
    /** The sum of the current column widths. Used to determine if column resize is necessary */
    private columnWidthsInternal = 0;
    /** The height of the row. Necessary for virtual scroll calculation. Needs to be an odd number to prevent partial pixel problems. Has 1px border added*/
    private rowHeight = 23;
    /** Keep track of which indexes are visible to prevent the component tree from being updated unless actually changed */
    private rowsIndexes = { start: 0, end: 0 };
    private columnIndexes = { start: 0, end: 0 };
    /** Throttle the window resize event */
    public onWindowResizeThrottled = throttle(() => this.onWindowResize(), 300, { trailing: true, leading: true });

    /** Hold subs for future unsub */
    private subscriptions: Subscription[] = [];

    public rowGroups: Datagrid.Group[] = [];
    public groups: Datagrid.Groupings | null = {};
    public status: Datagrid.Status;
   
    constructor(private dgSvc: DataGridService, private ref: ChangeDetectorRef) {}

    ngOnInit() {
        // If custom templates are available, create templates property
        if (this.columnTemplates && Object.keys(this.columnTemplates).length && this.columns) {
            this.templates = this.dgSvc.templatesAddToColumns(this.columns, this.columnTemplates);
        }
    }

    ngOnChanges(model: any) {
        // Clear all memoized caches anytime new data is loaded into the grid
        // this.dgSvc.clearCaches();

        // If filter global is set or updated
        if (model.filterGlobal && this.filterGlobal && this.filterGlobal.term) {
            throttle(() => this.viewCreate(), 500, { trailing: true, leading: true });
        }

        // If NEW columns are passed
        if (model.columns) {
           
            // If columnMap object is supplied, remap column props to what the datatable needs
            const columns = this.options.columnMap
                ? this.dgSvc.mapPropertiesDown(this.columns, this.options.columnMap)
                : this.columns;

            const columnsPinnedLeft = columns.filter(column => (column.pinnedLeft ? true : false));
            this.columnsPinnedLeft = columns.length ? this.dgSvc.columnCalculations(columnsPinnedLeft) : [];

            // Get un-pinned columns
            const columnsInternal = columns.filter(column => (!column.pinnedLeft ? true : false));
            this.columnsInternal = columns.length ? this.dgSvc.columnCalculations(columnsInternal) : [];

            // Determine total width of internal columns
            this.columnWidthsInternal = this.columnsInternal.reduce((a, b) => b.width ? a + b.width : 0, 0);

            // Create a column map
            this.columnsMapped = this.dgSvc.mapColumns(this.columns);
        }

        // If state and columns are present, check to make sure state has valid fields
        if (this.state && this.columns) {
            // Loop through each element in the state object and verify that the columns exist
            // Delete columns that are referenced in state that don't exist. Helps protect against corrupt states
            if (
                this.state.sorts &&
                this.state.sorts.length &&
                this.state.sorts[0].prop &&
                !this.columnsMapped[this.state.sorts[0].prop]
            ) {
                this.state.sorts = [];
                console.error(`Sorting option is for a column that doesn't exist. Sort option has been removed.`);
            }
            if (this.state.groups && this.state.groups.length && !this.columnsMapped[this.state.groups[0].prop]) {
                this.state.groups = [];
                console.error(`Grouping option is for a column that doesn't exist. Group option has been removed.`);
            }
            if (this.state.filters && this.state.filters.length) {
                for (let i = this.state.filters.length - 1; i >= 0; i--) {
                    if (!this.columnsMapped[this.state.filters[i].prop]) {
                        this.state.filters = this.state.filters.filter((_filter, index) => i !== index);
                        console.error(`Filter option is for a column that doesn't exist. Filter option has been removed.`);
                    }
                }
            }
        }

        // If columns and rows are available
        if (this.columns && this.rows) {
            // On any column or row changes, unselect rows
            this.rows.forEach(row => (row.$$selected = false));
            this.filterTerms = this.dgSvc.getDefaultTermsList(this.rows, this.columns); // Generate a list of default filter terms
            this.createRowStyles(); // Create row styles
            this.createRowClasses(); // Create row classes

            // Only on initial load, set app ready. This prevents the app from hanging on a route change
            this.appReady = true;
            this.dataGridReady();

            // Emit the state change to the parent component now that the first initial view has been created
            this.emitState(this.state);
        }
    }

    ngAfterViewInit() {
        this.domReady = true;
        this.dataGridReady();
    }
    
    /**
     * Determine the conditions for when the datagrid is ready to render to the dom
     * TODO: Set max iterations to check to avoid infinite loop
     */
    private dataGridReady() {
        // If appdata and DOM are ready
        if (this.appReady && this.domReady) {
            // Make sure that the datagrid is visible on the DOM so that the width can be extracted
            if (this.dataGrid && this.dataGrid.nativeElement) {
              this.gridProps.widthViewPort = Math.floor(this.dataGrid.nativeElement.getBoundingClientRect().width);
            }
            // If width is available, create the view and render the dom
            if (this.gridProps.widthViewPort) {
                this.viewCreate();
                // this.ref.detectChanges();
            } else {
                // If for some reason the DOM is not available, check every 100 seconds until it is
                setTimeout(() => {
                    this.dataGridReady();
                }, 50);
            }
        }
    }
    
    /**
     * When the datatable is scrolled
     * @param event
     */
    public onScroll(scrollPropsNew: Datagrid.ScrollProps) {
        // console.log('onScroll', scrollPropsNew);
        this.ref.detach();

        const scrollPropsOld = { ...this.scrollProps };
        const scrollProps = { ...scrollPropsNew };

        // Update rows only if rows have changed
        if (scrollPropsOld.scrollTop !== scrollProps.scrollTop) {
            const rowsVisible = Math.ceil(this.gridProps.heightTotal / this.rowHeight);
            const rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, scrollProps, rowsVisible, this.rowHeight);
            if (
                !this.rowsIndexes ||
                (rowsExternal[0] &&
                    rowsExternal[0].$$track !== this.rowsIndexes.start &&
                    rowsExternal[rowsExternal.length - 1].$$track !== this.rowsIndexes.end)
            ) {
                this.rowsExternal = rowsExternal;
                this.rowsIndexes = {
                    start: rowsExternal[0].$$track,
                    end: rowsExternal[rowsExternal.length - 1].$$track
                }
            }
        }
        // Update columns only if columns have changed
        if (scrollPropsOld.scrollLeft !== scrollProps.scrollLeft) {
            const columnsExternal = this.dgSvc.getVisibleColumns(this.columnsInternal, scrollProps, this.gridProps);
            if (
                !this.columnIndexes ||
                (columnsExternal[0] &&
                    columnsExternal[0].$$track !== this.columnIndexes.start &&
                    columnsExternal[columnsExternal.length - 1].$$track !== this.columnIndexes.end)
            ) {
                this.columnsExternal = columnsExternal;
                this.columnIndexes = {
                    start: columnsExternal[0].$$track,
                    end: columnsExternal[columnsExternal.length - 1].$$track
                }
            }
        }
        this.scrollProps = scrollProps;
        this.ref.reattach();
        // Does not scroll seamlessly without calling detectChanges
        // TODO: Detect changes is pretty costly, need another way to determine change detection
        this.ref.detectChanges();
    }

    /**
     * Create the view by assembling everything that modifies the state
     * @param state
     */
     @measure
    public viewCreate() {
        // console.warn('createView', this.state, this.status, this.filterTerms );
        // console.time('Creating View');
        // Set manual change detection
        this.ref.detach();

        let newRows = this.rows;
        // console.log('Total Rows', newRows.length)
        // If global filter option is set filter
        if (this.filterGlobal && this.filterGlobal.term) {
            // TODO: Figure out how to memoize since groupRows is not a pure function
            newRows = this.dgSvc.filterGlobal(newRows, this.filterGlobal);
        }

        // If custom filters are specified
        if (this.state && this.state.filters && this.state.filters.length) {
            newRows = this.dgSvc.filterArray(newRows, this.state.filters);
        }

        // If grouped
        if (this.state && this.state.groups && this.state.sorts && this.state.groups.length) {
            // Create groups
            // TODO: Figure out how to memoize since groupRows is not a pure function
            const groupings = this.dgSvc.groupRows(newRows, this.columns, this.state.groups, this.state.sorts, this.options);
            newRows = groupings.rows;
            this.groups = groupings.groups;
        } else {
            // If NOT grouped
            this.groups = null;
            // If sorts
            if (
                this.state &&
                this.state.sorts &&
                this.state.sorts.length &&
                this.state.sorts[0] &&
                this.state.sorts[0].prop &&
                this.state.sorts !== undefined
            ) {
                
                // Sort Arrays
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
        if (
          this.dataGrid &&
          this.dataGrid.nativeElement &&
          this.columnWidthsInternal < this.dataGrid.nativeElement.getBoundingClientRect().width
        ) {
            // Resize columns to fit available space
            this.columnsInternal = this.dgSvc.columnsResize(this.columnsInternal, this.columnWidthsInternal, this.gridProps.widthViewPort - this.gridProps.widthPinned);
          this.gridProps.widthFixed = true;
        } else {
          // Reset widths
          this.columnsInternal = this.columnsInternal.map(column => {
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
        const rowsVisible = Math.ceil(this.gridProps.heightTotal / this.rowHeight);

        this.rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, rowsVisible, this.rowHeight);
        // this.rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, rowsVisible, this.rowHeight);
        
        if (this.state.info) {
            // Add stats and info to be emitted
            this.state.info.rowsTotal = this.rows.length;
            this.state.info.rowsVisible = this.rowsInternal.filter(row => !row.type).length; // Filter out any group columns
        }

        this.status = this.dgSvc.createStatuses(this.state, this.columnsInternal);
        // console.warn('this.status', this.status);
        this.state = { ...this.state };

        // Emit the state change to the parent component
        this.emitState(this.state);
        // Turn change detection back on
        this.ref.reattach();
        // console.timeEnd('Creating View');
    }

    /**
     * When a group is toggled
     * @param event
     */
    public groupToggled() {
        this.viewCreate();
    }

    /**
     * When the datatable state is changed, usually via a control such as group/filter/sort etc
     * @param stateChange
     */
    public onStateUpdated(stateChange: Datagrid.StateChange) {
        // console.warn('changeState ', stateChange);
        this.ref.detach();

        const newState: Datagrid.State = { ...this.state };

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
        
        // ### Update Sorting ###
        if (stateChange.action === Actions.sort) {
            newState.sorts = stateChange.data.dir ? [stateChange.data] : [];
        } else if (stateChange.action === Actions.group) {
            // ### Update Grouping ###
            newState.groups = stateChange.data.dir ? [stateChange.data] : [];
        } else if (stateChange.action === Actions.filter) {
            // ### Update Filtering ###
            const newFilter: Datagrid.Filter = stateChange.data.filter;
            if (stateChange.data.filterAction === 'change') {
                let index = 0;
                for (let i = 0; i < newState.filters.length; i++) {
                    if (newFilter.prop === newState.filters[i].prop && newFilter.operator === newState.filters[i].operator) {
                        index = i;
                        break;
                    }
                }
                newState.filters[index] = newFilter;
            } else if (stateChange.data.filterAction === 'add') {
                newState.filters.push(newFilter);
            } else if (stateChange.data.filterAction === 'remove') {
                let index = 0;
                for (let i = 0; i < newState.filters.length; i++) {
                    // If this is a contains filter, only match against field and operator
                    if (
                        newFilter.operator === 'contains' &&
                        newFilter.prop === newState.filters[i].prop &&
                        newFilter.operator === newState.filters[i].operator
                    ) {
                        index = i;
                        break;
                    } else if (
                        newFilter.prop === newState.filters[i].prop &&
                        newFilter.operator === newState.filters[i].operator &&
                        newFilter.value === newState.filters[i].value
                    ) {
                        // If not a contains filter, match against all 3 fields
                        index = i;
                        break;
                    }
                }
                newState.filters.splice(index, 1);
            } else if (stateChange.data.filterAction === 'clear') {
                newState.filters = newState.filters.filter(item => item.prop !== stateChange.data.filter.prop);
                // console.warn('Clearing filters', newState.filters);
            }
        } else if (stateChange.action === Actions.reset) {
            // ### Reset everything ###
            // newRows = [...this.rows];
        } else if (stateChange.action === Actions.column) {
            // ### Column Changes ###
            // Deletion
            if (stateChange.data.action === 'delete') {
                this.columnsInternal = this.columnsInternal.filter(column => column.$$index !== stateChange.data.columnIndex);
                this.columns = this.columns.filter(column => column.$$index !== stateChange.data.columnIndex);
                // Update total width of internal columns
                this.columnWidthsInternal = this.columnsInternal.reduce((a, b) => b.width ? a + b.width : 0, 0);
                this.emitColumns();
            }
        } else if (stateChange.action === Actions.pinLeft) {
            // ### Pinning ###
            if (stateChange.data.isPinned) {
                // Get column being unpinned
                const colNew = this.columnsPinnedLeft[stateChange.data.index];
                delete colNew.pinnedLeft; // Delete pinned prop
                // Remove from pinned array
                this.columnsPinnedLeft = this.columnsPinnedLeft.filter((_col, index) => stateChange.data.index !== index);
                // Add to main array
                this.columnsInternal = [colNew, ...this.columnsInternal];
            } else {
                // console.warn('Pinning to left', stateChange.data);
                // Get pinned column
                const newCol = this.columnsInternal.filter(col => col.prop === stateChange.data.prop)[0];
                newCol.pinnedLeft = true;
                this.columnsPinnedLeft = [...this.columnsPinnedLeft, newCol];
                // Update non pinned columns
                this.columnsInternal = this.columnsInternal.filter(col => col.prop !== stateChange.data.prop);
            }
            // Update total width of internal columns
            this.columnWidthsInternal = this.columnsInternal.reduce((a, b) => b.width ? a + b.width : 0, 0);
            this.emitColumns();
        }

        this.state = newState;
        // Now create the view and update the DOM
        this.viewCreate();
    }

    /**
     * When columns are modified from a lower component
     * @param columns
     */
    public columnsUpdated(columnData: {
        action: 'resize' | 'reorder';
        columnIndex: number;
        prop?: string;
        type?: 'pinnedLeft' | 'main';
        width?: number;
        columns?: Datagrid.Column[];
    }) {
        // console.log('columnsUpdated', columnData);
        // If this is a resize column event
        if (columnData && columnData.columnIndex) {
            if (columnData.action === 'resize') {
                // Determine if updating pinned or regular columns
                if (columnData.type === 'pinnedLeft') {
                    this.columnsPinnedLeft[columnData.columnIndex].width = columnData.width;
                    this.columnsPinnedLeft[columnData.columnIndex] = { ...this.columnsPinnedLeft[columnData.columnIndex] };
                    // this.columnsPinnedLeft = [...this.columnsPinnedLeft];
                } else {
                    this.columnsInternal[columnData.columnIndex].width = columnData.width;
                    this.columnsInternal[columnData.columnIndex] = { ...this.columnsInternal[columnData.columnIndex] };
                    // this.columnsInternal = [...this.columnsInternal];
                }
            } else if (columnData.action === 'reorder') {
                // If this is a reorder columns event
                if (columnData.type === 'pinnedLeft') {
                    const colOld = this.columnsPinnedLeft.filter(column => column.prop === columnData.prop)[0]; // Get column being moved
                    const colsNew = this.columnsPinnedLeft.filter(column => column.prop !== columnData.prop); // Get new array without that column
                    colsNew.splice(columnData.columnIndex, 0, colOld); // Insert into index location
                    this.columnsPinnedLeft = colsNew; // Update reference
                } else {
                    const colOld = this.columnsInternal.filter(column => column.prop === columnData.prop)[0]; // Get column being moved
                    const colsNew = this.columnsInternal.filter(column => column.prop !== columnData.prop); // Get new array without that column
                    colsNew.splice(columnData.columnIndex, 0, colOld); // Insert into index location
                    this.columnsInternal = colsNew; // Update reference
                }
            }

            // Update total width of internal columns
            this.columnWidthsInternal = this.columnsInternal.reduce((a, b) => b.width ? a + b.width : 0, 0);
            this.emitColumns();
            this.viewCreate();
        }
    }


    /**
     * Global properties needed by grid to draw itself
     */
    public updateGridProps() {
      const gridProps: Datagrid.Props = { ...this.gridProps };

      // Get width of DOM viewport
      if (this.dataGrid && this.dataGrid.nativeElement.getBoundingClientRect().width) {
        gridProps.widthViewPort = Math.floor(this.dataGrid.nativeElement.getBoundingClientRect().width) || 0;
      }

      // Get width of pinned columns
      gridProps.widthPinned = this.columnsPinnedLeft.length
          ? this.columnsPinnedLeft.reduce((a, b) => b.$$width ? a + b.$$width : 0, 0) : 0;

      // Get width of non-pinned columns
      gridProps.widthMain = this.columnsInternal.reduce((a, b) => b.$$width ? a + b.$$width : 0, 0) || 0;
      
      // Get width of internal columns plus pinned columns
      gridProps.widthTotal = gridProps.widthMain + gridProps.widthPinned;

      // Get height of grid
      if (this.options.heightMax) {
        gridProps.heightTotal = <number>this.options.heightMax;
      } else if (this.options.fullScreen) {
        const height = this.dataGrid.nativeElement.getBoundingClientRect().height;
        let newHeight = height - 2 - this.rowHeight; // Add offsets for table header and bottom scrollbar
        // Check if the info bar is showing, deduct from total height
        if (this.options.showInfo &&
          (this.state.sorts.length || this.state.groups.length || this.state.filters.length)) {
          newHeight -= this.rowHeight;
        }

        gridProps.heightTotal = newHeight;
      } else {
        // Set default height if non specified
        gridProps.heightTotal = 300;
      }

      // gridProps.rowsVisible = Math.ceil(gridProps.heightTotal / this.rowHeight); // Get max visible rows
      if (this.rowsInternal && this.rowsInternal.length) {
        gridProps.heightBody = this.rowsInternal.length * this.rowHeight;
      } else if (this.rows && this.rows.length) {
        gridProps.heightBody = this.rows.length * this.rowHeight;
      } else {
        gridProps.heightBody = 300;
      }

      this.gridProps = gridProps;
    }

    /**
     * On a global mouse down event
     * @param event
     */
    private handleMouseDown(event: MouseEvent) {
        // console.warn('handleMouseDown 1', event, this.dataGridBody)
        // Set the default starting position of the initial click and also get the bounding box of the datatable
        const draggingPos = {
            startX: event.pageX,
            startY: event.pageY,
            bounding: this.dataGridBody.body.getBoundingClientRect(),
            ...this.draggingPos
        };
        // Only drag on left mouse click
        // Make sure the drag starts within the datatable bounding box
        if (
            event.which === 1 &&
            draggingPos.startY > draggingPos.bounding.top &&
            draggingPos.startY < draggingPos.bounding.bottom &&
            draggingPos.startX > draggingPos.bounding.left &&
            draggingPos.startX < draggingPos.bounding.right
        ) {
            this.draggingPos = draggingPos;
            this.dragging = true;
        }
    }

    /**
     * Global mouse up event
     * @param event
     */
    public handleMouseUp(event: MouseEvent) {
        // console.warn('handleMouseUp', event.pageY, this.dataGridBody.nativeElement.getBoundingClientRect().top);
        // Sometimes the mouse scrolls too fast to register the last hovered row. If the mouseup position is higher than the datatable top, set lasthovered to 0
        if (this.dragging && this.draggingPos && this.draggingPos.bounding && event.pageY < this.draggingPos.bounding.top) {
            this.rowHoveredLast = 0;
        }
        // If a drag event ended NOT on a row, fire the onrowmouseup event with the last hovered row
        if (this.dragging && this.rowHoveredLast !== null) {
            this.onRowMouseEvent({ type: 'mouseup', rowIndex: this.rowHoveredLast, event: event });
            // this.onRowMouseUp(this.rowHoveredLast, event);
            // Unselect all text after drag to prevent weird selection issues
            if (document.getSelection) {
                document.getSelection().removeAllRanges();
            } else if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }
        }

        this.dragging = false;
    }

    /**
     * On Global mouse move
     * @param event
     */
    public handleMouseMove(event: MouseEvent) {

            const draggingPos: Datagrid.DragSelect = {
                hasMinSize: false,
                ...this.draggingPos,
            };

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
            let pageY = event.pageY;
            let pageX = event.pageX;

                // Set top boundary
                if (pageY < draggingPos.bounding.top) {
                    pageY = draggingPos.bounding.top;
                }

                // Set bottom boundary
                if (pageY > draggingPos.bounding.bottom) {
                    pageY = draggingPos.bounding.bottom;
                }

                // Set left boundary
                if (pageX < draggingPos.bounding.left) {
                    pageX = draggingPos.bounding.left;
                }

                // Set right boundary
                if (pageX > draggingPos.bounding.right) {
                    pageX = draggingPos.bounding.right;
                }

                // Determine if this is a right to left drag or a left to right
                if (pageX >= draggingPos.startX) {
                    draggingPos.width = pageX - draggingPos.startX - 2;
                    draggingPos.left = draggingPos.startX;
                } else {
                    draggingPos.width = draggingPos.startX - pageX;
                    draggingPos.left = pageX + 2;
                }

                // Only allow height and top changes if the drag is within the horizontal bounding box
                // This prevents the drag selection continuing to draw vertically even though the mouse is off the datagrid which would give the user the impression
                // they are selecting rows even though their mouse is not on the grid and won't record the row mouse up event
                if (pageX < draggingPos.bounding.right && pageX > draggingPos.bounding.left) {
                    // Determine if this is a top down or bottom up drag
                    if (pageY >= draggingPos.startY) {
                        draggingPos.height = pageY - draggingPos.startY - 2;
                        draggingPos.top = draggingPos.startY;
                    } else {
                        draggingPos.height = draggingPos.startY - pageY;
                        draggingPos.top = pageY + 2;
                    }
                }

                // Make sure there's a minimum size so there isn't a FOUC
                if (draggingPos.width > 10 && draggingPos.height > 10) {
                    draggingPos.hasMinSize = true;
                }

                // Make sure the top is lower than the bounding box, don't allow it to be dragged outside the box
                if (draggingPos.top < draggingPos.bounding.top) {
                    draggingPos.top = draggingPos.bounding.top;
                }

                // Make sure the top is lower than the bounding box, don't allow it to be dragged outside the box
                if (draggingPos.height > draggingPos.bounding.top) {
                    // draggingPos.top = draggingPos.bounding.top;
                }

                // Update DOM
                this.draggingPos = draggingPos;
        }
    }

    /**
     * Handle keyboard events
     * @param event
     */
    public handleKeyboardEvents(event: KeyboardEvent): void {
        // console.warn('handleKeyboardEvents 1');
        // Ignore keyboard repeat events
        if (event.repeat === false) {
            this.keyPressed = event.type === 'keydown' ? event.key : null;

            // If this is a keydown event, add it to the dictionary
            if (event.type === 'keydown') {
                this.keysPressed[event.key.toString().toLowerCase()] = true;
            } else if (event.type === 'keyup') {
                // If this is a key up event, remove from dictionary
                delete this.keysPressed[event.key.toString().toLowerCase()];
            }

            // If control + a is pressed, select all
            if (this.keysPressed['a'] && this.keysPressed['Control']) {
                this.selectRowsAll();
                event.preventDefault();
                event.stopPropagation();
            }
            // console.log('handleKeyboardEvents 1', event.type, this.keysPressed);
        }
    }

    /**
     * Select all rows
     */
    private selectRowsAll() {
        if (this.rows.length) {
            this.rowsInternal.forEach(row => (row.$$selected = true));
            this.emitSelectedRows(this.rowsInternal);
        }
    }

    /**
     * When a mouse event has happend on a body row
     * @param event
     */
    public onRowMouseEvent(action: {
        type: 'click' | 'contextmenu' | 'mousedown' | 'mouseup' | 'mouseenter' | 'dblclick';
        rowIndex: number;
        event: MouseEvent;
    }) {
        if (action.type !== 'mouseenter') {
            // console.log('onRowMouseEvent', action);
        }

        const row = this.rowsInternal.filter(row2 => row2.$$rowIndex === action.rowIndex)[0]; // this.rowsInternal[action.rowIndex];

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
                if (action.event.which === 1 && action.rowIndex !== this.rowClickDrag.rowIndex) {
                    // Check if the drag was top to bottom or bottom to top for ROWS. Always start at the lowest index
                    const rowStart = this.rowClickDrag.rowIndex <= action.rowIndex ? this.rowClickDrag.rowIndex : action.rowIndex;
                    const rowEnd = this.rowClickDrag.rowIndex >= action.rowIndex ? this.rowClickDrag.rowIndex : action.rowIndex;

                    this.rowsInternal.forEach(rowNew => (rowNew.$$selected = false));
                    for (let j = rowStart; j <= rowEnd; j++) {
                        this.rowsInternal[j].$$selected = true;
                    }

                    const selectedRows = this.rowsInternal.filter(rowNew => rowNew.$$selected);
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
    }

    /**
     * Manage row selection. Includes single and multiple click by pressing control and shift
     * @param row - The row object
     * @param rowIndex - The index of the currently selected row
     */
    public selectRow(row: any, rowIndex: number, isRightClick?: boolean, elementRef?: any) {
        // console.warn('selectRow', this.keysPressed, row, rowIndex, isRightClick, elementRef);

        // Only allow row selection if set
        if (this.options.selectionType) {
            const newRows = [...this.rowsInternal];
            // If control is pressed while clicking
            if (this.keysPressed['control'] && this.options.selectionType === 'multi') {
                row.$$selected = row.$$selected ? false : true;
            } else if (this.keysPressed['shift'] && this.options.selectionType === 'multi' && this.rowSelectedLast) {
                // If shift is pressed while clicking
                // Unset all selected flags
                newRows.forEach(rowNew => (rowNew.$$selected = false));
                // Figure out if the selection goes top to bottom or bottom to top
                const startIndex = rowIndex > this.rowSelectedLast ? this.rowSelectedLast : rowIndex;
                const endIndex = rowIndex < this.rowSelectedLast ? this.rowSelectedLast : rowIndex;
                // Loop through the lowest index and set all selected flags
                for (let i = startIndex; i < endIndex + 1; i++) {
                    if (newRows[i]) {
                        newRows[i].$$selected = true;
                    }
                }
            } else if (!row.$$selected && !isRightClick) {
                // If just regular click
                // Disable all other selected flags
                newRows.forEach(rowNew => (rowNew.$$selected = false));
                row.$$selected = true;
                // this.rowsSelected = row;
            } else {
                // If this is a right click row, don't do anything special
                if (isRightClick) {
                    if (!row.$$selected) {
                        newRows.forEach(rowNew => (rowNew.$$selected = false));
                        row.$$selected = true;
                    }
                } else if (this.rowsSelectedCount > 1) {
                    // If multiple rows are already selected
                    // Reset all and set current row to selected
                    newRows.forEach(rowNew => (rowNew.$$selected = false));
                    row.$$selected = true;
                } else {
                    // Just untoggle this row
                    row.$$selected = false;
                }
            }
            const selectedRows = newRows.filter(rowNew => rowNew.$$selected);
            this.rowSelectedLast = rowIndex;
            this.rowsSelectedCount = selectedRows.length;
            this.emitSelectedRows(selectedRows);
            this.onElementRef.emit(elementRef);
        }
    }

    /**
     * Manage right click functionality. If right clicking and row is unselected, select it, otherwise do nothing
     * @param row
     * @param rowIndex
     * @param contextMenuEvent

    public onRightClick(row, rowIndex: number, event?: MouseEvent) {
          this.selectRow(row, rowIndex, true);

      this.onRightClickMenu.emit(event); // Emit right click event up to the parent
    }
       */

    /**
       * On mouse down on a row
       * @param rowIndex
       * @param groupIndex
       * @param event

    public onRowMouseDown(rowIndex: number | false, event) {

          this.handleMouseDown(event);

          // Only function when the left mouse button is clicked
      if (event.which == 1) {
        this.rowClickDrag.rowIndex = rowIndex;
      }
      }
  */
    /**
       * On mouse up on a row
       * @param rowIndex
       * @param groupIndex
       * @param event

    public onRowMouseUp(rowIndex: number, event): false | void {
      //console.warn('onRowMouseUp', rowIndex, this.rowClickDrag.rowIndex);

      if (!this.options.selectionType) {// || this.reSizing
        return false;
      }

          // Only function when the left mouse button is clicked
      if (event.which == 1 && rowIndex != this.rowClickDrag.rowIndex) {

        // Check if the drag was top to bottom or bottom to top for ROWS. Always start at the lowest index
        let rowStart = this.rowClickDrag.rowIndex <= rowIndex ? this.rowClickDrag.rowIndex : rowIndex;
        let rowEnd = this.rowClickDrag.rowIndex >= rowIndex ? this.rowClickDrag.rowIndex : rowIndex;
        //console.warn('rowStart', rowStart, rowEnd);
        this.rowsInternal.forEach(row => row.$$selected = false);
        for (let j = rowStart; j <= rowEnd; j++) {
          this.rowsInternal[j].$$selected = true;
        }

        let selectedRows = this.rowsInternal.filter(row => row.$$selected);
        this.rowsSelectedCount = selectedRows.length;
        this.emitSelectedRows(selectedRows);
      }
    }
  */
    /**
     * Calculate the height of the datatable

    public calculateHeight():number {
      if (this.options.heightMax) {
        this.tableContainerHeight = <number>this.options.heightMax;
      } else if (this.options.heightFullscreen){
        let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        //document.getElementById('datatable2')
        let offset = this.dataGridBody.nativeElement.getBoundingClientRect().top;
        let newHeight = height - offset - 16// + 'px';
        this.tableContainerHeight = newHeight;
      }
      return this.tableContainerHeight;
    }
       */

    /**
     * Create row css classes based on callback function in options
     * @param row - Table row
     */
    public getRowClasses(row: any) {
        if (!this.options.rowClass) {
            return null;
        }

        let classes = '';
        const results: any = this.options.rowClass(row);
        for (const key in results) {
            if (results.hasOwnProperty(key)) {
                if (results[key]) {
                    classes += key + ' ';
                }
            }
        }
        if (classes !== '') {
            return classes;
        }
    }

    /**
     * Create a dictionary of row css classes based on inputs from options.rowClass
     */
    public createRowClasses(): void {
        const rowClasses: { [key: string]: any } = {};
        if (this.options.rowClass) {
            this.rows.forEach(row => {
                if (this.options.primaryKey && row[this.options.primaryKey] && this.options.rowClass) {
                    const results: any = this.options.rowClass(row);
                    let classes = '';
                    for (const key in results) {
                        if (results[key]) {
                            classes += key + ' ';
                        }
                    }
                    rowClasses[row[this.options.primaryKey]] = classes.length ? classes : null;
                }
            });
        }
        this.rowClasses = rowClasses;
    }

    /**
     * Create inline css styles for rows
     */
    public createRowStyles(): void | false {
        let rowStyles: { [key: string]: any } = {};

        // Only create row styles if supplied by options
        if (!this.options.rowStyle) {
            this.rowStyles = rowStyles;
            return false;
        }

        const primaryKey = this.options.primaryKey ? this.options.primaryKey : '';

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
        const stylesWithModels: any[] = [];
        const stylesNoModels: any[] = [];

        // Sort styles that have observable models and those that don't
        this.options.rowStyle.forEach(
            style => (style.model ? stylesWithModels.push(style.model) : stylesNoModels.push(style.rules)),
        );

        // If no models
        if (stylesNoModels.length && primaryKey) {
            // Loop through all rows
            this.rows.forEach(row => {
                // Loop through all styles without rules
                stylesNoModels.forEach(rule => {
                    // Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
                    rowStyles[row[primaryKey]] = Object.assign(rowStyles[row[primaryKey]], rule(row));
                });
            });
        }

        // If models/observables were supplied
        // This class method is NOT fired everytime observables update so it needs to be self contained within the subscribe in order to update everything at once
        // Includes styles with no models in order to accomodate styles with mixed observables and non observables
        if (stylesWithModels.length) {
            // Create a single combine latest observable that will update when any of the inputs are updated
            const subscription = Observable.combineLatest(stylesWithModels).subscribe((models: any[]) => {
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
                if (stylesNoModels.length && primaryKey) {
                    // Loop through all rows
                    this.rows.forEach(row => {
                        // Loop through all styles without rules
                        stylesNoModels.forEach(rule => {
                            // Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
                            rowStyles[row[primaryKey]] = Object.assign(
                                rowStyles[row[primaryKey]] || {},
                                rule(row),
                            );
                        });
                    });
                }

                // Loop through all rays
                this.rows.forEach(row => {
                    // Now loop through each result of data returned from the observable
                    models.forEach((model, index) => {
                        if (this.options &&
                            this.options.rowStyle &&
                            this.options.rowStyle[index] &&
                            this.options.rowStyle[index].rules
                        ) {
                            // Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
                            if (this.options.rowStyle &&
                                this.options.rowStyle[index] &&
                                this.options.rowStyle[index].rules) {
                                rowStyles[row[primaryKey]] = {
                                    ...rowStyles[row[primaryKey]] || {},
                                    ...(<any>this.options.rowStyle[index]).rules(row, model)
                                };
                            }

                        }

                    });
                });
                // Update row styles
                this.rowStyles = rowStyles;
                // Tell DOM to updated after observable is done udpated
                this.ref.detectChanges();
            });
            this.subscriptions.push(<any>subscription);
        }

        this.rowStyles = rowStyles;
    }

    /**
     * Emit changed columns up to the parent component
     */
    public emitColumns() {
        // TODO: Mapping properties back up isn't seamless and needs work, commenting out for now
        // let remapColumns = this.dgSvc.mapPropertiesUp([...columns], this.options.columnMap);
        // Remove templates and emit new column references up. Templates have a circulate reference which blows up json usage
        const columnsNew: any[] = [...this.columnsPinnedLeft, ...this.columnsInternal];

        const columnsEmitted = columnsNew.map(column => {
            const columnNew = { ...column };
            columnNew.locked = columnNew.pinnedLeft ? true : false;
            delete columnNew.templateCell;
            delete columnNew.templateHeader;
            return columnNew;
        });

        // Emit data back up
        this.onColumnsUpdated.emit(columnsEmitted);
    }

    /**
     * Emit state changes up to the parent component
     * @param state
     */
    public emitState(state: Datagrid.State) {
        // User columns has a circular reference somewhere so create new instance and remove that property before emitting up
        const stateNew = { ...state };
        delete (<any>stateNew).usersColumns;

        // Create a new memory reference for the state and then remap all properties up into the layout
        const remapProps = JSON.parse(JSON.stringify(stateNew));
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
    }

    /**
     * When a row was edited
     * @param $event
     */
    public rowUpdated(event: any[]) {
        this.onRowUpdated.emit(event);
    }

    /**
     * Pass selected rows up to the parent component after cleaning up any DT2 properties
     * @param rows
     */
    public emitSelectedRows(rows: any[]) {
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
        this.onRowsSelected.emit([...rows]);
    }

    /**
     * Perform an action on the main datatable that was requested by lower component
     * @param action
     */
    public onUpdateDatatable(action: 'update' | 'reset') {
        // Update datatable
        if (action === 'update') {
            this.viewCreate();
        } else if (action === 'reset') {
            // Reset datatable
            this.reset();
        }
    }

    /**
     * Emit a custom link event response up to the parent component
     * @param data
     */
    public customLinkEvent(data: { link: Datagrid.ControlsCustomLinksGroup; column: Datagrid.Column }) {
        this.onCustomLinkEvent.emit(data);
    }

    /**
     * Reset all datatable controls, filters sorts groups etc
     */
    public reset(resetType?: 'groups' | 'sorts' | 'filters') {
        this.ref.detach();

        // Reset State
        if (resetType && resetType === 'groups') {
            this.state.groups = [];
        } else if (resetType && resetType === 'sorts') {
            this.state.sorts = [];
        } else if (resetType && resetType === 'filters') {
            this.state.filters = [];
        } else {
            this.state.groups = [];
            this.state.filters = [];
            this.state.sorts = [];
        }

        this.state.info = {};
        // Reset Columns
        this.columnsInternal = this.columnsInternal.map(column => {
            column.pinnedLeft = false;
            column.locked = false;
            return { ...column };
        });

        if (this.filterGlobal) {
            this.filterGlobal.term = '';
        }

        this.emitColumns();
        this.onStateUpdated({ action: Actions.reset, data: null });
        this.ref.reattach();
    }

    /**
     * On window resize
     * @param event
     */
    private onWindowResize() {
        if (this.columnsInternal && this.columnsInternal.length && this.rowsInternal && this.rowsInternal.length) {
            this.viewCreate();
        }
    }

    ngOnDestroy() {
        // Unsub from all subscriptions
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
