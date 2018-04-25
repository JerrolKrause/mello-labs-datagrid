/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/operator/debounceTime";
import { Datagrid } from "../../../typings";
var FiltersComponent = /** @class */ (function () {
    function FiltersComponent() {
    }
    /**
     * @return {?}
     */
    FiltersComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        // Create an subscription to debounce the user input
        this.filterTerm.debounceTime(300).subscribe(function (filter) {
            if (filter) {
                _this.onFiltersUpdated.emit(filter);
            }
        });
        // If custom column data has been supplied
        // If custom column data has been supplied
        if (this.options.columnData) {
            var /** @type {?} */ sub = this.options.columnData[this.column.prop].model.subscribe(function (model) {
                if (_this.options.columnData) {
                    // If a modelSrc has been supplied, fetch data from that. If not get it straight from the model
                    // If a modelSrc has been supplied, fetch data from that. If not get it straight from the model
                    _this.model = _this.options.columnData[_this.column.prop].modelSrc
                        ? model[_this.options.columnData[_this.column.prop].modelSrc]
                        : model;
                    // Simplify some of the properties for easier use in the dom
                    // Simplify some of the properties for easier use in the dom
                    _this.modelLabel = _this.options.columnData[_this.column.prop].label || '';
                    _this.modelValue = _this.options.columnData[_this.column.prop].value || '';
                    _this.modelClasses = _this.options.columnData[_this.column.prop].classes || '';
                    _this.modelStyles = _this.options.columnData[_this.column.prop].styles || '';
                }
            });
            this.subs.push(sub);
        }
    };
    /**
     * When the open form filter is modified
     * @param {?} columnProp
     * @param {?} operator
     * @param {?} newTerm
     * @param {?} oldTerm
     * @return {?}
     */
    FiltersComponent.prototype.modifyFilter = /**
     * When the open form filter is modified
     * @param {?} columnProp
     * @param {?} operator
     * @param {?} newTerm
     * @param {?} oldTerm
     * @return {?}
     */
    function (columnProp, operator, newTerm, oldTerm) {
        // console.warn('modifyFilter',newTerm, oldTerm);
        var /** @type {?} */ filterObj = {
            filterAction: '',
            filter: { prop: columnProp, operator: operator, value: newTerm },
        };
        // Adding new filter
        // Adding new filter
        if ((oldTerm === '' || !oldTerm) && newTerm !== '') {
            filterObj.filterAction = 'add';
        }
        else if (newTerm === '' || newTerm == false || !newTerm || newTerm === oldTerm) {
            // Removing existing filter
            filterObj.filterAction = 'remove';
        }
        else if (newTerm !== oldTerm) {
            // Changing existing filter
            filterObj.filterAction = 'change';
        }
        //console.warn('modifyFilter 2', JSON.parse(JSON.stringify(filterObj)));
        this.filterTerm.next(filterObj);
    };
    /**
     * @return {?}
     */
    FiltersComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this.subs.length) {
            this.subs.forEach(function (sub) { return sub.unsubscribe(); });
        }
    };
    return FiltersComponent;
}());
export { FiltersComponent };
function FiltersComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    FiltersComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    FiltersComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    FiltersComponent.propDecorators;
    /** @type {?} */
    FiltersComponent.prototype.column;
    /** @type {?} */
    FiltersComponent.prototype.options;
    /** @type {?} */
    FiltersComponent.prototype.state;
    /** @type {?} */
    FiltersComponent.prototype.status;
    /** @type {?} */
    FiltersComponent.prototype.filterTerms;
    /** @type {?} */
    FiltersComponent.prototype.onFiltersUpdated;
    /** @type {?} */
    FiltersComponent.prototype.defaultList;
    /** @type {?} */
    FiltersComponent.prototype.model;
    /** @type {?} */
    FiltersComponent.prototype.modelLabel;
    /** @type {?} */
    FiltersComponent.prototype.modelValue;
    /** @type {?} */
    FiltersComponent.prototype.modelClasses;
    /** @type {?} */
    FiltersComponent.prototype.modelStyles;
    /** @type {?} */
    FiltersComponent.prototype.filterTerm;
    /** @type {?} */
    FiltersComponent.prototype.subs;
}
