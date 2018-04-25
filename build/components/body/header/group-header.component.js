/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy, OnChanges, } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { Datagrid } from "../../../typings";
var GroupHeaderComponent = /** @class */ (function () {
    function GroupHeaderComponent() {
    }
    /**
     * @return {?}
     */
    GroupHeaderComponent.prototype.ngOnChanges = /**
     * @return {?}
     */
    function () {
        // Everytime new data is passed down, recreate the label
        this.createGroupLabel(this.group, this.options);
    };
    /**
     * @return {?}
     */
    GroupHeaderComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () { };
    /**
     * Toggle group visibility
     * @param {?} group
     * @param {?} $event
     * @return {?}
     */
    GroupHeaderComponent.prototype.toggleGroup = /**
     * Toggle group visibility
     * @param {?} group
     * @param {?} $event
     * @return {?}
     */
    function (group, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        if (group && group.rows) {
            group.rows.forEach(function (row) {
                if (!row.$$hidden) {
                    row.$$hidden = true;
                }
                else {
                    row.$$hidden = false;
                }
            });
            this.group.visible = !this.group.visible;
            this.active = !this.active;
            this.onGroupToggled.emit(this.group);
        }
    };
    /**
     * Create the label for the group
     * @param {?} group
     * @param {?} options
     * @return {?}
     */
    GroupHeaderComponent.prototype.createGroupLabel = /**
     * Create the label for the group
     * @param {?} group
     * @param {?} options
     * @return {?}
     */
    function (group, options) {
        var _this = this;
        // If columnData has been supplied then the app needs to get the group header label from within that data
        // If columnData has been supplied then the app needs to get the group header label from within that data
        if (group &&
            group.columnProp &&
            options.columnData &&
            options.columnData[group.columnProp] &&
            options.columnData[group.columnProp].model) {
            // Sub to the observable
            this.sub = options.columnData[group.columnProp].model.subscribe(function (model) {
                // If this row property is an array, join all possible settings
                // If this row property is an array, join all possible settings
                if (options.columnData && group && group.label && Array.isArray(group.label) && group.columnProp && group.rows) {
                    var /** @type {?} */ columnData_1 = options.columnData[group.columnProp];
                    var /** @type {?} */ newLabel_1 = [];
                    // Loop through the labels in the group prop
                    group.rows[0][group.columnProp].forEach(function (id) {
                        model[columnData_1.modelSrc].forEach(function (element) {
                            if (id === element[columnData_1.value]) {
                                newLabel_1.push(element[columnData_1.label]);
                            }
                        });
                    });
                    _this.groupLabel = newLabel_1.length ? newLabel_1.join(' & ') : 'Missing Value';
                }
                else {
                    // If this row property is NOT an array
                    // If this row property is NOT an array
                    _this.groupLabel = 'No Value';
                }
            });
        }
        else {
            // No columnData provided
            this.groupLabel = this.group.label ? this.group.label : 'No Value';
        }
    };
    /**
     * @return {?}
     */
    GroupHeaderComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    };
    return GroupHeaderComponent;
}());
export { GroupHeaderComponent };
function GroupHeaderComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    GroupHeaderComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    GroupHeaderComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    GroupHeaderComponent.propDecorators;
    /** @type {?} */
    GroupHeaderComponent.prototype.width;
    /** @type {?} */
    GroupHeaderComponent.prototype.group;
    /** @type {?} */
    GroupHeaderComponent.prototype.options;
    /** @type {?} */
    GroupHeaderComponent.prototype.onGroupToggled;
    /** @type {?} */
    GroupHeaderComponent.prototype.groupLabel;
    /** @type {?} */
    GroupHeaderComponent.prototype.active;
    /** @type {?} */
    GroupHeaderComponent.prototype.sub;
}
