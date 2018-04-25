/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap"; // Bootstrap
// Components
// Components
import { DataGridComponent } from "./components/datagrid.component";
import { HeaderComponent } from "./components/header/header.component";
import { FiltersComponent } from "./components/header/filters/filters.component";
import { ControlsComponent } from "./components/header/controls/controls.component";
import { HeaderRowComponent } from "./components/header/row/row.component";
import { BodyComponent } from "./components/body/body.component";
import { GroupHeaderComponent } from "./components/body/header/group-header.component";
import { RowComponent } from "./components/body/row/row.component";
import { CellComponent } from "./components/body/cell/cell.component";
import { InfoComponent } from "./components/info/info.component";
// Directives
// Directives
import { DataTableColumnDirective } from "./directives/column.directive";
import { DataGridColumnCellDirective } from "./directives/cell-body.directive";
import { DataGridColumnHeaderDirective } from "./directives/cell-header.directive";
// Services
// Services
import { DataGridService } from "./services/datagrid.service";
// 3rd party controls
// 3rd party controls
import { ResizableModule } from "angular-resizable-element";
export { } from "./typings";
var DatagridModule = /** @class */ (function () {
    function DatagridModule() {
    }
    /**
     * @return {?}
     */
    DatagridModule.forRoot = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: DatagridModule,
            providers: [DataGridService],
        };
    };
    return DatagridModule;
}());
export { DatagridModule };
function DatagridModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    DatagridModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    DatagridModule.ctorParameters;
}
