import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Bootstrap

import { DataGridService } from './datagrid.service';
import { DataGridComponent } from './datagrid.component';

import { HeaderComponent } from './header/header.component';
import { FiltersComponent } from './header/filters/filters.component';
import { ControlsComponent } from './header/controls/controls.component';
 
import { BodyComponent } from './body/body.component';
import { GroupHeaderComponent } from './body/header/group-header.component';
import { RowComponent } from './body/row/row.component';
import { CellComponent } from './body/cell/cell.component';

import { InfoComponent } from './info/info.component';

//import { Datagrid } from './typings';

// 3rd party controls  
import { DndModule } from 'ng2-dnd'; // Drag and drop
//import { ResizableModule } from '../../../angular-resizable-element';
  
// This is application specific code that should NOT be here. This will need to be removed once transcludable cell templates are added
import { TemplatesCellComponent } from './templates/templates-cell.component';
export * from './typings';
 
@NgModule({
  imports: [
    CommonModule, NgbModule.forRoot(), FormsModule, DndModule.forRoot()//, ResizableModule  
  ],
  declarations: [
   DataGridComponent, RowComponent, GroupHeaderComponent, HeaderComponent, ControlsComponent, FiltersComponent, BodyComponent, CellComponent, TemplatesCellComponent, InfoComponent
  ],
  exports: [
   DataGridComponent
  ]
})
export class DatagridModule {
  static forRoot(): ModuleWithProviders {
    return {
		ngModule: DatagridModule,
		providers: [DataGridService]
    };
  }
}

/**
 * Datatable Definitions
 */
import { Observable } from 'rxjs/Observable';

declare namespace Datagrid {

	export interface Props {
		widthTotal?: number;
		widthPinned?: number;
		widthMain?: number;
		heightTotal?: number;
		rowsVisible?: number;
		rowsTotal?: number;
		widthBody?: number;
	}

	export interface ScrollProps {
		scrollTop?: number;
		scrollLeft?: number;
	}

	export interface ColsVisible {
		[key: string]: boolean;
	}

	export interface StateChange {
		action?: 'group' | 'sort' | 'filter' | 'pinLeft' | 'pinRight' | 'reset' | 'column';
		data?: {
			dir?: 'asc' | 'desc';
			prop?: string
		} | any;
	}

	export interface State {
		groups?: Sorts[],
		sorts?: Sorts[],
		filters?: Filter[],
		info?: {
			rowsTotal?: number,
			rowsVisible?: number
			initial?: boolean
		}
	}

	export interface Status {
		groups?: {};
		sorts?: {};
		filters?: {};
	}

	export interface Filter {
		prop: string;
		operator: string;
		value: string;
	}

	export interface Sorts {
		dir?: string;
		prop?: string;
	}

	export interface Options {
		/** Tells the datatable which cell templates to use in the templates file. This is a temporary workaround until transcluded templates become possible */
		templatesId?: string,
		/** Allows selection of rows, options are: false, single, multi, multiClick, chkbox */
		selectionType?: false | 'single' | 'multi',
		/** Enables vertical scrollbars */
		scrollbarV?: boolean,
		/** Enables horizontal scrollbars */
		scrollbarH?: boolean,
		/** A unique ID for each row object. Currently used for row classes and row styles */
		primaryKey?: string,
		/** Should the filter search option be inline below the table header. NOT CURRENTLY FUNCTIONAL */
		filterInline?: boolean,
		/** A global filter/search object independent of column filtering */
		filterGlobal?: {
			/** The string to filter with */
			term: string,
			/** A global filter/search object independent of column filtering.  */
			props: string[]
		}
		/** Is the draggable red box visible? */
		showDragBox?: boolean;
		/** Can the rows be reordered via drag and drop */
		rowsReorder?: boolean,
		/** Callback method that adds css classes to the row. Input is the row object, map that to each property you want to style */
		rowClass?: (row: any) => {},
		/** The height in pixels of the row. Needed for virtual scroll */
		rowHeight?: number;
		/** Callback method that adds inline styles to the row. Input is the row object, map that to each property you want to style */
		rowStyle?: ModelRules[],
		/** Should the table header be sticky? */
		stickyHeader?: boolean,
		/** Max datatable height */
		heightMax?: number | string
		/** Automatically generate the max height */
		heightFullscreen?: boolean;
		/** If using heightFullscreen, subtract this many pixels from the height to account for DOM content above the datatable. This will keep the DT on page */
		//heightFullscreenOffset?: number;
		/** Applys the nowrap attribute to the table which forces all entires to a single line */
		noWrap?: boolean;
		/** Have the grouping/sorting/filtering/pinning controls inside a dropdown menu instead of inline in the header */
		controlsDropdown?: boolean;
		/** Show an info bar above and below the main rows that contains information about grouping/sorting/filtering and links to remove those controls */
		showInfo?: boolean;
		/** A callback function that returns a unique ID in the row object. Necessary for performance.  */
		trackRow?: (index, row) => {},
		/** Should widths be autogenerated and stay persistent  */
		widthAuto?: boolean;
		/** Virtual scroll only renders the data visible to the user. Useful for performance on large datasets  */
		virtualScroll?: boolean;
		/** Should the columns be able to collapse smaller than their content allows effectively truncating the data  */
		columnsTruncate?: boolean;
		/** Map column properties to values in your table. May need to use some <any> tags if the data doesn't quite line up  */
		columnMap?: Column;
		/** Supply an alternate set of data to use for this column instead of the property in the row. IE if you need to do a lookup in another array/dictionary  */
		columnData?: {
			[key: string]: {
				/** An observable of data for the column field */
				model?: Observable<any>,
				/** If the model being supplied is a complex object, get the data out of this property instead of in the root object */
				modelSrc?: string,
				/** The label or human readable value to display */
				label?: string,
				/** The unique ID which should map to the row property */
				value?: string,
				/** Property on the model with a list of inline css styles */
				styles?: string,
				/** Property on the model with a list of css classes */
				classes?: string
			}
		};
		/** Map grouping/sorting properties to values in your table  */
		controlsMap?: {
			/** The location of the groups array in the state object passed to the DT  */
			groupsArrayProp?: string;
			/** The location of the sorts array in the state object passed to the DT  */
			sortsArrayProp?: string;
			/** The location of the filters array in the state object passed to the DT  */
			filterArrayProp?: string;
			/** Property of where to find the unique field name  */
			prop?: string;
			/** Property of the direction  */
			dir?: string;
		};
	}

	/**  Configuration options for each column */
	export interface Column {
		/**  The property in the object to pull data from. Prop also defines which cell template to use in the HTML file */
		prop?: string;
		/** Static text to display in the header column */
		label?: string;
		/** Use this property from the column object as the label instead */
		labelProp?: string;
		/** Default width */
		width?: number;
		/**  Can the datatable resize this column to fit content. This should be true for your main content and false for your less importent content */
		canAutoResize?: boolean;
		/** Can the column be resized by dragging the right side of the header */
		canResize?: boolean;
		/** Can the user edit this cell/property. Will display a textbox by default but if column.data is supplied will show a select dropdown instead */
		canEdit?: boolean;
		/** Can the user search this column */
		canSearch?: boolean;
		/** Can the user filter this column. If this is set to true and column.data is supplied, that data will be used to populate a default filters list in the dropdown */
		canFilter?: boolean;
		/** Can the user group by this columns properties */
		canGroup?: boolean;
		/** Should this column show the button to have a drop row appear directly beneath the selected row */
		canDropRow?: boolean;
		/** Can this column be pinned to the left side of the screen */
		canPinLeft?: boolean;
		/** Can this column be pinned to the right side of the screen */
		canPinRight?: boolean;
		/** Can the user sort this column */
		canSort?: boolean;
		/** Can this column be reordered via dragging */
		canReorder?: boolean
		/** Can the user delete this column */
		canDelete?: boolean;
		/** If editing is restricted, this property should be a boolean to allow/disallow this user to edit */
		canEditPermission?: string;

		/** A list of custom links that appear in the controls dropdown */
		controlsCustomLinks?: ControlsCustomLinksGroup[];

		/**  An Observable of an array of objects. Will be used to populate editable select box and default filter options. If static, use Observable.of(['some','terms']) */
		mapData?: string;
		/** Used in conjunction with mapData, specifies the object property to display to the user */
		mapDataLabel?: string;
		/** Used in conjunction with mapData, specifies which object property to change the model to on edit operations */
		mapDataProp?: string;

		/** Use this pipe to manipulate the display of data */
		pipe?: string;


		/**  Used for edit operations. If column.prop doesn't map to directly to the api service, pass this instead of column.prop. Emitted up as update.action */
		editProp?: string;
		/**  CSS classes for the table cell */
		cellClass?: string;
		/**  Use this custom html template for the table cell, corresponds to the switch statement in cell-templates */
		templateCell?: string;
		/**  Use this custom html template for the droprow, corresponds to the switch statement in cell-templates */
		templateDropRow?: string;
		/**  Fix the column to the LEFT side of the screen */
		pinnedLeft?: boolean;
		/**  Fix the column to the RIGHT side of the screen */
		pinnedRight?: boolean;
		/**  The previous location of this column if pinned */
		pinnedIndex?: number;
		/** What type of data is in this column? Determine which pipe is used to format it and which filter control is present */
		columnType?: 'string' | 'number' | 'date' | 'dateTime' | string;
		/**  An array of filter objects */
		filters?: Filter[]
		/** Holds the X position of this cell, used to determine absolute position for left offsets */
		$$leftOffset?: number;

		//TEMP
		isDefault?: any;
		locked?: any;
	}

	interface ControlsCustomLinksGroup {
		/** Display text */
		label?: string;
		/** Font awesome icon to use as css class, IE: 'fa fa-remove' */
		icon?: string
		/** Is this a flyout with submenu links */
		submenu?: ControlsCustomLinksGroup[]
	}

	export interface Groupings {
		[key: number]: Group
	}

	export interface Group {
		rows?: any[];
		columnProp?: string;
		columnLabel?: string;
		label?: string;
		visible?: boolean;
	}

	export interface Filter {
		field: string;
		operator: string;
		value: string;
	}

	export interface ModelRules {
		model?: false | Observable<any>,
		rules?: (...args) => any
	}

	export interface DragSelect {
		hasMinSize?: boolean;
		startX?: number;
		startY?: number;
		top?: number;
		bottom?: number;
		left?: number;
		right?: number;
		width?: number;
		height?: number;
		bounding?: {
			top?: number;
			bottom?: number;
			left?: number;
			right?: number;
		}
	}

}
