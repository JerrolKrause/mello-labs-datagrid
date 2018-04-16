import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Actions } from '../../../datagrid.props';
import { Datagrid } from '../../../typings';

@Component({
  selector: 'datagrid-controls',
  templateUrl: './controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsComponent implements OnInit, OnDestroy {
  @Input() state: Datagrid.State;
  @Input() status: Datagrid.Status;
  @Input() options: Datagrid.Options;
  @Input() column: Datagrid.Column;
  @Input() filterTerms: any;
  @Input() columnIndex: number;

  @Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
  @Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();

  private subs: Subscription[] = [];

  constructor() {}

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
    } else if (direction === 'asc') {
      direction = 'desc';
    }

    this.modifyState(action, { dir: direction, prop: prop });
  }

  /**
   * Column pinning
   * @param action
   * @param column
   * @param index
   */
  public modifyPinned(action: Actions, column: Datagrid.Column, index?: number) {
    this.modifyState(action, { prop: column.prop, index: index, isPinned: column.pinnedLeft });
  }

  /**
   * Modify filter state
   * @param data
   */
  public modifyFilters(data: any) {
    this.modifyState(Actions.filter, data);
  }

  /**
   * Clear all filters for this column
   */
  public clearFilters(columnProp: string) {
    this.modifyState(Actions.filter, { filterAction: 'clear', filter: { prop: columnProp } });
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
    if (this.subs.length) {
      this.subs.forEach(sub => sub.unsubscribe());
    }
  }
}
