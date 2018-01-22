import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Datagrid } from '../../../typings';


@Component({
		selector: 'group-header',
		templateUrl: './group-header.component.html',
		changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupHeaderComponent implements OnInit, OnChanges, OnDestroy {

		@Input() width: number;
		@Input() group: Datagrid.Group;
		@Input() options: Datagrid.Options;

		@Output() onGroupToggled: EventEmitter<any> = new EventEmitter();

		public groupLabel: string = '';
		public active: boolean = true;

		private sub: Subscription;

		constructor(
		) {
		}

		ngOnChanges() {
				// Everytime new data is passed down, recreate the label
				this.createGroupLabel();
		}

		ngOnInit() {}

		/**
		 * Toggle group visibility
		 * @param group
		 */
		public toggleGroup(group: Datagrid.Group, $event: MouseEvent) {

				$event.preventDefault();
				$event.stopPropagation();

				this.group.rows.forEach(row => {
						if (!row.$$hidden) {
								row.$$hidden = true;
						} else {
								row.$$hidden = false;
						}
				});

				this.group.visible = !this.group.visible;
				this.active = !this.active;

				this.onGroupToggled.emit(this.group);
		}

		/**
		 * Create the label for the group
		 */
		private createGroupLabel() {
				// If columnData has been supplied then the app needs to get the group header label from within that data
				if (this.options.columnData && this.options.columnData[this.group.columnProp] && this.options.columnData[this.group.columnProp].model) {
						// Sub to the observable
						this.sub = this.options.columnData[this.group.columnProp].model.subscribe(model => {
								let columnData = this.options.columnData[this.group.columnProp];
								let newLabel = [];
								// If this row property is an array, join all possible settings
								if (this.group && this.group.label && Array.isArray(this.group.label)) {
										// Loop through the labels in the group prop
										//console.warn(columnData, model, this.group.rows[0][this.group.columnProp]);

										this.group.rows[0][this.group.columnProp].forEach(id => {
												model[columnData.modelSrc].forEach(element => {
														if (id == element[columnData.value]) {
																newLabel.push(element[columnData.label])
														}
												});
										});
										this.groupLabel = newLabel.length ? newLabel.join(' & ') : 'Missing Value';
								}
								//If this row property is NOT an array
								else {
										this.groupLabel = 'No Value';
								}
						});
				}
				// No columnData provided
				else {
						this.groupLabel = this.group.label ? this.group.label : 'No Value';
				}
		}

		ngOnDestroy() {
				if (this.sub) { this.sub.unsubscribe() }
		}


}
