import { OnInit, OnDestroy, OnChanges, EventEmitter, ChangeDetectorRef, AfterViewInit, ElementRef, QueryList, NgZone, AfterContentInit } from '@angular/core';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromEvent';
import { DataGridService } from '../services/datagrid.service';
import { DataTableColumnDirective } from '../directives/column.directive';
import { Datagrid } from '../typings';
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
export declare class DataGridComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy, AfterContentInit {
    private dgSvc;
    private ref;
    private zone;
    /** Self reference */
    dataGrid: ElementRef;
    dataGridBody: BodyComponent;
    /** Columns */
    private _columns;
    columns: Datagrid.Column[];
    /** Rows */
    private _rows;
    rows: any[];
    /** State. Set default if state is not passed down from parent */
    private _state;
    state: Datagrid.State;
    /** Holds custom DOM templates passed from parent */
    private _columnTemplates;
    columnTemplates: QueryList<DataTableColumnDirective>;
    options: Datagrid.Options;
    filterGlobal: Datagrid.FilterGlobal;
    /** Outputs */
    onColumnsUpdated: EventEmitter<any>;
    onRowsSelected: EventEmitter<any>;
    onStateChange: EventEmitter<any>;
    onRightClickMenu: EventEmitter<any>;
    action: EventEmitter<any>;
    onCustomLinkEvent: EventEmitter<any>;
    onElementRef: EventEmitter<any>;
    onRowUpdated: EventEmitter<any>;
    /** Columns that are sent to the DOM after any modification is done */
    columnsInternal: Datagrid.Column[];
    /** Columns that are sent to the DOM after any modification is done */
    columnsExternal: Datagrid.Column[];
    /** Columns that are pinned */
    columnsPinnedLeft: Datagrid.Column[];
    /** Columns that are pinned */
    columnsPinnedRight: Datagrid.Column[];
    /** Rows that are sent to the DOM after any modification is done */
    rowsInternal: any[];
    /** Rows that are sent to the DOM after any modification is done */
    rowsExternal: any[];
    /** Properties and info about the grid itself, IE formatting such as width and scroll area */
    gridProps: Datagrid.Props;
    /** Properties related to scrolling of the main grid */
    scrollProps: Datagrid.ScrollProps;
    /** Holds custom templates for cells */
    templatesCell: {
        [key: string]: ElementRef;
    };
    /** A dictionary of columns based on primary key, used for lookups */
    columnsMapped: {
        [key: string]: Datagrid.Column;
    };
    /** Last row that was selected */
    rowSelectedLast: number | null;
    /** How many rows are selected */
    rowsSelectedCount: number;
    /** Keep track of which row was hovered over last during a drag operation. Used to select all rows when a drag operation does not end on a row */
    rowHoveredLast: number | null;
    /** A list of default selectable terms to filter each column by */
    filterTerms: any;
    /** A dictionary that holds css CLASSES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowClass */
    rowClasses: {};
    /** A dictionary that holds css STYLES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowStyle */
    rowStyles: {};
    /** Does the datatable have the data it needs to draw the dom? */
    appReady: boolean;
    /** Does the datatable have the data it needs to draw the dom? */
    domReady: boolean;
    /** Is the user dragging with the mouse */
    dragging: boolean;
    draggingPos: Datagrid.DragSelect;
    /** Currently pressed key */
    keyPressed: string | null;
    /** A dictionary of currently pressed keys */
    private keysPressed;
    /** Hold the rowindex and group index when a row is clicked and dragged */
    private rowClickDrag;
    /** The sum of the current column widths. Used to determine if column resize is necessary */
    private columnWidthsInternal;
    /** The height of the row. Necessary for virtual scroll calculation. Needs to be an odd number to prevent partial pixel problems. Has 1px border added*/
    private rowHeight;
    /** Keep track of which indexes are visible to prevent the component tree from being updated unless actually changed */
    private rowsIndexes;
    private columnIndexes;
    /** Throttle the window resize event */
    onWindowResizeThrottled: any;
    /** Hold subs for future unsub */
    private subscriptions;
    rowGroups: Datagrid.Group[];
    groups: Datagrid.Groupings | null;
    status: Datagrid.Status;
    constructor(dgSvc: DataGridService, ref: ChangeDetectorRef, zone: NgZone);
    ngOnInit(): void;
    ngDoCheck(): void;
    ngAfterContentInit(): void;
    ngOnChanges(model: any): void;
    ngAfterViewInit(): void;
    /**
     * Determine the conditions for when the datagrid is ready to render to the dom
     * TODO: Set max iterations to check to avoid infinite loop
     */
    private dataGridReady();
    /** Throttle keyboard events. Not really necessary since repeated key events are ignored but will allow for more events down the road */
    /**
     * When the datatable is scrolled
     * @param event
     */
    onScroll(scrollPropsNew: Datagrid.ScrollProps): void;
    /**
     * Create the view by assembling everything that modifies the state
     * @param state
     */
    viewCreate(): void;
    /**
     * When a group is toggled
     * @param event
     */
    groupToggled(): void;
    /**
     * When the datatable state is changed, usually via a control such as group/filter/sort etc
     * @param stateChange
     */
    onStateUpdated(stateChange: Datagrid.StateChange): void;
    /**
     * When columns are modified from a lower component
     * @param columns
     */
    columnsUpdated(columnData: {
        action: 'resize' | 'reorder';
        columnIndex: number;
        prop?: string;
        type?: 'pinnedLeft' | 'main';
        width?: number;
        columns?: Datagrid.Column[];
    }): void;
    /**
     * Global properties needed by grid to draw itself
     */
    updateGridProps(): void;
    /**
     * On a global mouse down event
     * @param event
     */
    private handleMouseDown(event);
    /**
     * Global mouse up event
     * @param event
     */
    handleMouseUp(event: MouseEvent): void;
    /**
     * On Global mouse move
     * @param event
     */
    handleMouseMove(event: MouseEvent): void;
    /**
     * Handle keyboard events
     * @param event
     */
    handleKeyboardEvents(event: KeyboardEvent): void;
    /**
     * Select all rows
     */
    private selectRowsAll();
    /**
     * When a mouse event has happend on a body row
     * @param event
     */
    onRowMouseEvent(action: {
        type: 'click' | 'contextmenu' | 'mousedown' | 'mouseup' | 'mouseenter' | 'dblclick';
        rowIndex: number;
        event: MouseEvent;
    }): void;
    /**
     * Manage row selection. Includes single and multiple click by pressing control and shift
     * @param row - The row object
     * @param rowIndex - The index of the currently selected row
     */
    selectRow(row: any, rowIndex: number, isRightClick?: boolean, elementRef?: any): void;
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
    getRowClasses(row: any): string;
    /**
     * Create a dictionary of row css classes based on inputs from options.rowClass
     */
    createRowClasses(): void;
    /**
     * Create inline css styles for rows
     */
    createRowStyles(): void | false;
    /**
     * Emit changed columns up to the parent component
     */
    emitColumns(): void;
    /**
     * Emit state changes up to the parent component
     * @param state
     */
    emitState(state: Datagrid.State): void;
    /**
     * When a row was edited
     * @param $event
     */
    rowUpdated(event: any[]): void;
    /**
     * Pass selected rows up to the parent component after cleaning up any DT2 properties
     * @param rows
     */
    emitSelectedRows(rows: any[]): void;
    /**
     * Perform an action on the main datatable that was requested by lower component
     * @param action
     */
    onUpdateDatatable(action: 'update' | 'reset'): void;
    /**
     * Emit a custom link event response up to the parent component
     * @param data
     */
    customLinkEvent(data: {
        link: Datagrid.ControlsCustomLinksGroup;
        column: Datagrid.Column;
    }): void;
    /**
     * Reset all datatable controls, filters sorts groups etc
     */
    reset(resetType?: 'groups' | 'sorts' | 'filters'): void;
    /**
     * On window resize
     * @param event
     */
    private onWindowResize();
    ngOnDestroy(): void;
}
