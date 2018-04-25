/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from "@angular/core";
import { Datagrid } from "../../typings";
var HeaderComponent = /** @class */ (function () {
    /** During a resize, disable some stuff */
    //public reSizing: boolean = false;
    //public columnWidth: string = '';
    function HeaderComponent() {
    }
    /**
     * @return {?}
     */
    HeaderComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () { };
    /**
     * Pass state changes up from controls component
     * @param {?} event
     * @return {?}
     */
    HeaderComponent.prototype.stateUpdated = /**
     * Pass state changes up from controls component
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this.onStateUpdated.emit(event);
    };
    /**
     * Pass column changes up to the main datagrid
     * @param {?} event
     * @return {?}
     */
    HeaderComponent.prototype.columnsUpdated = /**
     * Pass column changes up to the main datagrid
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this.onColumnsUpdated.emit(event);
    };
    /**
     * Emit a custom link event response up to the parent component
     * @param {?} data
     * @return {?}
     */
    HeaderComponent.prototype.customLinkEvent = /**
     * Emit a custom link event response up to the parent component
     * @param {?} data
     * @return {?}
     */
    function (data) {
        this.onCustomLinkEvent.emit(data);
    };
    return HeaderComponent;
}());
export { HeaderComponent };
function HeaderComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    HeaderComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    HeaderComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    HeaderComponent.propDecorators;
    /** @type {?} */
    HeaderComponent.prototype.columns;
    /** @type {?} */
    HeaderComponent.prototype.columnsPinnedLeft;
    /** @type {?} */
    HeaderComponent.prototype.state;
    /** @type {?} */
    HeaderComponent.prototype.status;
    /** @type {?} */
    HeaderComponent.prototype.options;
    /** @type {?} */
    HeaderComponent.prototype.gridProps;
    /** @type {?} */
    HeaderComponent.prototype.scrollProps;
    /** @type {?} */
    HeaderComponent.prototype.filterTerms;
    /** @type {?} */
    HeaderComponent.prototype.onColumnsUpdated;
    /** @type {?} */
    HeaderComponent.prototype.onStateUpdated;
    /** @type {?} */
    HeaderComponent.prototype.onCustomLinkEvent;
}
