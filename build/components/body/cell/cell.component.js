/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit, OnChanges, ViewContainerRef, OnDestroy, } from "@angular/core";
import { Datagrid } from "../../../typings";
import { NgbPopover } from "@ng-bootstrap/ng-bootstrap";
var CellComponent = /** @class */ (function () {
    function CellComponent() {
    }
    /**
     * @return {?}
     */
    CellComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    CellComponent.prototype.ngOnChanges = /**
     * @return {?}
     */
    function () {
        if (this.row && this.column.prop) {
            this.checkTruncated();
            this.cellContext.column = this.column;
            this.cellContext.row = this.row;
            this.cellContext.options = this.options;
            this.cellContext.value = this.row[this.column.prop];
        }
    };
    /**
     * @return {?}
     */
    CellComponent.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        this.checkTruncated();
    };
    /**
     * Check if the content is truncated
     * @return {?}
     */
    CellComponent.prototype.checkTruncated = /**
     * Check if the content is truncated
     * @return {?}
     */
    function () {
        var _this = this;
        // This is a slightly costly operation since so many cells are present, wrap in setTimeout to release the DOM
        setTimeout(function () {
            if (_this.cellData &&
                _this.column &&
                _this.column.$$width &&
                _this.cellData.nativeElement &&
                _this.cellData.nativeElement.getBoundingClientRect().width > _this.column.$$width) {
                _this.truncated = true;
            }
            else {
                _this.truncated = false;
            }
        }, 10);
    };
    /**
     * Open the edit note tooltip and set the focus
     * @return {?}
     */
    CellComponent.prototype.fieldEdit = /**
     * Open the edit note tooltip and set the focus
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.column.canEdit) {
            this.p.open();
            setTimeout(function () { return _this.editBox.nativeElement.focus(); });
        }
    };
    /**
     * When a field was edited/updated
     * @param {?} event
     * @return {?}
     */
    CellComponent.prototype.rowUpdated = /**
     * When a field was edited/updated
     * @param {?} event
     * @return {?}
     */
    function (event) {
        var _this = this;
        if (this.column.prop && this.row) {
            var /** @type {?} */ valueOld = this.row[this.column.prop];
            this.row[this.column.prop] = event.target.value;
            var /** @type {?} */ fieldData = {
                valueNew: event.target.value,
                valueOld: valueOld,
                prop: this.column.prop,
                row: this.row,
            };
            // If the data has changed
            // If the data has changed
            if (fieldData.valueNew != fieldData.valueOld) {
                // Pass data up chain
                this.onRowUpdated.emit(fieldData);
            }
            // Fixes bug with ng-bootstrap not seeing close method
            setTimeout(function () { return _this.p.close(); });
        }
        event.preventDefault();
        event.stopPropagation();
    };
    /**
     * Perform an action on the main datatable that was requested by lower component
     * @param {?} action
     * @return {?}
     */
    CellComponent.prototype.onUpdateDatatable = /**
     * Perform an action on the main datatable that was requested by lower component
     * @param {?} action
     * @return {?}
     */
    function (action) {
        this.updateDatatable.emit(action);
    };
    /**
     * @return {?}
     */
    CellComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        // Clean up after custom cell templates
        // Clean up after custom cell templates
        if (this.cellTemplate) {
            this.cellTemplate.clear();
        }
    };
    return CellComponent;
}());
export { CellComponent };
function CellComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    CellComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    CellComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    CellComponent.propDecorators;
    /** @type {?} */
    CellComponent.prototype.column;
    /** @type {?} */
    CellComponent.prototype.row;
    /** @type {?} */
    CellComponent.prototype.options;
    /** @type {?} */
    CellComponent.prototype.updateDatatable;
    /** @type {?} */
    CellComponent.prototype.onRowUpdated;
    /**
     * The popover used for inline editing
     * @type {?}
     */
    CellComponent.prototype.p;
    /**
     * The popover textarea for inline editing
     * @type {?}
     */
    CellComponent.prototype.editBox;
    /**
     * Reference to content inside the cell
     * @type {?}
     */
    CellComponent.prototype.cellData;
    /**
     * Reference to content inside the cell
     * @type {?}
     */
    CellComponent.prototype.cellTemplate;
    /**
     * Use to pass internal data such as columns and rows to the templates projected from the parent component
     * @type {?}
     */
    CellComponent.prototype.cellContext;
    /**
     * Is the content truncated, IE is the content inside the cell wider than the parent container
     * @type {?}
     */
    CellComponent.prototype.truncated;
}
