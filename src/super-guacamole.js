( function( $, undefined ) {

  var default_templates = {
    menu: '<ul class="%1$s">' +
            '<li class="%2$s">' +
              '<a href="%3$s">%4$s</a>' +
              '%5$s' +
            '</li>' +
          '</ul>',
    child_wrap: '<ul>%s</ul>',
    child: '<li class="%1$s">' +
            '<a href="%2$s">%3$s</a>' +
           '</li>'
  };

  /**
   * Menu constructor
   *
   * @access private
   * @param {object} options Menu options.
   */
  function Menu( options ) {
    var defaults,
      settings,
      self = this;

    defaults = {
      href: '#',
      title: 'More',
      children: [],
      templates: default_templates,
      container: null
    };

    settings = $.extend( defaults, options );

    this.href = settings.href;
    this.title = settings.title;
    this.children = settings.children;
    this.templates = settings.templates;
    this.$container = settings.container;
    this.visible = true;
    this.node = null;
    this.attachedNode = null;
    this.options = {}; // Shared options
  }

  /**
   * Set menu visibility
   *
   * @access private
   * @param  {boolean} flag Menu visibility state flag.
   * @return {Menu}
   */
  Menu.prototype.setVisibility = function( flag ) {
    var self = this;

    flag = !( ! flag );
    self.visible = ! flag;

    if ( self.node && self.attachedNode ) {
      [ self.node, self.attachedNode ].forEach( function( node ) {
        node.style.display = flag ? 'inherit' : 'none';
        node.querySelector( 'a' ).style.color = flag ? 'green' : 'red';
      } );
    }

    return this;
  };

  /**
   * Return visibility state flag
   *
   * @access private
   * @return {boolean} Visibility state flag
   */
  Menu.prototype.isVisible = function() {
    return this.visible;
  }

  /**
   * Get visible children count
   * @return {number} Visible children count
   */
  Menu.prototype.countVisibleChildNodes = function() {
    var count = 0,
      index;

    for ( index = 0; index < this.children.length; index++ ) {
      if ( this.children[ index ].isVisible() ) {
        count++;
      }
    }

    this.children.map( function( child ) {
      if ( child.isVisible() ) {
        count++;
      }
    } );

    return count;
  }

  Menu.prototype.countVisibleChildNodes = function() {
    var count = 0,
      index;

    for ( index = 0; index < this.children.length; index++ ) {
      if ( this.children[ index ].isVisible() ) {
        count++;
      }
    }

    return count;
  };

  /**
   * Get menu `this.node`
   * @return {jQuery}
   */
  Menu.prototype.getNode = function() {
    return this.node;
  };

  /**
   * Return attached node to the menu element
   * @return {jQuery}
   */
  Menu.prototype.getAttachedNode = function() {
    return this.attachedNode;
  };

  /**
   * Set menu node
   * @param  {jQuery} $node Menu node
   */
  Menu.prototype.setNode = function( $node ) {
    this.node = $node;
  };

  /**
   * Attach a node to the menu element
   * @param  {jQuery} $node Node element
   */
  Menu.prototype.attachNode = function( $node ) {
    this.attachedNode = $node;
  };

  /**
   * Cache children selectors
   * @param  {jQuery} $nodes         jQuery nodes.
   * @param  {jQuery} $attachNodes   jQuery nodes.
   * @return {Menu}
   */
  Menu.prototype.cache = function( $nodes, $attachedNodes ) {
    var self = this;

    self.children.forEach( function( child, index ) {
      if ( undefined !== $nodes[ index ] ) {
        child.setNode( $nodes[ index ] );
      }

      if ( undefined !== $attachedNodes[ index ] ) {
        child.attachNode( $attachedNodes[ index ] );
      }

      self.children[ index ] = child;
    } );

    return self;
  };

  /**
   * Set options
   * @param {Object} options Options object
   * @return {Menu}
   */
  Menu.prototype.setOptions = function( options ) {
    this.options = options;
    return this;
  };

  /**
   * Get options
   * @return {Object}
   */
  Menu.prototype.getOptions = function() {
    return this.options;
  };

  /**
   * Render the menu
   *
   * @access private
   * @return {Menu}
   */
  Menu.prototype.render = function() {
    var self = this,
      $menu = self.options.$menu,
      _children_render = [];

    function _render( children_render ) {
      children_render = children_render || '';

      return self.templates.menu.replace( /\%1\$s/g, 'super-guacamole__menu' )
        .replace( /\%2\$s/g, 'super-guacamole__menu__child' )
        .replace( /\%3\$s/g, self.href )
        .replace( /\%4\$s/g, self.title )
        .replace( /\%5\$s/g, children_render ? self.templates.child_wrap.replace( /\%s/g, children_render ) : '' )
    }

    function _render_children() {
      _children_render = [];

      self.children.forEach( function( child ) {
        if ( child instanceof Menu ) {
          _children_render.push(
            self.templates.child.replace( /\%1\$s/g, 'super-guacamole__menu__child' )
                     .replace( /\%2\$s/g, child.href )
                     .replace( /\%3\$s/g, child.title )
          );
        }
      } );

      return _children_render;
    }

    if ( self.$container ) {
      self.$container[ self.options.append ? 'append' : 'html' ]( _render( _render_children().join( '\n' ) ) );

      self.cache(
        self.$container.find( '.super-guacamole__menu__child' ),
        $menu.children( self.options.children_filter )
      );

      return self;
    }

    return self;
  };

  /**
   * Extract elements
   *
   * @static
   * @access private
   * @param  {jQuery} $elements Collection of elements.
   * @return {array}            Array of Menu elements
   */
  Menu.extract = function( $elements ) {
    var arr = [];

    $elements.each( function( index, element ) {
      arr.push( new Menu( {
        href: element.getAttribute( 'href' ),
        title: element.querySelector( 'a:first-child' ).innerText
      } ) );
    } );

    return arr;
  };

  /**
   * Check if attached nodes fit `$parent` container
   * @param  {jQuery}   $parent Parent node.
   * @return {boolean}
   */
  Menu.prototype.attachedNodesFit = function( $parent ) {
    var self = this,
      width = 0,
      $node,
      maxWidth = $parent.width();

    self.children.forEach( function( child ) {
      $node = $( child.getAttachedNode() );

      if ( 0 < $node.length && $node.is( ':visible' ) ) {
        width += $node.width();
      }
    } );

    if ( width > maxWidth ) {
      return false;
    }

    return true;
  };

  /**
   * Watch handler.
   *
   * @access private
   * @return {boolean}
   */
  Menu.prototype.watch = function() {
    var self = this,
      $menu = self.options.$menu,
      _timeout = null,
      _index = -1,
      _visibility = false,
      _visibleChildrenCount = 0;

    /**
     * Handle `onresize` event
     */
    function _handler( $jqEvent ) {
      clearTimeout( _timeout );

      _timout = setTimeout( function() {
        self.children.forEach( function() { // ?

          _visibleChildrenCount = self.countVisibleChildren();

          if ( _visibleChildrenCount > self.options.min_children ) {
            _index = self.children.length - 1;
            _visibility = self.attachedNodesFit( $menu );
          } else {
            _index = _visibleChildrenCount - 1;
            _visibility = true;
          }

          if ( -1 < _index && undefined !== self.children[ _index ] ) {
            self.children[ _index ].setVisibility( _visibility );
          }
        } );
      }, 200 );
    }

    $( window ).on( 'resize', _handler );
  };

  /**
   * Super Guacamole!
   *
   * @access public
   * @param  {object} options Super Guacamole menu options.
   */
  $.fn.superGuacamole = function( options ) {
    var defaults,
      settings,
      $menu = $( this ),
      $children,
      the_menu;

    defaults = {
      threshold: 400, // Minimal menu width, when this plugin activates
      min_children: 3, // Minimal visible children count
      children_filter: 'li', // Child elements selector
      menu_title: 'More', // Menu title
      templates: default_templates, // Templates
      container: null, // Parent element, which should contain the menu
      append: true // Append contents or replace it
    };

    settings  = $.extend( defaults, options );
    $children = $menu.children( settings.children_filter );
    the_menu  = new Menu( {
      title:     settings.menu_title,
      templates: settings.templates,
      children:  Menu.extract( $children ),
      container: settings.container
    } );

    settings.$menu = $menu;

    the_menu.setOptions( settings )
      .render()
      .watch();

    // @TODO REMOVE THIS AFTER DEVELOPMENT IS FINISHED
    window.the_menu = the_menu;
  };

} ( jQuery ) );
