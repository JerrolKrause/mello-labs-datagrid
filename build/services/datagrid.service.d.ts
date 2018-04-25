import { Datagrid } from '../typings';
export declare class DataGridService {
    uniqueId: string;
    cache: {
        sortArray: any;
        groupRows: any;
        filterArray: any;
    };
    constructor();
    /**
     * Maps external table/column/control properties to those needed by the datatable
     * @param array
     * @param mapObj
     */
    mapPropertiesDown(array: any[], mapObj: any): any[];
    /**
     * If external map properties are specified, map them back to the input types before emitting them up to the host component
     * @param array
     * @param mapObj
     */
    mapPropertiesUp(array: any[], mapObj: any): any[];
    /**
     * Map the columns into an object based on its property name
     * @param columns
     */
    mapColumns(columns: Datagrid.Column[]): {
        [key: string]: any;
    };
    /**
     * Get the rows that should be visible in the scroll port based on the vertical scroll position
     * @param rows
     */
    getVisibleRows(rows: any[], scrollProps: Datagrid.ScrollProps, rowsVisible: number, rowHeight: number): any[];
    /**
     * Create an object of columns that should be visible based on horizontal scroll width
     */
    getVisibleColumns(columns: any[], scrollProps: Datagrid.ScrollProps, gridProps: Datagrid.Props): any[];
    /**
     * Filters based on the global object. Also creates the necessary filter structure.
     * @param array
     */
    filterGlobal(array: any[], filterGlobal: Datagrid.FilterGlobal): any[];
    /**
     * Filter an array of objects with an array of filters
     * @param array
     * @param filters
     */
    filterArray(array: any[], filters: Datagrid.Filter[]): any[];
    /**
     * Sort an array based on a property and direction
     * @param array
     * @param prop
     * @param sortType
     */
    sortArray(array: any[], prop: string, sortType: string): any[];
    /**
     * Group rows by property. Grouping is essentially a multilevel sort
     * @param rows
     * @param columns
     * @param prop
     * @param sorts
     */
    groupRows(rows: any[], columns: Datagrid.Column[], groups: Datagrid.Sorts[], sorts: Datagrid.Sorts[], options: Datagrid.Options): {
        rows: any[];
        groups: Datagrid.Groupings;
    };
    /**
     * Create the statuses/state of the controls (filtering/grouping/sorting)
     * @param state
     */
    createStatuses(state: Datagrid.State, columns: Datagrid.Column[]): Datagrid.Status;
    /**
     * Look through the rows and assemble a an array of terms
     * @param columnProp
     */
    getDefaultTermsList(rows: any[], columns: Datagrid.Column[]): {
        [key: string]: any;
    };
    /**
     * Determine the horizontal position of grid cells
     */
    columnCalculations(columns: Datagrid.Column[], offset?: number): Datagrid.Column[];
    /**
     * If total combined width of grid cells is less than viewport, resize widths to match
     * @param columns
     * @param widthColumns
     * @param widthTable
     */
    columnsResize(columns: Datagrid.Column[], widthColumns: number, widthTable: number): {
        $$leftOffset?: number;
        $$index?: number;
        $$track?: string;
        $$width?: number;
        prop: string;
        label: string;
        labelProp?: string;
        width?: number;
        canAutoResize?: boolean;
        canResize?: boolean;
        canEdit?: boolean;
        canSearch?: boolean;
        canFilter?: boolean;
        canGroup?: boolean;
        canDropRow?: boolean;
        canPinLeft?: boolean;
        canPinRight?: boolean;
        canSort?: boolean;
        canReorder?: boolean;
        canDelete?: boolean;
        canEditPermission?: string;
        controlsCustomLinks?: Datagrid.ControlsCustomLinksGroup[];
        mapData?: string;
        mapDataLabel?: string;
        mapDataProp?: string;
        pipe?: string;
        editProp?: string;
        cellClass?: string;
        templateCell?: any;
        templateHeader?: any;
        templateDropRow?: string;
        pinnedLeft?: boolean;
        pinnedRight?: boolean;
        pinnedIndex?: number;
        columnType?: string;
        filters?: Datagrid.Filter[];
        isDefault?: any;
        locked?: any;
    }[];
    /**
     * Attach any templates to their respective columns
     * Not using map to update columns array because that would retrigger the column getter logic
     * @param columns
     * @param columnTemplates
     */
    templatesAddToColumns(columns: Datagrid.Column[], columnTemplates: {
        [key: string]: any;
    }): void;
    /**
     * Map custom templates to a usable object for references
     * @param arr
     */
    templatesMapColumns(arr: any[]): {
        [key: string]: any;
    };
    /**
     * Calculate row properties such as visibility, y position and index
     * @param rows
     * @param rowHeight
     * @param makeVisible
     */
    rowPositions(rows: any[], rowHeight: number, makeVisible?: boolean): any[];
}
