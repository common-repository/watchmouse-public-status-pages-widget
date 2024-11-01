<?php 
// If uninstall not called from WordPress exit 
if( !defined( ‘WP_UNINSTALL_PLUGIN’ ) )
	exit ();

// Delete option from options table 
delete_option( 'widget_wm-psp-nav' );

$wpdb->query("DELETE a,b,c FROM wp_posts a
LEFT JOIN wp_term_relationships b ON (a.ID=b.object_id)
LEFT JOIN wp_postmeta c ON (a.ID=c.post_id)
WHERE a.post_type='public-status-pages'");

?>