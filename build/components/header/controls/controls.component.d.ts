import { OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Actions } from '../../../datagrid.props';
import { Datagrid } from '../../../typings';
export declare class ControlsComponent implements OnInit, OnDestroy {
    state: Datagrid.State;
    status: Datagrid.Status;
    options: Datagrid.Options;
    column: Datagrid.Column;
    filterTerms: any;
    columnIndex: number;
    onStateUpdated: EventEmitter<any>;
    onCustomLinkEvent: EventEmitter<any>;
    private subs;
    constructor();
    ngOnInit(): void;
    /**
     * When the modify sort button is clicked
     * @param action
     * @param prop
     * @param direction
     */
    modifySorts(action: Actions, prop: string, direction?: string | null): void;
    /**
     * Column pinning
     * @param action
     * @param column
     * @param index
     */
    modifyPinned(action: Actions, column: Datagrid.Column, index?: number): void;
    /**
     * Modify filter state
     * @param data
     */
    modifyFilters(data: any): void;
    /**
     * Clear all filters for this column
     */
    clearFilters(columnProp: string): void;
    /**
     * When the modify state button is clicked
     * @param action
     * @param data
     */
    modifyState(action: Actions, data: any): void;
    /**
     * When a custom link is clicked, emit that value up to the parent
     * @param event
     */
    customLinkAction(link: Datagrid.ControlsCustomLinksGroup, column: Datagrid.Column): void;
    /**
     * Delete a column
     * @param columnIndex
     */
    deleteColumn(columnIndex: number): void;
    ngOnDestroy(): void;
}
