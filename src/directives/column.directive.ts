import { Directive, TemplateRef, ContentChild, Input } from '@angular/core';


@Directive({ selector: '[datagrid-column]' })
export class ColumnDirective {

    
    @Input() prop: string;

    constructor() {
        console.log(this.prop);
    }

    /*
    @Input()
    @ContentChild(DataTableColumnCellDirective, { read: TemplateRef })
    cellTemplate: TemplateRef<any>;

    @Input()
    @ContentChild(DataTableColumnHeaderDirective, { read: TemplateRef })
    headerTemplate: TemplateRef<any>;
    */
}
