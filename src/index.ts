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
import { ColumnDirective } from './directives/column.directive';


// Services
import { DataGridService } from './datagrid.service';

// 3rd party controls  
import { DndModule } from 'ng2-dnd'; // Drag and drop
//import { ResizableModule } from '../../../angular-resizable-element';


export * from './typings';
export * from './datagrid.service';
 
@NgModule({
  imports: [
    CommonModule, NgbModule.forRoot(), FormsModule, DndModule.forRoot()//, ResizableModule  
  ],
  declarations: [
      DataGridComponent, RowComponent, GroupHeaderComponent, HeaderComponent, ControlsComponent, FiltersComponent, BodyComponent, CellComponent, 
      InfoComponent, HeaderRowComponent,

      ColumnDirective
  ],
  providers:[DataGridService],
  exports: [
   DataGridComponent
  ]
})
export class DatagridModule {
  static forRoot(): ModuleWithProviders {
    return {
		ngModule: DatagridModule,
		providers: [DataGridService]
    };
  }
}
