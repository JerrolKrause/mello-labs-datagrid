import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Actions } from '../datagrid.props';
import { Datagrid } from '../typings';

@Component({
    selector: 'datagrid-body',
	templateUrl: './body.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyComponent implements OnInit, OnChanges{

	@Input() columnsInternal: Datagrid.Column[];
    @Input() columnsPinnedLeft: Datagrid.Column[];
	@Input() rowsInternal: any[];
	@Input() state: Datagrid.State;
	@Input() status: Datagrid.Status;
	@Input() options: Datagrid.Options;
	@Input() gridProps: Datagrid.Props;

	@Output() onColumnsUpdated: EventEmitter<any> = new EventEmitter();
	@Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
    @Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();

    @Output() onRowMouseEvent: EventEmitter<any> = new EventEmitter();

    @Output() onRightClick: EventEmitter<any> = new EventEmitter();
    @Output() onRowMouseDown: EventEmitter<any> = new EventEmitter();
    @Output() onRowMouseUp: EventEmitter<any> = new EventEmitter();
    
    
    
	constructor(
    ) { 
    	this.onColumnsUpdated = new EventEmitter();
    	this.onStateUpdated = new EventEmitter();
    	this.onCustomLinkEvent = new EventEmitter();
    }

	ngOnInit() {}

	ngOnChanges() {}

    /**
     * Communicate mouse events on the body row up to the parent. Used mainly for selection
     * @param type
     * @param rowIndex
     * @param event
     */
    public onMouseEvent(type: 'click' | 'contextmenu' | 'mousedown' | 'mouseup' | 'mouseover', rowIndex: number, event?: MouseEvent) {
        this.onRowMouseEvent.emit({ type: type, rowIndex: rowIndex, event: event });
    }

    /**
	 * Manage right click functionality. If right clicking and row is unselected, select it, otherwise do nothing
	 * @param row 
	 * @param rowIndex 
	 * @param contextMenuEvent 
	
    public rightClick(row, rowIndex: number, event?: MouseEvent) {
        this.onRightClick.emit({ row: row, rowIndex: rowIndex, event: event}); 
    }

    public rowMouseDown(rowIndex, $event) {
        this.onRowMouseDown.emit({ rowIndex: rowIndex, event: event }); 
    }

    public rowMouseUp(rowIndex, $event) {
        this.onRowMouseUp.emit({ rowIndex: rowIndex, event: event }); 
    }
     */

    /**
     * Return a unique ID to ngfor to improve performance
     * @param index - Number in array
     * @param item - The column
    
	public trackColumn(index: number, item: Datagrid.Column) {
		return item.prop;
	}
	 */
    
}
