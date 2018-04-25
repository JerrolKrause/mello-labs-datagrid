import { OnInit, EventEmitter, ElementRef, NgZone } from '@angular/core';
import { Datagrid } from '../../typings';
export declare class BodyComponent implements OnInit {
    private zone;
    columns: Datagrid.Column[];
    columnsPinnedLeft: Datagrid.Column[];
    rows: any[];
    rowStyles: any;
    state: Datagrid.State;
    status: Datagrid.Status;
    options: Datagrid.Options;
    gridProps: Datagrid.Props;
    onColumnsUpdated: EventEmitter<any>;
    onStateUpdated: EventEmitter<any>;
    onCustomLinkEvent: EventEmitter<any>;
    onRowUpdated: EventEmitter<any>;
    onRowMouseEvent: EventEmitter<any>;
    onGroupToggled: EventEmitter<any>;
    onRightClick: EventEmitter<any>;
    onRowMouseDown: EventEmitter<any>;
    onRowMouseUp: EventEmitter<any>;
    onScrollEvent: EventEmitter<any>;
    body: any;
    constructor(zone: NgZone, element: ElementRef);
    ngOnInit(): void;
    /**
     * Throttle the scroll event
     */
    onScrollThrottled: any;
    /**
     * When the datatable is scrolled
     * @param event
     */
    private onScroll(event);
    /**
     * Return a unique ID to ngfor to improve performance
     * @param index - Number in array
     * @param item - The column
     */
    trackRow(_index: number, item: any): any;
    /**
     * Communicate mouse events on the body row up to the parent. Used mainly for selection
     * @param type
     * @param rowIndex
     * @param event
     */
    onMouseEvent(type: 'click' | 'contextmenu' | 'mousedown' | 'mouseup' | 'mouseenter', rowIndex: number, event?: MouseEvent): void;
    /**
     * Pass updated field up the component chain
     * @param event
     */
    rowUpdated(event: Datagrid.FieldEdit, rowIndex: number): void;
    /**
     * When a group is toggled
     * @param event
     */
    groupToggled(group: Datagrid.Group): void;
    ngOnDestroy(): void;
}
