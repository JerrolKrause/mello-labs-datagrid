import { OnInit, EventEmitter, OnChanges } from '@angular/core';
import { Datagrid } from '../../../typings';
export declare class HeaderRowComponent implements OnInit, OnChanges {
    columns: Datagrid.Column[];
    state: Datagrid.State;
    status: Datagrid.Status;
    options: Datagrid.Options;
    scrollProps: Datagrid.ScrollProps;
    filterTerms: any;
    columnType: 'pinnedLeft' | 'main';
    onColumnsUpdated: EventEmitter<any>;
    onStateUpdated: EventEmitter<any>;
    onCustomLinkEvent: EventEmitter<any>;
    cellContext: {
        column?: Datagrid.Column;
        row?: any;
        options?: Datagrid.Options;
        value?: any;
    };
    /** During a resize, disable some stuff */
    reSizing: boolean;
    dragStartProp: string;
    constructor();
    ngOnInit(): void;
    ngOnChanges(): void;
    /**
     * Pass state changes up from controls component
     * @param event
     */
    stateUpdated(event: Datagrid.State): void;
    /**
     * Emit a custom link event response up to the parent component
     * @param data
     */
    customLinkEvent(data: {
        link: Datagrid.ControlsCustomLinksGroup;
        column: Datagrid.Column;
    }): void;
    /**
     * Return a unique ID to ngfor to improve performance
     * @param index - Number in array
     * @param item - The column
     */
    trackColumn(_index: number, item: Datagrid.Column): string;
    /**
     * On a successful drag reorder of the column headers
     */
    dragDrop(type: 'pinnedLeft' | 'main', columnNewPosition: number): void;
    /**
     * If the column was resized
     * @param event
     */
    onResizeEnd(event: any, columnIndex: number, type: 'pinnedLeft' | 'main'): void;
}
