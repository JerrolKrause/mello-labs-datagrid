import {
	Component, OnInit, OnDestroy, OnChanges, Input, Output, ViewChild, ChangeDetectionStrategy, EventEmitter, ChangeDetectorRef, ViewEncapsulation,
	AfterViewInit, ElementRef, ContentChildren, QueryList, NgZone, AfterContentInit, DoCheck, Renderer2
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromEvent';

import { DataGridService } from '../datagrid.service';
import { DataTableColumnDirective } from '../directives/column.directive';
import { Actions } from '../datagrid.props';
import { Datagrid } from '../typings';

import * as _ from 'lodash';
import { BodyComponent } from './body/body.component';


/**
TODOS:
- Allow configurable options for resize: Min column width, max column width
- Move row height calculations from the SCSS file into inline so custom row heights will be supported
- Only generate filter terms on demand
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
		'(document:keydown)': 'onKeyEventThrottled($event)',
		'(document:keyup)': 'onKeyEventThrottled($event)',
		//'(document:mousedown )': 'handleMouseDown($event)',
		//'(document:mouseup)': 'handleMouseUp($event)',
		//'(document:mousemove)': 'handleMouseMove($event)',
		'(window:resize)': 'onWindowResizeThrottled($event)'
	}
})
export class DataGridComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy, AfterContentInit, DoCheck {
	/** Self reference */
	@ViewChild('dataGrid') dataGrid: ElementRef;
	@ViewChild('dataGridBody') dataGridBody: BodyComponent;

	/** Columns */
	private _columns: Datagrid.Column[];
	@Input()
	set columns(columns: Datagrid.Column[]) {
		let slug = Math.floor(Math.random() * 1000000); // Create a random number slug so if different columns are passed a new instance is created every time
		// Create custom track property and new reference for each column
		columns = columns.map((column, i) => {
			column.$$track = slug + '-' + i;
			return { ...column };
		});
		// If columnMap object is supplied, remap column props to what the datatable needs
		if (this.options && this.options.columnMap) {
			columns = this.dgSvc.mapPropertiesDown(columns, this.options.columnMap)
		}
		// If column templates supplied, map those to the column. This instance only fires if the columns are changed after initial load
		if (this.columnTemplates && Object.keys(this.columnTemplates).length && columns) {
			this.dgSvc.templatesAddToColumns(columns, this.columnTemplates);
		}
		this._columns = columns;
	};
	get columns(): Datagrid.Column[] {
		return this._columns && this._columns.length ? [...this._columns] : null;
	}

	/** Rows */
	private _rows: any[];
	@Input()
	set rows(rows: any[]) {
		let slug = Math.floor(Math.random() * 1000000); // Create a random number slug so if different rows are passed a new instance is created every time
		rows.forEach((row, i) => row.$$track = slug + '-' + i); // Add the unique ID which is slug + index
		this._rows = rows;
	};
	get rows(): any[] {
		return this._rows && this._rows.length ? [...this._rows] : null;
	}

	/** State */
	private _state: Datagrid.State;
	@Input()
	set state(state: Datagrid.State) {
		// If no state passed down, set a default and empty state object
		let stateNew: Datagrid.State = state ? state : {};

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
	};
	get state(): Datagrid.State {
		return this._state;
	}

	/** Holds custom DOM templates passed from parent */
	private _columnTemplates;
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
	/** Properties and info about the grid itself, IE formatting such as width and scroll area */
	public gridProps: Datagrid.Props = {};
	/** Properties related to scrolling of the main grid */
	public scrollProps: Datagrid.ScrollProps = { scrollTop: 0, scrollLeft: 0 };
	/** Holds custom templates for cells */
	public templatesCell: { [key: string]: ElementRef } = {};
	//private scrollDebounce$: BehaviorSubject<Datagrid.ScrollProps> = new BehaviorSubject(this.scrollProps);
	/** A dictionary of columns based on primary key, used for lookups */
	public columnsMapped: { [key: string]: Datagrid.Column } = {};
	/** Last row that was selected */
	public rowSelectedLast: number;
	/** How many rows are selected */
	public rowsSelectedCount: number;
	/** Keep track of which row was hovered over last during a drag operation. Used to select all rows when a drag operation does not end on a row */
	public rowHoveredLast: number;
	/** A list of default selectable terms to filter each column by */
	public filterTerms: any;
	/** A dictionary that holds css CLASSES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowClass */
	public rowClasses = {};
	/** A dictionary that holds css STYLES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowStyle */
	public rowStyles = {};
	/** Does the datatable have the data it needs to draw the dom? */
	public appReady: boolean = false;
	/** Does the datatable have the data it needs to draw the dom? */
	public domReady: boolean = false;
	/** Is the user dragging with the mouse */
	public dragging: boolean = false;
	public draggingPos: Datagrid.DragSelect = {};
	/** Currently pressed key */
	private keyPressed: string;
	/** A dictionary of currently pressed keys */
	private keysPressed: {} = {};
	/** Hold the rowindex and group index when a row is clicked and dragged */
	private rowClickDrag: any = {
		rowIndex: 0,
		groupIndex: 0
	}
	/** The height of the row. Necessary for virtual scroll calculation. Needs to be an odd number to prevent partial pixel problems. Has 1px border added*/
	private rowHeight: number = 23;
	/** Keep track of which indexes are visible to prevent the component tree from being updated unless actually changed */
	private rowsIndexes = { start: 0, end: 0 };
	private columnIndexes = { start: 0, end: 0 };
	/** Hold subs for future unsub */
	private subscriptions: Subscription[] = [];
	/** Default state of datatable, necessary if no state passed from parent */
	private stateDefault: Datagrid.State = {
		groups: [],
		sorts: [],
		filters: [],
	}

	public rowGroups: Datagrid.Group[] = [];
	public groups: any = {};
	public status: any = {};

	constructor(
		private dgSvc: DataGridService,
		private ref: ChangeDetectorRef,
		private zone: NgZone,
		private renderer: Renderer2
	) {
	}

	ngOnInit() {
		// Create a scroll event listener outside the zone

	}

	// Check when change detection is run
	ngDoCheck(): void {
		//console.log('Checking')
	}

	ngAfterContentInit() {
		// After all content has been projected into this component, attach templates to columns
		// Has to be in this lifecycle hook because all input data isn't available at the same time for getter/setters
		if (this.columnTemplates && Object.keys(this.columnTemplates).length && this.columns) {
			this.dgSvc.templatesAddToColumns(this.columns, this.columnTemplates);
		}
	}

	ngOnChanges(model) {
		// console.warn('ngOnChanges', model);

		// Clear all memoized caches anytime new data is loaded into the grid
		this.dgSvc.cache.sortArray.cache.clear();
		this.dgSvc.cache.groupRows.cache.clear();

		if (this.dataGrid && this.dataGrid.nativeElement) {
			this.gridProps.widthBody = Math.floor(this.dataGrid.nativeElement.getBoundingClientRect().width);
		}

		// If columns are passed
		if (model.filterGlobal && this.filterGlobal && this.filterGlobal.term) {
			_.throttle(() => this.viewCreate(), 500, { trailing: true, leading: true });
		}

		// If columns are passed
		if (model.columns && this.columns) {

			// If columnMap object is supplied, remap column props to what the datatable needs
			let columns = this.options.columnMap ? this.dgSvc.mapPropertiesDown(this.columns, this.options.columnMap) : this.columns;

			let columnsPinnedLeft = columns.filter(column => column.pinnedLeft ? true : false);
			this.columnsPinnedLeft = columns.length ? this.dgSvc.columnCalculations(columnsPinnedLeft) : [];

			// Get un-pinned columns
			let columnsInternal = columns.filter(column => !column.pinnedLeft ? true : false);
			this.columnsInternal = columns.length ? this.dgSvc.columnCalculations(columnsInternal) : [];

			// If show info is set, create a column map
			if (this.options.showInfo) {
				this.columnsMapped = this.dgSvc.mapColumns(this.columns);
			}
		}

		if (this.columns && this.rows) {
			//console.warn(this.columns, this.rows)
			if (this.state) {
				this.state.groups = this.state.groups && this.state.groups.length && this.options.controlsMap ? this.dgSvc.mapPropertiesDown(this.state.groups, this.options.controlsMap) : this.state.groups;
				this.state.sorts = this.state.sorts && this.state.sorts.length && this.options.controlsMap ? this.dgSvc.mapPropertiesDown(this.state.sorts, this.options.controlsMap) : this.state.sorts;
				this.state.filters = this.state.filters && this.state.filters.length && this.options.controlsMap ? this.dgSvc.mapPropertiesDown(this.state.filters, this.options.controlsMap) : this.state.filters;

			} else {
				this.state = { ...this.stateDefault }
			}

			this.filterTerms = this.dgSvc.getDefaultTermsList(this.rows, this.columns); // Generate a list of default filter terms
			this.createRowStyles(); // Create row styles
			this.createRowClasses(); // Create row classes

			this.state.info = {
				initial: true
			}

			// Only on initial load, set app ready. This prevents the app from hanging on a route change
			this.appReady = true;

			if (this.appReady && this.domReady) {
				this.viewCreate();
			}

			//Emit the state change to the parent component now that the first initial view has been created
			this.emitState(this.state);
		}

	}

	ngAfterViewInit() {
		// console.warn('ngAfterViewInit', Math.floor(this.dataGrid.nativeElement.getBoundingClientRect().width));
		// Update grid props body width, for some reason it is not available if called in datagrid on initial load OR if within a function call
		this.gridProps.widthBody = Math.floor(this.dataGrid.nativeElement.getBoundingClientRect().width);

		// Wrapped in settimeout to ensure DOM is ready, visible and can draw with gridprops
		setTimeout(() => {
			this.domReady = true;
			// If app and dom is ready, create the view
			if (this.appReady && this.domReady) {
				this.viewCreate();
				this.ref.detectChanges();
			}
		},100);
	}

    /** Throttle the window resize event */
	public onWindowResizeThrottled = _.throttle(event => this.onWindowResize(event), 300, { trailing: true, leading: true });

    /** Throttle keyboard events. Not really necessary since repeated key events are ignored but will allow for more events down the road */
	public onKeyEventThrottled = _.throttle(event => this.handleKeyboardEvents(event), 100, { trailing: true, leading: true });

	/**
	* When the datatable is scrolled
	* @param event
	*/
	private onScroll(scrollPropsNew: Datagrid.ScrollProps) {
		//console.log('onScroll', scrollPropsNew);

		let scrollPropsOld = { ...this.scrollProps };
		//this.ref.detach();
		this.scrollProps = scrollPropsNew;

		// Update rows only if rows have changed
		if (scrollPropsOld.scrollTop != this.scrollProps.scrollTop) {
			let rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, this.gridProps, this.rowHeight);
			if (!this.rowsIndexes || (rowsExternal[0].$$track != this.rowsIndexes.start && rowsExternal[rowsExternal.length - 1].$$track != this.rowsIndexes.end)) {
				this.rowsExternal = rowsExternal;
				this.rowsIndexes.start = rowsExternal[0].$$track;
				this.rowsIndexes.end = rowsExternal[rowsExternal.length - 1].$$track;
			}

		}
		// Update columns only if columns have changed
		if (scrollPropsOld.scrollLeft != this.scrollProps.scrollLeft) {
			let columnsExternal = this.dgSvc.getVisibleColumns(this.columnsInternal, this.scrollProps, this.gridProps);
			if (!this.columnIndexes || (columnsExternal[0].$$track != this.columnIndexes.start && columnsExternal[columnsExternal.length - 1].$$track != this.columnIndexes.end)) {
				this.columnsExternal = columnsExternal;
				this.columnIndexes.start = columnsExternal[0].$$track;
				this.columnIndexes.end = columnsExternal[columnsExternal.length - 1].$$track;
			}
		}
		// Not ideal but row updates aren't as seamless without the zone.run
		this.zone.run(() => {
			this.ref.detectChanges();
		});
	}

    /**   
     * Create the view by assembling everything that modifies the state
     * @param state
     */
	public viewCreate() {
		// TODO Fix issues with memoization with group and sorting
		// console.warn('createView',this.rows, this.columns);
		// console.time('Creating View');
		// Set manual change detection
		this.ref.detach();

		let newRows = this.rows;
		//console.log('Total Rows', newRows.length)
		// If global filter option is set filter 
		if (this.filterGlobal && this.filterGlobal.term) {
			newRows = this.dgSvc.filterGlobal(newRows, this.filterGlobal);
		}

		// If custom filters are specified
		if (this.state.filters.length) {
			newRows = this.dgSvc.filterArray(newRows, this.state.filters);
		}

		// If grouped
		if (this.state && this.state.groups.length) {
			// Create groups
			this.dgSvc.uniqueId = newRows.length + '-' + this.columns.length + '-' + this.state.groups[0].prop + '-' + this.state.groups[0].dir;
			if (this.state.sorts.length) {
				this.dgSvc.uniqueId += '-' + this.state.sorts[0].prop + '-' + this.state.sorts[0].dir;
			}
			// let groupings = this.dgSvc.cache.groupRows(newRows, this.columns, this.state.groups, this.state.sorts);
			// Non memoized
			let groupings = this.dgSvc.groupRows(newRows, this.columns, this.state.groups, this.state.sorts, this.options);
			newRows = groupings.rows;
			this.groups = groupings.groups;
		}
		// If NOT grouped
		else {
			this.groups = null;
			// If sorts
			if (this.state.sorts.length) {
				// Sort rows and use memoize function to cache results
				this.dgSvc.uniqueId = this.state.sorts[0].prop + this.state.sorts[0].dir + newRows.length;
				//newRows = this.dgSvc.cache.sortArray(newRows, this.state.sorts[0].prop, this.state.sorts[0].dir);

				// Non memoized
				newRows = this.dgSvc.sortArray(newRows, this.state.sorts[0].prop, this.state.sorts[0].dir);
			}
		}

		// Generate row vertical positions
		newRows = this.dgSvc.rowPositions(newRows, this.rowHeight);

		// TODO: Grid props needed to build visible rows and columns but visible rows and columns needed to update grid props
		this.updateGridProps();
		// If the total width of the columns is less than the viewport, resize columns to fit
		// TODO: This is very inefficient to call on every view change, memoize?
		if (this.gridProps.widthTotal < this.gridProps.widthBody) {
			this.columnsInternal = this.dgSvc.columnsResize(this.columnsInternal, this.gridProps);
			this.gridProps.widthFixed = true;
		} else {
			this.gridProps.widthFixed = false;
		}

		// Set updated columns
		this.columnsPinnedLeft = this.columnsPinnedLeft.length ? this.dgSvc.columnCalculations(this.columnsPinnedLeft) : [];
		this.columnsInternal = this.columnsInternal.length ? this.dgSvc.columnCalculations(this.columnsInternal) : [];

		// Update internal modified rows
		this.rowsInternal = newRows;
		// Update columns to go to the DOM
		this.columnsExternal = this.dgSvc.getVisibleColumns(this.columnsInternal, this.scrollProps, this.gridProps);
		// Updated rows to go to the DOM
		this.rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, this.gridProps, this.rowHeight);

		// TODO: Grid props needed to build visible rows and columns but visible rows and columns needed to update grid props
		this.updateGridProps();

		// Add stats and info to be emitted
		this.state.info.rowsTotal = this.rows.length;
		this.state.info.rowsVisible = this.rowsInternal.filter(row => !row.type).length; // Filter out any group columns

		this.status = this.dgSvc.createStatuses(this.state, this.columnsInternal);
		this.state = { ...this.state };

		//Emit the state change to the parent component
		this.emitState(this.state);
		// Turn change detection back on
		this.ref.reattach();
		// console.timeEnd('Creating View');
	}

    /**
     * When a group is toggled
     * @param event
     */
	public groupToggled(group: Datagrid.Group) {
		//console.log('groupToggled', group);
		this.viewCreate();
	}

    /**
     * When the datatable state is changed, usually via a control such as group/filter/sort etc
     * @param stateChange
     */
	public onStateUpdated(stateChange: Datagrid.StateChange): void {
		// console.warn('changeState ', this.state, stateChange);
		this.ref.detach();

		let newState: Datagrid.State = { ...this.state };
		//let newRows = this.rows;

		newState.info.initial = false;

		// If the global filter is set
		if (this.filterGlobal && this.filterGlobal.term) {
			//newRows = this.dgSvc.filterGlobal(newRows, this.filterGlobal);
		}

		//### Update Sorting ###
		if (stateChange.action == Actions.sort) {
			newState.sorts = stateChange.data.dir ? [stateChange.data] : [];
		}

		//### Update Grouping ###
		else if (stateChange.action == Actions.group) {
			newState.groups = stateChange.data.dir ? [stateChange.data] : [];
		}

		//### Update Filtering ###
		else if (stateChange.action == Actions.filter) {
			let newFilter: Datagrid.Filter = stateChange.data.filter;
			if (stateChange.data.filterAction == 'change') {
				let index;
				for (let i = 0; i < newState.filters.length; i++) {
					if (newFilter.prop == newState.filters[i].prop && newFilter.operator == newState.filters[i].operator) {
						index = i;
						break;
					}
				}
				newState.filters[index] = newFilter;
			} else if (stateChange.data.filterAction == 'add') {
				newState.filters.push(newFilter);
			} else if (stateChange.data.filterAction == 'remove') {
				let index;
				for (let i = 0; i < newState.filters.length; i++) {
					// If this is a contains filter, only match against field and operator
					if (newFilter.operator == 'contains' && newFilter.prop == newState.filters[i].prop && newFilter.operator == newState.filters[i].operator) {
						index = i;
						break;
					}
					// If not a contains filter, match against all 3 fields
					else if (newFilter.prop == newState.filters[i].prop && newFilter.operator == newState.filters[i].operator && newFilter.value == newState.filters[i].value) {
						index = i;
						break;
					}
				}
				newState.filters.splice(index, 1);
			} else if (stateChange.data.filterAction == 'clear') {
				newState.filters = newState.filters.filter(item => item.prop != stateChange.data.filter.prop);
				//console.warn('Clearing filters', newState.filters);
			}

		}

		//### Reset everything ###
		else if (stateChange.action == Actions.reset) {
			//newRows = [...this.rows];
		}

		//### Column Changes ###
		else if (stateChange.action == Actions.column) {
			//console.warn('Column Changes ', stateChange);
			// Deletion
			if (stateChange.data.action == 'delete') {
				//stateChange.data.columnIndex
				let goodbye = this.columnsInternal.splice(stateChange.data.columnIndex, 1);
				this.columnsInternal = [...this.columnsInternal];

				goodbye = this.columns.splice(stateChange.data.columnIndex, 1);
				this.columns = [...this.columns];
				this.emitColumns(this.columnsInternal);
			}
		}

		//### Pinning ###
		else if (stateChange.action == Actions.pinLeft) {
			//console.warn('Pinning');
			if (stateChange.data.isPinned) {
				// Get column being unpinned
				let colNew = this.columnsPinnedLeft[stateChange.data.index];
				delete colNew.pinnedLeft; // Delete pinned prop
				// Remove from pinned array
				this.columnsPinnedLeft = this.columnsPinnedLeft.filter((col, index) => stateChange.data.index != index);
				// Add to main array
				this.columnsInternal = [colNew, ...this.columnsInternal];
			} else {
				//console.warn('Pinning to left', stateChange.data);
				// Get pinned column
				let newCol = this.columnsInternal.filter(col => col.prop == stateChange.data.prop)[0];
				newCol.pinnedLeft = true;
				this.columnsPinnedLeft = [...this.columnsPinnedLeft, newCol];
				//Update non pinned columns
				this.columnsInternal = this.columnsInternal.filter(col => col.prop != stateChange.data.prop);
			}

			this.emitColumns(this.columnsInternal);
		}

		this.state = newState;
		// Now create the view and update the DOM
		this.viewCreate();
	}

    /**
     * When columns are modified from a lower component
     * @param columns
     */
	public columnsUpdated(columnData: { action: 'resize' | 'reorder', columnIndex?: number, columnIndex2?: number, type?: 'pinnedLeft' | 'main', width?: number, columns?: Datagrid.Column[] }) {
		console.log('columnsUpdated', columnData);
		// If this is a resize column event
		if (columnData.action == 'resize') {
			// Determine if updating pinned or regular columns
			if (columnData.type == 'pinnedLeft') {
				this.columnsPinnedLeft[columnData.columnIndex].width = columnData.width;
				this.columnsPinnedLeft[columnData.columnIndex] = { ...this.columnsPinnedLeft[columnData.columnIndex] };
				//this.columnsPinnedLeft = [...this.columnsPinnedLeft];
			} else {
				this.columnsInternal[columnData.columnIndex].width = columnData.width;
				this.columnsInternal[columnData.columnIndex] = { ...this.columnsInternal[columnData.columnIndex] };
				//this.columnsInternal = [...this.columnsInternal];
			}
		}
		// If this is a reorder columns event
		else if (columnData.action == 'reorder') {
			if (columnData.type == 'pinnedLeft') {
				// Swap the columns based on the new indexes
				let colOld = { ...this.columnsPinnedLeft[columnData.columnIndex] };
				let colNew = { ...this.columnsPinnedLeft[columnData.columnIndex2] };
				this.columnsPinnedLeft[columnData.columnIndex2] = colOld;
				this.columnsPinnedLeft[columnData.columnIndex] = colNew;
			} else {
				// Swap the columns based on the new indexes
				let colOld = { ...this.columnsInternal[columnData.columnIndex] };
				let colNew = { ...this.columnsInternal[columnData.columnIndex2] };
				this.columnsInternal[columnData.columnIndex2] = colOld;
				this.columnsInternal[columnData.columnIndex] = colNew;
			}
		}
		this.emitColumns(this.columnsInternal);
		this.viewCreate();
	}

    /**
     * Global properties needed by grid to draw itself
     */
	public updateGridProps() {

		let gridProps: Datagrid.Props = {};
		// Get total grid width
		gridProps.widthTotal = this.columns
			.map(b => b.width)
			.reduce((p, c) => p + c);

		// Get width of pinned columns
		gridProps.widthPinned = this.columnsPinnedLeft.length ? this.columnsPinnedLeft
			.map(b => b.width)
			.reduce((p, c) => p + c) : 0;

		// Get width of internal columns
		gridProps.widthMain = this.columnsInternal.length ? this.columnsInternal
			.map(b => b.width)
			.reduce((p, c) => p + c) : 0;

		// Get height of grid
		if (this.options.heightMax) {
			gridProps.heightTotal = <number>this.options.heightMax;
		} else if (this.options.fullScreen) {
			let height = this.dataGrid.nativeElement.getBoundingClientRect().height;
			let newHeight = height - 2 - this.rowHeight;// Add offsets for table header and bottom scrollbar
			// Check if the info bar is showing, deduct from total height
			if (this.options.showInfo && (this.state.sorts.length || this.state.groups.length || this.state.filters.length)) {
				newHeight -= this.rowHeight;
			}

			gridProps.heightTotal = newHeight;
		}
		// Set default height if non specified
		else {
			gridProps.heightTotal = 300;
		}

		gridProps.rowsVisible = Math.ceil(gridProps.heightTotal / this.rowHeight); // Get max visible rows
		if (this.rowsInternal && this.rowsInternal.length) {
			gridProps.heightBody = this.rowsInternal.length * this.rowHeight;
		} else if (this.rows && this.rows.length) {
			gridProps.heightBody = this.rows.length * this.rowHeight;
		} else {
			gridProps.heightBody = 300;
		}

		if (this.dataGrid && this.dataGrid.nativeElement.getBoundingClientRect().width) {
			gridProps.widthBody = Math.floor(this.dataGrid.nativeElement.getBoundingClientRect().width);
		} else {
			gridProps.widthBody = this.gridProps.widthBody;
		}

		this.gridProps = { ...this.gridProps, ...gridProps };
	}

    /**
     * On a global mouse down event
     * @param event
     */
	private handleMouseDown(event: MouseEvent) {
		// console.warn('handleMouseDown 1', event, this.dataGridBody)
		// Set the default starting position of the initial click and also get the bounding box of the datatable
		let draggingPos: Datagrid.DragSelect = {
			startX: event.pageX,
			startY: event.pageY,
			bounding: this.dataGridBody.body.getBoundingClientRect()
		}
		// Only drag on left mouse click
		// Make sure the drag starts within the datatable bounding box
		if (event.which == 1 &&
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
	private handleMouseUp(event: MouseEvent) {
		//console.warn('handleMouseUp', event.pageY, this.dataGridBody.nativeElement.getBoundingClientRect().top);
		// Sometimes the mouse scrolls too fast to register the last hovered row. If the mouseup position is higher than the datatable top, set lasthovered to 0
		if (this.dragging && this.draggingPos && this.draggingPos.bounding && event.pageY < this.draggingPos.bounding.top) {
			this.rowHoveredLast = 0;
		}
		// If a drag event ended NOT on a row, fire the onrowmouseup event with the last hovered row
		if (this.dragging) {
			this.onRowMouseEvent({ type: 'mouseup', rowIndex: this.rowHoveredLast, event: event });
			//this.onRowMouseUp(this.rowHoveredLast, event);
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
	private handleMouseMove(event: MouseEvent) {
		if (this.dragging) {

			let draggingPos: Datagrid.DragSelect = {
				hasMinSize: false,
				...this.draggingPos
			};
			// Set to local reference so they can be changed
			let pageY = event.pageY;
			let pageX = event.pageX;

			// Set top boundary
			if (pageY < this.draggingPos.bounding.top) {
				pageY = this.draggingPos.bounding.top;
			}

			// Set bottom boundary
			if (pageY > this.draggingPos.bounding.bottom) {
				pageY = this.draggingPos.bounding.bottom;
			}

			// Set left boundary
			if (pageX < this.draggingPos.bounding.left) {
				pageX = this.draggingPos.bounding.left;
			}

			// Set right boundary
			if (pageX > this.draggingPos.bounding.right) {
				pageX = this.draggingPos.bounding.right;
			}

			// Determine if this is a right to left drag or a left to right
			if (pageX >= this.draggingPos.startX) {
				draggingPos.width = pageX - this.draggingPos.startX - 2;
				draggingPos.left = this.draggingPos.startX
			} else {
				draggingPos.width = this.draggingPos.startX - pageX;
				draggingPos.left = pageX + 2;
			}

			// Only allow height and top changes if the drag is within the horizontal bounding box
			// This prevents the drag selection continuing to draw vertically even though the mouse is off the datagrid which would give the user the impression 
			// they are selecting rows even though their mouse is not on the grid and won't record the row mouse up event
			if (pageX < this.draggingPos.bounding.right && pageX > this.draggingPos.bounding.left) {
				// Determine if this is a top down or bottom up drag
				if (pageY >= this.draggingPos.startY) {
					draggingPos.height = pageY - this.draggingPos.startY - 2;
					draggingPos.top = this.draggingPos.startY
				} else {
					draggingPos.height = this.draggingPos.startY - pageY;
					draggingPos.top = pageY + 2;
				}
			}

			// Make sure there's a minimum size so there isn't a FOUC
			if (draggingPos.width > 10 && draggingPos.height > 10) {
				draggingPos.hasMinSize = true;
			}

			//Make sure the top is lower than the bounding box, don't allow it to be dragged outside the box
			if (draggingPos.top < draggingPos.bounding.top) {
				draggingPos.top = draggingPos.bounding.top;
			}

			//Make sure the top is lower than the bounding box, don't allow it to be dragged outside the box
			if (draggingPos.height > draggingPos.bounding.top) {
				//draggingPos.top = draggingPos.bounding.top;
			}

			// Update DOM
			this.draggingPos = draggingPos;
		}
	}

	/**
	 * Handle keyboard events
	 * @param event
	 */
	private handleKeyboardEvents(event: KeyboardEvent): void {
		// Ignore keyboard repeat events
		if (event.repeat == false) {
			this.keyPressed = event.type == 'keydown' ? event.key : null;

			// If this is a keydown event, add it to the dictionary
			if (event.type == 'keydown') {
				this.keysPressed[event.key] = true;
			}
			// If this is a key up event, remove from dictionary
			else if (event.type == 'keyup') {
				delete this.keysPressed[event.key];
			}

			// If control + a is pressed, select all
			if (this.keysPressed['a'] && this.keysPressed['Control']) {
				this.selectRowsAll();
				event.preventDefault();
				event.stopPropagation();
			}
			//console.log('handleKeyboardEvents', this.keysPressed, event.repeat);
		}
	}

    /**
     * Select all rows
     */
	private selectRowsAll() {
		if (this.rows.length) {
			this.rowsInternal.forEach(row => row.$$selected = true);
			this.emitSelectedRows(this.rowsInternal);
		}
	}

    /**
     * When a mouse event has happend on a body row
     * @param event
     */
	public onRowMouseEvent(action: { type: 'click' | 'contextmenu' | 'mousedown' | 'mouseup' | 'mouseenter', rowIndex: number, event: MouseEvent }) {

		let row = this.rowsInternal[action.rowIndex];

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
				if (action.event.which == 1) {// Only function when the left mouse button is clicked
					this.rowClickDrag.rowIndex = action.rowIndex;
				}
				break;
			case 'mouseup':
				// Only function when the left mouse button is clicked
				if (action.event.which == 1 && action.rowIndex != this.rowClickDrag.rowIndex) {

					// Check if the drag was top to bottom or bottom to top for ROWS. Always start at the lowest index
					let rowStart = this.rowClickDrag.rowIndex <= action.rowIndex ? this.rowClickDrag.rowIndex : action.rowIndex;
					let rowEnd = this.rowClickDrag.rowIndex >= action.rowIndex ? this.rowClickDrag.rowIndex : action.rowIndex;
					//console.warn('rowStart', rowStart, rowEnd);
					this.rowsInternal.forEach(rowNew => rowNew.$$selected = false);
					for (let j = rowStart; j <= rowEnd; j++) {
						this.rowsInternal[j].$$selected = true;
					}

					let selectedRows = this.rowsInternal.filter(rowNew => rowNew.$$selected);
					this.rowsSelectedCount = selectedRows.length;
					this.emitSelectedRows(selectedRows);
				}
				break;
			case 'mouseenter':
				this.rowHoveredLast = action.rowIndex;
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
	public selectRow(row, rowIndex: number, isRightClick?: boolean, elementRef?) {
		// console.warn('selectRow', this.keysPressed);
		// console.warn('selectRow', groupIndex);

		// Only allow row selection if set
		if (this.options.selectionType) {
			let newRows = [...this.rowsInternal];
			// If control is pressed while clicking
			if (this.keysPressed['Control'] && this.options.selectionType == 'multi') {
				row.$$selected = row.$$selected ? false : true;
			}
			// If shift is pressed while clicking
			else if (this.keysPressed['Shift'] && this.options.selectionType == 'multi') {
				// Unset all selected flags
				newRows.forEach(rowNew => rowNew.$$selected = false);
				// Figure out if the selection goes top to bottom or bottom to top
				let startIndex = rowIndex > this.rowSelectedLast ? this.rowSelectedLast : rowIndex;
				let endIndex = rowIndex < this.rowSelectedLast ? this.rowSelectedLast : rowIndex;
				// Loop through the lowest index and set all selected flags
				for (let i = startIndex; i < endIndex + 1; i++) {
					if (newRows[i]) {
						newRows[i].$$selected = true;
					}
				}
			}
			// If just regular click
			else if (!row.$$selected && !isRightClick) {
				// Disable all other selected flags
				newRows.forEach(rowNew => rowNew.$$selected = false);
				row.$$selected = true;
				//this.rowsSelected = row;
			} else {
				// If this is a right click row, don't do anything special
				if (isRightClick) {
					if (!row.$$selected) {
						newRows.forEach(rowNew => rowNew.$$selected = false);
						row.$$selected = true;
					}
				}
				// If multiple rows are already selected
				else if (this.rowsSelectedCount > 1) {
					// Reset all and set current row to selected
					newRows.forEach(rowNew => rowNew.$$selected = false);
					row.$$selected = true;
				}
				else {
					// Just untoggle this row
					row.$$selected = false;
				}
			}
			let selectedRows = newRows.filter(rowNew => rowNew.$$selected);
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
	public getRowClasses(row): string {
		if (!this.options.rowClass) {
			return null;
		}

		let classes = '';
		let results = this.options.rowClass(row);
		for (let key in results) {
			if (results.hasOwnProperty(key)) {
				if (results[key]) {
					classes += key + ' ';
				}
			}
		}
		if (classes != '') {
			return classes;
		}
	}


	/**
     * Create a dictionary of row css classes based on inputs from options.rowClass
     */
	public createRowClasses(): void {
		let rowClasses = {};
		if (this.options.rowClass) {
			this.rows.forEach(row => {
				if (this.options.primaryKey && row[this.options.primaryKey]) {
					let results = this.options.rowClass(row);
					let classes = '';
					for (let key in results) {
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
		let rowStyles = {};
		// Only create row styles if supplied by options
		if (!this.options.rowStyle) {
			this.rowStyles = rowStyles;
			return false;
		}

        /*
        // If row height is set in options, set it in row styles
        if (this.options.rowHeight) {
			this.rows.forEach((row, index) => {
				rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]] || {},{'line-height': this.options.rowHeight + 'px'});
			});
		}
        */
		let stylesWithModels = [];
		let stylesNoModels = [];

		// Sort styles that have observable models and those that don't
		this.options.rowStyle.forEach(style => style.model ? stylesWithModels.push(style.model) : stylesNoModels.push(style.rules));

		// If no models
		if (stylesNoModels.length) {
			// Loop through all rows
			this.rows.forEach(row => {
				// Loop through all styles without rules
				stylesNoModels.forEach(rule => {
					// Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
					rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]], rule(row));
				});
			});
		}

		// If models/observables were supplied
		// This class method is NOT fired everytime observables update so it needs to be self contained within the subscribe in order to update everything at once
		// Includes styles with no models in order to accomodate styles with mixed observables and non observables
		if (stylesWithModels.length) {
			// Create a single combine latest observable that will update when any of the inputs are updated
			let subscription = Observable.combineLatest(stylesWithModels).subscribe((models: any[]) => {
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
				if (stylesNoModels.length) {
					// Loop through all rows
					this.rows.forEach(row => {
						// Loop through all styles without rules
						stylesNoModels.forEach(rule => {
							// Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
							rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]] || {}, rule(row));
						});
					});
				}

				// Loop through all rays
				this.rows.forEach(row => {
					// Now loop through each result of data returned from the observable
					models.forEach((model, index) => {
						// Merge the newly created styles with what is already existing. This allows for multiple rulesets to assign styles without wiping out preexisting
						rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]] || {}, this.options.rowStyle[index].rules(row, model));

					});
				});
				// Update row styles
				this.rowStyles = rowStyles;
				// Tell DOM to updated after observable is done udpated
				this.ref.detectChanges();
			});
			this.subscriptions.push(subscription);
		}

		this.rowStyles = rowStyles;
	}


    /**
     * Emit changed columns up to the parent component
     */
	public emitColumns(columns: Datagrid.Column[]) {
		// TODO: Mapping properties back up isn't seamless and needs work, commenting out for now
		// let remapColumns = this.dgSvc.mapPropertiesUp([...columns], this.options.columnMap);
		// Remove templates and emit new column references up. Templates have a circulate reference which blows up json usage
		let columnsEmitted = columns.map((column) => {
			let columnNew = { ... column };
			delete columnNew.templateCell;
			delete columnNew.templateHeader;
			return columnNew;
		});
		// Remap data back up
		this.onColumnsUpdated.emit(columnsEmitted);
	}

    /**
     * Emit state changes up to the parent component
     * @param state
     */
	public emitState(state: Datagrid.State) {
		// User columns has a circular reference somewhere so create new instance and remove that property before emitting up
		let stateNew = { ...state };
		delete (<any>stateNew).usersColumns;

		// Create a new memory reference for the state and then remap all properties up into the layout
		let remapProps = JSON.parse(JSON.stringify(stateNew));
		remapProps.groups = remapProps.groups && remapProps.groups.length ? this.dgSvc.mapPropertiesUp(remapProps.groups, this.options.controlsMap) : [];
		remapProps.sorts = remapProps.sorts && remapProps.sorts.length ? this.dgSvc.mapPropertiesUp(remapProps.sorts, this.options.controlsMap) : [];
		remapProps.filters = remapProps.filters && remapProps.filters.length ? this.dgSvc.mapPropertiesUp(remapProps.filters, this.options.controlsMap) : [];
		this.onStateChange.emit(remapProps);
	}

    /**
     * When a row was edited
     * @param $event
     */
	public rowUpdated(event) {
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
		if (action == 'update') {
			this.viewCreate();
		}
		// Reset datatable
		else if (action == 'reset') {
			this.reset();
		}
	}

    /**
     * Emit a custom link event response up to the parent component
     * @param data
     */
	public customLinkEvent(data: { link: Datagrid.ControlsCustomLinksGroup, column: Datagrid.Column }) {
		this.onCustomLinkEvent.emit(data);
	}

	/**
	 * Reset all datatable controls, filters sorts groups etc
	 */
	public reset(resetType?: 'groups' | 'sorts' | 'filters') {
		this.ref.detach();
		
		//Reset State
		if (resetType && resetType == 'groups') {
			this.state.groups = [];
		} else if (resetType && resetType == 'sorts') {
			this.state.sorts = [];
		} else if (resetType && resetType == 'filters') {
			this.state.filters = [];
		} else {
			this.state.groups = [];
			this.state.filters = [];
			this.state.sorts = [];
		}

		this.state.info = {};
		//Reset Columns
		this.columnsInternal = this.columns.map(column => {
			column.pinnedLeft = false;
			column.locked = false;
			return { ...column };
		});

		if (this.filterGlobal){
			this.filterGlobal.term = null;
		}
		
		this.emitColumns(this.columnsInternal);
		this.onStateUpdated({ action: Actions.reset, data: null });
		this.ref.reattach();
	}

	/**
	* On window resize
	* @param event
	 */
	private onWindowResize(event) {
		if (this.columnsInternal && this.columnsInternal.length && this.rowsInternal && this.rowsInternal.length) {
			this.viewCreate();
		}
	}

	ngOnDestroy() {
		// Unsub from all subscriptions
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}


