import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { DataGridService } from '../../datagrid.service';
import { Datagrid } from '../../typings';
import { Subscription } from 'rxjs';
import { Actions } from '../../datagrid.props';

@Component({
	selector: 'datagrid-controls',
    templateUrl: './controls.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent implements OnInit, OnDestroy{

	@Input() state: Datagrid.State;
	@Input() status: Datagrid.Status;
	@Input() options: Datagrid.Options;
	@Input() column: Datagrid.Column;
	@Input() filterTerms: any;

	@Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
	@Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();
	public columnIndex;
	private subs: Subscription[] = [];

	constructor(
		private dgSvc: DataGridService,
	) { }

	

	ngOnInit() {}

    /**
     * When the modify sort button is clicked
     * @param action 
     * @param prop 
     * @param direction 
     */
	public modifySorts(action: Actions, prop: string, direction?: string) {
		if (!direction) {
			direction = 'asc';
		} else if (direction == 'asc') {
			direction = 'desc';
		} else {
			direction = null;
		}

		this.modifyState(action, { dir: direction, prop: prop });
	}

    /**
     * Column pinning
     * @param action
     * @param column
     * @param index
     */
	public modifyPinned(action: Actions, column: Datagrid.Column, index?: string) {
		this.modifyState(action, { prop: column.prop, index: index, isPinned: column.pinnedLeft });
	}

    /**
     * Modify filter state
     * @param data 
     */
	public modifyFilters(data) {
		this.modifyState(Actions.filter, data);
	}

    /**
     * Clear all filters for this column
     */
	public clearFilters(columnProp) {
		this.modifyState(Actions.filter, { filterAction: 'clear', filter: { 'prop': columnProp } });
	}

    /**
     * When the modify state button is clicked
     * @param action 
     * @param data 
     */
	public modifyState(action: Actions, data: any): void {
		this.onStateUpdated.emit({ action: action, data: data });
	}

    /**
     * When a custom link is clicked, emit that value up to the parent
     * @param event
     */
	public customLinkAction(link: Datagrid.ControlsCustomLinksGroup, column: Datagrid.Column) {
		this.onCustomLinkEvent.emit({ link: link, column: column });
	}

    /**
     * Delete a column
     * @param columnIndex
     */
	public deleteColumn(columnIndex: number) {
		this.modifyState(Actions.column, { action: 'delete', columnIndex: columnIndex });
	}




	ngOnDestroy() {
		if (this.subs.length){
			this.subs.forEach(sub => sub.unsubscribe());
		}
	}

}
