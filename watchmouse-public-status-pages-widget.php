<?php
/*
Plugin Name: WatchMouse Public Status Pages Widget
Plugin URI: http://www.watchmouse.com/psp_widgets/wordpress.php
Description: Public Status Page to a WatchMouse Account
Version: 1.0
Author: WatchMouse b.v.
Author http://www.watchmouse.com/


Copyright (C) 2011  WatchMouse b.v.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

A copy of the GNU General Public License can be found in LICENSE file.
*/

define('WM_PLUGIN_URL', WP_PLUGIN_URL.'/'.dirname(plugin_basename(__FILE__)));
define('WM_PLUGIN_PATH', WP_PLUGIN_DIR.'/'.dirname(plugin_basename(__FILE__)));
define('PLUGIN_VERSION', '1.0');

if (!class_exists('WM_PSP_Widget')) {
	class WM_PSP_Widget {
		public $wm_loc_script = array('jquery', 'google-jsapi');
		public $widget_enabled = FALSE;
				
		function wm_psp_widget_activate() {
			// verify that WP version is3.0 at least
			if ( version_compare( get_bloginfo( 'version' ), '3.0', '<' ) ) {
				deactivate_plugins( basename( __FILE__ ) ); // Deactivate our plugin
			}	
			
			flush_rewrite_rules();
		}
		
		function wm_psp_widget_deactivate() {
			flush_rewrite_rules();
		}
		
		// ==================
		// ! front-end area   
		// ==================
		function wm_add_front_stylesheets() {
	        if ( file_exists(WM_PLUGIN_PATH . '/assets/css/style.css') )
		        wp_register_style( 'wm_psp_widget_css', plugins_url('/assets/css/style.css', __FILE__), array(), PLUGIN_VERSION, 'all' );
			if ( file_exists(WM_PLUGIN_PATH . '/assets/css/style.min.css') )
				wp_register_style( 'wm_psp_widget_css-min', plugins_url('/assets/css/style.min.css', __FILE__), array(), PLUGIN_VERSION, 'all' );

			if ( $this->widget_enabled == TRUE ) {
				if ( file_exists(WM_PLUGIN_PATH . '/assets/css/module.css') )
					wp_register_style( 'wm_psp_widget_module', plugins_url('/assets/css/module.css', __FILE__), array(), PLUGIN_VERSION, 'all' );
			}
	    }
		
		public function wm_add_front_scripts() {
			// check if widget needs to be loaded so as to load needed assets
			if ( $this->widget_enabled == TRUE )
    			wp_register_script('jquery-sparkline', plugins_url('/assets/js/jquery.sparkline.min.js', __FILE__), array('jquery'), 1.6, TRUE);
			
			wp_register_script('google-jsapi', 'http://www.google.com/jsapi', array(), FALSE, TRUE);

			// register our script
			wp_register_script('wm-widget-js', plugins_url('/assets/js/widget.js', __FILE__), array('jquery'), PLUGIN_VERSION, TRUE);

			wp_register_script('wm-widget-js-min', plugins_url('/assets/js/widget.min.js', __FILE__), array('jquery'), PLUGIN_VERSION, TRUE);
		}
		
		function prepare_psp_page( $single ) {
			global $wp_query, $post, $wm_options;

			/* Checks for single template by post type */
			if ($post->post_type == 'public-status-pages' && !is_admin() ) {
			
				$wm_options = get_post_meta( $post->ID, 'wm_options', true );
				
				if ( isset($wm_options['folder']) && $wm_options['folder'] != '' ) {
					list ($uid, $fid, $fname) = preg_split('/,\s/', esc_html( $wm_options['folder'] ));
				} else {
					$uid = $fid = 0;
					$fname = 'Folder Name';
				}
				
				$rid = ( isset( $wp_query->query_vars['rid'] ) && is_numeric( $wp_query->query_vars['rid'] ) ) ? esc_html( $wp_query->query_vars['rid'] ) : 0;
				
				// =====================================================
				// ! set client name for merge it to page_title and on psp pages footer   
				// =====================================================
				$company_name = esc_html( $wm_options['page_caption'] );
				
				// if we are on chart page put the monitor name also in client name
		 		if (isset( $rid ) && $rid != 0) {
		 			$rname		= ( isset( $wp_query->query_vars['rname'] ) ) ? esc_html( urldecode($wp_query->query_vars['rname']) ) : '';

		 			$rname		= str_replace( '-', ' ', $rname );
		
		 			$client_name = $company_name . ' - ' . ucwords( $rname );
		 		} else {
		 			$client_name = $company_name . ' - ' . esc_html( $fname );
		 		}
				
				// build the route for the link either we use seo friendly urls or not
				$psp_page_url = self::build_link_route( $post->post_name );
				
				$wm_options = self::validate_options( $wm_options );
				
				// ============ 
			  	// !
				// ! PSP PAGE
				// !
				// ============ 
			  	if ( $rid == 0 ) {
			  		$this->wm_loc_script['js_dependencies'] = array('jquery');
			  		
			  		$this->wm_loc_script['ID'] = 0;
			  						
					// convert an array to json object for adding it to an inline script tag
					$this->wm_loc_script['options'] = array(
						"uid"					=> (int) $uid,
						"fid"					=> (int) $fid,
						"chart_types"			=> array('PSPPage'),
						"component_url"			=> $psp_page_url,
						"assets_folder_com"		=> WM_PLUGIN_URL.'/assets/'
				  	);
				  	
				  	// language variables used from js file for PSP Page
				  	if ($wm_options['multi_language'] == 1)
						wp_localize_script( 'wm-widget-js', 'wm_lang', self::js_localaziation('PSPPage'));	
			  		
			  	// ==================
			  	// !
				// ! PSP CHART PAGE
				// !
				// ================== 
			  	} else {		  		
					$chart_types = array( 'HourlyPageLoadTime', 'WorldDailyPerformance', 'DailyUptime', 'HourlyUptime' );

					$chart_types_js = $chart_types;
					$chart_types_js[] = 'ChartPage';
					
					wp_enqueue_script('google-jsapi', 'http://www.google.com/jsapi');
					$this->wm_loc_script['js_dependencies'] = array('jquery', 'google-jsapi');
					
					$this->wm_loc_script['ID'] = $post->ID;
					
					// convert an array to json object for adding it to an inline script tag
				  	$this->wm_loc_script['options'] = array(
						"uid"					=> (int) $uid,
						"fid"					=> (int) $fid,
						"rid"					=> (int) $rid,
						"chart_types"			=> $chart_types_js,
						"widget_style"			=> 3,
						"widget_width"			=> (int) esc_js( $wm_options['chart_width'] ),
						"widget_height"			=> (int) esc_js( $wm_options['chart_height'] ),
						"widget_chart_gap"		=> (int) esc_js( $wm_options['chart_gap'] ),
						"widget_chart_padding"	=> (int) esc_js( $wm_options['chart_padding'] ),
						"widget_theme"			=> esc_js( $wm_options['theme'] ),
						"widget_captions"		=> (int) esc_js( $wm_options['captions'] ),
						"widget_layout"			=> esc_js( $wm_options['chart_style'] ),
						"widget_html_markup"	=> esc_js( $wm_options['html_markup'] ),
						"assets_folder_com"		=> WM_PLUGIN_URL.'/assets/'
				  	);
				  	
				  	// language variables used from js file for PSP Chart Page
				  	if ($wm_options['multi_language'] == 1)
					  	wp_localize_script( 'wm-widget-js', 'wm_lang', self::js_localaziation('ChartPage'));
				}
				
				// enqueue the scirpts and css (minified or not) but also de-register the opposite script. Both script are registered from the beginning so as widget can load the scripts.
				wp_deregister_style( 'wm_psp_widget_module' );
				
				if ($wm_options['minified'] == 1) {
					// js
					wp_enqueue_script('wm-widget-js-min');
					wp_deregister_script('wm-widget-js');
					
					// css
					wp_enqueue_style( 'wm_psp_widget_css-min' );
					wp_deregister_style( 'wm_psp_widget_css' );
				} else {
					// js
					wp_enqueue_script('wm-widget-js');
					wp_deregister_script('wm-widget-js-min');
					
					// css
					wp_enqueue_style( 'wm_psp_widget_css' );
					wp_deregister_style( 'wm_psp_widget_css-min' );
				}		 
				
				$script = "\n".'<script type="text/javascript">/* <![CDATA[ */'
					."\n".'(typeof(WM_instances) === \'undefined\') ? WM_instances={} : \'\'; WM_instances['. $this->wm_loc_script['ID'] .'] = ' . json_encode( $this->wm_loc_script['options'] ) . ';'
	  				."\n".'/* ]]> */</script>'."\n";
				
				// below variable used for the wp 3.2 which is using a new theme with a little different structure
				$theme_name = get_current_theme();
				$theme_name = ( $theme_name == 'Twenty Eleven' ) ? 'primary' : 'container';

				// point to the correct tmpl file
				if ( $rid == 0 && !is_null( $rid ) ) {
					if(file_exists(WM_PLUGIN_PATH.'/site/default.php')) {
		    			include WM_PLUGIN_PATH.'/site/default.php';
			        	return;
			        }
				} else if ( $rid != 0 && $wm_options['html_markup'] == 'table'){
		        	switch( $wm_options['chart_style'] ){
		        		case 'horizontal':
		        			if(file_exists(WM_PLUGIN_PATH.'/site/chart_horizontal_table.php')) {
				    			include WM_PLUGIN_PATH.'/site/chart_horizontal_table.php';
				    			return;
				    		}
		        			break;
		        		case 'vertical':
		        			if(file_exists(WM_PLUGIN_PATH.'/site/chart_vertical_table.php')) {
				    			include WM_PLUGIN_PATH.'/site/chart_vertical_table.php';
				    			return;
				    		}
		        			break;
		        		case 'vertical': default:
		        			if(file_exists(WM_PLUGIN_PATH.'/site/chart_columns_table.php')) {
				    			include WM_PLUGIN_PATH.'/site/chart_columns_table.php';
				    			return;
				    		}
		        			break;
		        	}
		        } else if ( $rid != 0 && $wm_options['html_markup'] == 'default' ) {
		        	if(file_exists(WM_PLUGIN_PATH.'/site/chart.php')) {
		    			include WM_PLUGIN_PATH.'/site/chart.php';
			        	return;
		        	}
		        }
			}	
			
			return $single; 
		}	

		// ==============
		// ! admin area   
		// ============== 

		// ! Adds menus to admin page
		
		function admin_actions() {	
			add_submenu_page('edit.php?post_type=public-status-pages', __( 'Plugin Overview', 'watchmouse-public-status-pages-widget'), __( 'Plugin Overview', 'watchmouse-public-status-pages-widget'), 'manage_options', 'wm-psp-widget-overview', array(&$this, 'plugin_overview_page') );
		}
		
		function admin_js() {
			wp_enqueue_script('jquery');
			wp_enqueue_script('thickbox');
			wp_enqueue_script( 'wm-get-folders',plugins_url('/admin/js/wm-psp-get-folders.js', __FILE__) );
		}
		
		function admin_styles() {
			wp_enqueue_style('thickbox');
		}
		
		function admin_style_post_type_icon() {
			global $post_type;

			if ((isset($_GET['post_type']) && $_GET['post_type'] == 'public-status-pages') || ($post_type == 'public-status-pages')) :
				
				echo '<style>'."\n".
					'#icon-edit { background:transparent url(\''. WM_PLUGIN_URL .'/admin/images/psp-widget-ico-32.png\') no-repeat 0 0; }'."\n".
				'</style>';
			endif;
		}
		
		// ! settings pages		
		function get_folders() {
			// modal box content
			include 'admin/ajax/wm-psp-get-folders.php';
		}
		
		function plugin_overview_page() {			
			include 'admin/wm-plugin-overview.php';
		}	
		
		/* Registers post types. */ 
		function register_post_types() {
		
			/* Set up the arguments for the 'wm_public_folder’ post type. */ 
			$labels = array(
				'name' => 'Public Status Pages', 
				'singular_name' => 'Public Status Page', 
				'add_new' => 'Add Public Status Page', 
				'add_new_item' => 'Add New Public Status Page', 
				'edit_item' => 'Edit Public Status Page', 
				'new_item' => 'New Public Status Page',
				'view_item' => 'View Public Status Page',
				'search_items' => 'Search Public Status Pages',
				'not_found' => 'No Public Status Pages Found',
				'not_found_in_trash' => 'No Public Status Pages Found In Trash',
				'menu_name' => __( 'WatchMouse Status Pages', 'watchmouse-public-status-pages-widget')
			);

			register_post_type('public-status-pages', array(
				'label' => __( 'Public Status Pages', 'watchmouse-public-status-pages-widget'),
				'description' => __( 'PSP Desc', 'watchmouse-public-status-pages-widget'),
				'public' => true,
				'show_ui' => true,
				'show_in_menu' => true,
				'menu_position' => 55,
				'menu_icon' => WM_PLUGIN_URL.'/assets/images/psp-widget-ico-16.png',
				'supports' => array('title','page-attributes'),
				'register_meta_box_cb' => array(&$this, 'create_meta_boxes'),
				'can_export' => true,
				'labels' => $labels	
			) );
		}
		
		//add filter to ensure the text Book, or book, is displayed when user updates a book 
		
		function create_meta_boxes() {
			//create a custom meta box 
			add_meta_box( 'public-status-pages', __( 'General Settings - WatchMouse Public Folder', 'watchmouse-public-status-pages-widget'), array( &$this, 'render_meta_box_wm_pf' ), 'public-status-pages', 'normal', 'high' );
		}
		
		function render_meta_box_wm_pf( $post ) {	
			//retrieve the metadata values if they exist 
			$wm_options = get_post_meta( $post->ID, 'wm_options', true );
			
			//this is used to set default option for show_sidebar
			//default themes before WP 3.2 not support full page layout without sidebar, for this reason default option will be to show the sidebar 
			$show_sidebar = ( get_current_theme() == 'Twenty Ten' ) ? '1' : '0';
			
			if (empty( $wm_options )) {
				$wm_options = array (
					'page_caption'		=> __( 'Default Page Cpation', 'watchmouse-public-status-pages-widget'),
					'folder'			=> '',
					'html_markup'		=> 'default',
					'chart_style'		=> 'vertical',
					'chart_width'		=> '0',
					'chart_height'		=> '0',
					'chart_gap'			=> '20',
					'chart_padding'		=> '8',
					'table_spacing'		=> '0',
					'table_padding'		=> '3',
					'theme'				=> 'none',
					'captions'			=> '1',
					'minified'			=> '1',
					'multi_language'	=> '0',
					'show_sidebar'		=> $show_sidebar
				);
			}

			// create a custom nonce for submit verification later
			echo '<input type="hidden" name="wm_psp_update_nonce" value="', wp_create_nonce(basename(__FILE__)), '" />';
			
			// settings page
			include 'admin/wm-psp-general-settings.php';
		}
		
		function save_meta_box_wm_pf( $post_id = '' ) {
			global $meta_box;
			
			// verify if this is an auto save routine. 
			// If it is our form has not been submitted, so we dont want to do anything
			if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
				return;
				
			// verify this came from our screen and with proper authorization,
			// because save_post can be triggered at other times
			if ( !isset( $_POST['wm_psp_update_nonce'] ) || !wp_verify_nonce( $_POST['wm_psp_update_nonce'], basename( __FILE__ ) ) )
				return $post_id;
			
			// Check permissions
			if ( !current_user_can( 'edit_post', $post_id ) )
				wp_die( 'Insufficient privileges!' );

			// OK, we're authenticated: we need to find and save the data
			// verify the metadata is set
			if ( isset( $_POST['wm_options'] ) ) {
				$wm_options = $_POST['wm_options'];
				
				// validate the input data
				$wm_options = self::validate_options( $wm_options );
			
				update_post_meta($post_id, 'wm_options', $wm_options);
			}
			
			return $wm_options;
		}
		
		// ================
		// ! help functions 
		// ================
		
		function validate_options( $wm_options ) {
			$wm_options['page_caption'] 	= self::clean_input( $wm_options['page_caption'], 'text', 'Your PSP Name');
			$wm_options['folder'] 			= self::clean_input( $wm_options['folder'], 'text' );
			$wm_options['html_markup'] 		= self::clean_input( $wm_options['html_markup'], 'select', 'default' );
			$wm_options['chart_style']		= self::clean_input( $wm_options['chart_style'], 'select', 'vertical' );
			$wm_options['chart_width']		= self::clean_input( $wm_options['chart_width'], 'text', 0 );
			$wm_options['chart_height']		= self::clean_input( $wm_options['chart_height'], 'text', 0 );
			$wm_options['chart_gap']		= self::clean_input( $wm_options['chart_gap'], 'text', 20 );
			$wm_options['chart_padding']	= self::clean_input( $wm_options['chart_padding'], 'text', 8 );
			$wm_options['table_padding']	= self::clean_input( $wm_options['table_padding'], 'text', 0 );
			$wm_options['table_spacing']	= self::clean_input( $wm_options['table_spacing'], 'text', 3 );
			$wm_options['theme']			= self::clean_input( $wm_options['theme'], 'select', 'none' );
			$wm_options['captions']			= self::clean_input( $wm_options['captions'], 'radio', 1 );
			$wm_options['minified']			= self::clean_input( $wm_options['minified'], 'radio', 1 );
			$wm_options['multi_language']	= self::clean_input( $wm_options['multi_language'], 'radio', 0 );
			$wm_options['show_sidebar']	= self::clean_input( $wm_options['show_sidebar'], 'radio', 0 );
			
			return $wm_options;
		}
		
		function psp_updated_messages( $messages ) {
		  global $post, $post_ID;
		
		  $messages['public-status-pages'] = array(
		    0 => '', // Unused. Messages start at index 1.
		    1 => sprintf( __('Public Status Page updated. <a href="%s">View page</a>'), esc_url( get_permalink($post_ID) ) ),
		    2 => __('Custom field updated.'),
		    3 => __('Custom field deleted.'),
		    4 => __('Public Status Page updated.'),
		    /* translators: %s: date and time of the revision */
		    5 => isset($_GET['revision']) ? sprintf( __('Public Status Page restored to revision from %s'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
		    6 => sprintf( __('Public Status Page published. <a href="%s">View page</a>'), esc_url( get_permalink($post_ID) ) ),
		    7 => __('Public Status Page saved.'),
		    8 => sprintf( __('Public Status Page submitted. <a target="_blank" href="%s">Preview page</a>'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
		    9 => sprintf( __('Public Status Page scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview page</a>'),
		      // translators: Publish box date format, see http://php.net/date
		      date_i18n( __( 'M j, Y @ G:i' ), strtotime( $post->post_date ) ), esc_url( get_permalink($post_ID) ) ),
		    10 => sprintf( __('Public Status Page draft updated. <a target="_blank" href="%s">Preview page</a>'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
		  );
		
		  return $messages;
		}
		
		function empty_title_message() {
			global $post;

			// check if this is a public status page
			if ( $post == NULL ) return;
			
			$sendback = $_SERVER['REQUEST_URI'];

			if( $post->post_title == '' && $post->post_type == 'public-status-pages' && strpos($sendback, 'post-new.php') == false ) {
				?>
			    <div id="message" class="error">
			        <p><?php  _e('Please enter a title for your Public Status Page (important).') ?></p>
			    </div>
			<?php 
			}
		}
		
		// this is the main array for js localization
		function js_localaziation( $used_for = '' ) {
			$lang_vars['lang'] = array(
				"uid_not_valid"	=> esc_html__( 'UID_NOT_VALID', 'watchmouse-public-status-pages-widget' ),
				"rid_not_valid"	=> esc_html__( 'RID_NOT_VALID', 'watchmouse-public-status-pages-widget' ),
				"request_timeout"	=> esc_html__( 'REQUEST_TIMEOUT', 'watchmouse-public-status-pages-widget' ),
				"error"	=> esc_html__( 'ERROR_TEXT', 'watchmouse-public-status-pages-widget' ),
				"empty_chart_data"	=> esc_html__( 'EMPTY_CHART_DATA', 'watchmouse-public-status-pages-widget' ),
				"empty_table_data"	=> esc_html__( 'EMPTY_TABLE_DATA', 'watchmouse-public-status-pages-widget' ),
				"status_states"	=> array(
					array("text" => esc_html__( 'STATUS_0', 'watchmouse-public-status-pages-widget' ), "image" => 'images/icn-green.png'),
					array("text" => esc_html__( 'STATUS_1', 'watchmouse-public-status-pages-widget' ), "image" => 'images/icn-yellow.png'),
					array("text" => esc_html__( 'STATUS_2', 'watchmouse-public-status-pages-widget' ), "image" => 'images/icn-red.png'),
					array("text" => esc_html__( 'STATUS_3', 'watchmouse-public-status-pages-widget' ), "image" => 'images/icn-grey-black.png'),
					array("text" => '-', "image" => 'images/icn-grey-black.png')
				),
				"captions" => array(
					"Sparkline"			=> esc_html__( 'SPARKLINE', 'watchmouse-public-status-pages-widget' ),
					"Gauges"			=> esc_html__( 'GAUGES', 'watchmouse-public-status-pages-widget' )
				),
				"months" => array(
					esc_html__( 'JAN', 'watchmouse-public-status-pages-widget' ), esc_html__( 'FEB', 'watchmouse-public-status-pages-widget' ), esc_html__( 'MAR', 'watchmouse-public-status-pages-widget' ), esc_html__( 'APR', 'watchmouse-public-status-pages-widget' ), esc_html__( 'MAY', 'watchmouse-public-status-pages-widget' ), esc_html__( 'JUN', 'watchmouse-public-status-pages-widget' ), esc_html__( 'JUL', 'watchmouse-public-status-pages-widget' ), esc_html__( 'AUG', 'watchmouse-public-status-pages-widget' ), esc_html__( 'SEP', 'watchmouse-public-status-pages-widget' ), esc_html__( 'OCT', 'watchmouse-public-status-pages-widget' ), esc_html__( 'NOV', 'watchmouse-public-status-pages-widget' ), esc_html__( 'DEC', 'watchmouse-public-status-pages-widget' )
				)
			);
			
			// add this vars for PSP Page
			if ( $used_for == 'PSPPage' ) {		
				$lang_vars['lang']['psp'] = array(
					"uptime"		=> esc_html__( 'UPTIME', 'watchmouse-public-status-pages-widget' ),
					"view_details"	=> esc_html__( 'VIEW_DETAILS', 'watchmouse-public-status-pages-widget' ),
					"last_update"	=> esc_html__( 'LAST_UPDATE', 'watchmouse-public-status-pages-widget' )
				);
			// add this vars for PSP Chart Page
			} else if ( $used_for == 'ChartPage' ) {
				$lang_vars['lang']['psp'] = array(
					"uptime"		=> esc_html__( 'UPTIME', 'watchmouse-public-status-pages-widget' )
				);
				$lang_vars['lang']['charts'] = array(
					"hours"			=> esc_html__( 'HOURS', 'watchmouse-public-status-pages-widget' ),
					"days"			=> esc_html__( 'DAYS', 'watchmouse-public-status-pages-widget' ),
					"axis_titles"	=> array(
						"total_load_time" => esc_html__( 'TOTALLOADTIMEINMS', 'watchmouse-public-status-pages-widget' ),
						"uptime_perc" => esc_html__( 'UPTIMEPERC', 'watchmouse-public-status-pages-widget' )
					),
					"rtime"	=> array("name" => esc_html__( 'RESOLVE_TIME', 'watchmouse-public-status-pages-widget' ), "unit" => 'ms'),
					"ctime"	=> array("name" => esc_html__( 'CONNECT_TIME', 'watchmouse-public-status-pages-widget' ), "unit" => 'ms'),
					"ptime"	=> array("name" => esc_html__( 'PROCESSING_TIME', 'watchmouse-public-status-pages-widget' ), "unit" => 'ms'),
					"ttime"	=> array("name" => esc_html__( 'TRANSFER_TIME', 'watchmouse-public-status-pages-widget' ), "unit" => 'ms'),
					"uptime"	=> array("name" => esc_html__( 'UP_TIME', 'watchmouse-public-status-pages-widget' ), "unit" => '%'),
					"downtime"	=> array("name" => esc_html__( 'DOWN_TIME', 'watchmouse-public-status-pages-widget' ), "unit" => '%')
				);
			} else if ( $used_for == 'Widget' ) {
				$lang_vars['lang'] = array(
					"status_states"	=> array(
						array("text" => esc_html__( 'STATUS_0', 'watchmouse-public-status-pages-widget' ), "image" => 'images/icn-green.png'),
						array("text" => esc_html__( 'STATUS_1', 'watchmouse-public-status-pages-widget' ), "image" => 'images/icn-yellow.png'),
						array("text" => esc_html__( 'STATUS_2', 'watchmouse-public-status-pages-widget' ), "image" => 'images/icn-red.png'),
						array("text" => esc_html__( 'STATUS_3', 'watchmouse-public-status-pages-widget' ), "image" => 'images/icn-grey-black.png'),
						array("text" => '-', "image" => 'images/icn-grey-black.png')
					),
					"captions" => array(
						"Sparkline"			=> esc_html__( 'SPARKLINE', 'watchmouse-public-status-pages-widget' ),
						"Gauges"			=> esc_html__( 'GAUGES', 'watchmouse-public-status-pages-widget' )
					)
				);
			}
			
			$reshuffled_data = array(
			    'l10n_print_after' => 'wm_lang = ' . json_encode( $lang_vars['lang'] ) . ';'
			);
			
			return $reshuffled_data;
		}
		
		// sanitize
		function clean_input( $input, $type, $default = '' ) {
			global $allowedposttags;
			$cleanInput = false;
			switch ($type) {
			  case 'text': case 'select':
			    $cleanInput = ($input !== '') ? wp_filter_nohtml_kses ( $input ) : $default;
			    break;
		      case 'radio':
		      	$default = ($default !== '') ? $default : '0';
		        $cleanInput = ($input !== '') ?  $input : $default;
			    break;
			  case 'num':
			    $cleanInput = ( !empty( $input ) ) ? (int) $input : $default;
			  default:
			    $cleanInput = false;
			    break;
			}
			return $cleanInput;
		}
				
		// Adding a new rule
		function rewrite_rules($rules)
		{
			$newrules = array();
			$newrules['public-status-pages/([^/]+)/?([0-9]{1,})/?([^/]+)/?$'] = 'index.php?'
				.'public-status-pages=$matches[1]'
				.'&post_type=public-status-pages'
				.'&name=$matches[1]'
				.'&rid=$matches[2]'
				.'&rname=$matches[3]';
			$finalrules = $newrules + $rules;
		    
		    return $finalrules;
		}
		
		// Adding the var so that WP recognizes it
		function rewrite_query_vars($vars)
		{
			array_push($vars, 'public-status-pages');
		    array_push($vars, 'post_type');
		    array_push($vars, 'name');
		    array_push($vars, 'rid');
		    array_push($vars, 'rname');
		    
		    return $vars;
		}
		
		// build the route for the link either we use seo friendly urls or not
		function build_link_route( $post_name ) {
			if ( get_option('permalink_structure') != '' ) {
				$psp_page_url = get_site_url().'/public-status-pages/'. $post_name;
			} else {
				$psp_page_url = 'index.php?public-status-pages='. $post_name;
			}
			
			return $psp_page_url;
		}

		// ==============
		// ! register widget   
		// ============== 
		
		function register_wm_nav_widget() {
			if ( $this->widget_enabled == TRUE || is_admin() )
			    register_widget('watchmouse_folder_navigation');
		}
			
		// ==============
		// ! initialize   
		// ============== 
		
		function init() {
			$locales_dir = WM_PLUGIN_PATH.'/languages';
			load_plugin_textdomain('watchmouse-public-status-pages-widget', false, 'watchmouse-public-status-pages-widget/languages');

			// if widget is active
			if ( is_active_widget( false, false, 'wm-psp-nav' ) ){
				$this->widget_enabled = TRUE;
			}		
		}	
	}
}

if (class_exists('WM_PSP_Widget')) {	
	$widget_WM_PSP_Widget = new WM_PSP_Widget();
}

/**
 * WatchMouse Folder Navigation Widget
 */
class watchmouse_folder_navigation extends WP_Widget {
	public $widget_exists = FALSE;
	public $minified_assets = 2;
	public $first_instance = TRUE;
	public $is_public_status_page = FALSE;
	
    function watchmouse_folder_navigation() {
        $widget_ops = array('classname' => 'watchmouse_folder_navigation', 'description' => __( 'List Monitors for the selected Public Folder', 'watchmouse-public-status-pages-widget') );
		$this->WP_Widget('wm-psp-nav', __('Public Status Pages', 'watchmouse-public-status-pages-widget'), $widget_ops);
        
        // print css & js only on the frontend page
        if ( !is_admin() ) {
	        // js     
			WM_PSP_Widget::wm_add_front_scripts();
			wp_enqueue_script( 'google-jsapi' );
			wp_enqueue_script( 'jquery-sparkline' );
			wp_enqueue_script( 'wm-widget-js' );
			wp_enqueue_script( 'wm-widget-js-min' );
			
			// css
			WM_PSP_Widget::wm_add_front_stylesheets();
			wp_enqueue_style( 'wm_psp_widget_module' );
			
			// Schedule an action to remove the enqueued script; this action is removed if the widget is actually rendered (if the widget() is called)
			add_action('wp_print_footer_scripts', array(&$this, 'remove_enqueued_scripts'));
		}
    }
    
	// check if user selected minified assets files or not and remove the opposite. Or if no widgets at all remove both.
	function remove_enqueued_scripts() {
		if ( $this->is_public_status_page == FALSE && preg_match('/public-status-pages/', $_SERVER['REQUEST_URI']) == 0 ) {
			if ( $this->minified_assets == 1 ) {
				wp_deregister_script( 'wm-widget-js' );
			} elseif ( $this->minified_assets == 0 ) {
				wp_deregister_script( 'wm-widget-js-min' );
			} elseif ( $this->widget_exists == FALSE ) {
				wp_deregister_script( 'google-jsapi' );
				wp_deregister_script( 'jquery-sparkline' );
				wp_deregister_script( 'wm-widget-js' );
				wp_deregister_script( 'wm-widget-js-min' );
			}
		}
	}
	 
    function widget($args, $instance) {
        extract($args);
        global $post;
        
        $title = empty($instance['title']) ? __('WatchMouse Folder Navigation', 'watchmouse-public-status-pages-widget') : apply_filters('widget_title', $instance['title']);
		$wm_options = (string) $instance['wm_widget_options'];
		
		if ( empty($wm_options) )
			return;
			
		list ( $uid, $fid, $fname, $post_name, $minified, $multi_language ) = preg_split( '/,\s/', esc_html( $wm_options ) );
		
		$wm_theme = (string) $instance['theme'];
    	
    	// check if user selected minified assets files or not 
    	if ( $this->first_instance == TRUE ) {
    		if ( $post->post_type == 'public-status-pages' )
    			$this->is_public_status_page = TRUE;
    		
			$this->minified_assets = $minified;
			$this->first_instance = FALSE;
			$this->widget_exists = TRUE;
		}
    	
    	// Abort the scheduled removal of the enqueued script because the widget is being rendered
		//remove_action("wp_print_footer_scripts", array(__CLASS__, 'remove_enqueued_script'));
    	
    	// get the widget id
    	preg_match( '/([0-9]{1,})/', esc_attr( $args['widget_id'] ), $widget_id );   	
    	
  		$wm_loc_script['ID'] = $widget_id[0];
  		
  		// build route for links
  		$psp_page_url = WM_PSP_Widget::build_link_route( $post_name );
  		
		// convert an array to json object for adding it to an inline script tag
		$wm_loc_script['options'] = array(		
			"uid"					=> (int) $uid,
			"fid"					=> (int) $fid,
			"component_url"			=> $psp_page_url,
			"chart_types"			=> array('Sparkline', 'Gauge'),
			"widget_style"			=> 3,
			"widget_width"			=> (int) 140,
			"widget_height"			=> (int) 20,
			"widget_chart_gap"		=> (int) 0,
			"widget_chart_padding"	=> (int) 0,
			"widget_theme"			=> $wm_theme,
			"widget_captions"		=> (int) 1,
			"is_module"				=> true	
	  	);
		
	  	if ($multi_language == 1 && $post->post_type != 'public-status-pages')
			wp_localize_script( 'wm-widget-js'.($minified == 1)?'-min':'', 'wm_lang', WM_PSP_Widget::js_localaziation('Widget'));
								
    	// print widget html
    	echo $before_widget;
        if ( $title )
        	echo $before_title . $title . $after_title;
		?>
			<div id="wm-chart-widget-<?php echo $widget_id[0]; ?>" class="wm-widget-module <?php if ($wm_theme == 'mod-dark') echo $wm_theme; ?>"><!--start WM module-->
	        
		        <?php // loading image ?>
				<img height="16" width="16" class="loading" src="<?php echo WM_PLUGIN_URL; ?>/assets/images/ajax-loader_<?php echo esc_attr( $wm_theme ); ?>.gif">
			</div>
			<script type="text/javascript">/* <![CDATA[ */
				(typeof(WM_instances) === 'undefined') ? WM_instances={} : ''; WM_instances['<?php echo $wm_loc_script['ID']; ?>'] = <?php echo json_encode( $wm_loc_script['options'] ); ?>;
  			/* ]]> */</script>
		<?php
        echo $after_widget;
    }
 
    function update( $new_instance, $old_instance ) {
        $instance = $old_instance;
        $instance['title'] = strip_tags($new_instance['title']);
        $instance['wm_widget_options'] = (string) $new_instance['wm_widget_options'];
        $instance['theme'] = ( $new_instance['theme'] !== '' ) ? wp_filter_nohtml_kses ( $new_instance['theme'] ) : 'mod-light';
 
        return $instance;
    }
 
    function form( $instance ) {
    	global $wpdb;
    	
    	$defaults = array('title' => __( 'WatchMouse Folder Navigation', 'watchmouse-public-status-pages-widget'), 'wm_widget_options' => '', 'theme' => 'mod-light');
        $instance = wp_parse_args( (array) $instance, $defaults );
        
        $title = attribute_escape($instance['title']);
        $wm_options = (string) $instance['wm_widget_options'];
		$wm_theme = (string) $instance['theme'];
		
		$all_psp_pages = new WP_Query( array( 'post_type' => 'public-status-pages', 'post_status' => 'publish') );
	    ?>
	    
        <p><label for="<?php echo $this->get_field_id('title'); ?>">
	        <?php esc_html_e('Title', 'watchmouse-public-status-pages-widget'); ?>:
	        <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </label></p>
        <p><label for="<?php echo $this->get_field_id('wm_widget_options'); ?>">
	        <?php esc_html_e('Folder to show', 'watchmouse-public-status-pages-widget'); ?>:
	        
	        <select id="<?php echo $this->get_field_id('wm_widget_options'); ?>" name="<?php echo $this->get_field_name('wm_widget_options'); ?>">
	        	<option value=""><?php esc_html_e('Please select a folder', 'watchmouse-public-status-pages-widget'); ?></option>
	        	<?php 
	        	foreach($all_psp_pages->posts as $folder) { 
	        		$folder_post_meta = get_post_meta($folder->ID, 'wm_options');
					$select_value = $folder_post_meta[0]['folder'].', '. $folder->post_name.', '. $folder_post_meta[0]['minified'].', '. $folder_post_meta[0]['multi_language'];
					
					echo '<option value="'
						. $select_value .'"'
						.selected( $wm_options, $select_value ) .'>'
						.$folder->post_title
					.'</option>';
	
				}
				?>
			</select>
        </label></p>
        
        <p><label for="<?php echo $this->get_field_id('theme'); ?>">
	        <?php esc_html_e('Theme', 'watchmouse-public-status-pages-widget'); ?>:
	        
	        <select id="<?php echo $this->get_field_id('theme'); ?>" name="<?php echo $this->get_field_name('theme'); ?>">
				<option value="mod-light" <?php selected( 'mod-light', $wm_theme ); ?>><?php esc_html_e('Light', 'watchmouse-public-status-pages-widget'); ?></option>
				<option value="mod-dark" <?php selected( 'mod-dark', $wm_theme ); ?>><?php esc_html_e('Dark', 'watchmouse-public-status-pages-widget'); ?></option>
			</select>
        </label></p>
	    <?php
    }
}

if (isset($widget_WM_PSP_Widget)) {
	add_action('init', array(&$widget_WM_PSP_Widget, 'init'), 1 );
	
	// Set up the post types.
	add_action( 'init', array(&$widget_WM_PSP_Widget, 'register_post_types') );
	
	// add query vars support for monitor pages (chart pages)
	add_filter('rewrite_rules_array',array(&$widget_WM_PSP_Widget, 'rewrite_rules') );
	add_filter('query_vars',array(&$widget_WM_PSP_Widget, 'rewrite_query_vars') );
	
	// create Widget
	add_action("widgets_init", array( &$widget_WM_PSP_Widget, 'register_wm_nav_widget' ) );
	
	// if this is frontend page
	if ( !is_admin() ) {
		add_action('init', array(&$widget_WM_PSP_Widget, 'wm_add_front_stylesheets'), 1 );
		
		add_action('init', array(&$widget_WM_PSP_Widget, 'wm_add_front_scripts'), 1 );

		//single_template
		add_action('template_include', array( &$widget_WM_PSP_Widget, 'prepare_psp_page' ) );
	// if this is admin area
	} else {
		/* Runs when plugin is activated/deactivated */
		register_activation_hook( __FILE__, array(&$widget_WM_PSP_Widget, 'wm_psp_widget_activate') );
		register_deactivation_hook( __FILE__, array(&$widget_WM_PSP_Widget, 'wm_psp_widget_deactivate') );
		
		// create an overview menu page on the current menu
		add_action( 'admin_menu', array(&$widget_WM_PSP_Widget, 'admin_actions') );
				
		// admin css & js
		add_action( 'admin_print_styles', array(&$widget_WM_PSP_Widget, 'admin_styles') );
		add_action( 'admin_print_styles', array(&$widget_WM_PSP_Widget, 'admin_style_post_type_icon'), 100 );
		add_action( 'admin_print_scripts', array(&$widget_WM_PSP_Widget, 'admin_js') );
		add_action( 'wp_ajax_get_folders', array(&$widget_WM_PSP_Widget, 'get_folders') );
		
		// Do something with the data entered 
		add_action( 'save_post', array(&$widget_WM_PSP_Widget, 'save_meta_box_wm_pf') );
		
		add_action('admin_notices', array(&$widget_WM_PSP_Widget, 'empty_title_message') );
		add_filter('post_updated_messages', array(&$widget_WM_PSP_Widget,'psp_updated_messages'));
	}
}
?>