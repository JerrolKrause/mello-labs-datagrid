import { Directive, TemplateRef, ContentChild, Input, ContentChildren, ElementRef, QueryList } from '@angular/core';


@Directive({ selector: '[templates]' })
export class Templates {

    
    //@Input() prop: string;

    //@ContentChildren(ColumnDirective, { descendants: true, read: ElementRef }) template2: QueryList<ColumnDirective>;

    constructor() {
      
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
