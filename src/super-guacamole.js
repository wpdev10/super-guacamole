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
   * Set child
   * @param  {Menu}   child   Child menu element
   * @param  {number} [index] Optional index. If not specified, child will be added into the end.
   * @return {Menu}
   */
  Menu.prototype.set = function( child, index ) {
    if ( false === child instanceof Menu ) {
      throw new Error( 'Invalid argument type' );
    }

    if ( undefined === index ) {
      this.children.push( child );
    } else {
      this.children[ index ] = child;
    }

    return this;
  };

  /**
   * Alias of `Menu.prototype.set`
   */
  Menu.prototype.push = function( child ) {
    return this.set( child );
  };

  /**
   * Get child
   * @param  {number} index
   * @return {Menu}
   */
  Menu.prototype.get = function( index ) {
    return this.has( index ) ? this.children[ index ] : null;
  };

  /**
   * Check if menu has children with the specified `index`
   * @param  {number} index
   * @return {boolean}
   */
  Menu.prototype.has = function( index ) {
    return undefined !== this.children[ index ];
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

  Menu.prototype.forEach = function( callback ) {
    return this.children.forEach( callback );
  };

  /**
   * Count the visible attached nodes
   * @return {number}
   */
  Menu.prototype.countVisibleAttachedNodes = function() {
    var self = this,
      count = 0;

    self.forEach( function( child ) {
      if ( false === $( child.getAttachedNode() ).hasClass( 'super-guacamole__menu__hidden' ) ) {
        count++;
      }
    } );

    return count;
  }

  /**
   * Count the `{Menu}` nodes
   * @return {number}
   */
  Menu.prototype.countVisible = function() {
    var self = this,
      count = 0;

    self.forEach( function( child ) {
      if ( child.isVisible() ) {
        count++;
      }
    } );

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

    self.forEach( function( child, index ) {
      child.setNode( $nodes[ index ] );
      child.attachNode( $attachedNodes[ index ] );
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
        self.$container.find( '.super-guacamole__menu * .super-guacamole__menu__child' ),
        $menu.children( self.options.children_filter )
      );
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
    var arr = [],
      $element,
      child;

    $elements.each( function( index, element ) {
      $element = $( element );

      child = new Menu( {
        href: $element.attr( 'href' ),
        title: $element.find( 'a:first-child' ).text()
      } );

      child.attachNode( $element );

      arr.push( child );
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

      if ( 0 < $node.length &&
           false === $node.hasClass( 'super-guacamole__menu__hidden' ) ) {
        width += $node.width();
      }
    } );

    return !( width > maxWidth );
  };

  /**
   * Watch handler.
   *
   * @access private
   * @return {Menu}
   */
  Menu.prototype.watch = function( once ) {
    var self = this,
      $menu = self.options.$menu,
      node,
      _index = -1,
      _visibility = false,
      _attachedNodesCount = 0,
      $attachedNode;

    once = once || false;

    function _debounce( threshold ) {
      var _timeout;

      return function _debounced( $jqEvent ) {
        function _delayed() {
          self.forEach( function( child ) {
            _attachedNodesCount = self.countVisibleAttachedNodes();
            _visibility = self.attachedNodesFit( $menu );
            _index = _attachedNodesCount - 1;

            if ( _attachedNodesCount < self.options.min_children ) {
              _visibility = true;
              _index = _attachedNodesCount + 1;
            }

            if ( self.has( _index ) ) {
              node = self.get( _index );
              $attachedNode = $( node.getAttachedNode() );

              $menu.find( self.options.children_filter ).each( function() {
                if ( $( this ).index() > $attachedNode.index() ) {
                  $(this)[ _visibility ? 'removeClass' : 'addClass' ]( 'super-guacamole__menu__hidden' );
                }
              } );

              self.$container.find( '.super-guacamole__menu * .super-guacamole__menu__child' ).each( function() {
                if ( $( this ).index() < $attachedNode.index() ) {
                  $(this)[ _visibility ? 'removeClass' : 'addClass' ]( 'super-guacamole__menu__hidden' );
                }
              } );
            }
          } );

          timeout = null;
        }

        if ( _timeout ) {
          clearTimeout( _timeout );
        }

        _timeout = setTimeout( _delayed, threshold );
      };
    }

    if ( once ) {
      _debounce( 1 );
      return self;
    }

    $( window ).on( 'resize', _debounce( 1000 ) );
    return self;
  };

  /**
   * Super Guacamole!
   *
   * @access public
   * @param  {object} options Super Guacamole menu options.
   */
  $.fn.superGuacamole = function( options ) {
    var defaults,
      styles = '<style> .super-guacamole__menu__hidden { display: none !important; } </style>',
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

    // Append styles
    $( document.head ).append( styles );

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
