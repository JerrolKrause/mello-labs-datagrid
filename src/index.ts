import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Bootstrap

import { DataGridService } from './datagrid.service';
import { DataGridComponent } from './datagrid.component';

import { HeaderComponent } from './header/header.component';
import { FiltersComponent } from './header/filters/filters.component';
import { ControlsComponent } from './header/controls/controls.component';

import { BodyComponent } from './body/body.component';
import { GroupHeaderComponent } from './body/header/group-header.component';
import { RowComponent } from './body/row/row.component';
import { CellComponent } from './body/cell/cell.component';

import { InfoComponent } from './info/info.component';

// 3rd party controls
import { DndModule } from 'ng2-dnd'; // Drag and drop
//import { ResizableModule } from '../../../angular-resizable-element';

// This is application specific code that should NOT be here. This will need to be removed once transcludable cell templates are added
import { TemplatesCellComponent } from './templates/templates-cell.component';


@NgModule({
  imports: [
    CommonModule, NgbModule.forRoot(), FormsModule, DndModule.forRoot()//, ResizableModule 
  ],
  declarations: [
   DataGridComponent, RowComponent, GroupHeaderComponent, HeaderComponent, ControlsComponent, FiltersComponent, BodyComponent, CellComponent, TemplatesCellComponent, InfoComponent
  ],
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
