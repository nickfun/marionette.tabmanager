/**
 * Tab Manager Class
 *
 * Usage:	var tm = new TabManager('#tabs-go-here-in-html');
 *			tm.addTab( {name: 'tab 1'}); 
 *			tm.addTab( {name: 'tab 2'});
 *			tm.render('tab 1');
 *
 * Other things to pass in for options:
 * - order: the order the tab should show up (left to right)
 * - selectCallback: function to execute when tab is clicked. the this variable will be the tab view (marionette ItemView)
 * - unselectCallback: same as above but when unclicked
 * - tagName: the HTML tag that the tab should render as. defaults to span
 * - className / selectedClassName: the default & selected HTML class to be
 *
 * @author Nickf
 * @since 2013-03-18
 */
function TabManager( target ) {
	var _tabTemplate = _.template('<%= name %>');
	var that = this;

	var TabModel = Backbone.Model.extend({
		defaults: {
			name: '_tab',
			order: 1,
			tagName: 'span',
			className: '_tab_manager tab-normal',
			selectedClassName: '_tab_manager tab-selected'
		},
		idAttribute: 'name'
	});

	// collection of tabs to display
	var _TabCollection = Backbone.Collection.extend({
		model: TabModel
	});

	var _tabs = new _TabCollection();

	// how our tabs should be sorted
	_tabs.comparator = function( oTab) {
		return oTab.get('order');
	};

	// the tab that is currently selected
	var _currentTabView = false;

	// view that displays one tab
	var TabView = Backbone.Marionette.ItemView.extend({
		className: function() {
			return this.model.get('className');
		},
		tagName: function() {
			return this.model.get('tagName');
		},
		getTemplate: function() {
			return _tabTemplate;
		},
		attributes: function() {
			return { 'data-tabViewCid': this.cid };
		},
		events: {
			'click': 'clickHandler'
		},
		clickHandler: function( oEvent ) {
			this.select();
		},
		select: function() {
			// was something already clicked?
			if( _currentTabView === false ) {
				// no, this is a new selection
				that.selectCallback( this );
				// remember new selection
				_currentTabView = this;
				return;
			}
			// do nothing if we are selecting ourself
			if( _currentTabView.cid === this.cid ) {
				console.log('no op');
				return;
			}
			// unselect old, select new
			that.unselectCallback( _currentTabView );
			that.selectCallback( this );
			// remember new selection
			_currentTabView = this;
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

	// remove a tab
	this.removeTab = function( sTabName ) {
		_tabs.remove( sTabName );
	};

	// select a tab
	this.selectTab = function( sSelectedName ) {
		// get the model for it
		var oModel = _tabs.get( sSelectedName );
		// valid?
		if( typeof oModel === 'undefined' ) {
			throw new Error("TabManager: cant find tab " + sSelectedName);
		}
		// get the view
		var oView = AllTabs.children.findByModel( oModel );
		// select it
		oView.select();
	};

	// render
	// pass in the name of the tab to be default selection
	this.render = function( sSelectedName ) {
		_tabs.sort();
		AllTabs.render();
		var oView;
		var oModel;
		oModel = _tabs.get( sSelectedName );
		if( typeof oModel === 'undefined' ) {
			// model not found. use first.
			oModel = _tabs.first();
		}
		oView = AllTabs.children.findByModel( oModel );
		oView.select();
	};

	// get tabs collection for whatever reason
	this.getTabs = function() {
		return _tabs;
	};

	// get the big CollectionView that is showing everything
	this.getView = function() {
		return AllTabs;
	};

	// Making these public in case they need to be over-ridden 
	// but you should just specify a callback for each tab

	// What to do when a tab is selected
	this.selectCallback = function( oView ) {
		oView.$el.toggleClass( oView.model.get('className') );
		oView.$el.toggleClass( oView.model.get('selectedClassName') );
		// does this model have a callback for selection?
		if( oView.model.has('selectCallback')) {
			var callback = oView.model.get('selectCallback');
			if( typeof callback !== 'function' ) {
				throw new Error("TabManager: invalid callback");
			}
			callback.apply( oView );
		}
	};

	// what to do when a tab is unselected
	this.unselectCallback = function( oView ) {
		oView.$el.toggleClass( oView.model.get('className') );
		oView.$el.toggleClass( oView.model.get('selectedClassName') );
		if( oView.model.has('unselectCallback')) {
			var callback = oView.model.get('unselectCallback');
			if( typeof callback !== 'function' ) {
				throw new Error("TabManager: invalid callback");
			}
			callback.apply( oView );
		}
	};
}