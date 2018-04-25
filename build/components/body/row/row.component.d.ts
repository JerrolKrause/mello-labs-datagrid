import { OnInit, EventEmitter, ElementRef, OnChanges } from '@angular/core';
import { Datagrid } from '../../../typings';
export declare class RowComponent implements OnInit, OnChanges {
    elementRef: ElementRef;
    columns: Datagrid.Column[];
    options: Datagrid.Options;
    row: any[];
    updateDatatable: EventEmitter<any>;
    onRowUpdated: EventEmitter<any>;
    constructor(elementRef: ElementRef);
    ngOnInit(): void;
    ngOnChanges(): void;
    /**
     * Return a unique ID to ngfor to improve performance
     * @param index - Number in array
     * @param item - The column
     */
    trackColumn(_index: number, item: Datagrid.Column): string;
    /**
     * Perform an action on the main datatable that was requested by lower component
     * @param action
     */
    onUpdateDatatable(action: 'update' | 'reset'): void;
    /**
     * Pass updated field up the component chain
     * @param event
     */
    rowUpdated(event: Datagrid.FieldEdit): void;
}
