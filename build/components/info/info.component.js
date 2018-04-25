/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output } from "@angular/core";
import { Datagrid } from "../../typings";
var InfoComponent = /** @class */ (function () {
    function InfoComponent() {
    }
    /**
     * @return {?}
     */
    InfoComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
    };
    /**
     * Reset one of the datatable controls
     * @param {?} resetType
     * @return {?}
     */
    InfoComponent.prototype.reset = /**
     * Reset one of the datatable controls
     * @param {?} resetType
     * @return {?}
     */
    function (resetType) {
        this.onReset.emit(resetType);
    };
    return InfoComponent;
}());
export { InfoComponent };
function InfoComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    InfoComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    InfoComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    InfoComponent.propDecorators;
    /** @type {?} */
    InfoComponent.prototype.state;
    /** @type {?} */
    InfoComponent.prototype.options;
    /** @type {?} */
    InfoComponent.prototype.columnsMapped;
    /** @type {?} */
    InfoComponent.prototype.onReset;
}
