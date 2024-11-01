<?php get_header(); ?>

<?php // below div id is different for wp 3.2 Twenty Eleven theme so this is setted with a variable ?>
<div id="<?php echo esc_attr( $theme_name ); ?>">
	<div id="content" class="content-psp" role="main">
		<?php echo $script; ?>
		<div id="wm-psp-page" class="wm-psp-comp wm-<?php echo esc_attr( $wm_options['theme'] ); ?>"><!--start WM PSP Page-->

			<?php // for printing Component Heading ?>
			<h1><?php printf( esc_html__('CURRENT_STATUS', 'watchmouse-public-status-pages-widget' ), esc_html( $client_name ) ); ?></h1>
			
			<?php // last update time bubble ?>
			<div id="psp_last_update" class="wm-hidden"></div>
			
			<div id="psp-tables-con">
				<?php // Current Performance and Availability Status table ?>
				<h2><?php esc_html_e('CURR_PERF_AVAIL_STAT', 'watchmouse-public-status-pages-widget' ); ?></h2><!--start overview table-->
				<table id="wm-psp-uptime-table" class="psp-table wm-hidden" cellpadding="<?php echo esc_attr( $wm_options['table_padding'] ); ?>" cellspacing="<?php echo esc_attr( $wm_options['table_spacing'] ); ?>" width="100%">
					<tr>
						<th width="28%" colspan="2"><?php _e('MON_NAME', 'watchmouse-public-status-pages-widget' ); ?></th>
						<th width="34%"><?php _e('PERF_AVAIL_STAT', 'watchmouse-public-status-pages-widget' ); ?></th>
						<th width="23%"><?php _e('PERFORMANCE_24', 'watchmouse-public-status-pages-widget' ); ?></th>
						<th width="15%"><?php _e('UPTIME_24', 'watchmouse-public-status-pages-widget' ); ?></th>
					</tr>
				</table>
				<img height="16" width="16" class="loading-uptime" src="<?php echo WM_PLUGIN_URL; ?>/assets/images/ajax-loader_<?php echo esc_attr( $wm_options['theme'] ); ?>.gif">
				
				<?php // Performance and Availability History table ?>
				<h2><?php esc_html_e('PERF_AVAIL_HIST', 'watchmouse-public-status-pages-widget' ); ?></h2><!--start history table-->
				<table id="wm-psp-history-table" class="psp-table wm-hidden" cellpadding="<?php echo esc_attr( $wm_options['table_padding'] ); ?>" cellspacing="<?php echo esc_attr( $wm_options['table_spacing'] ); ?>" width="100%">
					<tr>
						<th width="23%"><?php _e('PUBLIC_API', 'watchmouse-public-status-pages-widget' ); ?></th>
						<th id="hist_date_0" width="11%" valign="middle" class="center"></th>
						<th id="hist_date_1" width="11%" valign="middle" class="center"></th>
						<th id="hist_date_2" width="11%" valign="middle" class="center"></th>
						<th id="hist_date_3" width="11%" valign="middle" class="center"></th>
						<th id="hist_date_4" width="11%" valign="middle" class="center"></th>
						<th id="hist_date_5" width="11%" valign="middle" class="center"></th>
						<th id="hist_date_6" width="11%" valign="middle" class="center"></th>
					</tr>
				</table>
				<img height="16" width="16" class="loading-history" src="<?php echo WM_PLUGIN_URL; ?>/assets/images/ajax-loader_<?php echo esc_attr( $wm_options['theme'] ); ?>.gif">
			</div>
			
			<?php // Icons Legend ?>
			<div id="wm-psp-legend"><!--start legend-->
					<span class="legend-status-icon-container legend-status-icon-ok"><?php _e('STATUS_0', 'watchmouse-public-status-pages-widget' ); ?></span>
					<span class="legend-status-icon-container legend-status-icon-warn"><?php _e('STATUS_1', 'watchmouse-public-status-pages-widget' ); ?></span>
					<span class="legend-status-icon-container legend-status-icon-error"><?php _e('STATUS_2', 'watchmouse-public-status-pages-widget' ); ?></span>
					<span class="legend-status-icon-container legend-status-icon-notes"><?php _e('STATUS_3', 'watchmouse-public-status-pages-widget' ); ?></span>
			</div>

			<?php // Info about this page ?>
			<div id="wm-psp-body-meta">
				<?php printf( esc_html__('ABOUT_TEXT', 'watchmouse-public-status-pages-widget' ),  esc_html( $client_name )); ?>
			</div>
			<div id="wm-psp-footer"><!--start footer-->
				<?php printf( esc_html__('ABOUT_TAG', 'watchmouse-public-status-pages-widget' ), esc_html( $client_name ) ); ?><br />
				<?php printf( __('FOOTER_TEXT', 'watchmouse-public-status-pages-widget' ), esc_html( $wm_options['page_caption'] )); ?>
			</div>
		</div>
	</div><!-- #content -->
</div><!-- #container -->

<?php
if ( $wm_options['show_sidebar'] == 1 )
	get_sidebar(); 
?>
<?php get_footer(); ?>