import { Component, OnInit, ChangeDetectionStrategy, Input, ViewContainerRef, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit, OnChanges } from '@angular/core';
import { Datagrid } from '../../../typings';
import { BehaviorSubject } from 'rxjs';


@Component({
    selector: 'datagrid-cell',
    templateUrl: './cell.component.html',
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellComponent implements OnInit, OnChanges, AfterViewInit {

	@Input() column: Datagrid.Column;
	@Input() row: any;
	@Input() options: Datagrid.Options;

	@Output() updateDatatable: EventEmitter<any> = new EventEmitter();

    /** Is the content truncated, IE is the content inside the cell wider than the parent container */
	public truncated$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	private loaded: boolean = false;

	constructor(
	) { 
		this.updateDatatable = new EventEmitter();
		this.truncated$ = new BehaviorSubject(false);
		this.loaded  = false;
	}

	ngOnInit() {
	}

	ngOnChanges() {
		//console.log(this.row, this.column);
		//if (this.loaded) {
		//	this.checkIfTruncated();
		//}
	}

	ngAfterViewInit() {
		//this.checkIfTruncated();
		//this.loaded = true;
	}

    /**
     * Check if the content is truncated 
    
	public checkIfTruncated() {
		if (this.options.columnsTruncate && this.cell3.nativeElement.offsetWidth > this.cell2.nativeElement.offsetWidth) {
			this.truncated$.next(true);
		} else {
			this.truncated$.next(false);
		}
	}
	 */
    /**
    * Perform an action on the main datatable that was requested by lower component
    * @param action
    */
    public onUpdateDatatable(action: 'update' | 'reset') {
        this.updateDatatable.emit(action);
    }

}
