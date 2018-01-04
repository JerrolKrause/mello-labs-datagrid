import {Component, OnInit, OnDestroy, OnChanges, Input, Output, ViewChild, ChangeDetectionStrategy, EventEmitter, ChangeDetectorRef, ViewEncapsulation,
	AfterViewInit, AfterViewChecked, ElementRef, ContentChildren
} from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';

import { ColumnDirective } from '../directives/column.directive';
import { DataGridService } from '../datagrid.service';
import { Actions } from '../datagrid.props';
import { Datagrid } from '../typings';

import * as _ from 'lodash';


/**
TODOS:
- Only generate filter terms on demand
- Refactor DT to support 2 types of grids only: Single line grids with H scroll and full screen grids with word wrap
- Better handling/performance of initial load. Should also have null value for rows to avoid FOUC of 'no rows found'
- Ability to transclude templates from parent which would allow the DT to be fully componentized. Need to get rid of the templates subdirectory
- Only refresh datatable when changing tags or row colors if grouped/sorted/filtered by tags or row colors
- Implement virtual scroll. This will require moving away from a table structure which makes column width calculation on load required
- Related to virtual scroll, need to perform width calculations for tables
- Add observable throttling for mouse move events
- Getter/setters for input props that return immutable references
- Datatable is not properly cleaning up after itself when emitting data up to parent. Need to remove props added by DT, either directly or by mapping. Look in dgSvc map props up
- Update scaffolding
- Add css classes where appropriate for more control over styling
- Some calculations are being done with assumptions on css styling (IE Padding)
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
		'(window:resize)': 'onResizeEvent($event)'
	}
})
export class DataGridComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked, OnDestroy  {
    /** Self reference */
	@ViewChild('dataGrid') datagrid: ElementRef;
	@ViewChild('dataGridBody') datagridBody: ElementRef;

    /** Inputs */
	@Input() columns: Datagrid.Column[];
	@Input() options: Datagrid.Options;
	@Input() rows: any[];
	@Input() state: Datagrid.State;

    /** Outputs */
	@Output() onRowsUpdated: EventEmitter<any[]> = new EventEmitter();
	@Output() onColumnsUpdated: EventEmitter<any[]> = new EventEmitter();
	@Output() onRowsSelected: EventEmitter<any[]> = new EventEmitter();
	@Output() onStateChange: EventEmitter<any> = new EventEmitter();
	@Output() onRightClickMenu: EventEmitter<any> = new EventEmitter();
	@Output() action: EventEmitter<any> = new EventEmitter();
	@Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();
	@Output() onElementRef: EventEmitter<any> = new EventEmitter();

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
    public filterTerms:any;
    /** A dictionary that holds css CLASSES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowClass */
	public rowClasses = {};
    /** A dictionary that holds css STYLES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowStyle */
	public rowStyles = {};
    /** Holds the left offsets used for column pinning */
	//public leftOffsets: number[] = [];
    /** Does the datatable have the data it needs to draw the dom? */
	public appReady: boolean = false;
    /** Height of the containing div that has the overflow scroll */
	public tableContainerHeight: number = 300;
    /** Height of the actual table, used for vScroll */
	public tableHeight: string;
    /** Is the user dragging with the mouse */
	public dragging: boolean = false;
	public draggingPos: Datagrid.DragSelect = {};
    
	/** Currently pressed key */
	private keyPressed: string;
    /** A dictionary of currently pressed keys */
	private keysPressed: {} = {};
    /** Hold the rowindex and group index when a row is clicked and dragged */
	private rowClickDrag:any = {
		rowIndex: 0,
        groupIndex: 0
	}
    /** The height of the row and cell. Necessary for virtual scroll calculation */
	private rowHeight: number = 24;
    
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
		private ref: ChangeDetectorRef
	) {
		this.rowClasses = {};
		this.columnsMapped = {};
		this.rowStyles = {};
		// Default props get stripped out by the compiler for some reason
		this.gridProps = {};
		this.tableContainerHeight = 300;
		this.scrollProps = { scrollTop: 0, scrollLeft: 0 };
		this.appReady = false;
		this.dragging = false;
		this.draggingPos = {};
		this.keysPressed = {};
		this.subscriptions = [];
		this.rowHeight = 24;
		this.stateDefault = {
			groups: [],
			sorts: [],
			filters: [],
		}

		this.onRowsUpdated = new EventEmitter();
		this.onColumnsUpdated = new EventEmitter();
		this.onRowsSelected = new EventEmitter();
		this.onStateChange = new EventEmitter();
		this.onRightClickMenu = new EventEmitter();
		this.action = new EventEmitter();
		this.onCustomLinkEvent = new EventEmitter();
        this.onElementRef = new EventEmitter();
        
	}

    /**
   * Column templates gathered from `ContentChildren`
   * if described in your markup.
   */
    @ContentChildren('[datagrid-column]')
    set columnTemplates(val: any) {
        console.log('Templates', val);
        if (val) {
            const arr = val.toArray();
            if (arr.length) {
                //this._internalColumns = translateTemplates(arr);
            }
        }
    }

   
	ngOnInit() {}

	ngOnChanges(model) {
		//console.warn('ngOnChanges', model);

        // Clear all memoized caches anytime new data is loaded into the grid
		this.dgSvc.cache.sortArray.cache.clear();
		this.dgSvc.cache.groupRows.cache.clear();

        // If columns or rows are not available, set app ready to false to show loading screen
		if (!this.columns || !this.rows) {
			this.appReady = false;
		}

		// If state is passed
		if (model.state && this.state) {
            //console.log(this.state)
			if (!this.state.filters) {
				this.state.filters = [];
			}
			if (!this.state.sorts) {
				this.state.sorts = [];
			}
			if (!this.state.groups) {
				this.state.groups = [];
			}
		}

        // If rows are passed, store rows
		if (model.rows && this.rows) {
            //console.warn('Updating Rows', this.rows);

		}

		if (model.columns && this.columns) {
            
            // If columnMap object is supplied, remap column props to what the datatable needs
			let columns = this.options.columnMap ? this.dgSvc.mapPropertiesDown([...this.columns], this.options.columnMap) : [...this.columns];

			// Get pinned columns
			let columnsPinnedLeft = columns.filter(column => column.pinnedLeft ? true : false);
            this.columnsPinnedLeft = this.dgSvc.columnCalculations(columnsPinnedLeft);

            // Get un-pinned columns
			let columnsInternal = columns.filter(column => !column.pinnedLeft ? true : false);
            this.columnsInternal = this.dgSvc.columnCalculations(columnsInternal);

            // If show info is set, create a column map
            if (this.options.showInfo) {
                this.columnsMapped = this.dgSvc.mapColumns(this.columns);
			}
		}
		
		if (this.columns && this.rows) {
        
			//console.warn(this.columns, this.rows)
			if (this.state) {
				this.state.groups = this.state.groups && this.state.groups.length && this.options.controlsMap ? this.dgSvc.mapPropertiesDown(this.state.groups, this.options.controlsMap) : [];
				this.state.sorts = this.state.sorts && this.state.sorts.length && this.options.controlsMap ? this.dgSvc.mapPropertiesDown(this.state.sorts, this.options.controlsMap) : [];
				this.state.filters = this.state.filters && this.state.filters.length && this.options.controlsMap ? this.dgSvc.mapPropertiesDown(this.state.filters, this.options.controlsMap) : [];

			} else {
				this.state = { ...this.stateDefault }
            }

            // Generate a list of default filter terms
		    this.filterTerms = this.dgSvc.getDefaultTermsList(this.rows, this.columns);
		   
			this.state.info = {
                initial : true
			}
			
            // Create the view
			this.viewCreate();

            // Only on initial load, set app ready on with a settimeout. This prevents the app from hanging on a route change
		    this.appReady = true;
			
			//Emit the state change to the parent component now that the first initial view has been created
			this.emitState(this.state);
		}

	}
    
	ngAfterViewInit() {
        // Update grid props body width, for some reason it is not available if called in datagrid on initial load OR if within a function call
		this.gridProps.widthBody = Math.floor(this.datagrid.nativeElement.getBoundingClientRect().width);
	}

	ngAfterViewChecked() {}

    /**
    * Throttle the scroll event
    */
    public onScrollThrottled = _.throttle(event => this.onScroll(event), 10, { trailing: true, leading: true });

    /*
     * Throttle keyboard events. Not really necessary since repeated key events are ignored but will allow for more events down the road
     */
    public onKeyEventThrottled = _.throttle(event => this.handleKeyboardEvents(event), 100, { trailing: true, leading: true });

	/**
	* When the datatable is scrolled
	* @param event
	*/
	private onScroll(event) {
		//console.log('onScroll')
        // Manual change detection
		this.ref.detach();
		let scrollProps = {
			scrollTop: event.target.scrollTop,
			scrollLeft: event.target.scrollLeft
		}
        
		this.scrollProps = { ...scrollProps };
		this.rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, this.gridProps, this.rowHeight);
		this.columnsExternal = this.dgSvc.getVisibleColumns(this.columnsInternal, this.scrollProps, this.gridProps);
		this.ref.reattach();
	}
    

    /**   
     * Create the view by assembling everything that modifies the state
     * @param state
     */
    public viewCreate(state: Datagrid.State = this.state) {
        // TODO Memoization causing problems with group and sorting
		// console.warn('createView');
		 console.time('Creating View');
        // Set manual change detection
		this.ref.detach();
		
		let newRows = [...this.rows]; 
		//console.log('Total Rows', newRows.length)
        // If global filter option is set filter 
		if (this.options.filterGlobal && this.options.filterGlobal.term) {
			newRows = this.dgSvc.filterGlobal(newRows, this.options);
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
			let groupings = this.dgSvc.groupRows(newRows, this.columns, this.state.groups, this.state.sorts);
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
        
		//this.createRowClasses();
		this.createRowStyles();
        
		// Add information for row positioning and indexing. Use for virtual scroll and row selection
		let y = 0;
        for (let i = 0; i < newRows.length; i++) {
            newRows[i].$$rowIndex = i;
			newRows[i].$$rowPosition = y;
            newRows[i].$$hidden = false;

            y += this.rowHeight + 1;
            // If this is a group header
			//if (newRows[i].type == 'group') {
			//    y += this.rowHeight + 1; // Can later update to different heights for headers but throws off grid calculations
			//}

		}
        
        // HACK: Grid props needed to build visible rows and columns but visible rows and columns needed to update grid props
		this.updateGridProps();

        // If the total width of the columns is less than the viewport, resize columns to fit
        // TODO: This is very inefficient to call on every view change, memoize?
		if (this.gridProps.widthTotal < this.gridProps.widthBody) {
			this.columnsInternal = this.dgSvc.columnsResize(this.columnsInternal, this.gridProps);
			this.gridProps.widthFixed = true;
        } else {
			this.gridProps.widthFixed = false;
        }

        this.columnsPinnedLeft = this.dgSvc.columnCalculations(this.columnsPinnedLeft);
        this.columnsInternal = this.dgSvc.columnCalculations(this.columnsInternal);
        

        // Update internal modified rows
		this.rowsInternal = newRows;

		this.columnsExternal = this.dgSvc.getVisibleColumns(this.columnsInternal, this.scrollProps, this.gridProps);
        // Updated rows to go to the DOM
		this.rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, this.gridProps, this.rowHeight);

        // HACK: Grid props needed to build visible rows and columns but visible rows and columns needed to update grid props
		this.updateGridProps();

		//console.log('this.columnsExternal', this.columnsInternal, this.columnsExternal);
		//console.log('this.gridProps', this.gridProps);

        // Update DOM
		//this.rowsInternal = newRows;

        // Add stats and info to be emitted
		state.info.rowsTotal = this.rows.length;
		state.info.rowsVisible = this.rowsInternal.length;
		
		this.status = this.dgSvc.createStatuses(this.state, this.columnsInternal);
		this.state = { ...state };
		
        // Turn change detection back on
		this.ref.reattach();
		console.timeEnd('Creating View');
	}

    /**
     * When the datatable state is changed, usually via a control such as group/filter/sort etc
     * @param stateChange
     */
	public onStateUpdated(stateChange:Datagrid.StateChange):void{
		// console.warn('changeState ', this.state, stateChange);
		let newState: Datagrid.State = this.state;
		let newRows = [...this.rows];
		
		newState.info.initial = false;

		// If the global filter is set
		if (this.options.filterGlobal && this.options.filterGlobal.term) {
            newRows = this.dgSvc.filterGlobal(newRows, this.options);
		}

        //### Update Sorting ###
		if (stateChange.action == Actions.sort) {
			newState.sorts = stateChange.data.dir ? [stateChange.data] : [];
		}

        //### Update Grouping ###
		else if (stateChange.action == Actions.group){
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
			newRows = [...this.rows];
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
                //console.warn('Unpinning', stateChange.data);
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

            this.emitColumns(this.columnsExternal);
		}

		// Now create the view and update the DOM
		this.viewCreate(newState);

        //Emit the state change to the parent component
		this.emitState(newState);
	}

    /**
     * When columns are modified from a lower component
     * @param columns
     */
	public columnsUpdated(columData: { columns: Datagrid.Column[], type: 'columnsInternal' | 'columnsPinned' }) {
		// Determine if updating pinned or regular columns
		if (columData.type == 'columnsPinned') {
			this.columnsPinnedLeft = [...columData.columns];
		} else {
			this.columnsInternal = [...columData.columns];
		}
        // Update grid props
		this.updateGridProps();
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
        if (this.columnsPinnedLeft.length){
            gridProps.widthPinned = this.columnsPinnedLeft
				.map(b => b.width)
				.reduce((p, c) => p + c);
		}
        // Get width of internal columns
		if (this.columnsInternal.length) {
			gridProps.widthMain = this.columnsInternal
				.map(b => b.width)
				.reduce((p, c) => p + c);
		}

        // Get height of grid
		if (this.options.heightMax) {
			gridProps.heightTotal = <number>this.options.heightMax
		} else if (this.options.heightFullscreen) {
			let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			let offset = this.datagrid.nativeElement.getBoundingClientRect().top;
			let newHeight = height - offset - 18 - 24;// Add offsets for table header and bottom scrollbar
			gridProps.heightTotal = newHeight;
		}
        
		gridProps.rowsVisible = Math.ceil(gridProps.heightTotal / this.rowHeight); // Get max visible rows
		if (this.rowsInternal && this.rowsInternal.length) {
			gridProps.heightBody = this.rowsInternal.length * this.rowHeight;
		} else if (this.rows && this.rows.length) {
			gridProps.heightBody = this.rows.length * this.rowHeight;
		} else {
			gridProps.heightBody = 300;
		}

		if (this.datagrid && this.datagrid.nativeElement.getBoundingClientRect().width) {
			gridProps.widthBody = Math.floor(this.datagrid.nativeElement.getBoundingClientRect().width);
		} else {
			gridProps.widthBody = this.gridProps.widthBody;
		}
        
		this.gridProps = { ...this.gridProps, ...gridProps };
		// console.log(this.gridProps);
	}

    /**
     * On a global mouse down event
     * @param event
     */
    private handleMouseDown(event: MouseEvent) {
        //console.warn('handleMouseDown', event)
        // Set the default starting position of the initial click and also get the bounding box of the datatable
        let draggingPos:Datagrid.DragSelect = {
            startX: event.pageX,
            startY: event.pageY,
			bounding: this.datagridBody.nativeElement.getBoundingClientRect()
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
         //console.warn('handleMouseUp', event.pageY, this.datagridBody.nativeElement.getBoundingClientRect().top);
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
    private handleMouseMove(event: MouseEvent){
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
			if (pageX >= this.draggingPos.startX){
				draggingPos.width = pageX - this.draggingPos.startX -2;
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
		    else if (event.type == 'keyup'){
			    delete this.keysPressed[event.key];
		    }

            // If control + a is pressed, select all
		    if (this.keysPressed['a'] && this.keysPressed['Control']){
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
		if (this.rows.length){
			this.rowsInternal.forEach(row => row.$$selected = true);
			this.emitSelectedRows(this.rowsInternal);
		}
	}

    /**
     * When a mouse event has happend on a body row
     * @param event
     */
    public onRowMouseEvent(action: { type: 'click' | 'contextmenu' | 'mousedown' | 'mouseup' | 'mouseenter', rowIndex:number, event:MouseEvent}) {
        
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
            if (this.keysPressed['Control'] && this.options.selectionType == 'multi'){
				row.$$selected = row.$$selected ? false : true;
			}
			// If shift is pressed while clicking
            else if (this.keysPressed['Shift'] && this.options.selectionType == 'multi'){
				// Unset all selected flags
                newRows.forEach(rowNew => rowNew.$$selected = false);
				// Figure out if the selection goes top to bottom or bottom to top
				let startIndex = rowIndex > this.rowSelectedLast ? this.rowSelectedLast : rowIndex;
				let endIndex = rowIndex < this.rowSelectedLast ? this.rowSelectedLast : rowIndex;
				// Loop through the lowest index and set all selected flags
				for (let i = startIndex; i < endIndex + 1; i++){
					if (newRows[i]){
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
					if (!row.$$selected){
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
			let offset = this.datagridBody.nativeElement.getBoundingClientRect().top;
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
	public getRowClasses(row): string{
		if (!this.options.rowClass){
			return null;
		}

		let classes = '';
		let results = this.options.rowClass(row);
		for(let key in results) {
	        if (results.hasOwnProperty(key)) {
	            if (results[key]) {
	                classes += key + ' ';
	            }
	        }
	    }
	    if(classes != ''){
			return classes;
		}
	}
    

	/**
     * Create a dictionary of row css classes based on inputs from options.rowClass
     */
	public createRowClasses(): void {
		let rowClasses = {};
		if (this.options.rowClass){
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
		let remapColumns = this.dgSvc.mapPropertiesUp([...columns], this.options.columnMap);
        // Remap data back up
		//console.warn('emitColumns', remapColumns);
		this.onColumnsUpdated.emit(remapColumns);
	}

    /**
     * Emit state changes up to the parent component
     * @param state
     */
	public emitState(state: Datagrid.State) {
		// Create a new memory reference for the state and then remap all properties up into the layout
		let remapProps = JSON.parse(JSON.stringify(state)); // This is cheating
		remapProps.groups = remapProps.groups && remapProps.groups.length ? this.dgSvc.mapPropertiesUp(remapProps.groups, this.options.controlsMap) : [];
		remapProps.sorts = remapProps.sorts && remapProps.sorts.length ? this.dgSvc.mapPropertiesUp(remapProps.sorts, this.options.controlsMap) : [];
		remapProps.filters = remapProps.filters && remapProps.filters.length ? this.dgSvc.mapPropertiesUp(remapProps.filters, this.options.controlsMap) : [];

		this.onStateChange.emit(remapProps);
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
        else if (action == 'reset'){
            this.reset();
        }
    }

    /**
     * 
     * @param data
     */
	public customLinkEvent(data: { link: Datagrid.ControlsCustomLinksGroup, column: Datagrid.Column }) {
		this.onCustomLinkEvent.emit(data);
	}

    
    /**
     * Reset all datatable controls, filters sorts groups etc
     */
	public reset(resetType?: 'groups' | 'sorts' | 'filters') {
		if (resetType){
			this.state[resetType] = [];
		} else {
			//console.warn('Resetting State');
			this.state.groups = [];
			this.state.filters = [];
			this.state.sorts = [];
			this.columns.forEach(column => { column.pinnedLeft = false; column.locked = false; column = Object.assign({}, column) });
			this.columnsInternal.forEach(column => { column.pinnedLeft = false; column.locked = false; column = Object.assign({}, column) });
			this.columnsInternal = [...this.columnsInternal];
			this.options.filterGlobal.term = null;
        }
        this.emitColumns(this.columnsInternal);
		this.onStateUpdated({ action: Actions.reset, data:null});
	}

	/**
	* On window resize
	* @param event
	*/
	private onResizeEvent(event) {
		if (this.columnsInternal && this.columnsInternal.length && this.rowsInternal && this.rowsInternal.length){
            this.ref.detach();
		    if (this.gridProps.widthTotal < this.gridProps.widthBody) {
		        this.columnsInternal = this.dgSvc.columnsResize(this.columnsInternal, this.gridProps);
		    }
			this.columnsInternal = this.dgSvc.columnCalculations(this.columnsInternal);
			// Update columns that go to the DOM
			this.columnsExternal = this.dgSvc.getVisibleColumns(this.columnsInternal, this.scrollProps, this.gridProps);
			// Updated rows to go to the DOM
			this.rowsExternal = this.dgSvc.getVisibleRows(this.rowsInternal, this.scrollProps, this.gridProps, this.rowHeight);
			this.updateGridProps();
			this.ref.reattach();
		}
	}
    
	ngOnDestroy() {
		// Unsub from all subscriptions
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}


