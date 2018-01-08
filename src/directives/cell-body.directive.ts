import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[datagrid-cell-template]' })
export class DataGridColumnCellDirective {
    constructor(public template: TemplateRef<any>) { }
}
