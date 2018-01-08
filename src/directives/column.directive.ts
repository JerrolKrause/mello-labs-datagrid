import { Directive, TemplateRef, ContentChild, Input } from '@angular/core';
import { DataTableColumnHeaderDirective } from './cell-header.directive';
import { DataTableColumnCellDirective } from './cell-body.directive';
//import { TableColumnProp } from '../../types';

@Directive({ selector: 'datagrid-column' })
export class DataTableColumnDirective {

    @Input() name: string;
    @Input() prop: string;
    @Input() frozenLeft: any;
    @Input() frozenRight: any;
    @Input() flexGrow: number;
    @Input() resizeable: boolean;
    @Input() comparator: any;
    @Input() pipe: any;
    @Input() sortable: boolean;
    @Input() draggable: boolean;
    @Input() canAutoResize: boolean;
    @Input() minWidth: number;
    @Input() width: number;
    @Input() maxWidth: number;
    @Input() checkboxable: boolean;
    @Input() headerCheckboxable: boolean;
    @Input() headerClass: string | ((data: any) => string | any);
    @Input() cellClass: string | ((data: any) => string | any);

    @Input()
    @ContentChild(DataTableColumnCellDirective, { read: TemplateRef })
    templateCell: TemplateRef<any>;

    @Input()
    @ContentChild(DataTableColumnHeaderDirective, { read: TemplateRef })
    templateHeader: TemplateRef<any>;
    
}
