import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { Datagrid } from '../../typings';

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
    @Input() rowStyles;
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

}
