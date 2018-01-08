import { Injectable } from '@angular/core';
import { Datagrid } from './typings';

import * as _ from 'lodash';

@Injectable()
export class DataGridService {

	public uniqueId: string;

	public cache = {
		sortArray: _.memoize(this.sortArray, () => this.uniqueId),
		groupRows: _.memoize(this.groupRows, () => this.uniqueId),
		filterArray: _.memoize(this.filterArray, () => this.uniqueId)
	}
    
	constructor(
	) {
		this.cache = {
			sortArray: _.memoize(this.sortArray, () => this.uniqueId),
			groupRows: _.memoize(this.groupRows, () => this.uniqueId),
			filterArray: _.memoize(this.filterArray, () => this.uniqueId)
		}

	}

    /**
     * Maps external table/column/control properties to those needed by the datatable
     * @param array
     * @param mapObj
     */
	public mapPropertiesDown(array: any[], mapObj: any): any[] {
		//console.warn('mapProperties Down', JSON.parse(JSON.stringify(array))); 
		//console.warn('mapProperties',  mapObj); 
		
		array.forEach(element => {
			for (let key in mapObj) {
                // If the default property needed by the DT is NOT found in the object
                // This avoids issues where the correct property is actually being passed in even though it is mapped
				if (!element[key]) {
					// If mapping data, any column references will be camel case instead of title case. Remap to camel case
					//console.warn('mapProperties', key)
					element[key] = element[mapObj[key]];
					//delete element[mapObj[key]];
				}
			}
		});
		//console.warn(JSON.parse(JSON.stringify(array)));
		return array;
	}

    /**
     * If external map properties are specified, map them back to the input types before emitting them up to the host component
     * @param array
     * @param mapObj
     */
	public mapPropertiesUp(array: any[], mapObj: any): any[] {
		//let newArray = JSON.parse(JSON.stringify(array));

		//console.warn('mapProperties', newArray, mapObj);

		return JSON.parse(JSON.stringify(array)).map(element => {
			//console.warn(element);
			for (let key in mapObj) {
				// If the default property needed by the DT is NOT found in the object
				// This avoids issues where the correct property is actually being passed in even though it is mapped
				//if (!element[mapObj[key]]) {
					//console.warn('Current State: Key:', key, '- element[key]', element[key], '- mapObj[key]:', mapObj[key]);
					element[mapObj[key]] = element[key];
					//console.warn(element);
				//}
				//console.warn('mapProperties', JSON.parse(JSON.stringify(element)));
				//delete element[key];  // TODO: Cleaning up old properties isn't working for some reason, it deletes the wrong property even though the key is correct
                // Possible related to mapping a property down
			}
			return element;
		});
    }

    /**
     * Map the columns into an object based on its property name
     * @param columns
     */
    public mapColumns(columns: Datagrid.Column[]) {
        let columnMap = {};
        columns.forEach(column => columnMap[column.prop] = column);
        return columnMap;
	}

    /**
     * Get the rows that should be visible in the scroll port
     * @param rows
     */
    public getVisibleRows(rows: any[], scrollProps: Datagrid.ScrollProps, gridProps: Datagrid.Props, rowHeight: number): any[] {
		//console.log('getVisibleRowsoffSetRowsFromTop', rows, this.scrollProps, this.rowHeight, this.gridProps);
		let rowsNew = [...rows];
		let buffer = 1;
		let offSetRowsFromTop = Math.floor(scrollProps.scrollTop / rowHeight);
		if (offSetRowsFromTop - buffer > 0) {
			offSetRowsFromTop -= buffer;
		}
		if (offSetRowsFromTop < buffer) {
			offSetRowsFromTop = 0;
		}

		let rowsEnd = offSetRowsFromTop + gridProps.rowsVisible + (buffer * 2);
		if (rowsEnd > rowsNew.length) {
			rowsEnd = rowsNew.length;
		}
        //console.log('getVisibleRows', offSetRowsFromTop, rowsEnd);
		//console.log('getVisibleRowsoffSetRowsFromTop', rowsEnd)
		return rowsNew.slice(offSetRowsFromTop, rowsEnd);
	}

    /**
     * Create an object of columns that should be visible based on horizontal scroll width
     */
	public getVisibleColumns(columns: any[], scrollProps, gridProps) {
		//console.log('getVisibleColumns', this.scrollProps, this.gridProps, this.columnsInternal.length);
		let colsExternal = [];

		//let widthTotal = this.scrollProps.scrollLeft;
		let widthCurrent = 0;
		// Loop through column widths
		for (let i = 0; i < columns.length; i++) {
			let column = columns[i];

			// If current column width + all widths before this one is greater than the left scroll position
			// If total column widths is less than the width of the body minus the left scroll position
			if (
				column.width + widthCurrent > scrollProps.scrollLeft &&
				widthCurrent < gridProps.widthBody + scrollProps.scrollLeft
			) {
				colsExternal.push(column);
			}
			// Update current width by adding the current column
			widthCurrent = widthCurrent + column.width;
		}
		return [...colsExternal];
		//this.columnsExternal = colsExternal;
	}

    /**
     * Filters based on the global object. Also creates the necessary filter structure.
     * @param array
     */
	public filterGlobal(array: any[], options: Datagrid.Options): any[] {
		//console.warn('filterGlobal', options.filterGlobal.props);

        // Loop through the existing props supplied and create the appropriate filter object
		let filters = [];
		options.filterGlobal.props.forEach(prop => {
			filters.push({
				operator: 'search',
				prop: prop,
				value: options.filterGlobal.term
			})


		});
		
		return this.filterArray(array, filters);
	}

    /**
     * Filter an array of objects with an array of filters
     * @param array
     * @param filters
     */
	public filterArray(array: any[], filters: Datagrid.Filter[]): any[] {
		//console.warn('filterArray: ', array);
		
		// Get number of contains filters
		let contains = filters.filter(filter => filter.operator == 'contains');
        // Get searches which as passed from the global search option
		let searches = filters.filter(filter => filter.operator == 'search');
		// Equals filters are an OR within the same field but an AND between different fields
		// Map down to dictionary with field as key so we can handle that difference
		let equals = {};
		filters.filter(filter => filter.operator == 'eq').forEach(filter => {
			if(!equals[filter.prop]){
				equals[filter.prop] = [];
			}
			equals[filter.prop].push(filter);
		});
		
		// Perform filter and return
		return array.filter(row => {
        
			// Searches is an OR. If it does not contain, it should be filtered out
			if (searches.length) {
				let matches = false;
				for (let i = 0; i < searches.length; i++) {
					let filter = searches[i];
					// If this field isn't found on the row, return false
					if (!row[filter.prop]) {
						return false;
					}
					
					// Perform some cleanup on the strings
					let rowValue = row[filter.prop].toString().toLowerCase().trim();
					let filterValue = filter.value.toString().toLowerCase().trim();

					//console.warn(rowValue, filterValue, rowValue.indexOf(filterValue));
					if (rowValue.indexOf(filterValue) != -1) {
						matches = true;
						break;
					}
				}
				// If this group does not have at least one match, return false
				if (!matches) {
					return false
				}
			}

			// Contains is an AND. If it does not contain, it should be filtered out
			if (contains.length) {
				let matches = false;
				for (let i = 0; i < contains.length; i++) {
					let filter = contains[i];
                    // If this field isn't found on the row, return false
					if (!row[filter.prop]){
						return false;
					}
					//console.warn(row[filter.prop], '-', filter.prop)
                    // Perform some cleanup on the strings
					let rowValue = row[filter.prop].toString().toLowerCase().trim();
					let filterValue = filter.value.toString().toLowerCase().trim();

					//console.warn(rowValue, filterValue, rowValue.indexOf(filterValue));
					if (rowValue.indexOf(filterValue) != -1) {
						matches = true;
						break;
					}
				}
				// If this group does not have at least one match, return false
				if (!matches) {
					return false
				}
			}
			// Equals contains sets of rules groups. Each rule group is based on field and is an OR. Between rule groups it must be an AND
			// Results must contain at least one match within each field
			if (Object.keys(equals).length) {
				let allGroupMatches = 0;
				// Loop through all equals collections
				for (let key in equals){
					// Within each field, only need 1 match to include in the collection
					let matches = false;
					for (let i = 0; i < equals[key].length; i++) {
						let filter = equals[key][i];
						
						// If this field isn't found on the row, return false
						if (!row[filter.prop]){
							return false;
						}

						// If row property is an array of strings, see if the field value is in the array
						if (Array.isArray(row[filter.prop]) && row[filter.prop] && row[filter.prop].indexOf(filter.value.toString()) > -1) {
							matches = true;
							break;
						} 

						// If the field value matches the filter value
						if (row[filter.prop] == filter.value){
							matches = true;
							break;
						}
					}
					// If this group has a match, increment the group matcher
					if(matches){
						allGroupMatches++;
					}
				}

				if (allGroupMatches != Object.keys(equals).length) {
					return false;
				}
			}
			// If there isn't a match within each group, return false
			
			// If no filters failed, return true
			return true;
		});
	}

	/**
	* Sort an array based on a property and direction
	* @param array
	* @param prop
	* @param sortType
	*/
	public sortArray(array: any[], prop: string, sortType: string): any[] {
		//console.warn('sortRows', prop, sortType);
		//console.warn('sortRows', array);
		let mapProp = (prop) => {
			// If string, make lower case and remove special characters
			if (typeof prop == 'string') {
				return prop.toLowerCase().replace(/[^a-z0-9]/gi, '');
			}
			// If number
			else if (typeof prop == 'number') {
				return prop * 1000;
			}
			// Make string
			else {
				if (prop){
					return prop.toString();
				}
				return '';
			}
		}

		if (sortType == 'asc') {
			return array.sort((a, b) => mapProp(a[prop]) !== mapProp(b[prop]) ? mapProp(a[prop]) < mapProp(b[prop]) ? -1 : 1 : 0);
		} else {
			return array.sort((b, a) => mapProp(a[prop]) !== mapProp(b[prop]) ? mapProp(a[prop]) < mapProp(b[prop]) ? -1 : 1 : 0);
		}
	}

    /**
     * 
     * @param rows
     * @param columns
     * @param prop
     * @param sorts
     */
    public groupRows(rows: any[], columns: Datagrid.Column[], groups: Datagrid.Sorts[], sorts: Datagrid.Sorts[]): { rows: any[], groups: Datagrid.Groupings } {
        console.log('groupRows', groups, sorts);
		let newGroups = {};
		let group = groups[0];
		
		rows.forEach(row => {
			// If the row property is an array of strings, flatten it down to a string. Otherwise just use string
            let newProp = Array.isArray(row[group.prop]) ? row[group.prop].join() : row[group.prop];
            // If this is an empty array, set to null instead
            //if (Array.isArray(row[group.prop]) && !row[group.prop].length){
            //    newProp = row[group.prop] = null;
            //}

            if (!newProp || newProp == '') {
				newProp = 'No Value';
			}

			if (!newGroups[newProp]) {
				newGroups[newProp] = <Datagrid.Group>{
					rows: [],
					columnProp: group.prop,
					columnLabel: null,
                    label: row[group.prop] || 'No Value',
					visible: true,
                    type: 'group'
                }
                let label = columns.filter(column => column.prop == group.prop);
                newGroups[newProp].columnLabel = label && label[0] ? label[0].label : 'No Value';
			}
            
            newGroups[newProp].rows.push(row);
		});

        // Now remap the object into an array
		let grouped = [];
		for (let key in newGroups) {
            if (newGroups.hasOwnProperty(key)) {
                grouped.push(newGroups[key]);
            }
        }

        // Sort the group
		grouped = this.sortArray(grouped, 'label', group.dir);

		let newRows = [];
		let groupsFinal: Datagrid.Groupings = {};
        // Sort the rows within the group
        grouped.forEach((group: Datagrid.Group, index: number) => {
            if (sorts.length) {
				this.sortArray(group.rows, sorts[0].prop, sorts[0].dir);
			}
			
			let currentLoc = newRows.length;
			groupsFinal[currentLoc] = group;
			newRows = [...newRows, group, ...group.rows];
		});
		
		return { rows: newRows, groups: groupsFinal };
	}

    /**
     * Create the statuses/state of the controls (filtering/grouping/sorting)
     * @param state
     */
	public createStatuses(state: Datagrid.State, columns: Datagrid.Column[]): Datagrid.Status {
		//console.warn('createStatuses: ',JSON.parse(JSON.stringify(state)));
		let status: Datagrid.Status = {};
		// If groupings are found, create dictionary
		if (state.groups.length) {
			let newStatus = {};
			state.groups.forEach(group => {
				newStatus[group.prop] = group.dir;
			});
			status.groups = newStatus;
		} else {
			status.groups = {};
		}
		//console.warn('createStatuses: ', JSON.parse(JSON.stringify(status.groups)));
		// If sortings are found, create dictionary
		if (state.sorts.length) {
			let newStatus = {};
			state.sorts.forEach(sort => {
				newStatus[sort.prop] = sort.dir;
			});
			status.sorts = newStatus;
		} else {
			status.sorts = {};
		}

		//console.warn('createStatuses: ', JSON.parse(JSON.stringify(status.sorts)));
		//console.warn('state.filters: ', JSON.parse(JSON.stringify(state.filters)));
		let newFilters = {};
		if (columns && columns.length) {
			columns.forEach(column => {
				newFilters[column.prop] = {
					contains: '',
					eq: {}
				};
			});
		}

		//console.warn('status 1: ', JSON.parse(JSON.stringify(state.filters)));
		// If filters are found, create dictionary
		if (state.filters && typeof state.filters != 'string' && state.filters.length) {
			//console.warn('Adding filters')
			state.filters.forEach(filter => {
				//console.warn('Filter ',filter)
				// Create field/property object
				if (!newFilters[filter.prop]) {
					newFilters[filter.prop] = {
						hasFilters: false,
						contains:{},
						eq:{}
					};
				}

				// Operator is Contains
				if (filter.operator == 'contains') {
					newFilters[filter.prop][filter.operator] = filter.value;
					newFilters[filter.prop].hasFilters = true;
				}
				// Everything else
				else {
					//console.warn('EQ', filter)
					// Create operator object inside field object
					if (!newFilters[filter.prop][filter.operator]) {
						newFilters[filter.prop][filter.operator] = {}
					}
					newFilters[filter.prop][filter.operator][filter.value] = filter.value;
					newFilters[filter.prop].hasFilters = true;
				}

			});
		}

		status.filters = newFilters;
		//console.warn('status 2: ', JSON.parse(JSON.stringify(status)));
		return status;
	}

    /**
     * Look through the rows and assemble a an array of terms
     * @param columnProp
     */
	public getDefaultTermsList(rows: any[], columns: Datagrid.Column[]) {
        //console.log('getDefaultTermsList');
        // console.time('getDefaultTermsList');
		let termsList = {};
        let uniques = {};

        // Loop through all the columns
        columns.forEach(column => {
            // If the column type is string and does not exist, create the dictionary and array
            if (!termsList[column.prop]) {// && column.columnType == 'string'
				termsList[column.prop] = [];
				uniques[column.prop] = {};
			}
		});

		// Find the unique values for each row
		rows.forEach(row => {
			for (let key in termsList) {
		        if (termsList.hasOwnProperty(key)) {
		            if (row[key] && uniques[key]) {
		                uniques[key][row[key]] = true;
		            }
		        }
		    }
		});

        // Now push the uniques to the termslist
		for (let key in uniques) {
	        if (uniques.hasOwnProperty(key)) {
	            let foo = uniques[key];
	            for (let key2 in foo) {
	                if (foo.hasOwnProperty(key2)) {
	                    termsList[key].push(key2);
	                }
	            }
	        }
	    }
	    // Now sort terms in default order
		for (let key in termsList) {
	        if (termsList.hasOwnProperty(key)) {
	            termsList[key].sort();
	        }
	    }
        // console.warn(termsList);
        // console.timeEnd('getDefaultTermsList');

        return termsList;
	}

    /**
     * Determine the horizontal position of grid cells
     */
    public columnCalculations(columns: Datagrid.Column[], offset:number = 0) {
        //console.log('columnCalculations', columns, offset);
        let leftOffset = offset;
		return columns.map((column, index) => {
			// If no width, set default to 150
		    column.width = column.width ? column.width : 150;
            // If no column type, set default of string
            column.columnType = column.columnType ? column.columnType : 'string';

			// Ensure min width of 44
			if (column.width < 44) {
			    column.width = 44;
			}
			// Ensure all column widths are divisible by 4, fixes a blurry text bug in chrome
		    column.width = Math.floor(column.width / 4) * 4;

		    column.$$leftOffset = leftOffset;
			leftOffset += column.width;
			return column;
		});
	}

    /**
     * If total combined width of grid cells is less than viewport, resize widths to match
     * @param columns
     * @param gridProps
     */
	public columnsResize(columns: Datagrid.Column[], gridProps: Datagrid.Props) {
		let widthTotal = gridProps.widthTotal// - 7;
		return columns.map(column => {
			column.width = Math.ceil(column.width * gridProps.widthBody / widthTotal) + 1;
			return column;
		});
    }

    /**
     * Map custom templates to a usable object for references
     * @param arr
     */
    public columnMapTemplates(arr:any[]) {
        //const result: any[] = [];
        const result = {};

        for (const temp of arr) {
            const col: any = {};

            const props = Object.getOwnPropertyNames(temp);
            for (const prop of props) {
                col[prop] = temp[prop];
            }

            if (temp.headerTemplate) {
                col.templateHeader = temp.templateHeader;
            }

            if (temp.cellTemplate) {
                col.templateCell = temp.templateCell;
            }
            result[col.prop] = col;
        }
        return result;
    }

    /**
     * Calculate row properties such as visibility, y position and index
     * @param rows
     * @param rowHeight
     * @param makeVisible
     */
    public rowPositions(rows: any[], rowHeight: number, makeVisible: boolean = false) {
        //console.log('rowPositions start', rows);
        
        let y = 0;
        return rows.filter((row, i) => {
            row.$$rowIndex = i; // Set rowIndex

            // If hidden prop is not set, set default to false
            if (typeof row.$$hidden == 'undefined' || makeVisible) {
                row.$$hidden = false;
            }
            // If visible
            if (row.$$hidden == false) {
                row.$$rowPosition = y; // Set y position
                y += rowHeight + 1;
                return true;
            } else {
                return false;
            }
          
        });
        
        /*
        for (let i = 0; i < rowsNew.length; i++) {
            rowsNew[i].$$rowIndex = i; // Set rowIndex

            // If hidden prop is not set, set default to false
            if (typeof rowsNew[i].$$hidden == 'undefined' || makeVisible) {
                rowsNew[i].$$hidden = false;
            }
            // If visible
            if (rowsNew[i].$$hidden == false) {
                rowsNew[i].$$rowPosition = y; // Set y position
                y += rowHeight + 1;
            }
            console.log('Row', i, rowsNew[i].$$rowPosition, rowsNew[i]);
        }
        return rowsNew;
        */
    }
   
}
