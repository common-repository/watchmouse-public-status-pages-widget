<?php
	if ( isset( $wm_options['folder'] ) && $wm_options['folder'] != '' ) {
		list ($uid, $fid, $fname) = preg_split('/,\s/', esc_attr( $wm_options['folder'] ));
	} else {
		$fname = __( 'No Public Folder selected yet', 'watchmouse-public-status-pages-widget');
	}
?>

<div class="settings-page wrap">
	<p>Don't have a WatchMouse account? <a href="http://watchmouse.com/" target="_blank">Take one for free</a>.</p>

	<?php 
	$prefix = 'wm_';
	$meta_box_fields = array(
		array(
		    'name' => __( 'PSP Name', 'watchmouse-public-status-pages-widget'),
		    'id' => 'page_caption',
		    'type' => 'text',
		    'size' => '22'
		),
		array(
		    'name' => __( 'Public Folder', 'watchmouse-public-status-pages-widget'),
		    'id' => 'folder',
		    'type' => 'text',
		    'std' => '',
		    'public_folder' => 1,
		    'attr' => 'style="display:none;"'
		),
		array(
		    'name' => __( 'Chart HTML Markup', 'watchmouse-public-status-pages-widget'),
		    'id' => 'html_markup',
		    'type' => 'select',
		    'options' => array(
		        array('name' => __( 'Div / CSS Markup', 'watchmouse-public-status-pages-widget'), 'value' => 'default'),
		        array('name' => __( 'Table Markup', 'watchmouse-public-status-pages-widget'), 'value' => 'table')
		    )
		),
		array(
		    'name' => __( 'Chart Orientation', 'watchmouse-public-status-pages-widget'),
		    'id' => 'chart_style',
		    'type' => 'select',
		    'options' => array(
		        array('name' => __( 'Horizontal', 'watchmouse-public-status-pages-widget'), 'value' => 'horizontal'),
		        array('name' => __( 'Vertical', 'watchmouse-public-status-pages-widget'), 'value' => 'vertical'),
		        array('name' => __( '2-columns layout', 'watchmouse-public-status-pages-widget'), 'value' => 'columns')
		    )
		),
		array(
		    'name' => __( 'Chart Width (W)', 'watchmouse-public-status-pages-widget'),
		    'id' => 'chart_width',
		    'type' => 'text'
		),
		array(
		    'name' => __( 'Chart Height (H)', 'watchmouse-public-status-pages-widget'),
		    'id' => 'chart_height',
		    'type' => 'text'
		),
		array(
		    'name' => __( 'Space between Charts (S)', 'watchmouse-public-status-pages-widget'),
		    'id' => 'chart_gap',
		    'type' => 'text'
		),
		array(
		    'name' => __( 'Padding around Chart', 'watchmouse-public-status-pages-widget'),
		    'id' => 'chart_padding',
		    'type' => 'text'
		),
		array(
		    'name' => __( 'Theme', 'watchmouse-public-status-pages-widget'),
		    'id' => 'theme',
		    'type' => 'select',
		    'options' => array(
		        array('name' => __( 'None', 'watchmouse-public-status-pages-widget'), 'value' => 'none'),
		        array('name' => __( 'Watchmouse', 'watchmouse-public-status-pages-widget'), 'value' => 'light')
		    )
		),
		array(
		    'name' => __( 'Show Captions', 'watchmouse-public-status-pages-widget'),
		    'id' => 'captions',
		    'type' => 'radio',
		    'attr' => 'style="margin-left:10px;"',
		    'options' => array(
		        array('name' => __( 'Yes', 'watchmouse-public-status-pages-widget'), 'value' => '1'),
		        array('name' => __( 'No', 'watchmouse-public-status-pages-widget'), 'value' => '0')
		    )
		),
		array(
		    'name' => __( 'Compress CSS & JS', 'watchmouse-public-status-pages-widget'),
		    'id' => 'minified',
		    'type' => 'radio',
		    'attr' => 'style="margin-left:10px;"',
		    'options' => array(
		        array('name' => __( 'Yes', 'watchmouse-public-status-pages-widget'), 'value' => '1'),
		        array('name' => __( 'No', 'watchmouse-public-status-pages-widget'), 'value' => '0')
		    )
		),
		array(
		    'name' => __( 'Multi-language site', 'watchmouse-public-status-pages-widget'),
		    'id' => 'multi_language',
		    'type' => 'radio',
		    'attr' => 'style="margin-left:10px;"',
		    'options' => array(
		        array('name' => __( 'Yes', 'watchmouse-public-status-pages-widget'), 'value' => '1'),
		        array('name' => __( 'No', 'watchmouse-public-status-pages-widget'), 'value' => '0')
		    )
		),
		array(
		    'name' => __( 'Show WordPress Sidebar', 'watchmouse-public-status-pages-widget'),
		    'id' => 'show_sidebar',
		    'type' => 'radio',
		    'attr' => 'style="margin-left:10px;"',
		    'options' => array(
		        array('name' => __( 'Yes', 'watchmouse-public-status-pages-widget'), 'value' => '1'),
		        array('name' => __( 'No', 'watchmouse-public-status-pages-widget'), 'value' => '0')
		    )
		)
	);
	
	$thickbox_button = '<td>'."\n".
			'<a class="thickbox button" href="'. get_option('siteurl') .'/wp-admin/admin-ajax.php?action=get_folders&width=480&height=250" title="'. __( 'WatchMouse Public Status Pages', 'watchmouse-public-status-pages-widget') .'">'. __( 'Get Public Folders', 'watchmouse-public-status-pages-widget') .' &raquo;</a>'."\n".
		'</td>'."\n";
	
	// Use nonce for verification
	//wp_nonce_field( plugin_basename( __FILE__ ), 'wm_psp_update_nonce' );
	
	echo '<table class="form-table">'."\n";
	
	foreach ($meta_box_fields as $field) {
	    // get current post meta data
	    //$meta = get_post_meta($post->ID, $field['id'], true);
	    
	    echo '<tr>'."\n".
	            '<th scope="row"><label for="'. $prefix.$field['id'] .'">'. $field['name'] .'</label></th>'."\n".
	            '<td'. ( ($field['id'] != 'folder') ? ' colspan="2"' : '' ) .'>'."\n";
	    
	    switch ($field['type']) {
	        case 'text':
	        	if ( $field['id'] == 'folder' )
	        		echo '<span class="wm-public-folder">'. esc_attr( $fname ) .'</span>'."\n";
	            echo '<input type="text" name="wm_options['. $field['id'] .']" id="'. $prefix.$field['id'] .'" value="'. $wm_options[ $field['id'] ] .'" size="'.(isset($field['size']) ? $field['size'] : '13') .'"'. (isset($field['attr']) ? ' '.$field['attr'] : '') .' />'."\n";
	            if ( $field['id'] == 'folder' )
	        		echo $thickbox_button;
	            break;
	        case 'select':
	            echo '<select name="wm_options['. $field['id'] .']" id="'. $prefix.$field['id'] .'">'."\n";
	            foreach ($field['options'] as $option) {
	                echo '<option value="'. $option['value'] .'" '. ($wm_options[ $field['id'] ] == $option['value'] ? ' selected="selected"' : '') .'>'. $option['name']. '</option>'."\n";
	            }
	            echo '</select>'."\n";
	            break;
	        case 'radio':
	            foreach ($field['options'] as $option) {
	                echo '<input type="radio" id="'. $prefix.$field['id'].$option['value'] .'" name="wm_options['. $field['id'] .']" value="'. $option['value'] .'"'. ( ($wm_options[ $field['id'] ] == $option['value']) ? ' checked="checked"' : ''). ( isset($field['attr']) ? ' '.$field['attr'] : '' ) .' />'. 
	                	'<label for="'. $prefix.$field['id'].$option['value'] .'"> '. $option['name'] .'</label>'."\n";
	            }
	            break;
	    }
	    echo '</td>'."\n".
	    	'</tr>'."\n";
	}
	
	echo '</table>'."\n";
	
	?>

</div>