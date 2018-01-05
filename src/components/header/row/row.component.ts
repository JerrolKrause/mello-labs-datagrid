import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { Datagrid } from '../../../typings';

@Component({
    selector: 'datagrid-header-row',
    templateUrl: './row.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderRowComponent implements OnInit, OnChanges{

	@Input() columns: Datagrid.Column[];
	@Input() state: Datagrid.State;
	@Input() status: Datagrid.Status;
	@Input() options: Datagrid.Options;
	@Input() scrollProps: Datagrid.ScrollProps;
    @Input() filterTerms: any;
    @Input() columnType: 'pinnedLeft' | 'main';
    
	
	@Output() onColumnsUpdated: EventEmitter<any> = new EventEmitter();
	@Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
	@Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();

	/** During a resize, disable some stuff */
	public reSizing: boolean = false;

	public columnWidth: string = '';
    
	constructor(
    ) { 
    }

	ngOnInit() {}

	ngOnChanges() {}

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
    public onReorderSuccess(event, type: 'pinnedLeft' | 'main') {
		// If columns are being dragged before a pinned column, set that column to pinned
		let isPinned = false;
        for (let i = this.columns.length - 1; i >= 0; i--) {
            let column = this.columns[i];
			if (column.pinnedLeft) {
				isPinned = true;
			}
			column.locked = isPinned;
			column.pinnedLeft = isPinned;
		}
        this.onColumnsUpdated.emit({ action: 'reorder', columns: this.columns, type: type });
	}

    /**
      * If the column was resized
      * @param event
      */
    public onResizeEnd(event, columnIndex: number, type: 'pinnedLeft' | 'main') {
        //console.warn('onResizeEnd', columnIndex, type, Math.floor(event.rectangle.width / 2) * 2)
        
        let width = Math.floor(event.rectangle.width / 2) * 2; // Round to nearest 2 pixels to prevent rendering issues in chrome
        // Min column size 44 px
        if (width < 44) {
            width = 44;
        }
        this.reSizing = false;

        this.onColumnsUpdated.emit({ action: 'resize', columnIndex: columnIndex, type: type, width: width });
    }
    
}
