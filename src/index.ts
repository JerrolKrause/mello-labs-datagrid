import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Bootstrap

// Components
import { DataGridComponent } from './components/datagrid.component';

import { HeaderComponent } from './components/header/header.component';
import { FiltersComponent } from './components/header/filters/filters.component';
import { ControlsComponent } from './components/header/controls/controls.component';
import { HeaderRowComponent } from './components/header/row/row.component';

import { BodyComponent } from './components/body/body.component';
import { GroupHeaderComponent } from './components/body/header/group-header.component';
import { RowComponent } from './components/body/row/row.component';
import { CellComponent } from './components/body/cell/cell.component';

import { InfoComponent } from './components/info/info.component';

// Directives
import { DataTableColumnDirective } from './directives/column.directive';
import { DataGridColumnCellDirective } from './directives/cell-body.directive';
import { DataGridColumnHeaderDirective } from './directives/cell-header.directive';

// Services
import { DataGridService } from './services/datagrid.service';

// 3rd party controls
import { ResizableModule } from 'angular-resizable-element';

export * from './models/typings';

@NgModule({
  imports: [CommonModule, NgbModule.forRoot(), FormsModule, ResizableModule],
  declarations: [
    DataGridComponent,
    RowComponent,
    GroupHeaderComponent,
    HeaderComponent,
    ControlsComponent,
    FiltersComponent,
    BodyComponent,
    CellComponent,
    InfoComponent,
    HeaderRowComponent,

    DataTableColumnDirective,
    DataGridColumnCellDirective,
    DataGridColumnHeaderDirective,
  ],
  providers: [DataGridService],
  exports: [DataGridComponent, DataTableColumnDirective, DataGridColumnCellDirective, DataGridColumnHeaderDirective],
})
export class DatagridModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DatagridModule,
      providers: [DataGridService],
    };
  }
}
