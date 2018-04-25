import { OnInit, EventEmitter } from '@angular/core';
import { Datagrid } from '../../typings';
export declare class InfoComponent implements OnInit {
    state: Datagrid.State;
    options: Datagrid.Options;
    columnsMapped: Datagrid.Column;
    onReset: EventEmitter<any>;
    constructor();
    ngOnInit(): void;
    /**
     * Reset one of the datatable controls
     * @param resetType
     */
    reset(resetType: 'groups' | 'sorts' | 'filters'): void;
}
