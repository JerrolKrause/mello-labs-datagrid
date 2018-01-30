import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, ElementRef, NgZone } from '@angular/core';
import { Datagrid } from '../../typings';
import * as _ from 'lodash';

@Component({
		selector: 'datagrid-body',
		templateUrl: './body.component.html',
		styles: [],
		changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyComponent implements OnInit, OnChanges {

		@Input() columns: Datagrid.Column[];
		@Input() columnsPinnedLeft: Datagrid.Column[];
		@Input() rows: any[];
		@Input() rowStyles;
		@Input() state: Datagrid.State;
		@Input() status: Datagrid.Status;
		@Input() options: Datagrid.Options;
		@Input() gridProps: Datagrid.Props;

		@Output() onColumnsUpdated: EventEmitter<any> = new EventEmitter();
		@Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
		@Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();
		@Output() onRowUpdated: EventEmitter<any> = new EventEmitter();
		@Output() onRowMouseEvent: EventEmitter<any> = new EventEmitter();
		@Output() onGroupToggled: EventEmitter<any> = new EventEmitter();
		@Output() onRightClick: EventEmitter<any> = new EventEmitter();
		@Output() onRowMouseDown: EventEmitter<any> = new EventEmitter();
		@Output() onRowMouseUp: EventEmitter<any> = new EventEmitter();
		@Output() onScrollEvent: EventEmitter<any> = new EventEmitter();

		public body: any;

		constructor(
				private zone: NgZone,
				element: ElementRef
		) {
				this.body = element.nativeElement;
		}

		ngOnInit() {
				// Attach scroll event listener
				this.zone.runOutsideAngular(() => {
						this.body.addEventListener('scroll', this.onScrollThrottled.bind(this), <any>{ capture: true, passive: true });
				});
		}

		ngOnChanges(model) {
				//console.log('ngOnChanges', model);
		}

		/**
		 * Throttle the scroll event
		 */
		public onScrollThrottled = _.throttle(event => this.onScroll(event), 20, { trailing: true, leading: true });

		/**
		* When the datatable is scrolled
		* @param event
		*/
		private onScroll(event) {
				//console.log('onScroll', event.target.scrollTop);
				requestAnimationFrame(() => {
						let scrollProps = {
								scrollTop: event.target.scrollTop,
								scrollLeft: event.target.scrollLeft
						}
						this.onScrollEvent.emit(scrollProps);
				});
		}

		/**
			* Return a unique ID to ngfor to improve performance
			* @param index - Number in array
			* @param item - The column
			*/
		public trackRow(index: number, item: any) {
				//console.log('Tracking Rows');
				return item.$$track;
		}

    /**
     * Communicate mouse events on the body row up to the parent. Used mainly for selection
     * @param type
     * @param rowIndex
     * @param event
     */
		public onMouseEvent(type: 'click' | 'contextmenu' | 'mousedown' | 'mouseup' | 'mouseenter', rowIndex: number, event?: MouseEvent) {
				this.onRowMouseEvent.emit({ type: type, rowIndex: rowIndex, event: event });
		}


    /**
     * Pass updated field up the component chain
     * @param event
     */
		public rowUpdated(event: Datagrid.FieldEdit, rowIndex: number) {
				event.rowIndex = rowIndex;
				this.onRowUpdated.emit(event);
		}

    /**
     * When a group is toggled
     * @param event
     */
		public groupToggled(group: Datagrid.Group) {
				this.onGroupToggled.emit(group);
		}

		ngOnDestroy() {
				// Unsub from all subscriptions
				this.body.removeEventListener('scroll', this.onScrollThrottled.bind(this), <any>{ capture: true, passive: true });
		}
}
