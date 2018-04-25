import { OnInit, EventEmitter } from '@angular/core';
import { Datagrid } from '../../typings';
export declare class HeaderComponent implements OnInit {
    columns: Datagrid.Column[];
    columnsPinnedLeft: Datagrid.Column[];
    state: Datagrid.State;
    status: Datagrid.Status;
    options: Datagrid.Options;
    gridProps: Datagrid.Props;
    scrollProps: Datagrid.ScrollProps;
    filterTerms: any;
    onColumnsUpdated: EventEmitter<any>;
    onStateUpdated: EventEmitter<any>;
    onCustomLinkEvent: EventEmitter<any>;
    /** During a resize, disable some stuff */
    constructor();
    ngOnInit(): void;
    /**
     * Pass state changes up from controls component
     * @param event
     */
    stateUpdated(event: Datagrid.State): void;
    /**
     * Pass column changes up to the main datagrid
     * @param event
     */
    columnsUpdated(event: Datagrid.Column[]): void;
    /**
     * Emit a custom link event response up to the parent component
     * @param data
     */
    customLinkEvent(data: {
        link: Datagrid.ControlsCustomLinksGroup;
        column: Datagrid.Column;
    }): void;
}
