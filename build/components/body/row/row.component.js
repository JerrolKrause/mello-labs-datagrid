/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ElementRef, OnChanges, } from "@angular/core";
import { Datagrid } from "../../../typings";
var RowComponent = /** @class */ (function () {
    function RowComponent(elementRef) {
        this.elementRef = elementRef;
    }
    /**
     * @return {?}
     */
    RowComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    RowComponent.prototype.ngOnChanges = /**
     * @return {?}
     */
    function () { };
    /**
     * Return a unique ID to ngfor to improve performance
     * @param {?} _index
     * @param {?} item - The column
     * @return {?}
     */
    RowComponent.prototype.trackColumn = /**
     * Return a unique ID to ngfor to improve performance
     * @param {?} _index
     * @param {?} item - The column
     * @return {?}
     */
    function (_index, item) {
        return item.$$track;
    };
    /**
     * Perform an action on the main datatable that was requested by lower component
     * @param {?} action
     * @return {?}
     */
    RowComponent.prototype.onUpdateDatatable = /**
     * Perform an action on the main datatable that was requested by lower component
     * @param {?} action
     * @return {?}
     */
    function (action) {
        this.updateDatatable.emit(action);
    };
    /**
     * Pass updated field up the component chain
     * @param {?} event
     * @return {?}
     */
    RowComponent.prototype.rowUpdated = /**
     * Pass updated field up the component chain
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this.onRowUpdated.emit(event);
    };
    return RowComponent;
}());
export { RowComponent };
function RowComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    RowComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    RowComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    RowComponent.propDecorators;
    /** @type {?} */
    RowComponent.prototype.columns;
    /** @type {?} */
    RowComponent.prototype.options;
    /** @type {?} */
    RowComponent.prototype.row;
    /** @type {?} */
    RowComponent.prototype.updateDatatable;
    /** @type {?} */
    RowComponent.prototype.onRowUpdated;
    /** @type {?} */
    RowComponent.prototype.elementRef;
}
