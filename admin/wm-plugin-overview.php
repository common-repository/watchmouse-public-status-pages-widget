<?php
    $url = WM_PLUGIN_URL . '/admin/css/overview.css';
    echo "<link rel='stylesheet' type='text/css' href='$url' />\n";
?>
<div class="wrap wm-howto">
	<div id="icon-edit" class="icon32"></div>
	<h2>WordPress Public Status Pages Widget - Tutorial</h2>

    <p>
        Impress your WordPress users by transparently displaying your WatchMouse Public Status Page statistics in clear graphs on your WordPress site.
    </p>
    <p>
        After creating a WatchMouse Public Status Page containing your website and server monitors, the component can use the WatchMouse API to download your monitoring results and push them to your WordPress site. Using CSS you can adjust the look and feel to match your organization's style.
    </p>
    <p>     
       The Public Status Page Widget allows your WordPress site users to view:
        <ul>
            <li>The current status and response times for any published WatchMouse Public Status Page</li>
            <li>Uptime and response times in hourly, daily or weekly graphs</li>
            <li>A list of any outages</li>
        </ul>
    </p>
    <p>&nbsp;</p>
    <p>Follow the below steps to create a new WatchMouse Public Status Page (PSP) for your website:</p>
    
    <div class="step left">
    	<h3>1. Creating a Public Status Page</h3>
    	<div class="image-wrap step-1 right">
            <img src="<?php echo plugins_url('/images/step-1.jpg', __FILE__); ?>" alt="" />
            <span><b>Figure 1</b>: Creating a Public Status Page</span>
        </div>
        
        <p>To begin, you have to navigate to "WM Public Status Pages" -> "Add Public Status Page". You will view a page like the one showed at <b>Figure 1</b>.</p>
        <p>The page settings include:</p>
        <dl>
            <dt>PSP Name</dt>
            <dd>This name will be used for the title and footer of the PSP.</dd>
            <dt>Public Folder Name</dt>
            <dd>Click on 'Get Public Folder!' to login on your WatchMouse account and retrieve a list of your Public Folders. Select the Public Folder you wish to push to your WordPress site.</dd>
            <dt>Chart HTML Markup</dt>
            <dd>You can select between Div / CSS Markups and Table Markup. Depending on how your site template has been created you may encounter problems with a Div / CSS Markup in which case, please select the Table Markup option.</dd>
            <dt>Chart Orientation</dt>
            <dd>Select how your charts should be oriented.</dd>
            <dt>Chart Width (W)</dt>
            <dd>This is the width of each chart container. If you enter '0' then the width will be automatically calculated for you.</dd>
            <dt>Chart Height (H)</dt>
            <dd>This is the height of the chart container. If you enter '0' then the height will be automatically calculated for you.</dd>
            <dt>Space Between Charts (S)</dt>
            <dd>This is the white space between the different chart containers.</dd>
            <dt>Padding Around Charts</dt>
            <dd>This is the padding around the actual chart, inside the chart's container. If you have selected the 'WatchMouse' theme the padding is shaded gray in accordance with the WatchMouse theme colors. If you select 'None' as your theme, the padding is not visible as it is white and therefore blends in with the background.</dd>
            <dt>Theme</dt>
            <dd>The 'WatchMouse' theme applies attractive colors and formatting to your PSP layout. If you select 'None' as your theme the basic chart display will be applied for the PSP layout, which you can adjust, using your template CSS file. You can also easily apply your own themes.</dd>
            <dt>Show Captions</dt>
            <dd>Elect if you prefer to show or hide the captions for each chart.</dd>
            <dt>Compress CSS & JS</dt>
            <dd>This option gives Web Programmers or Designers that ability to change the design or the way the PSP works. If this option is set to 'Yes' the plugin will use minified, compressed CSS and JavaScript files for faster loading. If you are unsure about this option please leave it at the default setting 'Yes' so as the PSP loads faster.</dd>
            <dt>Multi-language Site</dt>
            <dd>This option allows your PSP to support multiple languages. If you want our PSP to be multi-language, set this option to 'Yes'. You can find a list of available languages at http://www.watchmouse.com/psp_widgets/wordpress.php or you can create a language translation of your own.</dd>
            <dt>Show WordPress Sidebar</dt>
            <dd>This option gives Web Programmers or Designers that ability to choose whether to display or hide the WordPress sidebar in their Public Status Page. The default option is to hide the sidebar so that the Public Status Page displays using the website's full width. </dd>
        </dl>
    </div>
    
    <div class="step left">
    	<h3>2. Adding a Widget</h3>
    	<div class="image-wrap right">
            <img src="<?php echo plugins_url('/images/step-2.jpg', __FILE__); ?>" alt="" />
            <span><b>Figure 2</b>: Adding a Widget</span>
        </div>
        
        <p>You can add a widget to your sidebar that displays the results of monitors for the selected Public Status Page. To do this navigate to "Appearance" -> "Widgets".</p>
        <p>The options as shown in <b>Figure 2</b> are:</p>
		
		<dl>
            <dt>Title</dt>
            <dd>The Widget's title.</dd>
            <dt>Folder to show</dt>
            <dd>Select from this dropdown the Public Status Page (already created) you wish to connect to this widget.</dd>
            <dt>Theme</dt>
            <dd>The 'Light' theme is designed for layouts with light background colors. Conversely, the 'Dark' theme should be selected if your organisation’ s color scheme has a dark background. You can also adjust widgets using your template CSS file or easily apply your own themes.</dd>
        </dl>
    </div>
    
    <div class="step left">
        <h3>3. Adding a Menu</h3>
        <div class="image-wrap right">
            <img src="<?php echo plugins_url('/images/step-4.jpg', __FILE__); ?>" alt="" />
            <span><b>Figure 3</b>: Adding a Menu</span>
        </div>
        
        <div class="image-wrap right clear-r margin-t">
            <img src="<?php echo plugins_url('/images/step-3.jpg', __FILE__); ?>" alt="" />
            <span><b>Figure 4</b>: Adding Menu Widget</span>
        </div>
        
        <p>Optionally, you can create a menu with your Public Status Pages. <br /> To do this navigate to "Appearance" -> "Menus".<br />
        	Now follow the instructions on the right area, as shown in <b>Figure 3</b>.
        </p>
        <p>Finally, you must navigate to the widgets page and add a "Custom Menu" widget to your sidebar, as shown in <b>Figure 4</b>.
        </p>
    </div>
</div>