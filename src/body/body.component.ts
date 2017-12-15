import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Actions } from '../datagrid.props';
import { Datagrid } from '../datagrid';

@Component({
    selector: 'datagrid-body',
	templateUrl: './body.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyComponent implements OnInit, OnChanges{

	@Input() columnsInternal: Datagrid.Column[];
	@Input() columnsPinned: Datagrid.Column[];
	@Input() rowsInternal: any[];
	@Input() state: Datagrid.State;
	@Input() status: Datagrid.Status;
	@Input() options: Datagrid.Options;
	@Input() gridProps: Datagrid.Props;
	@Input() colsVisible: Datagrid.ColsVisible;

	@Output() onColumnsUpdated: EventEmitter<any[]> = new EventEmitter();
	@Output() onStateUpdated: EventEmitter<any> = new EventEmitter();
	@Output() onCustomLinkEvent: EventEmitter<any> = new EventEmitter();

	constructor(
    ) { }

	ngOnInit() {
	}

	ngOnChanges(model) {
		//console.log('BodyComponent',model)
	}

    /**
     * Return a unique ID to ngfor to improve performance
     * @param index - Number in array
     * @param item - The column
     */
	public trackColumn(index: number, item: Datagrid.Column) {
		return item.prop;
	}
	
    
}
