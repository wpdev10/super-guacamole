# super-guacamole
Super Guacamole is a script for generating a dropdown menu from WordPress Site Navigation (`#site-navigation`).
It will add menu items dynamically based on window width.

# Usage

```js

$( '.main-navigation' ).superGuacamole( {
	threshold: 768, // Minimal menu width, when this plugin activates
	minChildren: 3, // Minimal visible children count
	childrenFilter: '.menu-item', // Child elements selector
	menuTitle: 'More', // Menu title
	menuUrl: '#',
	templates: {
		menu: '<li id="%5$s" class="%1$s"><a href="%2$s">%3$s</a><ul class="sub-menu">%4$s</ul></li>',
		child_wrap: '<ul class="%1$s">%2$s</ul>',
		child: '<li id="%5$s" class="%1$s"><a href="%2$s">%3$s</a><ul class="sub-menu">%4$s</ul></li>'
	}
} );

```
