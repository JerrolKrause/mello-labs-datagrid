import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[datagrid-header-template]' })
export class DataGridColumnHeaderDirective {
    constructor(public template: TemplateRef<any>) { }
}
