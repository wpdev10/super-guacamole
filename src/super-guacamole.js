( function( $ ) {

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
    this.visible = false;
    this.$node = null;
  }

  /**
   * Set menu visibility
   *
   * @access private
   * @param  {boolean} flag Menu visibility state flag.
   * @return {Menu}
   */
  Menu.prototype.setVisibility = function( flag ) {
    this.visible = !( ! flag );

    if ( this.$node && this.$node.length > 0 ) {
      this.$node.css( 'display', flag ? 'inherit' : 'none' );
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
  Menu.prototype.countVisibleChildren = function() {
    var count = 0,
      index;

    for ( index = 0; index < this.children.length; index++ ) {
      if ( this.children[ index ].isVisible() ) {
        count++;
      }
    }

    return count;
  }

  /**
   * Get menu `this.$node`
   * @return {jQuery}
   */
  Menu.prototype.getNode = function() {
    return this.$node;
  };

  /**
   * Set menu node
   * @param  {jQuery} $node Menu node
   */
  Menu.prototype.setNode = function( $node ) {
    this.$node = $node;
  };

  /**
   * Cache children selectors
   * @param  {jQuery} $nodes jQuery nodes
   * @return {Menu}
   */
  Menu.prototype.cache = function( $nodes ) {
    var self = this;

    self.children.forEach( function( child, index ) {
      if ( $nodes.indexOf( index ) > -1 ) {
        child.setNode( $nodes[ index ] );
        self.children[ index ] = child;
      }
    } );

    return self;
  };

  /**
   * Render the menu
   *
   * @access private
   * @param {boolean} append Append content or replace it.
   * @return {string}
   */
  Menu.prototype.render = function( append ) {
    var self = this,
      $menu = null,
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
      if ( self.$container.find( '.super-guacamole__menu' ).length > 0 ) {
        $menu = self.$container.find( '.super-guacamole__menu' );
        self.cache( $menu.children( '.super-guacamole__menu__child' ) );

        return self;
      }

      self.$container[ append ? 'append' : 'html' ]( _render( _render_children().join( '\n' ) ) );
      return self;
    } else {
      return _render( _render_children().join( '\n' ) );
    }
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
        href: $( element ).attr( 'href' ),
        title: $( element ).find( 'a:first' ).text()
      } ) );
    } );

    return arr;
  };

  /**
   * Watch handler.
   *
   * @access private
   * @param  {jQuery}      $menu    Parent element which contains the menu.
   * @param  {object}      options  Options object.
   * @return {boolean}
   */
  Menu.prototype.watch = function( $menu, options ) {
    var self = this,
      _timeout = null,
      _index = -1,
      _visibility = false;

    /**
     * Handle `onresize` event
     */
    function _handler( $jqEvent ) {
      clearTimeout( _timeout );

      _timout = setTimeout( function() {

        if ( self.countVisibleChildren() > options.min_children ) {
          _index = self.children.length - 1;
          _visibility = true;
        } else {
          _index = 0;
          _visibility = false;
        }

        if ( -1 < _index && -1 < self.children.indexOf( _index ) ) {
          self.children[ _index ].setVisibility( _visibility );
        }
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

    the_menu.render( settings.append );

    the_menu.watch( $menu, {
      min_children: settings.min_children,
      children_filter: settings.children_filter,
      threshold: settings.threshold,
      append: settings.append
    } );
  };

} ( jQuery ) );
