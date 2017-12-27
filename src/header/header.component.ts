import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Actions } from '../datagrid.props';
import { Datagrid } from '../typings';

@Component({
    selector: 'datagrid-header',
    templateUrl: './header.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnChanges{

	@Input() columnsInternal: Datagrid.Column[];
	@Input() columnsPinned: Datagrid.Column[];
	@Input() state: Datagrid.State;
	@Input() status: Datagrid.Status;
	@Input() options: Datagrid.Options;
	@Input() gridProps: Datagrid.Props;
	@Input() scrollProps: Datagrid.ScrollProps;
	@Input() filterTerms: any;
	
	@Output() onColumnsUpdated: EventEmitter<any> = new EventEmitter();
	@Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
	@Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();

	/** During a resize, disable some stuff */
	public reSizing: boolean = false;

    /*
	@Input() column: Datagrid.Column;
	@Input() options: Datagrid.Options;
	@Input() state: Datagrid.State;
	@Input() status: Datagrid.Status;
	@Input() columnIndex: number;
	@Input() filterTerms: any;
	@Input() columnsCount:number;
    
	@Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
	@Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();
    */
	public columnWidth: string = '';
    
	constructor(
    ) { 
    	this.onColumnsUpdated = new EventEmitter();
		this.onColumnsUpdated = new EventEmitter();
		this.onColumnsUpdated = new EventEmitter();
    	this.reSizing = false;
    	this.columnWidth = '';
    }

	ngOnInit() {
	}

	ngOnChanges() {

	}

    /**
     * Pass state changes up from controls component
     * @param event
     */
	public stateUpdated(event) {
		this.onStateUpdated.emit(event);
	}

    /**
     * Return a unique ID to ngfor to improve performance
     * @param index - Number in array
     * @param item - The column
     */
	public trackColumn(index: number, item: Datagrid.Column) {
		return item.prop;
	}
	/**
	* On a successfull drag reorder of the column headers
	*/
	public onReorderSuccess() {
		// If columns are being dragged before a pinned column, set that column to pinned
		let isPinned = false;
		for (let i = this.columnsInternal.length - 1; i >= 0; i--) {
			let column = this.columnsInternal[i];
			if (column.pinnedLeft) {
				isPinned = true;
			}
			column.locked = isPinned;
			column.pinnedLeft = isPinned;
		}
		this.onColumnsUpdated.emit(this.columnsInternal);
	}

    /**
     * If the column was resized
     * @param event
     */
	public onResizeEnd(event, column: Datagrid.Column, columnIndex: number, type: 'columnsInternal' | 'columnsPinned') {
		//console.warn('onResizeEnd', column, event)
		column.width = Math.floor(event.rectangle.width);

		if (column.width < 45) {
			column.width = 45;
		}
		this.reSizing = false;

		if (type == 'columnsPinned') {
			this.columnsPinned[columnIndex] = { ...column };
			this.onColumnsUpdated.emit({ columns: this.columnsPinned, type: type });
		} else {
			this.columnsInternal[columnIndex] = { ...column };
			this.onColumnsUpdated.emit({ columns: this.columnsInternal, type: type });
        }

		
		
		
	}
    
}
