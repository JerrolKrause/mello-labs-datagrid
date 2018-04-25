import { OnInit, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { Datagrid } from '../../../typings';
export declare class GroupHeaderComponent implements OnInit, OnChanges, OnDestroy {
    width: number;
    group: Datagrid.Group;
    options: Datagrid.Options;
    onGroupToggled: EventEmitter<any>;
    groupLabel: string;
    active: boolean;
    private sub;
    constructor();
    ngOnChanges(): void;
    ngOnInit(): void;
    /**
     * Toggle group visibility
     * @param group
     */
    toggleGroup(group: Datagrid.Group, $event: MouseEvent): void;
    /**
     * Create the label for the group
     */
    private createGroupLabel(group, options);
    ngOnDestroy(): void;
}
