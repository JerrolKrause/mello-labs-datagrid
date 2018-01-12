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

    @Output() updateDatatable: EventEmitter<any> = new EventEmitter();
    @Output() onRowUpdated: EventEmitter<any> = new EventEmitter();

	constructor(public elementRef: ElementRef
    ) {
    }

	ngOnInit() {}

	ngOnChanges() {}

	/**
    * Return a unique ID to ngfor to improve performance
    * @param index - Number in array
    * @param item - The column
    */
	public trackColumn(index: number, item: Datagrid.Column) {
		return item.$$track;
    }

    /**
    * Perform an action on the main datatable that was requested by lower component
    * @param action
    */
    public onUpdateDatatable(action: 'update' | 'reset') {
        this.updateDatatable.emit(action);
    }

    /**
    * Pass updated field up the component chain
    * @param event
    */
    public rowUpdated(event: Datagrid.FieldEdit) {
        this.onRowUpdated.emit(event);
    }
   
}
