import { OnInit, OnDestroy, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import { Datagrid } from '../../../typings';
export declare class FiltersComponent implements OnInit, OnDestroy {
    column: Datagrid.Column;
    options: Datagrid.Options;
    state: Datagrid.State;
    status: Datagrid.Status;
    filterTerms: any;
    onFiltersUpdated: EventEmitter<any>;
    defaultList: any;
    model: any;
    modelLabel: string;
    modelValue: string;
    modelClasses: string;
    modelStyles: string;
    private filterTerm;
    private subs;
    constructor();
    ngOnInit(): void;
    /**
     * When the open form filter is modified
     * @param columnProp
     * @param operator
     * @param newTerm
     * @param oldTerm
     */
    modifyFilter(columnProp: string, operator: string, newTerm: string | boolean, oldTerm: string): void;
    ngOnDestroy(): void;
}
