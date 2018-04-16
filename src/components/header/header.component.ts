import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Datagrid } from '../../typings';

@Component({
  selector: 'datagrid-header',
  templateUrl: './header.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Input() columns: Datagrid.Column[];
  @Input() columnsPinnedLeft: Datagrid.Column[];
  @Input() state: Datagrid.State;
  @Input() status: Datagrid.Status;
  @Input() options: Datagrid.Options;
  @Input() gridProps: Datagrid.Props;
  @Input() scrollProps: Datagrid.ScrollProps;
  @Input() filterTerms: any;

  @Output() onColumnsUpdated: EventEmitter<any> = new EventEmitter();
  @Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
  @Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();

  /** During a resize, disable some stuff */
  //public reSizing: boolean = false;

  //public columnWidth: string = '';

  constructor() {}

  ngOnInit() {}

  /**
   * Pass state changes up from controls component
   * @param event
   */
  public stateUpdated(event: Datagrid.State) {
    this.onStateUpdated.emit(event);
  }

  /**
   * Pass column changes up to the main datagrid
   * @param event
   */
  public columnsUpdated(event: Datagrid.Column[]) {
    this.onColumnsUpdated.emit(event);
  }

  /**
   * Emit a custom link event response up to the parent component
   * @param data
   */
  public customLinkEvent(data: { link: Datagrid.ControlsCustomLinksGroup; column: Datagrid.Column }) {
    this.onCustomLinkEvent.emit(data);
  }

  /**
	* On a successfull drag reorder of the column headers

	public onReorderSuccess() {
		// If columns are being dragged before a pinned column, set that column to pinned
		let isPinned = false;
        for (let i = this.columns.length - 1; i >= 0; i--) {
            let column = this.columns[i];
			if (column.pinnedLeft) {
				isPinned = true;
			}
			column.locked = isPinned;
			column.pinnedLeft = isPinned;
		}
        this.onColumnsUpdated.emit(this.columns);
	}
    */
}
