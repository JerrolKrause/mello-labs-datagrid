import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit, OnChanges } from '@angular/core';
import { Datagrid } from '../../../typings';

@Component({
    selector: 'datagrid-cell',
    templateUrl: './cell.component.html',
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellComponent implements OnInit, OnChanges, AfterViewInit {

	@Input() column: Datagrid.Column;
	@Input() row: any;
    @Input() options: Datagrid.Options;

    @Output() updateDatatable: EventEmitter<any> = new EventEmitter();
    @Output() onRowUpdated: EventEmitter<any> = new EventEmitter();

    /** The popover used for inline editing */
    @ViewChild('p') p;
    /** The popover textarea for inline editing */
    @ViewChild('editBox') editBox;
    /** Reference to content inside the cell */
    @ViewChild('cellData') cellData :ElementRef;
    /** Use to pass internal data such as columns and rows to the templates projected from the parent component */
    public cellContext: {
        column?: Datagrid.Column,
        row?: any,
        options?: Datagrid.Options,
        value?: any
    } = {};
	/** Is the content truncated, IE is the content inside the cell wider than the parent container */
    public truncated = false;

    constructor(
	) { 
	}

    ngOnInit() {}

    ngOnChanges() {
        this.checkTruncated();
        this.cellContext.column = this.column;
        this.cellContext.row = this.row;
        this.cellContext.options = this.options;
        this.cellContext.value = this.row[this.column.prop];
    }

    ngAfterViewInit() {
        this.checkTruncated();
    }

    /**
     * Check if the content is truncated
     */
    private checkTruncated() {
        if (this.cellData &&
            this.cellData.nativeElement &&
            this.cellData.nativeElement.getBoundingClientRect().width > this.column.width) {
            this.truncated = true;
        } else {
            this.truncated = false;
        }
    }

    /**
     * Open the edit note tooltip and set the focus
     * @param event
     */
    public fieldEdit(event) {
        if (this.column.canEdit) {
            this.p.open();
            //document.getElementById('privateNoteEditBox').focus();
        } 
    }

    /**
     * When a field was edited/updated
     * @param event
     */
    public rowUpdated(event) {
        let valueOld = this.row[this.column.prop].toString();
        this.row[this.column.prop] = event.target.value;

        let fieldData: Datagrid.FieldEdit = {
            valueNew: event.target.value,
            valueOld: valueOld,
            prop: this.column.prop,
            row: this.row
        }
        // Pass data up chain
        this.onRowUpdated.emit(fieldData);
        // Fixes bug with ng-bootstrap not seeing close method
        setTimeout(() => this.p.close());
        
        event.preventDefault();
        event.stopPropagation();
    }

    /**
    * Perform an action on the main datatable that was requested by lower component
    * @param action
    */
    public onUpdateDatatable(action: 'update' | 'reset') {
        this.updateDatatable.emit(action);
    }

}
