// Need to update this file

/*
// Sample Options call
public options: DT2.Options = {
	scrollbarH: true,
	heightFullscreen: true,
	heightFullscreenOffset: 170,
	noWrap: true,
	selectionType: 'multi',
	controlsDropdown: true,
	primaryKey: 'LNKey',
	trackRow: (index, row) => row.LNKey,
	rowClass: (row) => ,
	rowStyle: [
		{
			model: this.api.select.getData(ApiProps.tagdefs),
			rules: (row: M4Pipe.StoragePipeline, model) => {
				let styles = {};
				if (row.ColorCategory && model.lookup[row.ColorCategory]) {
					styles['background-color'] = model.lookup[row.ColorCategory].tagColor;
				}
				return styles;
			}
		},
		{
			model: this.api.select.getData(ApiProps.layouts),
			rules: (row, model) => {
				let styles = {};
				if (!row.ColorCategory && model[0].channelId == 2) {
					styles['color'] = '#840000';
				}
				return styles;
			}
		},
		{
			model: false,
			rules: (row) => {
				let styles = {};
				if (row.Mailbox == 'Processing') {
					styles['font-weight'] = 'bold';
				}
				return styles;
			}
		}
	],
	columnData: {
		'ColorCategory': {
			model: this.api.select.getData(ApiProps.tagdefs),
			value: 'tagDefId',
			label: 'tagColor'
		}
	},
	columnMap: {
		prop: 'columnFieldName',
		label: 'headerText',
		columnType: <any>'columnTypeName'
	},
	controlsMap: {
		//groupsArrayProp: 'groups',
		//sortsArrayProp: 'sorts',
		//filtersArrayProp: 'filters',
		prop: 'field'
	}
}
*/
