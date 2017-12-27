/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

//import { DataGridComponent } from '../src/datagrid.component';
import { DatagridModule  } from '../src/';

@Component({
  selector: 'app',
  template: `<datagrid></datagrid>`
})
class AppComponent {}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [AppComponent ],
  imports: [BrowserModule, DatagridModule ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
