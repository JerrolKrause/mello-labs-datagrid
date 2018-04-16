import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Datagrid } from '../../../typings';

@Component({
  selector: 'group-header',
  templateUrl: './group-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupHeaderComponent implements OnInit, OnChanges, OnDestroy {
  @Input() width: number;
  @Input() group: Datagrid.Group;
  @Input() options: Datagrid.Options;

  @Output() onGroupToggled: EventEmitter<any> = new EventEmitter();

  public groupLabel = '';
  public active = true;

  private sub: Subscription;

  constructor() {}

  ngOnChanges() {
    // Everytime new data is passed down, recreate the label
    this.createGroupLabel(this.group, this.options);
  }

  ngOnInit() {}

  /**
   * Toggle group visibility
   * @param group
   */
  public toggleGroup(group: Datagrid.Group, $event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    if (group && group.rows) {
      group.rows.forEach(row => {
        if (!row.$$hidden) {
          row.$$hidden = true;
        } else {
          row.$$hidden = false;
        }
      });

      this.group.visible = !this.group.visible;
      this.active = !this.active;

      this.onGroupToggled.emit(this.group);
    }
  }

  /**
   * Create the label for the group
   */
  private createGroupLabel(group: Datagrid.Group, options: Datagrid.Options) {
    // If columnData has been supplied then the app needs to get the group header label from within that data
    if (
      group &&
      group.columnProp &&
      options.columnData &&
      options.columnData[group.columnProp] &&
      options.columnData[group.columnProp].model
    ) {
      // Sub to the observable
      this.sub = options.columnData[group.columnProp].model.subscribe(model => {

        // If this row property is an array, join all possible settings
          if (options.columnData && group && group.label && Array.isArray(group.label) && group.columnProp && group.rows) {
              const columnData = options.columnData[group.columnProp];
              const newLabel: any[] = [];
          // Loop through the labels in the group prop
          group.rows[0][group.columnProp].forEach((id: string) => {
            model[columnData.modelSrc].forEach((element: any) => {
              if (id === element[columnData.value]) {
                newLabel.push(element[columnData.label]);
              }
            });
          });
          this.groupLabel = newLabel.length ? newLabel.join(' & ') : 'Missing Value';
        } else {
          // If this row property is NOT an array
          this.groupLabel = 'No Value';
        }
      });
    } else {
      // No columnData provided
      this.groupLabel = this.group.label ? this.group.label : 'No Value';
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
