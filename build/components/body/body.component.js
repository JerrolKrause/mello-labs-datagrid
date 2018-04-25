/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ElementRef, NgZone, } from "@angular/core";
import { Datagrid } from "../../typings";
import * as _ from "lodash";
var BodyComponent = /** @class */ (function () {
    function BodyComponent(zone, element) {
        this.zone = zone;
        this.body = element.nativeElement;
    }
    /**
     * @return {?}
     */
    BodyComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        // Attach scroll event listener
        this.zone.runOutsideAngular(function () {
            _this.body.addEventListener('scroll', _this.onScrollThrottled.bind(_this), /** @type {?} */ ({ capture: true, passive: true }));
        });
    };
    /**
     * When the datatable is scrolled
     * @param {?} event
     * @return {?}
     */
    BodyComponent.prototype.onScroll = /**
     * When the datatable is scrolled
     * @param {?} event
     * @return {?}
     */
    function (event) {
        var _this = this;
        //console.log('onScroll', event.target.scrollTop);
        requestAnimationFrame(function () {
            var /** @type {?} */ scrollProps = {
                scrollTop: event.target.scrollTop,
                scrollLeft: event.target.scrollLeft,
            };
            _this.onScrollEvent.emit(scrollProps);
        });
    };
    /**
     * Return a unique ID to ngfor to improve performance
     * @param {?} _index
     * @param {?} item - The column
     * @return {?}
     */
    BodyComponent.prototype.trackRow = /**
     * Return a unique ID to ngfor to improve performance
     * @param {?} _index
     * @param {?} item - The column
     * @return {?}
     */
    function (_index, item) {
        //console.log('Tracking Rows');
        //console.log('Tracking Rows');
        return item.$$track;
    };
    /**
     * Communicate mouse events on the body row up to the parent. Used mainly for selection
     * @param {?} type
     * @param {?} rowIndex
     * @param {?=} event
     * @return {?}
     */
    BodyComponent.prototype.onMouseEvent = /**
     * Communicate mouse events on the body row up to the parent. Used mainly for selection
     * @param {?} type
     * @param {?} rowIndex
     * @param {?=} event
     * @return {?}
     */
    function (type, rowIndex, event) {
        this.onRowMouseEvent.emit({ type: type, rowIndex: rowIndex, event: event });
    };
    /**
     * Pass updated field up the component chain
     * @param {?} event
     * @param {?} rowIndex
     * @return {?}
     */
    BodyComponent.prototype.rowUpdated = /**
     * Pass updated field up the component chain
     * @param {?} event
     * @param {?} rowIndex
     * @return {?}
     */
    function (event, rowIndex) {
        event.rowIndex = rowIndex;
        this.onRowUpdated.emit(event);
    };
    /**
     * When a group is toggled
     * @param {?} group
     * @return {?}
     */
    BodyComponent.prototype.groupToggled = /**
     * When a group is toggled
     * @param {?} group
     * @return {?}
     */
    function (group) {
        this.onGroupToggled.emit(group);
    };
    /**
     * @return {?}
     */
    BodyComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        // Unsub from all subscriptions
        this.body.removeEventListener('scroll', this.onScrollThrottled.bind(this), /** @type {?} */ ({ capture: true, passive: true }));
    };
    return BodyComponent;
}());
export { BodyComponent };
function BodyComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    BodyComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    BodyComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    BodyComponent.propDecorators;
    /** @type {?} */
    BodyComponent.prototype.columns;
    /** @type {?} */
    BodyComponent.prototype.columnsPinnedLeft;
    /** @type {?} */
    BodyComponent.prototype.rows;
    /** @type {?} */
    BodyComponent.prototype.rowStyles;
    /** @type {?} */
    BodyComponent.prototype.state;
    /** @type {?} */
    BodyComponent.prototype.status;
    /** @type {?} */
    BodyComponent.prototype.options;
    /** @type {?} */
    BodyComponent.prototype.gridProps;
    /** @type {?} */
    BodyComponent.prototype.onColumnsUpdated;
    /** @type {?} */
    BodyComponent.prototype.onStateUpdated;
    /** @type {?} */
    BodyComponent.prototype.onCustomLinkEvent;
    /** @type {?} */
    BodyComponent.prototype.onRowUpdated;
    /** @type {?} */
    BodyComponent.prototype.onRowMouseEvent;
    /** @type {?} */
    BodyComponent.prototype.onGroupToggled;
    /** @type {?} */
    BodyComponent.prototype.onRightClick;
    /** @type {?} */
    BodyComponent.prototype.onRowMouseDown;
    /** @type {?} */
    BodyComponent.prototype.onRowMouseUp;
    /** @type {?} */
    BodyComponent.prototype.onScrollEvent;
    /** @type {?} */
    BodyComponent.prototype.body;
    /**
     * Throttle the scroll event
     * @type {?}
     */
    BodyComponent.prototype.onScrollThrottled;
    /** @type {?} */
    BodyComponent.prototype.zone;
}
