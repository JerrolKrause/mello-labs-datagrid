import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ElementRef, OnChanges } from '@angular/core';
import { Datagrid } from '../../../typings';

@Component({
    selector: 'datagrid-body-row',
    templateUrl: './row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowComponent implements OnInit, OnChanges  {

	@Input() columns: Datagrid.Column[];
	@Input() options: Datagrid.Options;
    @Input() row: any[];
    @Input() templatesCell;

    @Output() updateDatatable: EventEmitter<any> = new EventEmitter();

	constructor(public elementRef: ElementRef
    ) {
        this.updateDatatable = new EventEmitter(); 
    }

	ngOnInit() {}

	ngOnChanges(model) {
		//console.log('RowComponent', model)
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
    * Perform an action on the main datatable that was requested by lower component
    * @param action
    */
    public onUpdateDatatable(action: 'update' | 'reset') {
        this.updateDatatable.emit(action);
    }
   
}
