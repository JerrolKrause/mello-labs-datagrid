/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { Datagrid } from "../../../typings";
var HeaderRowComponent = /** @class */ (function () {
    function HeaderRowComponent() {
    }
    /**
     * @return {?}
     */
    HeaderRowComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    HeaderRowComponent.prototype.ngOnChanges = /**
     * @return {?}
     */
    function () {
        // this.cellContext.column = this.column;
        // this.cellContext.row = this.row;
        // this.cellContext.options = this.options;
        // this.cellContext.value = this.row[this.column.prop];
        // if (this.columns) {
        //		this.columnsOriginal = [...this.columns];
        // }
    };
    /**
     * Pass state changes up from controls component
     * @param {?} event
     * @return {?}
     */
    HeaderRowComponent.prototype.stateUpdated = /**
     * Pass state changes up from controls component
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this.onStateUpdated.emit(event);
    };
    /**
     * Emit a custom link event response up to the parent component
     * @param {?} data
     * @return {?}
     */
    HeaderRowComponent.prototype.customLinkEvent = /**
     * Emit a custom link event response up to the parent component
     * @param {?} data
     * @return {?}
     */
    function (data) {
        this.onCustomLinkEvent.emit(data);
    };
    /**
     * Return a unique ID to ngfor to improve performance
     * @param {?} _index
     * @param {?} item - The column
     * @return {?}
     */
    HeaderRowComponent.prototype.trackColumn = /**
     * Return a unique ID to ngfor to improve performance
     * @param {?} _index
     * @param {?} item - The column
     * @return {?}
     */
    function (_index, item) {
        return item.$$track;
    };
    /**
     * On a successful drag reorder of the column headers
     * @param {?} type
     * @param {?} columnNewPosition
     * @return {?}
     */
    HeaderRowComponent.prototype.dragDrop = /**
     * On a successful drag reorder of the column headers
     * @param {?} type
     * @param {?} columnNewPosition
     * @return {?}
     */
    function (type, columnNewPosition) {
        // console.log('onReorderSuccess', this.dragStartProp, columnNewPosition);
        // If columns are being dragged before a pinned column, set that column to pinned
        var /** @type {?} */ isPinned = false;
        var /** @type {?} */ payload = { action: 'reorder', type: type, prop: this.dragStartProp, columnIndex: columnNewPosition };
        for (var /** @type {?} */ i = this.columns.length - 1; i >= 0; i--) {
            var /** @type {?} */ column = this.columns[i];
            if (column.pinnedLeft) {
                isPinned = true;
            }
            column.locked = isPinned;
            column.pinnedLeft = isPinned;
        }
        this.onColumnsUpdated.emit(payload);
    };
    /**
     * If the column was resized
     * @param {?} event
     * @param {?} columnIndex
     * @param {?} type
     * @return {?}
     */
    HeaderRowComponent.prototype.onResizeEnd = /**
     * If the column was resized
     * @param {?} event
     * @param {?} columnIndex
     * @param {?} type
     * @return {?}
     */
    function (event, columnIndex, type) {
        //console.warn('onResizeEnd', columnIndex, type, Math.floor(event.rectangle.width / 2) * 2)
        var /** @type {?} */ width = Math.floor(event.rectangle.width / 2) * 2; // Round to nearest 2 pixels to prevent rendering issues in chrome
        // Min column size 44 px
        // Min column size 44 px
        if (width < 44) {
            width = 44;
        }
        this.reSizing = false;
        this.onColumnsUpdated.emit({ action: 'resize', columnIndex: columnIndex, type: type, width: width });
    };
    return HeaderRowComponent;
}());
export { HeaderRowComponent };
function HeaderRowComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    HeaderRowComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    HeaderRowComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    HeaderRowComponent.propDecorators;
    /** @type {?} */
    HeaderRowComponent.prototype.columns;
    /** @type {?} */
    HeaderRowComponent.prototype.state;
    /** @type {?} */
    HeaderRowComponent.prototype.status;
    /** @type {?} */
    HeaderRowComponent.prototype.options;
    /** @type {?} */
    HeaderRowComponent.prototype.scrollProps;
    /** @type {?} */
    HeaderRowComponent.prototype.filterTerms;
    /** @type {?} */
    HeaderRowComponent.prototype.columnType;
    /** @type {?} */
    HeaderRowComponent.prototype.onColumnsUpdated;
    /** @type {?} */
    HeaderRowComponent.prototype.onStateUpdated;
    /** @type {?} */
    HeaderRowComponent.prototype.onCustomLinkEvent;
    /** @type {?} */
    HeaderRowComponent.prototype.cellContext;
    /**
     * During a resize, disable some stuff
     * @type {?}
     */
    HeaderRowComponent.prototype.reSizing;
    /** @type {?} */
    HeaderRowComponent.prototype.dragStartProp;
}
