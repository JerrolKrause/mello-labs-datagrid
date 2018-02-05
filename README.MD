# @mello-labs/datagrid

## Installation

To install this library, run:

```bash
$ npm install @mello-labs/datagrid --save
```

## Consuming your library

Once you have published your library to npm, you can import your library in any Angular application by running:

```bash
$ npm install @mello-labs/datagrid
```

and then from your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import your library
import { DatagridModule } from '@mello-labs/datagrid';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // Specify your library as an import
    DatagridModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Once your library is imported, you can use its components, directives and pipes in your Angular application:

```xml
<!-- You can now use your library component in app.component.html -->
<datagrid #datagrid
            [rows]="rows$ | async"
            [columns]="columns$ | async"
            [state]="state"
            [options]="options"
            (onStateChange)="onStateChange($event)"
            (onRowsSelected)="onRowsSelected($event)"
            (onRowUpdated)="onRowUpdated($event)">
    <!-- Custom templates, prop corresponds to column property -->
    <datagrid-column prop="LNKey">
        <!-- Header template -->
        <ng-template let-value="value" let-column="column" let-row="row" datagrid-header-template>
            {{column.name}}
        </ng-template>
        <!-- Cell template -->
        <ng-template let-value="value" let-column="column" let-row="row" datagrid-cell-template>
            <strong>{{value}}</strong> - {{column.prop}}
        </ng-template>
    </datagrid-column>
</datagrid>
```

```typescript
import { Datagrid } from '@mello-labs/datagrid';

// Inputs
public options: Datagrid.Options = {
    scrollbarH: true,
    selectionType: 'multi',
    fullScreen: true,
    controlsDropdown: true,
    showInfo: true,
    trackRow: (index, row) => row.LNKey,
    primaryKey: 'LNKey',
    rowStyle: [
    {
            model: this.api.get('/assets/mock/rowstyles.json'),
            rules: (row, model) => {
                //console.log('rowStyle', row, model);
            let styles = {};
            if (model.rowColors.lookup && model.rowColors.lookup[row.LNKey] && model.rowColors.lookup[row.LNKey].tagDefId && model.tagDefs.lookup && model.tagDefs.lookup[model.rowColors.lookup[row.LNKey].tagDefId]) {
                styles['background-color'] = model.tagDefs.lookup[model.rowColors.lookup[row.LNKey].tagDefId].tagColor;
                styles['color'] = model.tagDefs.lookup[model.rowColors.lookup[row.LNKey].tagDefId].fontColor;
            }
            return styles;
        }
    }
  ],
}

public columns: Datagrid.Column[] = [
	{
		prop: 'name',
		label: 'Name',
		columnType: 'string',
		canSort: true,
		canGroup: true,
		canFilter: true
	},
	{
		prop: 'pod',
		label: 'POD',
		columnType: 'string',
		width: 70,
		canSort: true,
		canGroup: true,
		canFilter: true
	}	
];

public state = { "filters": [], "sorts": [], "groups": [{ "dir": "asc", "prop": "State" }] };
public rows$: Observable<any[]> = this.api.get('/assets/mock/pipeline-sm.json');

// Methods
/**
 * When the state has been changed (grouping/filtering/sorting/etc)
 * @param event
 */
public onStateChange(event) {
    console.log('onStateChange', event, JSON.stringify(event));
}

/**
 * When rows have been selected
 * @param event
 */
public onRowsSelected(event) {
    console.log('onRowsSelected', event);
}

/**
 * When a row has been edited
 * @param event
 */
public onRowUpdated(event) {
    console.log('onRowUpdated', event);
}

/**
 * When columns have been updated, IE resizing/sorting etc
 * @param event
 */
public onColumnsUpdated(event) {
    console.log('onColumnsUpdated', event);
}

/**
 * On a right click event within the datatable
 * @param event
 */
public onRightClickMenu(event) {
    console.log('onRightClickMenu', event);
}

/**
 * When a custom link was clicked
 * @param event
 */
public onCustomLinkEvent(event) {
    console.log('onCustomLinkEvent', event);
}

```

## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

## License

MIT © [Jerrol Krause](mailto:jerrolkrause@gmail.com)
