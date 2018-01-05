import { Component, OnInit, ChangeDetectionStrategy, Input, ViewContainerRef, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit, OnChanges, ContentChild, TemplateRef, forwardRef, QueryList, ContentChildren } from '@angular/core';
import { Datagrid } from '../../../typings';
import { BehaviorSubject } from 'rxjs';
import { Templates } from '@mello-labs/datagrid/directives/column.directive';



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

    @Input() @ContentChild('', { read: TemplateRef }) templatesCell: TemplateRef<any>;
    
    @Output() updateDatatable: EventEmitter<any> = new EventEmitter();
    @Output() onRowUpdated: EventEmitter<any> = new EventEmitter();

    /** The popover used for inline editing */
    @ViewChild('p') p;
    /** The popover textarea for inline editing */
    @ViewChild('editBox') editBox;
    /** Reference to content inside the cell */
    @ViewChild('cellData') cellData :ElementRef;
    
	/** Is the content truncated, IE is the content inside the cell wider than the parent container */
    public truncated = false;

    constructor(
	) { 
	}

    ngOnInit() {
        
    }

    ngOnChanges() {
        this.checkTruncated();
	}

    ngAfterViewInit() {
        this.checkTruncated();
    }

    /**
     * Check if the content is truncated
     */
    private checkTruncated() {
        if (this.cellData && this.cellData.nativeElement && this.cellData.nativeElement.getBoundingClientRect().width > this.column.width) {
            this.truncated = true;
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
