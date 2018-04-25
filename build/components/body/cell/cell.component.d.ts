import { OnInit, EventEmitter, ElementRef, AfterViewInit, OnChanges, ViewContainerRef, OnDestroy } from '@angular/core';
import { Datagrid } from '../../../typings';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
export declare class CellComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    column: Datagrid.Column;
    row: {
        [key: string]: any;
    };
    options: Datagrid.Options;
    updateDatatable: EventEmitter<any>;
    onRowUpdated: EventEmitter<any>;
    /** The popover used for inline editing */
    p: NgbPopover;
    /** The popover textarea for inline editing */
    editBox: ElementRef;
    /** Reference to content inside the cell */
    cellData: ElementRef;
    /** Reference to content inside the cell */
    cellTemplate: ViewContainerRef;
    /** Use to pass internal data such as columns and rows to the templates projected from the parent component */
    cellContext: {
        column?: Datagrid.Column;
        row?: any;
        options?: Datagrid.Options;
        value?: any;
    };
    /** Is the content truncated, IE is the content inside the cell wider than the parent container */
    truncated: boolean;
    constructor();
    ngOnInit(): void;
    ngOnChanges(): void;
    ngAfterViewInit(): void;
    /**
     * Check if the content is truncated
     */
    private checkTruncated();
    /**
     * Open the edit note tooltip and set the focus
     * @param event
     */
    fieldEdit(): void;
    /**
     * When a field was edited/updated
     * @param event
     */
    rowUpdated(event: any): void;
    /**
     * Perform an action on the main datatable that was requested by lower component
     * @param action
     */
    onUpdateDatatable(action: 'update' | 'reset'): void;
    ngOnDestroy(): void;
}
