import { Directive, TemplateRef, ContentChild, Input } from '@angular/core';
import { DataGridColumnHeaderDirective } from './cell-header.directive';
import { DataGridColumnCellDirective } from './cell-body.directive';

@Directive({ selector: 'datagrid-column' })
export class DataTableColumnDirective {
  @Input() name: string;
  @Input() prop: string;
  //Add custom props here for overrides in the cell templates

  // Cell Templates
  @Input()
  @ContentChild(DataGridColumnCellDirective, { read: TemplateRef })
  templateCell: TemplateRef<any>;

  // Header Templates
  @Input()
  @ContentChild(DataGridColumnHeaderDirective, { read: TemplateRef })
  templateHeader: TemplateRef<any>;
}
