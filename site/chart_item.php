<?php // this is used for each chart ?>
<div id="<?php echo $chart; ?>-<?php echo $post->ID; ?>" class="chart-item">
	<img height="16" width="16" class="loading" src="<?php echo WM_PLUGIN_URL; ?>/assets/images/ajax-loader_<?php echo esc_attr( $wm_options['theme'] ); ?>.gif">
</div>

<?php // not print chart caption if option is setted to no ?>
<?php if( $wm_options['captions'] == 1 )
	echo '<p>'. __( $chart, 'watchmouse-public-status-pages-widget' ) .'</p>'."\n";
?>

<?php
	// this is used only to push variables to .pot file for translation. The actual part that echo's the captions is at the echo above
	
	__( 'HourlyPageLoadTime', 'watchmouse-public-status-pages-widget' );
	__( 'WorldDailyPerformance', 'watchmouse-public-status-pages-widget' );
	__( 'DailyUptime', 'watchmouse-public-status-pages-widget' );
	__( 'HourlyUptime', 'watchmouse-public-status-pages-widget' );
?>