import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Datagrid } from '../../../models/typings';

@Component({
  selector: 'datagrid-header-row',
  templateUrl: './row.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderRowComponent implements OnInit, OnChanges {
  @Input() columns: Datagrid.Column[];
  @Input() state: Datagrid.State;
  @Input() status: Datagrid.Status;
  @Input() options: Datagrid.Options;
  @Input() scrollProps: Datagrid.ScrollProps;
  @Input() filterTerms: any;
  @Input() columnType: 'pinnedLeft' | 'main';

  // private columnsOriginal;

  @Output() onColumnsUpdated: EventEmitter<any> = new EventEmitter();
  @Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
  @Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();

  public cellContext: {
    column?: Datagrid.Column;
    row?: any;
    options?: Datagrid.Options;
    value?: any;
  } = {};

  /** During a resize, disable some stuff */
  public reSizing = false;

  //public columnWidth: string = '';
  public dragStartProp: string;

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    // this.cellContext.column = this.column;
    // this.cellContext.row = this.row;
    // this.cellContext.options = this.options;
    // this.cellContext.value = this.row[this.column.prop];
    // if (this.columns) {
    //		this.columnsOriginal = [...this.columns];
    // }
  }

  /**
   * Pass state changes up from controls component
   * @param event
   */
  public stateUpdated(event: Datagrid.State) {
    this.onStateUpdated.emit(event);
  }

  /**
   * Emit a custom link event response up to the parent component
   * @param data
   */
  public customLinkEvent(data: { link: Datagrid.ControlsCustomLinksGroup; column: Datagrid.Column }) {
    this.onCustomLinkEvent.emit(data);
  }

  /**
   * Return a unique ID to ngfor to improve performance
   * @param index - Number in array
   * @param item - The column
   */
  public trackColumn(_index: number, item: Datagrid.Column) {
    return item.$$track;
  }

  /**
   * On a successful drag reorder of the column headers
   */
  public dragDrop(type: 'pinnedLeft' | 'main', columnNewPosition: number) {
    // console.log('onReorderSuccess', this.dragStartProp, columnNewPosition);
    // If columns are being dragged before a pinned column, set that column to pinned
    let isPinned = false;
    const payload = { action: 'reorder', type: type, prop: this.dragStartProp, columnIndex: columnNewPosition };

    for (let i = this.columns.length - 1; i >= 0; i--) {
      const column = this.columns[i];
      if (column.pinnedLeft) {
        isPinned = true;
      }
      column.locked = isPinned;
      column.pinnedLeft = isPinned;
    }

    this.onColumnsUpdated.emit(payload);
  }

  /**
   * If the column was resized
   * @param event
   */
  public onResizeEnd(event: any, columnIndex: number, type: 'pinnedLeft' | 'main') {
    //console.warn('onResizeEnd', columnIndex, type, Math.floor(event.rectangle.width / 2) * 2)

    let width = Math.floor(event.rectangle.width / 2) * 2; // Round to nearest 2 pixels to prevent rendering issues in chrome
    // Min column size 44 px
    if (width < 44) {
      width = 44;
    }
    this.reSizing = false;

    this.onColumnsUpdated.emit({ action: 'resize', columnIndex: columnIndex, type: type, width: width });
  }
}
