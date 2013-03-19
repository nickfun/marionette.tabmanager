var TabModel = Backbone.Model.extend({
	defaults: {
		name: '_tab',
		order: 1,
		tagName: 'span',
		selectedClassName: 'tab-selected',
		className: 'tab-normal'
	},
	idAttribute: 'name'
});

function TabManager( target ) {
	var _tabTemplate = _.template('<%= name %>');

	// collection of tabs to display
	var _TabCollection = Backbone.Collection.extend({
		model: TabModel
	});
	var _tabs = new _TabCollection();
	// how our tabs should be sorted
	_tabs.comparator = function( oTab) {
		return oTab.get('order');
	};

	// view that displays one tab
	var TabView = Backbone.Marionette.ItemView.extend({
		className: function() {
			return this.model.get('className');
		},
		tagName: function() {
			return this.model.get('tagName');
		},
		template: _tabTemplate,
		events: {
			'click': 'onTabClick'
		},
		onTabClick: function( oEvent ) {
			var callback = this.model.get('callback');
			if( typeof callback === 'function') {
				callback( this.model, this );
			}
		}
	});

	// view that displays all tabs
	var AllTabs = new Backbone.Marionette.CollectionView({
		el: $(target),
		itemView: TabView,
		collection: _tabs
	});

	// public functions
	// ----------------

	// Set the template
	this.setTemplate = function( sTemplate ) {
		_tabTemplate = _.template( sTemplate );
	};

	// add a tab
	this.addTab = function( oTabModel ) {
		_tabs.add( oTabModel, {merge: true} );
	};

	// render
	this.render = function() {
		AllTabs.render();
	};

	// get tabs for whatever reason
	this.getTabs = function() {
		return _tabs;
	};

	// get the big CollectionView that is showing everything
	this.getView = function() {
		return AllTabs;
	};
}