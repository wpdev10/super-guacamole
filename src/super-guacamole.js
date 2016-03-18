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
  }

  /**
   * Render the menu
   *
   * @access private
   *
   * @param {boolean} append Append content or replace it?
   *
   * @return {string}
   */
  Menu.prototype.render = function( append ) {
    var menu_tpl = this.templates.menu,
      child_tpl = this.templates.child,
      child_wrap = this.templates.child_wrap,
      menu_render = '',
      children_render = [];

    $( this.children ).each( function( index, child ) {
      if ( child instanceof Menu ) {
        children_render.push(
          child_tpl.replace( /\%1\$s/g, 'super-guacamole__menu__child' )
                   .replace( /\%2\$s/g, child.href )
                   .replace( /\%3\$s/g, child.title )
        );
      }
    } );

    menu_render = menu_tpl
      .replace( /\%1\$s/g, 'super-guacamole__menu' )
      .replace( /\%2\$s/g, 'super-guacamole__menu__item' )
      .replace( /\%3\$s/g, this.href )
      .replace( /\%4\$s/g, this.title );

    if ( 0 < children_render.length ) {
      menu_render = menu_render.replace(
        /\%5\$s/g,
        child_wrap.replace(
          /\%s/g,
          children_render.join( '\n' )
        )
      );
    } else {
      menu_render = menu_render.replace( /\%5\$s/g, '' );
    }

    if ( this.$container ) {
      this.$container[ append ? 'append' : 'html' ]( menu_render );
    }

    return menu_render;
  };

  /**
   * Watch handler.
   *
   * @access private
   *
   * @param  {jQuery}      Parent element which contains the menu.
   * @param  {object}      Options object.
   *
   * @return {boolean}
   */
  Menu.prototype.watch = function( $parent, options ) {
    var self = this;

    /**
     * Calculate the widths & show/hide the menu elements
     *
     * @access private
     */
    function watch() {
      var $selector,
        $menu = self.$container.find( '.super-guacamole__menu__item' );

      if( $( window ).width() >= options.threshold ) {
        $menu.show();

        $selector = self.$container.children( options.children_filter );

        if ( $selector.filter( ':not(.hidden)' ).length < options.min_children ) {

          console.log( 1 );

          //$selector.filter( ':visible' ).last().hide();
          self.$container.find( '.super-guacamole__menu__child:visible:first' ).hide();
        } else {

          console.log( 2 );

          //$selector.filter( ':hidden' ).first().show();
          //self.$container.find( '.super-guacamole__menu__child:hidden:first' ).show();

          $menu.hide();
        }
      } else {
        $menu.hide();
      }
    }

    //if ( flag ) {

      if ( 0 < self.$container.length ) {
        self.$container
          .addClass( 'super-guacamole__menu-active' )
          .removeClass( 'super-guacamole__menu-inactive' );

        watch();
      }

      return true;
    //}

    /*if ( 0 < self.$container.length ) {
      self.$container
        .addClass( 'super-guacamole__menu-inactive' )
        .removeClass( 'super-guacamole__menu-active' );

      watch();
    }*/

    return false;
  };

  /**
   * Extract elements
   *
   * @static
   * @access private
   *
   * @param  {jQuery} $elements Collection of elements
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
   * Super Guacamole!
   *
   * @access public
   *
   * @param  {object} options {
   *                          	threshold: 400, // Minimal menu width, when this plugin activates
   *                          	min_children: 3, // Minimal visible children count
   *                          	children_filter: 'li', // Child elements selector
   *                          	templates: {
   *                          		menu: '<li class="%1$s"><a href="%2$s">%3$s</a><ul class="%4$s">%5$s</ul></li>',
   *                          		child: '<li class="%1$s"><a href="%2$s">%3$s</a></li>'
   *                          	}
   *                          }.
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

    /**
     * Resize event handler
     *
     * @access private
     *
     * @param  {jqEvent} event jqEvent object.
     */
    function handler( event ) {
      the_menu.watch( $menu, {
        min_children: settings.min_children,
        children_filter: settings.children_filter,
        threshold: settings.threshold
      } );
    }

    handler();
    $( window ).on( 'resize', handler );
  };

} ( jQuery ) );
