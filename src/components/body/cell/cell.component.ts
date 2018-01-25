import {
  Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit, OnChanges,
  ViewContainerRef, OnDestroy
} from '@angular/core';
import { Datagrid } from '../../../typings';

@Component({
  selector: 'datagrid-cell',
  templateUrl: './cell.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy{

  @Input() column: Datagrid.Column;
  @Input() row: any;
  @Input() options: Datagrid.Options;

  @Output() updateDatatable: EventEmitter<any> = new EventEmitter();
  @Output() onRowUpdated: EventEmitter<any> = new EventEmitter();

  /** The popover used for inline editing */
	@ViewChild('p') p;
  /** The popover textarea for inline editing */
	@ViewChild('editBox') editBox: ElementRef;
  /** Reference to content inside the cell */
  @ViewChild('cellData') cellData: ElementRef;
  /** Reference to content inside the cell */
  @ViewChild('cellTemplate', { read: ViewContainerRef }) cellTemplate: ViewContainerRef;
  /** Use to pass internal data such as columns and rows to the templates projected from the parent component */
  public cellContext: {
    column?: Datagrid.Column,
    row?: any,
    options?: Datagrid.Options,
    value?: any
  } = {};
  /** Is the content truncated, IE is the content inside the cell wider than the parent container */
  public truncated = false;

  constructor(
  ) {
  }
  
  ngOnInit() { }

  ngOnChanges(model) {

    // console.log('Cell Changes', this.column.prop);
    this.checkTruncated();
    this.cellContext.column = this.column;
    this.cellContext.row = this.row;
    this.cellContext.options = this.options;
    this.cellContext.value = this.row[this.column.prop];
  }

  ngAfterViewInit() {
    this.checkTruncated();
  }

  /**
   * Check if the content is truncated
   */
  private checkTruncated() {
    // This is a slightly costly operation since so many cells are present, wrap in setTimeout to release the DOM
    setTimeout(() => {
      if (this.cellData &&
        this.cellData.nativeElement &&
        this.cellData.nativeElement.getBoundingClientRect().width > this.column.width) {
        this.truncated = true;
      } else {
        this.truncated = false;
      }
    }, 10);
  }

  /**
   * Open the edit note tooltip and set the focus
   * @param event
   */
  public fieldEdit(event) {
    if (this.column.canEdit) {
				this.p.open();
				setTimeout(() => this.editBox.nativeElement.focus());
    }
  }

  /**
   * When a field was edited/updated
   * @param event
   */
  public rowUpdated(event) {
    let valueOld = this.row[this.column.prop];
    this.row[this.column.prop] = event.target.value;

    let fieldData: Datagrid.FieldEdit = {
      valueNew: event.target.value,
      valueOld: valueOld,
      prop: this.column.prop,
      row: this.row
		}
		console.log(fieldData.valueNew, fieldData.valueOld)
    // If the data has changed
		if (fieldData.valueNew && fieldData.valueNew == fieldData.valueOld) {
				// Pass data up chain
				this.onRowUpdated.emit(fieldData);
		}
    
    // Fixes bug with ng-bootstrap not seeing close method
    setTimeout(() => this.p.close());

    event.preventDefault();
    event.stopPropagation();
  }

  /**
  * Perform an action on the main datatable that was requested by lower component
  * @param action
  */
  public onUpdateDatatable(action: 'update' | 'reset') {
    this.updateDatatable.emit(action);
  }

  ngOnDestroy(): void {
    // Clean up after custom cell templates
    if (this.cellTemplate) {
      this.cellTemplate.clear();
    }
  }


}
