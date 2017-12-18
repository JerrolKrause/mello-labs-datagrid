import { Component, OnInit, ChangeDetectionStrategy, Input, ViewContainerRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { Datagrid } from '../typings';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'templates-cell',
	templateUrl: './templates-cell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesCellComponent implements OnInit {

	@Input() column: Datagrid.Column;
	@Input() options: Datagrid.Options;
    @Input() rowData: any;

    @Output() updateDatatable: EventEmitter<any> = new EventEmitter();

	public model: any;
	public modelValue: string;
	public modelLabel: string;

	constructor(
    ) { }

	ngOnInit() {
		
	}


}
