/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { Actions } from "../../../datagrid.props";
import { Datagrid } from "../../../typings";
var ControlsComponent = /** @class */ (function () {
    function ControlsComponent() {
    }
    /**
     * @return {?}
     */
    ControlsComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
    };
    /**
     * When the modify sort button is clicked
     * @param {?} action
     * @param {?} prop
     * @param {?=} direction
     * @return {?}
     */
    ControlsComponent.prototype.modifySorts = /**
     * When the modify sort button is clicked
     * @param {?} action
     * @param {?} prop
     * @param {?=} direction
     * @return {?}
     */
    function (action, prop, direction) {
        if (!direction) {
            direction = 'asc';
        }
        else if (direction === 'asc') {
            direction = 'desc';
        }
        else if (direction === 'desc') {
            direction = null;
        }
        this.modifyState(action, { dir: direction, prop: prop });
    };
    /**
     * Column pinning
     * @param {?} action
     * @param {?} column
     * @param {?=} index
     * @return {?}
     */
    ControlsComponent.prototype.modifyPinned = /**
     * Column pinning
     * @param {?} action
     * @param {?} column
     * @param {?=} index
     * @return {?}
     */
    function (action, column, index) {
        this.modifyState(action, { prop: column.prop, index: index, isPinned: column.pinnedLeft });
    };
    /**
     * Modify filter state
     * @param {?} data
     * @return {?}
     */
    ControlsComponent.prototype.modifyFilters = /**
     * Modify filter state
     * @param {?} data
     * @return {?}
     */
    function (data) {
        this.modifyState(Actions.filter, data);
    };
    /**
     * Clear all filters for this column
     * @param {?} columnProp
     * @return {?}
     */
    ControlsComponent.prototype.clearFilters = /**
     * Clear all filters for this column
     * @param {?} columnProp
     * @return {?}
     */
    function (columnProp) {
        this.modifyState(Actions.filter, { filterAction: 'clear', filter: { prop: columnProp } });
    };
    /**
     * When the modify state button is clicked
     * @param {?} action
     * @param {?} data
     * @return {?}
     */
    ControlsComponent.prototype.modifyState = /**
     * When the modify state button is clicked
     * @param {?} action
     * @param {?} data
     * @return {?}
     */
    function (action, data) {
        this.onStateUpdated.emit({ action: action, data: data });
    };
    /**
     * When a custom link is clicked, emit that value up to the parent
     * @param {?} link
     * @param {?} column
     * @return {?}
     */
    ControlsComponent.prototype.customLinkAction = /**
     * When a custom link is clicked, emit that value up to the parent
     * @param {?} link
     * @param {?} column
     * @return {?}
     */
    function (link, column) {
        this.onCustomLinkEvent.emit({ link: link, column: column });
    };
    /**
     * Delete a column
     * @param {?} columnIndex
     * @return {?}
     */
    ControlsComponent.prototype.deleteColumn = /**
     * Delete a column
     * @param {?} columnIndex
     * @return {?}
     */
    function (columnIndex) {
        this.modifyState(Actions.column, { action: 'delete', columnIndex: columnIndex });
    };
    /**
     * @return {?}
     */
    ControlsComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this.subs.length) {
            this.subs.forEach(function (sub) { return sub.unsubscribe(); });
        }
    };
    return ControlsComponent;
}());
export { ControlsComponent };
function ControlsComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    ControlsComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    ControlsComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    ControlsComponent.propDecorators;
    /** @type {?} */
    ControlsComponent.prototype.state;
    /** @type {?} */
    ControlsComponent.prototype.status;
    /** @type {?} */
    ControlsComponent.prototype.options;
    /** @type {?} */
    ControlsComponent.prototype.column;
    /** @type {?} */
    ControlsComponent.prototype.filterTerms;
    /** @type {?} */
    ControlsComponent.prototype.columnIndex;
    /** @type {?} */
    ControlsComponent.prototype.onStateUpdated;
    /** @type {?} */
    ControlsComponent.prototype.onCustomLinkEvent;
    /** @type {?} */
    ControlsComponent.prototype.subs;
}
