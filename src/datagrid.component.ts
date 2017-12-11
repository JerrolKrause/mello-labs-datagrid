import {Component, OnInit, OnDestroy, OnChanges, Input, Output, ViewChild, ChangeDetectionStrategy, EventEmitter, ChangeDetectorRef, HostListener, ViewEncapsulation,
	AfterViewInit, AfterViewChecked, TemplateRef, ContentChild, ElementRef, Renderer2
} from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import { Observable, BehaviorSubject } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';

import { ResizeEvent } from 'angular-resizable-element';

import { DataGridService } from './datagrid.service';
import { Actions, Operators } from './datagrid.props';
import { Datagrid } from './datagrid';
import { debounce } from 'rxjs/operator/debounce';

/**
TODOS:
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
	styleUrls: ['./datagrid.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'(document:keydown)': 'handleKeyboardEvents($event)',
		'(document:keyup)': 'handleKeyboardEvents($event)',
        //'(document:mousedown )': 'handleMouseDown($event)',
        '(document:mouseup )': 'handleMouseUp($event)',
        '(document:mousemove )': 'handleMouseMove($event)'
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
	/** Columns that are pinned */
	public columnsPinned: Datagrid.Column[];
    /** Rows that are sent to the DOM after any modification is done */
	public rowsInternal: any[];
	/** Rows that are sent to the DOM after any modification is done */
	public rowsExternal: any[];
    /** Properties and info about the grid itself, IE formatting such as width and scroll area */
	public gridProps: Datagrid.Props = {};
	/** Properties related to scrolling of the main grid */
	public scrollProps: Datagrid.ScrollProps = { scrollTop: 0, scrollLeft: 0 };

	private scrollDebounce$: BehaviorSubject<Datagrid.ScrollProps> = new BehaviorSubject(this.scrollProps);
    /** A dictionary of columns based on primary key, used for lookups */
    public columnsMapped: { [key: string]: Datagrid.Column } = {};
    /** Last row that was selected */
    public rowSelectedLast: number;
    /** How many rows are selected */
    public rowsSelectedCount: number;
    /** Keep track of which row was hovered over last during a drag operation. Used to select all rows when a drag operation does not end on a row */
    public rowHoveredLast: number;
    /** A list of default selectable terms to filter each column by */
    public filterTerms
    /** A dictionary that holds css CLASSES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowClass */
	public rowClasses = {};
    /** A dictionary that holds css STYLES for a given row. The lookup is the primary key specified in the options. Gets its data from options.rowStyle */
	public rowStyles = {};
    /** Holds the left offsets used for column pinning */
	public leftOffsets: number[] = [];
    /** Does the datatable have the data it needs to draw the dom? */
	public appReady: boolean = false;
    /** Height of the containing div that has the overflow scroll */
	public tableContainerHeight: number = 300;
    /** Height of the actual table, used for vScroll */
	public tableHeight: string;
    /** Holds the vertical positioning of all elements that use */
	public virtualScrollPositions: any;
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
	}

	ngOnInit() {
        // On window resize, fire change detection
		window.onresize = (event) => {
			this.updateGridProps();
			this.rowsExternal = this.getVisibleRows(this.rowsInternal);
		};
        /*
		this.scrollDebounce$.debounceTime(10).subscribe(scrollProps => {
			this.scrollProps = { ...scrollProps };
			this.rowsExternal = this.getVisibleRows(this.rowsInternal);
		});
        */
	}
    
	ngOnChanges(model) {
		//console.warn('ngOnChanges', model);
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
        
			//console.warn('Updating Rows');
			//this.dgSvc.rows = [...this.rows];
		}

		if (model.columns && this.columns) {
            
            // If columnMap object is supplied, remap column props to what the datatable needs
			let columns = this.options.columnMap ? this.dgSvc.mapPropertiesDown([...this.columns], this.options.columnMap) : [...this.columns];

			// Get pinned columns
			let columnsPinned = this.columns.filter(column => column.pinnedLeft ? true : false);
			this.columnCalculations(columnsPinned);
			this.columnsPinned = columnsPinned;

            // Get un-pinned columns
			let columnsInternal = columns.filter(column => !column.pinnedLeft ? true : false);
			this.columnCalculations(columnsInternal);
			this.columnsInternal = columnsInternal;

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
				this.state = Object.assign({}, this.stateDefault);
			}
            // Create the list of default filterable terms for string columns
			this.filterTerms = this.dgSvc.getDefaultTermsList([...this.rows], this.columns);
			this.state.info = {
                initial : true
			}
			
            // Create the view
			this.viewCreate();

            // Only on initial load, set app ready on with a settimeout. This prevents the app from hanging on a route change
			setTimeout(() => {
				this.appReady = true;
				this.ref.markForCheck();
			}, 0);

			
			//Emit the state change to the parent component now that the first initial view has been created
			this.emitState(this.state);
		}

	}
    
	ngAfterViewInit() {}
    
	ngAfterViewChecked() {}


	/**
	* When the datatable is scrolled
	* @param event
	*/
	public onScroll(event) {
		let scrollProps = {
			scrollTop: event.target.scrollTop,
			scrollLeft: event.target.scrollLeft
		}
		//this.scrollDebounce$.next(scrollProps);
		this.scrollProps = { ...scrollProps };
		this.rowsExternal = this.getVisibleRows(this.rowsInternal);
	}

    /**
     * 
     * @param rows
     */
	public getVisibleRows(rows: any[]): any[] {
		let buffer = 10;
		let offSetRowsFromTop = Math.floor(this.scrollProps.scrollTop / this.rowHeight);
		if (offSetRowsFromTop - buffer > 0){
			offSetRowsFromTop -= buffer;
		}
		if (offSetRowsFromTop < buffer){
			offSetRowsFromTop = 0;
		}

		let rowsEnd = offSetRowsFromTop + this.gridProps.rowsVisible + (buffer * 2);
		if (rowsEnd > rows.length) {
			rowsEnd = rows.length;
		}

		//console.log(offSetRowsFromTop, rowsEnd)
		return [...rows].slice(offSetRowsFromTop, rowsEnd);
	}

    /**
     * Create the view by assembling everything that modifies the state
     * @param state
     */
    public viewCreate(state: Datagrid.State = this.state) {
		//console.warn('createView');
		//console.time('Creating View');

		let newRows = [...this.rows];
		console.log('Total Rows', newRows.length)
        // If global filter option is set filter 
		if (this.options.filterGlobal && this.options.filterGlobal.term) {
			newRows = this.dgSvc.filterGlobal(newRows, this.options);
		}

		// If custom filters are specified
		if (this.state.filters.length) {
			newRows = this.dgSvc.filterArray(newRows, this.state.filters);
		}

        // Add a row index for all rows, this determines the vertical positioning for virtual scroll
		for (let i = 0; i < newRows.length; i++) {
			newRows[i].$$rowIndex = i;
			newRows[i].$$hidden = false
		}
        
		// If grouped
		if (this.state && this.state.groups.length) {
			// Create groups
			let groupings = this.dgSvc.groupRows(newRows, this.columns, this.state.groups, this.state.sorts);
			newRows = groupings.rows;
			this.groups = groupings.groups;
		}
        // If NOT grouped
		else {
			this.groups = null;
            // If sorts
			if (this.state.sorts.length) {
				newRows = this.dgSvc.sortArray(newRows, this.state.sorts[0].prop, this.state.sorts[0].dir);
			}
		}
        
		this.updateGridProps();
		this.createRowClasses();
		this.createRowStyles();
		//this.columnCalculations();
        //this.calculateHeight();

        // Update internal modified rows
		this.rowsInternal = newRows;
        // Updated rows to go to the DOM
		this.rowsExternal = this.getVisibleRows(this.rowsInternal);
		console.log(newRows.length, this.rowsExternal.length)
        // Update DOM
		//this.rowsInternal = newRows;

        // Add stats and info to be emitted
		state.info.rowsTotal = this.rows.length;
		state.info.rowsVisible = this.rowsInternal.length;
		
		this.status = this.dgSvc.createStatuses(this.state, this.columnsInternal);
		this.state = { ...state };
		//console.timeEnd('Creating View');
	}

    /**
     * When the datatable state is changed, usually via a control such as group/filter/sort etc
     * @param stateChange
     */
	public onStateUpdated(stateChange:Datagrid.StateChange):void{
		//console.warn('changeState ', this.state, stateChange);
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
				//console.warn('Unpinning', stateChange.data)
				this.columnsInternal[stateChange.data.index].pinnedLeft = false;
				// Get all pinned columns only
				let pinnedCols = this.columnsInternal.filter(column => column.pinnedLeft);
				// Get all unpinned colunms only
				let nonPinnedCols = this.columnsInternal.filter(column => !column.pinnedLeft);
				// Put pinned columns up front
                this.columnsInternal = [...pinnedCols, ...nonPinnedCols];
			} else {
				//console.warn('Pinning to left', stateChange.data)
                let newCol;
                let newColumns = [...this.columnsInternal];
				// Get the column being pinned
                newCol = newColumns[stateChange.data.index];
				newCol.pinnedLeft = true;
                newCol.pinnedIndex = stateChange.data.index;
                // Now delete from columns without mutating
                newColumns = newColumns.slice(0, stateChange.data.index).concat(newColumns.slice(stateChange.data.index + 1));

				// Get all pinned columns only
                let pinnedCols = newColumns.filter(column => column.pinnedLeft);
				// Get all unpinned colunms only
                let nonPinnedCols = newColumns.filter(column => !column.pinnedLeft);
                this.columnsInternal = [...pinnedCols, newCol, ...nonPinnedCols];
				//this.columnsInternal = [newCol, ...this.columnsInternal];
				// Update left offsets now that columns have been reordered
				
            }

			this.emitColumns(this.columnsInternal);
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
			this.columnsPinned = [...columData.columns];
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
		if (this.columnsPinned.length){
			gridProps.widthPinned = this.columnsPinned
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
			this.gridProps.heightTotal = <number>this.options.heightMax
		} else if (this.options.heightFullscreen) {
			let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			let offset = this.datagrid.nativeElement.getBoundingClientRect().top;
			let newHeight = height - offset - 18 - 24;// Add offsets for table header and bottom scrollbar
			this.gridProps.heightTotal = newHeight;
		}

		this.gridProps.rowsVisible = Math.ceil(this.gridProps.heightTotal / this.rowHeight); // Get max visible rows
		this.gridProps.rowsTotal = this.rows.length;    // Hold total rows
		this.gridProps.widthBody = this.datagrid.nativeElement.getBoundingClientRect().width;
		this.gridProps = { ...this.gridProps, ...gridProps };
	}


    /**
     * On a global mouse down event
     * @param event
     */
    private handleMouseDown(event: MouseEvent) {
        //console.warn('handleMouseDown', event)
        // Set the default starting position of the initial click and also get the bounding box of the datatable
        let draggingPos = {
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
         if (this.dragging){
             this.onRowMouseUp(this.rowHoveredLast, event);

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
	private handleKeyboardEvents(event: KeyboardEvent):void {
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
	 * Manage row selection. Includes single and multiple click by pressing control and shift
	 * @param row - The row object
	 * @param rowIndex - The index of the currently selected row
	 */
	public selectRow(row, rowIndex: number, isRightClick?: boolean, elementRef?): false | void{
        //console.warn('selectRow', row.$$selected);
		//console.warn('selectRow', groupIndex);

		if (!this.options.selectionType) {// || this.reSizing
            return false;
        }

		let newRows = [...this.rowsInternal];

		// Only allow row selection if set
		if (this.options.selectionType) {
			// If control is pressed while clicking
			if(this.keyPressed == 'Control' && this.options.selectionType == 'multi'){
				row.$$selected = row.$$selected ? false : true;
			}
			// If shift is pressed while clicking
			else if(this.keyPressed == 'Shift' && this.options.selectionType == 'multi'){
				// Unset all selected flags
				newRows.map(row => row.$$selected = false);
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
				newRows.map(row => row.$$selected = false);
				row.$$selected = true;
				//this.rowsSelected = row;
            } else {
				// If this is a right click row, don't do anything special
                if (isRightClick) {
					if (!row.$$selected){
						newRows.map(row => row.$$selected = false);
						row.$$selected = true;
					}
				} 
				// If multiple rows are already selected
				else if (this.rowsSelectedCount > 1) {
					// Reset all and set current row to selected
					newRows.map(row => row.$$selected = false);
					row.$$selected = true;
                }
				else {
					// Just untoggle this row
					row.$$selected = false;
				}
			}
			let selectedRows = newRows.filter(row => row.$$selected);
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
	 */
	public onRightClick(row, rowIndex: number, event?: MouseEvent) {
        this.selectRow(row, rowIndex, true);

		this.onRightClickMenu.emit(event); // Emit right click event up to the parent
	}

    /**
     * On mouse down on a row
     * @param rowIndex
     * @param groupIndex
     * @param event
     */
	public onRowMouseDown(rowIndex: number | false, event) {

        this.handleMouseDown(event);

        // Only function when the left mouse button is clicked
		if (event.which == 1) {
			this.rowClickDrag.rowIndex = rowIndex;
		}
    }

    /**
     * On mouse up on a row
     * @param rowIndex
     * @param groupIndex
     * @param event
     */
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
		for(let key in results){
			if(results[key]){
				classes += key + ' ';
			}
		}
		if(classes != ''){
			return classes;
		}
	}
    
	/**
     * Get the left offsets needed by column pinning
     * This method adds up the values of all widths of previous columns
     */
	public columnCalculations(columns: Datagrid.Column[]): void {
		let leftOffset = 0;
		columns.forEach((column, index) => {
            // If no width, set default to 150
			column.width ? column.width : 150;
            // Ensure min width of 44
			if (column.width < 44) {
				column.width = 44
			}
            // Ensure all column widths are divisible by 4, fixes a blurry text bug in chrome
			column.width = Math.floor(column.width / 4) * 4

			column.$$leftOffset = leftOffset;
			leftOffset += column.width;
		});
		
    /**
     * 
    
		let offset = 0;
		let newOffsets = [];
        this.columnsInternal.forEach((column, index) => {
        
            if (column.pinnedLeft) {
                newOffsets[index] = offset;
            }
            
            offset += column.width;
            
		});
        this.leftOffsets = newOffsets; */
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

        // If row height is set in options, set it in row styles
        if (this.options.rowHeight) {
			this.rows.forEach((row, index) => {
				rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]] || {},{'line-height': this.options.rowHeight + 'px'});
			});
		}

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

				// If row height is set in options, set it in row styles
				if (this.options.rowHeight) {
					this.rows.forEach((row, index) => {
						rowStyles[row[this.options.primaryKey]] = Object.assign(rowStyles[row[this.options.primaryKey]] || {}, {'line-height': this.options.rowHeight + 'px'});
					});
				}

				if (this.options.virtualScroll && this.virtualScrollPositions) {
					for (let key in this.virtualScrollPositions.rows) {
						rowStyles[key] = Object.assign(rowStyles[key], { 'transform': 'translate3d(0px, ' + this.virtualScrollPositions.rows[key]+'px, 0px)'})
					}
				}

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
				this.ref.markForCheck();
			});
			this.subscriptions.push(subscription);
		}

		
		//console.warn('rowStyles', rowStyles);
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

   


	public virtualScroll(scrollTop: number) {
		console.warn('OnScroll ', scrollTop);
        // transform: translate3d(0px, 74px, 0px);
		let rowHeight = this.options.rowHeight + 1;
		let tableHeight = this.tableContainerHeight - 24;
		let rowsVisibleCount = Math.floor(tableHeight / rowHeight);
        // Order of operations for vScroll
        // 1. Generate Z-indexes of rows and group headers (for transform property)
        // 2. Determine visible scrollbox area, figure out which rows and headers fall within that



		let i = 0;
		this.rowsInternal.forEach((row, index:number) => {
			let vPos = index * rowHeight;
			if (vPos <= scrollTop && vPos + rowHeight < rowsVisibleCount * rowHeight){
				i++;
			}


            //console.warn(vPos)
		});
		console.warn('i',i)
		//console.warn('OnScroll-Container Height ', rowsVisibleCount);
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
    
	ngOnDestroy() {
		// Unsub from all subscriptions
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}


