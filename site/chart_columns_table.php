<?php get_header(); ?>

<?php // below div id is different for wp 3.2 Twenty Eleven theme so this is setted with a variable ?>
<div id="<?php echo esc_attr( $theme_name ); ?>">
	<div id="content" role="main">
		<?php echo $script; ?>
		<div id="wm-psp-page" class="chart-page wm-<?php echo esc_attr( $wm_options['theme'] ); ?>"><!--start WM PSP Chart Page-->
		
			<?php // for printing Component Heading ?>
			<h1>
				<a href="<?php echo esc_url( $psp_page_url ); ?>" title="<?php printf( esc_attr__('BACK_TO_PSP_PAGE', 'wm-psp-widget'), esc_attr( $company_name ) ); ?>">
					<?php printf( esc_html__('CURRENT_STATUS', 'wm-psp-widget' ), esc_html( $client_name ) ); ?>
				</a>
			</h1>
			
			<?php // current availability last update time bubble ?>
			<h2><?php esc_html_e('CURR_PERF_AVAIL_STAT', 'wm-psp-widget' ); ?></h2>
			<div id="wm-psp-curr-status" class="wm-hidden">
				<div id="psp_last_update" class="wm-hidden">&nbsp;</div>
			</div>
			
			<?php // charts will be printed there ?>
			<table id="wm-chart-widget-<?php echo esc_attr( $post->ID ); ?>" class="wm-chart-widget-table" cellpadding="<?php echo esc_attr( $wm_options['table_padding'] ); ?>" cellspacing="<?php echo esc_attr( $wm_options['table_spacing'] ); ?>"><!--start printing of charts-->
				<?php
				$i = 0;
				foreach ($chart_types as $chart) : ?>
				
				<?php if (!($i & 1)){ ?>
				<tr>
				<?php } ?>
					<td align="center">
						<?php if($wm_options['chart_padding'] > 0) { ?>
						<div class="chart-con wm-hidden">
						<?php } ?>
							<div class="chart-wrap">
								<?php
									if(file_exists(WM_PLUGIN_PATH.'/site/chart_item.php'))
	    								include WM_PLUGIN_PATH.'/site/chart_item.php'; 
								?>
							</div>
						<?php if($wm_options['chart_padding'] > 0) { ?>
						</div>
						<?php } ?>
					</td>
				<?php if (($i & 1)){ ?>
				</tr>
				<?php } 
				$i++;
				?>
				<?php endforeach; ?>
			</table>
			<div class="clear"></div>
			
			<?php // Performance and Availability History table ?>
			<h2><?php esc_html_e('PERF_AVAIL_HIST', 'wm-psp-widget' ); ?></h2><!--start history table-->
			<table id="wm-psp-history-table" class="psp-table wm-hidden" cellpadding="<?php echo esc_attr( $wm_options['table_padding'] ); ?>" cellspacing="<?php echo esc_attr( $wm_options['table_spacing'] ); ?>" width="100%">
				<tr>
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
			<div class="clear"></div>
			
			<?php // Icons Legend ?>
			<div id="wm-psp-legend"><!--start legend-->
					<span class="legend-status-icon-container legend-status-icon-ok"><?php _e('STATUS_0', 'wm-psp-widget' ); ?></span>
					<span class="legend-status-icon-container legend-status-icon-warn"><?php _e('STATUS_1', 'wm-psp-widget' ); ?></span>
					<span class="legend-status-icon-container legend-status-icon-error"><?php _e('STATUS_2', 'wm-psp-widget' ); ?></span>
					<span class="legend-status-icon-container legend-status-icon-notes"><?php _e('STATUS_3', 'wm-psp-widget' ); ?></span>
			</div>
			
			<?php // Info about this page ?>
			<div id="wm-psp-body-meta">
				<?php printf( esc_html__('ABOUT_TEXT', 'wm-psp-widget' ),  esc_html( $client_name )); ?>
			</div>
			<div id="wm-psp-footer"><!--start footer-->
				<?php printf( esc_html__('ABOUT_TAG', 'wm-psp-widget' ), esc_html( $client_name ) ); ?><br />
				<?php printf( __('FOOTER_TEXT', 'wm-psp-widget' ), esc_html( $wm_options['page_caption'] )); ?>
			</div>
		</div>
	</div><!-- #content -->
</div><!-- #container -->

<?php get_sidebar(); ?>
<?php
if ( $wm_options['show_sidebar'] == 1 )
	get_sidebar(); 
?><?php get_footer(); ?>