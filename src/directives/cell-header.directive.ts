import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[datagrid-header-template]' })
export class DataTableColumnHeaderDirective {
    constructor(public template: TemplateRef<any>) { }
}
