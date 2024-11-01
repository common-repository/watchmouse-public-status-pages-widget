/**
 * @package			WatchMouse PSP Widgets
 * @subpackage		PSP Widget - WordPress Plugin
 * @link			http://www.watchmouse.com
 * @copyright		Copyright (C) 2011 - 2012 WatchMouse b.v.. All rights reserved.
*/

// add js functions to an object so as to be sure for its uniquness
var wm_psp_charts = {

	// =============================================== 
	// ! set global variables and variables defaults   
	// ===============================================
	widget_defaults : { 
		defaults	: { 
			widget_container_id		: '#wm-chart-widget',
			widget_mod_container_id	: '#wm-chart-mod-widget',
			psp_page_container_id	: '#wm-psp-page',
			psp_page_uptime_table_id: '#wm-psp-uptime-table',
			psp_page_history_table_id:'#wm-psp-history-table',
			psp_page_curr_status	: '#wm-psp-curr-status',
			psp_page_last_update	: '#psp_last_update',
			widget_captions			: 1,
			gv_formatter_loaded		: false
		},
		messages	: { 
			uid_not_valid			: 'Please fill a valid WM Account id',
			rid_not_valid			: 'Please fill a valid WM Folder/Monitor id',
			request_timeout			: 'Data request timeout.',
			error					: 'Data could not be loaded at this time. Please try again in a minute.',
			empty_chart_data		: 'There is no data for that chart. Try later.',
			empty_table_data		: 'There is no data for that table. Try later.',
			psp						: {
				uptime				: 'Uptime',
				view_details		: 'View Details',
				last_update			: 'Last update'
			},
			charts					: {
				backgroung_color	: '#fff',
				text_color			: '#4c4c4c',
				hours				: 'Hours',
				days				: 'Days',
				total_time			: 'Total Time',
				min_load_time		: 'Min Load Time',
				max_load_time		: 'Max Load Time',
				country				: 'Country',
				performance			: 'Performance',
				apdex_score			: 'Apdex Score',
				axis_titles			: {total_load_time: 'Total load time in ms', uptime_perc: 'Uptime percentage[%]'},
				rtime				: {name: 'Resolve', unit: 'ms'},
				ctime				: {name: 'Connect', unit: 'ms'},
				ptime				: {name: 'Processing', unit: 'ms'},
				ttime				: {name: 'Transfer', unit: 'ms'},
				uptime				: {name: 'Up', unit: '%'},
				downtime			: {name: 'Down', unit: '%'},
				colors				: ['#669900','#CC0000','#EEA111','#119dee','#BDBDBD','#ee11b7','#1116ee','#11ee5f','#a811ee','#116fee']
			},
			captions				: {
				HourlyUptime		: 'Uptime over the last 24 hours',
				DailyUptime			: 'Uptime over the last 7 days',
				HourlyPageLoadTime	: 'Performance indication by country over the last 24 hours',
				WorldDailyPerformance:'Average daily performance for this service from selected countries',
				Sparkline			: 'Performance last 24h',
				Gauges				: 'Current Performance'
			},
			status_states	: {
				0	: {text:"Service is operating normally", image:"images/icn-green.png"},
				1	: {text:"Performance issues", image:"images/icn-yellow.png"},
				2	: {text:"Service disruption", image:"images/icn-red.png"},
				3	: {text:"Informational message", image:"images/icn-grey-black.png"},
				4	: {text:"-", image:"images/icn-grey-black.png"}
			},
			months			: {
				0 : 'Jan', 1 : 'Feb', 2 : 'Mar', 3 : 'Apr', 4 : 'May', 5 : 'Jun', 6 : 'Jul', 7 : 'Aug', 8 : 'Sep', 9 : 'Oct', 10 : 'Nov', 11 : 'Dec' 
			}
		},
		urls	: {
			mongo_cache_api			: 'http://api.io.watchmouse.com/',
			s3_url_assets			: 'http://wmassets.s3.amazonaws.com'
		},
		chart_options	: {
			area					: {top: 10, left: 70, height: '82%', width: '84%'},
			area_legend				: {top: 10, left: 70, height: '82%', width: '84%'},
			font_size				: '10',
			show_text_hours			: '3',
			show_text_days			: '2'
		},
		country_names	: {}
	},
	
	//===========================================================================
	// ! get data from API with a jsonp call
	// ! the data that needed for all charts will be parsed at once from the API
	//===========================================================================
	
	initMap : function(instance){
		// set the base url   
	    var jsonFeed = wm_psp_charts.urls.mongo_cache_api+'latest/synth/current/'+parseInt(WM_instances[instance].uid,10);	
	    	if (typeof(WM_instances[instance].rid) !== 'undefined' && WM_instances[instance].rid !== 0) {
	    		jsonFeed += '/monitor/'+parseInt(WM_instances[instance].rid,10)+'?callback=?';
	    	} else {
	    		jsonFeed += '/folder/'+parseInt(WM_instances[instance].fid,10)+'?callback=?';
	    	}
	    
	    jQuery.jsonp({
	        url: jsonFeed,
	        data: WM_instances[instance].fields,				// data that are required from the API for chart data
	        dataType: "jsonp",
	        timeout: 10000,				// timeout if call needs more than 8 seconds
	        success: function (data) {	// on success
	        	// check if API returned any data or has an error
	        	if (data.code !== 200){
					wm_psp_charts.handleError(data.info, instance);
				} else {
					// sort results by info.name
					data.result.sort(wm_psp_charts.SortByName);
					wm_psp_charts.loadPackages(data, instance);
				}
	        },
	        // if script fail to call the API or timed
	        error: function(XHR, textStatus, errorThrown){wm_psp_charts.handleError(textStatus, instance);}
	    });
	},
	
	// ========================================================================= 
	// ! load needed google visualization packages at once 
	// ! and call fuctions for chart render
	// ! passed value wm_api_data has the jsonp returned from the API
	// ========================================================================= 
	
	loadPackages : function(wm_api_data, instance) {
		if (typeof(WM_instances[instance].is_module) === 'undefined' && wm_psp_charts.iframe_version_widget !== true){
			wm_psp_charts.fillDates(wm_api_data);
		}
		
		if (instance === '0') {		// PSP Page
			wm_psp_charts.loadMonitorsUptime(wm_api_data, instance);
			wm_psp_charts.loadMonitorsHistory(wm_api_data, instance);
		}
		
		// ------ not load if psp page --------
		if (typeof(WM_instances[instance].is_module) !== 'undefined' || instance !== '0'){
		
			// load google visualization packages from google, after successful load callback some functions
			google.load('visualization','1.1',{'packages':WM_instances[instance].visualization_packages, 'callback':function(){
					
				var chart_types_length = WM_instances[instance].chart_types.length,	// get the size of the chart types array
					i = 0;	
				
				// 'while' loop was used instead of 'for', because 'switch -> break' stops the for loop
				// in other programming languages, not in php, namespaces can be defined.
				// So as to break only specific namespaces.
				
				while(i < chart_types_length){
					// makes a call to function for each chart client requested
					switch(WM_instances[instance].chart_types[i]){		
						case 'HourlyUptime':
							wm_psp_charts.drawHourlyUptime(wm_api_data, instance);
							break;
						case 'DailyUptime':
							wm_psp_charts.drawDailyUptime(wm_api_data, instance);
							break;
						case 'HourlyPageLoadTime':
							wm_psp_charts.drawHourlyPageLoadTime(wm_api_data, instance);
							break;
						case 'WorldDailyPerformance':
							wm_psp_charts.drawWorldDailyPerformance(wm_api_data, instance);
							break;
						case 'Sparkline':
							wm_psp_charts.drawSparkline(wm_api_data, instance);		
							break;
						case 'Gauge':
							wm_psp_charts.drawGauges(wm_api_data, instance);
							break;
					}
				i++;			// increase i for the while statement
				}
			}});
		}
			
		// set psp page date and status //
		// check if this instance is not for module
		if (typeof(WM_instances[instance].is_module) === 'undefined' && wm_psp_charts.iframe_version_widget !== true){		
			
			// set this monitor current status
			if (instance !== '0'){		// is chart page
				if (typeof(wm_api_data.result[0].info) !== 'undefined' && typeof(wm_api_data.result[0].info.name) !== 'undefined'){
					
					var status = 2;
					if (typeof(wm_api_data.result[0].cur.status) !== 'undefined'){
						status = wm_api_data.result[0].cur.status;
					}
	
					var status_text = '<img src="'+WM_instances[instance].assets_folder_com+wm_psp_charts.msgs.status_states[status].image+'" alt="'+wm_api_data.result[0].info.name+'" /><span>'+wm_psp_charts.msgs.status_states[status].text+'</span>';
					
					jQuery(wm_psp_charts.opts.psp_page_curr_status).prepend(status_text).removeClass('wm-hidden');
				}
				
				// fill Performance and Availability History
				wm_psp_charts.loadMonitorsHistory(wm_api_data, instance);
			}
		}
	},
	
	// ========================================================================================== 
	// ! this is code needed for PSP page
	// ========================================================================================== 
	
	loadMonitorsUptime : function(json_data, instance){
		var result_length = json_data.result.length;
		
		if (result_length < 1 || (typeof(json_data.result[0]['24h']) === 'undefined')) {	
			wm_psp_charts.handleEmptyDataError(wm_psp_charts.opts.psp_page_uptime_table_id, 5);
			jQuery(wm_psp_charts.opts.psp_page_uptime_table_id).removeClass('wm-hidden');
			jQuery('.loading-uptime').remove();
			return false;
		}
		
		var rid, name, date_string, status, ttime_24h, uptime_today, parsed_data;
	
		for(i=0;i<result_length;i++){
			parsed_data = json_data.result[i];
			
			// check that retrieved monitors returned values in this week
			check_monitors_data_are_last_7d = wm_psp_charts.makeDate(parsed_data['24h'].period.from.sec*1000, parsed_data.info.tz);
			if(wm_psp_charts.weekDates[6] > check_monitors_data_are_last_7d){ continue; }
			
			rid = parsed_data.info.id;
			name = parsed_data.info.name;
			date_string = wm_psp_charts.getDateStr(parsed_data['24h'].period.from.sec*1000, parsed_data.info.tz, 'last');
			status = (typeof(parsed_data.cur.status) !== 'undefined') ? parsed_data.cur.status : 4;
	
			ttime_24h = (typeof(parsed_data['24h'].avg.ttime) !== 'undefined' && status !== 4) ? parseInt(parsed_data['24h'].avg.ttime, 10)+' ms' : '-';
			
			uptime_today = (typeof(parsed_data['24h'].uptime) !== 'undefined' && status !== 4) ? wm_psp_charts.round_number(parsed_data['24h'].uptime, 1)+'%' : '-';
			
			wm_psp_charts.addMonitorUptime(instance, rid, name, date_string, status, ttime_24h, uptime_today);
			
			if (i === 0){
				jQuery(wm_psp_charts.opts.psp_page_uptime_table_id).removeClass('wm-hidden');
			}
		}
		
		jQuery('.loading-uptime').remove();
		jQuery(wm_psp_charts.opts.psp_page_uptime_table_id).find('tr:odd').css('background-color','#eeeeee');
	},
	
	// function that creates the html container
	addMonitorUptime : function(instance, rid, name, date_string, status, ttime_24h, uptime_today){
		var content_to_append = '<tr>\n'+
			'<td height="30px" width="3%">'+wm_psp_charts.setStatus(instance, status)+'</td>\n'+
			'<td><a href="'+wm_psp_charts.createLink(instance, rid, name)+'" title="'+wm_psp_charts.msgs.psp.last_update+': '+date_string+'">'+name+'</a></td>\n'+
			'<td>'+wm_psp_charts.setStatus(instance, status, 'text')+'</td>\n'+
			'<td>'+ttime_24h+'</td>\n'+
			'<td>'+uptime_today+'</td>\n'+
		'</tr>';
		
		jQuery(wm_psp_charts.opts.psp_page_uptime_table_id).append(content_to_append);
	},
	
	loadMonitorsHistory : function(json_data, instance){
		var result_length = json_data.result.length;
			
		if (result_length < 1 || (typeof(json_data.result[0].daily) === 'undefined')) {	
			wm_psp_charts.handleEmptyDataError(wm_psp_charts.opts.psp_page_history_table_id, 8);
			jQuery(wm_psp_charts.opts.psp_page_history_table_id).removeClass('wm-hidden');
			jQuery('.loading-history').remove();
	
			return false;
		}
		
		var data_length = json_data.result[0].daily.length;
		
		if (instance !== '0'){		// not psp page, but chart page
			result_length = 1;
		}
		
		var rid, name, date_string = [], status = [], uptime = [], parsed_data, parsed_status;
	
		for(i=0;i<result_length;i++){
			parsed_data = json_data.result[i];
			data_length = json_data.result[i].daily.length;
			
			// check that retrieved monitors returned values in this week
			check_monitors_data_are_last_7d = wm_psp_charts.makeDate(parsed_data.last.date.sec*1000, parsed_data.info.tz);
			if(wm_psp_charts.weekDates[6] > check_monitors_data_are_last_7d){ continue; }
			
			rid = parsed_data.info.id;
			name = parsed_data.info.name;
			
			// used for making history dates have reversed ordering
			var z = data_length-1;	
			date_string.length = 0; status.length = 0; uptime.length = 0;
			
			for(y=0;y<wm_psp_charts.weekDates.length;y++){
				var parsed_status = null;
				
				// reset date counter (used for reversing order)
				if (z === -1){ z = data_length-1; }
	
				date_string[y] = wm_psp_charts.weekDates[y].getFullYear() +' '+ wm_psp_charts.weekDates[y].getMonth() +' '+ wm_psp_charts.weekDates[y].getDate();
			
				for(var dataDay=0; dataDay<data_length; dataDay++){
	
					// check if data exists, used for when we have fewer data than 7 days
					if(typeof(parsed_data.daily[z]) === 'undefined' ){ break; }
									
					date2 = new Date(parsed_data.daily[z].period.from.sec*1000);
					date_str_2 = date2.getFullYear() +' '+ date2.getMonth() +' '+ date2.getDate();
					
					z--;
					if(date_string[y] === date_str_2){		
						parsed_status = parsed_data.daily[z+1];
						break;
					}
				}
	
				if (parsed_status !== null){
					status[y] = parsed_status.status;
					uptime[y] = wm_psp_charts.round_number(parsed_status.uptime, 1)+'%';
				}		
			}
			
			wm_psp_charts.addMonitorHistory(instance, rid, name, date_string, status, uptime);
					
			if (i === 0){
				jQuery(wm_psp_charts.opts.psp_page_history_table_id).removeClass('wm-hidden');
			}
		}
		
		jQuery('.loading-history').remove();
		jQuery(wm_psp_charts.opts.psp_page_history_table_id).find('tr:odd').css('background-color','#eeeeee');
	},
	
	addMonitorHistory : function(instance, rid, name, date_string, status, uptime){
		var content_to_append = '<tr>\n';
	
		if (instance === '0'){		// not chart page, but psp page
			content_to_append += '<td><a href="'+wm_psp_charts.createLink(instance, rid, name)+'" title="'+wm_psp_charts.msgs.psp.view_details+'">'+name+'</a></td>\n';
		}
		
		if(typeof(status) !== 'undefined' && typeof(status) === 'object'){
			var status_length = 7; //status.length;
			for(z=0;z<status_length;z++){
				var status_val = (typeof(status[z]) !== 'undefined') ? status[z] : 4;
				var uptime_val = (typeof(uptime[z]) !== 'undefined') ? uptime[z] : '-';
				var status_type = (status_val !== 4) ? 0 : 'text';
				
				content_to_append += '<td class="center">'+wm_psp_charts.setStatus(instance, status_val, status_type, uptime_val)+'</td>\n';
			}
		}
		content_to_append += '</tr>';
		
		jQuery(wm_psp_charts.opts.psp_page_history_table_id).append(content_to_append);
	},
	
	createLink : function(instance, rid, name){
		var result;
		
		// convert name to slug
		name = name.replace(/\\p{L}[^a-zA-Z 0-9\-]+/g,'').toLowerCase().replace(/\s/g,'-');
	
		// check if component url is initiated
		var filter_url = /(index\.php)/;
		if (WM_instances[instance].seo_friendly === true || !filter_url.test(WM_instances[instance].component_url)) {	// if seo friendly
			result = WM_instances[instance].component_url+'/'+rid+'/'+name;
			WM_instances[instance].seo_friendly = true;
		} else {
			result = WM_instances[instance].component_url+'&rid='+rid+'&rname='+name;
		}
	
		return result;
	},
	
	setStatus : function(instance, status, type, alt){
		var result;
			
		if (type === 'text'){
			result = wm_psp_charts.msgs.status_states[status].text;
			if (status === 2){
				result = '<span class="caution">'+result+'</span>';
			}
		} else {
			alt = (typeof(alt) !== 'undefined') ? ' alt="<b>'+wm_psp_charts.msgs.psp.uptime+':</b> '+alt+'" class="wm-tooltip"' : '';
			result = '<img src="'+WM_instances[instance].assets_folder_com+wm_psp_charts.msgs.status_states[status].image+'"'+alt+' />';
		}
		return result;
	},
	
	// ========================================================================================== 
	// ! in the next section there are the render functions for charts in factory JS widget  
	//
	// ! only the first function was documented, all the functions following the same principles
	// ========================================================================================== 
	
	// Hourly Uptime
	// __________________________________________________________________________
	// API jsonp fields needed: hourly.uptime;hourly.downtime;hourly.period.from
	drawHourlyUptime : function(json_data, instance) {	
		var data_length = json_data.result[0].hourly.length;
		
		if (data_length < 1) {	
			wm_psp_charts.handleEmptyDataError('#HourlyUptime-'+instance, 'chart');
			return false;
		}
		
		var data = new google.visualization.DataTable();
		
		data.addRows(data_length); 
		data.addColumn('string', wm_psp_charts.msgs.charts.hours);  
		data.addColumn('number', wm_psp_charts.msgs.charts.uptime.name);
		
	  	var parsed_data, min_value = 100, value;
	  
		for(i=0;i<data_length;i++){
			parsed_data = json_data.result[0].hourly[i];
			
			dateString = wm_psp_charts.getDateStr(parsed_data.period.from.sec*1000, json_data.result[0].info.tz);
	
			value = parseInt(parsed_data.uptime,10);
			min_value = (value < min_value) ? value : min_value;
	
			data.setValue(i, 0, dateString);
			data.setValue(i, 1, value);
		}
			
		var options = {
			width			: WM_instances[instance].widget_width,
			height			: WM_instances[instance].widget_height,
			is3D			: false,
			fontSize		: wm_psp_charts.chart_options.font_size,
			isStacked		: false,
			pointSize		: 2,
			vAxis			: {title: wm_psp_charts.msgs.charts.axis_titles.uptime_perc, minValue: min_value-3, maxValue: 100, textStyle: {color: wm_psp_charts.msgs.charts.text_color}},
			hAxis			: {title: wm_psp_charts.msgs.charts.hours, showTextEvery: wm_psp_charts.chart_options.show_text_hours, /* slantedText: true, */ textStyle: {color: wm_psp_charts.msgs.charts.text_color}},
			legend			: 'none',
			backgroundColor	: {stroke:null, fill:wm_psp_charts.msgs.charts.backgroung_color, strokeWidth: 0},
			gridlineColor	: '#b2b2b2',
			colors			: ['#669900','#CC0000'],
			chartArea		: wm_psp_charts.chart_options.area
		};
		
		if (80 > min_value && min_value >= 70){
			options.vAxis.minValue = 60;
		} else if (60 > min_value && min_value >= 55){
			options.vAxis.minValue = 40;
		} else if (40 > min_value && min_value >= 0){
			options.vAxis.minValue = 0;
		}
			
		var area_con = document.getElementById('HourlyUptime-'+instance);
		var draw_chart = new google.visualization.AreaChart(area_con);
		
		draw_chart.draw(data, options);
		
		wm_psp_charts.fill_color('HourlyUptime-'+instance, instance);
	},
	
	// Daily Uptime
	// _______________________________________________________________________
	// API jsonp fields needed: daily.uptime;daily.downtime;daily.period.from
	drawDailyUptime : function(json_data, instance) {	
		var data_length = json_data.result[0].daily.length;
		
		if (data_length < 1) {	
			wm_psp_charts.handleEmptyDataError('#DailyUptime-'+instance, 'chart');
			return false;
		}
		
		var data = new google.visualization.DataTable();
		
		data.addRows(data_length);   
		data.addColumn('string', wm_psp_charts.msgs.charts.hours);  
		data.addColumn('number', wm_psp_charts.msgs.charts.uptime.name);
		 
	  	var parsed_data, min_value = 100, value;
	
		for(i=0;i<data_length;i++){
			parsed_data = json_data.result[0].daily[i];
			
			dateString = wm_psp_charts.getDateStr(parsed_data.period.from.sec*1000, json_data.result[0].info.tz, 'date');
			
			value = parseInt(parsed_data.uptime,10);
			min_value = (min_value > value) ? value : min_value;
			data.setValue(i, 0, dateString);
			data.setValue(i, 1, value);
		}
			
		var options = {
			width			: WM_instances[instance].widget_width,
			height			: WM_instances[instance].widget_height,
			is3D			: false,
			fontSize		: wm_psp_charts.chart_options.font_size,
			pointSize		: 2,
			vAxis			: {title: wm_psp_charts.msgs.charts.axis_titles.uptime_perc, minValue: min_value-1, maxValue: 100, textStyle: {color: wm_psp_charts.msgs.charts.text_color}},
			hAxis			: {title: wm_psp_charts.msgs.charts.days, showTextEvery: wm_psp_charts.chart_options.show_text_days,  /* slantedText: true, */ textStyle: {color: wm_psp_charts.msgs.charts.text_color}},
			isStacked		: false,
			legend			: 'none',
			backgroundColor	: {stroke:null, fill:wm_psp_charts.msgs.charts.backgroung_color, strokeWidth: 0},
			gridlineColor	: '#b2b2b2',
			colors			: ['#669900','#CC0000'],
			chartArea		: wm_psp_charts.chart_options.area
		};
	
		if (80 > min_value && min_value >= 70){
			options.vAxis.minValue = 60;
		} else if (60 > min_value && min_value >= 55){
			options.vAxis.minValue = 40;
		} else if (40 > min_value && min_value >= 0){
			options.vAxis.minValue = 0;
		}
	
		var area_con = document.getElementById('DailyUptime-'+instance);
		var draw_chart = new google.visualization.AreaChart(area_con);
		
		draw_chart.draw(data, options);
		
		wm_psp_charts.fill_color('DailyUptime-'+instance, instance);
	},
	
	
	// Hourly Page Load Time
	// __________________________________________________________________________
	// API jsonp fields needed: hourly.uptime;hourly.downtime;hourly.period.from
	drawHourlyPageLoadTime : function(json_data, instance) {	
		var data_length = json_data.result[0].hourly.length;
			
		if (data_length < 1) {	
			wm_psp_charts.handleEmptyDataError('#HourlyPageLoadTime-'+instance, 'chart');
			return false;
		}
		
		var data = new google.visualization.DataTable();
		
		data.addRows(data_length);
	
		data.addColumn('string', wm_psp_charts.msgs.charts.hours); 
		data.addColumn('number', wm_psp_charts.msgs.charts.rtime.name);  
		data.addColumn('number', wm_psp_charts.msgs.charts.ctime.name); 
		data.addColumn('number', wm_psp_charts.msgs.charts.ptime.name); 
		data.addColumn('number', wm_psp_charts.msgs.charts.ttime.name); 
		
	  	var parsed_data;
	
		for(i=0;i<data_length;i++){
			parsed_data = json_data.result[0].hourly[i];
			
			dateString = wm_psp_charts.getDateStr(parsed_data.period.from.sec*1000, json_data.result[0].info.tz);
			data.setValue(i, 0, dateString);
			data.setValue(i, 1, (typeof(parsed_data.avg.rtime) !== 'undefined') ? parseInt(parsed_data.avg.rtime,10) : 0);
			data.setValue(i, 2, (typeof(parsed_data.avg.ctime) !== 'undefined') ? parseInt(parsed_data.avg.ctime,10) : 0);
			data.setValue(i, 3, (typeof(parsed_data.avg.ptime) !== 'undefined') ? parseInt(parsed_data.avg.ptime,10) : 0);
			data.setValue(i, 4, (typeof(parsed_data.avg.dtime) !== 'undefined') ? parseInt(parsed_data.avg.dtime,10) : 0);
		}
		
		var options = {
			width			: WM_instances[instance].widget_width,
			height			: WM_instances[instance].widget_height,
			is3D			: false,
			fontSize		: wm_psp_charts.chart_options.font_size,
			isStacked		: true,
			pointSize		: 0,
			vAxis			: {title: wm_psp_charts.msgs.charts.axis_titles.total_load_time, textStyle: {color: wm_psp_charts.msgs.charts.text_color}},
			hAxis			: {title: wm_psp_charts.msgs.charts.hours, showTextEvery: wm_psp_charts.chart_options.show_text_hours,  /* slantedText: true, */ minValue: 0, textStyle: {color: wm_psp_charts.msgs.charts.text_color}},
			legend			: 'bottom',
			backgroundColor	: {stroke:null, fill:wm_psp_charts.msgs.charts.backgroung_color, strokeWidth: 0},
			gridlineColor	: '#b2b2b2',
			colors			: ['#BDBDBD','#CC0000','#669900','#EEA111'],
			chartArea		: wm_psp_charts.chart_options.area_legend
		};
	
		var area_con = document.getElementById('HourlyPageLoadTime-'+instance);
		var draw_chart = new google.visualization.AreaChart(area_con);
	
		draw_chart.draw(data, options);
		
		wm_psp_charts.fill_color('HourlyPageLoadTime-'+instance, instance);
	},
	
	// World Daily Performance
	// _____________________________________________
	// API jsonp fields needed: world.id;world.score
	drawWorldDailyPerformance : function(json_data, instance){
		var data_length = json_data.result[0].world.length;
		
		if (data_length < 1) {	
			wm_psp_charts.handleEmptyDataError('#WorldDailyPerformance-'+instance, 'chart');
			return false;
		}
		
		var data = new google.visualization.DataTable();
	
		data.addRows(data_length+2);
		data.addColumn('string', wm_psp_charts.msgs.charts.country);
		data.addColumn('number', wm_psp_charts.msgs.charts.performance);
		
		// use this for making the scale start from 0-100
		data.setValue(data_length, 1, 0);
		data.setValue(data_length+1, 1, 100);
		
		var parsed_data, country_name;
		for(i=0;i<data_length;i++){
			parsed_data = json_data.result[0].world[i];
			
			country_name = typeof(wm_psp_charts.country_names[parsed_data.id]) === 'undefined' ? parsed_data.id.toUpperCase() : wm_psp_charts.country_names[parsed_data.id];
			data.setValue(i, 0, country_name);
			data.setValue(i, 1, parseInt(parsed_data.score,10));
		}
		
		var draw_chart, options;
		if (wm_psp_charts.browser.flash.version < 8){
			draw_chart = new google.visualization.ImageChart(document.getElementById('WorldDailyPerformance-'+instance));
			options = {chf:'bg,s,EAF7FE',cht: 't', chtm: 'world', chco: 'FFFFFF,CC0000,FF9900,CCFF66,009900', chs: '383x220',region:'regions',showZoomOut:region!=='world'};
		} else {
			draw_chart = new google.visualization.GeoMap(document.getElementById('WorldDailyPerformance-'+instance));
			options = {width: WM_instances[instance].widget_width, height: WM_instances[instance].widget_height, dataMode: 'regions', is3D: false, colors:[0xCC0000,0xFF9900,0xCCFF66,0x009900]};
		}
		
		draw_chart.draw(data, options);
	},
	
	// SparkLines
	// _____________________________________________________________
	// API jsonp fields needed: daily.avg.ttime
	drawSparkline : function(json_data, instance) {
		var result_length = json_data.result.length,
			data_length = json_data.result[0].hourly.length;
		
		if (result_length < 1) {	
			wm_psp_charts.handleEmptyDataError('#wm-chart-widget-'+instance, 'chart');
			return false;
		}
		
		var content_to_append = '<ul id="monitors-list-'+instance+'" class="monitors-list"></ul>';
		jQuery('#wm-chart-widget-'+instance).prepend(content_to_append);
		
		for(i=0;i<result_length;i++){
			parsed_results = json_data.result[i];
			data_length = parsed_results.hourly.length;
			var rname = parsed_results.info.name,
				date_string = wm_psp_charts.getDateStr(parsed_results.cur.period.from.sec*1000, parsed_results.info.tz, 'last'),
				status = parsed_results.cur.status;
				
			wm_psp_charts.createElement(instance, 'monitors-list', rname, true, i, parsed_results.info.id, status, date_string);
			
			var sparkline_data = [];
			for(y=0;y<(data_length-1);y++){
				parsed_data = parsed_results.hourly[y];
				sparkline_data.push(parseInt(parsed_data.avg.ttime,10));
			}
			jQuery('#Sparkline-'+instance+'-'+i).sparkline(sparkline_data, {
				width: WM_instances[instance].widget_width,	//auto
				height: '20px',	//auto
				lineColor: '#20a228',
				fillColor: '#d1e0b2'
				//chartRangeMin: 0,
				//chartRangeMax: 100,
				//composite: true		
			});
		}
		
		jQuery('#wm-chart-widget-'+instance+' .loading').remove();
	},
	
	// Gauges
	// _____________________________________________________________
	// API jsonp fields needed: daily.performance
	drawGauges : function(json_data, instance) {
		var result_length = json_data.result.length,
			parsed_results;
		
		if (result_length < 1) {	
			wm_psp_charts.handleEmptyDataError('#Gauge-'+instance, 'chart');
			return false;
		}
		
		var width = (WM_instances[instance].widget_width < 140) ? 140 : WM_instances[instance].widget_width;
		
		var data = new google.visualization.DataTable();
			
		data.addRows(result_length);	
		data.addColumn('string', 'Label');
	    data.addColumn('number', 'Value');
		
		for(i=0;i<result_length;i++){
			parsed_results = json_data.result[i];
			var ttime = parsed_results.cur.avg.ttime,
			timewarn = parsed_results.info.timewarn,
			timepoor = parsed_results.info.timepoor,
			timeout = parsed_results.info.timeout*1000;
	
			data.setValue(0, 0, 'ms');	//wm_psp_charts.msgs.charts.performance);
	        data.setValue(0, 1, parseInt(ttime, 10));
	        
	        var options = {
				width			: width,
				height			: width,
				greenFrom		: 0,
				greenTo			: timewarn,
				yellowFrom		: timewarn,
				yellowTo		: timepoor,
				redFrom			: timepoor,
				redTo			: timeout,
				minorTicks		: 5,
				majorTicks		: 10,
				min				: 0,
				max				: timeout
			};
	        
	        var area_con = document.getElementById('Gauge-'+instance+'-'+i);
			var draw_chart = new google.visualization.Gauge(area_con);
			
			draw_chart.draw(data, options);
		}
	},
	
	// end of functions for charts in factory JS widget
	
	// ============================================================ 
	// ! functions for rendering the chart containers in the page   
	// ============================================================ 
	
	fill_color : function(container, instance){
		if (WM_instances[instance].widget_theme !== 'none'){
			var currentIFrame = jQuery('#'+container+' iframe');
			currentIFrame.contents().find('body #chart g rect:first-child').attr('fill-opacity','0').attr('fill','none'); //null
		}
	},
	
	// function for setting chart caption and call the function that creates the html container
	renderChartArea : function(instance, chart_type){
	
		// switch between possible chart types
		switch(chart_type){		
			case 'HourlyUptime': 
				msg = wm_psp_charts.msgs.captions.HourlyUptime; 
				wm_psp_charts.createElement(instance, chart_type, msg);
				break;
			case 'DailyUptime': 
				msg = wm_psp_charts.msgs.captions.DailyUptime; 
				wm_psp_charts.createElement(instance, chart_type, msg);
				break;
			case 'HourlyPageLoadTime': 
				msg = wm_psp_charts.msgs.captions.HourlyPageLoadTime; 
				wm_psp_charts.createElement(instance, chart_type, msg);
				break;
			case 'WorldDailyPerformance': 
				msg = wm_psp_charts.msgs.captions.WorldDailyPerformance;
				wm_psp_charts.createElement(instance, chart_type, msg);
				break;
			case 'Sparkline': 
				msg = wm_psp_charts.msgs.captions.sparkline;
				wm_psp_charts.createElement(instance, chart_type, msg);
				break;
			case 'Gauge': 
				msg = wm_psp_charts.msgs.captions.gauges; 
				wm_psp_charts.createElement(instance, chart_type, msg);
				break;
		}
		//styleChartArea(instance);
	},
	
	// function that creates the html container
	// variables passed: id = container id attr, msg = chart caption
	createElement : function(instance, chart_type, msg, sparkline_list, sparkline_num, rid, status, alt){
		var content_to_append;
		if(sparkline_list === true){	
			alt = (typeof(alt) !== 'undefined') ? ' alt="Uptime: '+alt+'"' : '';
	
			var odd = ((sparkline_num%2) === 0) ? ' odd' : '';
			
			content_to_append = '<li class="monitor '+odd+'">'+
				//status_img+
					'<h4 class="status-'+status+'"><a href="'+wm_psp_charts.createLink(instance, rid, msg)+'" title="'+wm_psp_charts.msgs.status_states[status].text+'">'+msg+'</a>'+
						'<a class="toogle-info-charts" />'+
					'</h4>\n'+
					'<div class="info-charts" style="display:none;">'+
						'<div id="Gauge-'+instance+'-'+sparkline_num+'"></div>'+
						'<p>'+wm_psp_charts.msgs.captions.Gauges+'</p>'+
						'<div id="Sparkline-'+instance+'-'+sparkline_num+'"></div>'+
						'<p>'+wm_psp_charts.msgs.captions.Sparkline+'</p>'+
					'</div>'+
				'</li>';
	
			jQuery('#'+chart_type+'-'+instance).append(content_to_append); // append code into widget container
		} else {
			content_to_append = '<div class="chart-con">\n'+
				'<div class="chart-wrap">\n'+
					'<div id="'+chart_type+'-'+instance+'" class="chart-item">\n'+
						'<img height="16" width="16" class="loading" src="'+WM_instances[instance].assets_folder_com+'images/ajax-loader_'+((wm_psp_charts.opts.widget_theme === "dark") ? 'dark' : 'light')+'.gif">\n'+
					'</div>\n'+
					((wm_psp_charts.opts.widget_captions === 1) ? '<p>'+msg+'</p>' : '<p style="margin:0 0 8px"></p>')+'\n'+
				'</div>\n'+
			'</div>';
			
			jQuery(WM_instances[instance].instance_container_id).append(content_to_append); // append code into widget container
		}
	},
	
	// style our charts' containers
	// ### NOTE ###
	// if we want nothing to break if user not import our stylesheet the we must uncomment
	// float: left
	
	styleChartArea : function(instance){
		var wm_chart_widget = {};
		var chart_item_style = {};
		
		// default options for widget chart wrapper
		var wm_chart_widget_options = {
			'margin' : (WM_instances[instance].widget_chart_gap/2)+' auto'			// set the top and bottom margin to the half of the gap value and set to be horizontal centered
		};
		
		// default options for chart container
		var chart_item_style_options = {
			'width' : WM_instances[instance].widget_width,
			'padding' : WM_instances[instance].widget_chart_padding+'px '+WM_instances[instance].widget_chart_padding+'px',
			'margin-right' : WM_instances[instance].widget_chart_gap+'px'
		};
		
		// check what style user has selected
		// default is the 2 charts per row
		switch (WM_instances[instance].widget_layout){
	  		// horizontal	
			case 'horizontal':
				var margin_right = (WM_instances[instance].auto_size_charts === true) ? '0 ' : WM_instances[instance].widget_chart_gap+'px '; 
	  			wm_chart_widget = {'margin' : '0 '+margin_right+WM_instances[instance].widget_chart_gap+'px'+' 0'};	// gets the width for its parent
	  			chart_item_style = {'margin' : '0px'};
	  			break;
	  		//vertical
			case 'vertical':
				if (typeof(WM_instances[instance].is_module) === 'undefined' || WM_instances[instance].is_module !== true){
					// sets the width equal to (width + 2 (for borders) + left and right paddings)
		  			wm_chart_widget = {'width' : WM_instances[instance].widget_width+2+(WM_instances[instance].widget_chart_padding*2)+'px'};	
	  			}
	  			wm_chart_widget = {'margin' : '0px 0px '+WM_instances[instance].widget_chart_gap+'px'};
	  			//chart_item_style = {'margin' : '0px 0px '+WM_instances[instance].widget_chart_gap+'px'};
	  			chart_item_style = {'margin' : '0px'};
	  			break;
	  		// 2 charts per row (buggy for user site layout if user put large value for width)
	  		case 'columns': default:
	  			var chart_width_auto;
	  			if (WM_instances[instance].auto_size_charts === true){	  			
		  			chart_width_auto = WM_instances[instance].widget_chart_padding*2;
		  		}
	
	  			// sets the width equal to (width + 2 (for borders) + left and right paddings) * 2 (<= for 2 charts)  			
	  			wm_chart_widget = {
	  				'width' : (WM_instances[instance].widget_width+chart_width_auto)+'px',
	  				'margin' : '0 '+WM_instances[instance].widget_chart_gap+'px '+WM_instances[instance].widget_chart_gap+'px'+' 0'
	  			};
	
	  			chart_item_style = {
	  				'width' : WM_instances[instance].widget_width+'px',
	  				'margin' : '0px'
	  			};
	  			break;
		}
	
		// merge options arrays - the default and one based on selected style
		wm_chart_widget_options = jQuery.extend(wm_chart_widget_options, wm_chart_widget);
		chart_item_style_options = jQuery.extend(chart_item_style_options, chart_item_style);
	
		// add css styles to containers
		if (typeof(WM_instances[instance].is_module) === 'undefined' || WM_instances[instance].is_module !== true){
			jQuery(WM_instances[instance].instance_container_id)
				.find('.chart-con')
				.css(wm_chart_widget_options)
				.removeClass('wm-hidden');
			jQuery(WM_instances[instance].instance_container_id)
				.find('.chart-item')
				.css(chart_item_style_options);	
	
			// if selected style is 2 charts per row then remove the margin-right on the right column
			if (WM_instances[instance].widget_layout === 'columns'){
				jQuery(WM_instances[instance].instance_container_id).find('.chart-con:nth-child(even)').css('margin-right', '0px');
			}
		} else {
			jQuery(WM_instances[instance].instance_container_id)
				.removeClass('wm-hidden');
		}
	},
	
	// ============================ 
	// ! used for handling errors   
	// ============================ 
	
	handleError : function(msg, instance, account_error){
		var message = '', error;
		
		// according to the occasion the appropriate message will be assigned
		switch(msg){
			case 'timeout':
				message = wm_psp_charts.msgs.request_timeout;
				error = true;		
				break;
			case 'error': 
				message = wm_psp_charts.msgs.error;
				error = true;
				break;
			default:
				message = msg;
				break;
		}
		jQuery(WM_instances[instance].instance_container_id).html('<div class="error">'+message+'</div>').removeClass('wm-hidden');
		
		if (error === true){
			jQuery(wm_psp_charts.opts.psp_page_uptime_table_id).replaceWith('<div id="'+wm_psp_charts.opts.psp_page_uptime_table_id+'" class="error margin-b19">'+message+'</div>').removeClass('wm-hidden');
			jQuery('.loading-uptime').remove();
			
			jQuery(wm_psp_charts.opts.psp_page_history_table_id).replaceWith('<div id="'+wm_psp_charts.opts.psp_page_history_table_id+'" class="error margin-b19">'+message+'</div>').removeClass('wm-hidden');
			jQuery('.loading-history').remove();
		}

		if(account_error === true){
			jQuery('#psp-tables-con').html('<div class="error margin-b19">'+message+'</div>');
		}
	},
	
	// if no data for selected chart or table displays error
	// type variable is also used as colspan for table errors
	handleEmptyDataError : function(container, type){
		if (type === 'chart') {
			jQuery(container).parent().addClass('error').css('padding', '20px').html(wm_psp_charts.msgs.empty_chart_data);
		} else {		// table
			var content_to_append = '<tr>\n'+
				'<td colspan="'+type+'" align="center" class="caution">'+wm_psp_charts.msgs.empty_chart_data+'</td>\n'+
			'</tr>';
			
			jQuery(container).append(content_to_append);
		}
	},
	
	initiate : function(instance){
		// extends javascript options with current module instance options
		//- var instance_opts	= jQuery.extend(opts, instance_options);
	
		// set the div's id for the current instance
		WM_instances[instance].instance_container_id = wm_psp_charts.opts.widget_container_id+'-'+instance;
		WM_instances[instance].instance_mod_container_id = wm_psp_charts.opts.widget_mod_container_id+'-'+instance;
		
		//- instance.chart_types = instance_opts.chart_types.split(",");
	
		// ============================================================================
		// ! validate that variables has values that won't harm client layout so much   
		// ============================================================================ 
		
		// one number from 1-3, horizontal layout as default
		filter_style = /^[1-3]{1}$/;
		WM_instances[instance].widget_style = (filter_style.test(WM_instances[instance].widget_style)) ? WM_instances[instance].widget_style : 2; 
		
		// one to four numbers, also we give an upper value for each variable
		filter_numbers = /^[0-9]{1,4}$/;
		
		// below we check if user want to autosize its' charts
		if (WM_instances[instance].widget_width === 0){
			WM_instances[instance].widget_width = jQuery(WM_instances[instance].instance_container_id).width();
			
			// if column width is smaller than 740px then use vertical layout, otherwise charts are very small
			if (WM_instances[instance].widget_width < 740 && WM_instances[instance].widget_html_markup !== 'table') {
				WM_instances[instance].widget_layout = 'vertical';
			}
				
			if (WM_instances[instance].widget_height === 0){
				if (WM_instances[instance].widget_layout === 'columns'){	// columns
					// divide width to 2 columns
					WM_instances[instance].widget_width = parseInt(((WM_instances[instance].widget_width-12-4-WM_instances[instance].widget_chart_gap-(WM_instances[instance].widget_chart_padding*4))/2),10);
				}
				
				WM_instances[instance].widget_height = WM_instances[instance].widget_width / 1.7;
				WM_instances[instance].widget_height = parseInt(WM_instances[instance].widget_height, 10);
			} else {
				WM_instances[instance].widget_height = (filter_numbers.test(WM_instances[instance].widget_height) && WM_instances[instance].widget_height < 800) ? parseInt(WM_instances[instance].widget_height, 10) : 320;
			}
			
			WM_instances[instance].auto_size_charts = true;
		} else {
			WM_instances[instance].widget_width = ((typeof(WM_instances[instance].widget_width) !== 'undefined') && filter_numbers.test(WM_instances[instance].widget_width) && WM_instances[instance].widget_width < 1200) ? parseInt(WM_instances[instance].widget_width, 10) : 454; 
			WM_instances[instance].widget_height = ((typeof(WM_instances[instance].widget_height) !== 'undefined') && filter_numbers.test(WM_instances[instance].widget_height) && WM_instances[instance].widget_height < 800) ? parseInt(WM_instances[instance].widget_height, 10) : 320;
		}
		
		// set the size of charts containers so as to fill the needed space and look more robust
		jQuery(WM_instances[instance].instance_container_id)
			.find('.chart-item')
			.css({'width': WM_instances[instance].widget_width, 'height': WM_instances[instance].widget_height });	
		
		// testing
		//WM_instances[instance].widget_layout = 'vertical';
		//WM_instances[instance].widget_width = 800;
	
		if (typeof(WM_instances[instance].is_module) === 'undefined'){
			if (2000 > WM_instances[instance].widget_width && WM_instances[instance].widget_width >= 1000) {
				wm_psp_charts.chart_options.area = {top: 10, left: 100, height: '90%', width: '90%'};
				wm_psp_charts.chart_options.area_legend = {top: 10, left: 100, height: '84%', width: '90%'};
				wm_psp_charts.chart_options.font_size = '11';
				wm_psp_charts.chart_options.show_text_hours = '3';
				wm_psp_charts.chart_options.show_text_days = '1';
			} else if (1000 > WM_instances[instance].widget_width && WM_instances[instance].widget_width >= 550) {
				wm_psp_charts.chart_options.area = {top: 10, left: 70, height: '82%', width: '86%'};
				wm_psp_charts.chart_options.area_legend = {top: 10, left: 70, height: '74%', width: '86%'};
				wm_psp_charts.chart_options.font_size = '11';
				wm_psp_charts.chart_options.show_text_hours = '3';
				wm_psp_charts.chart_options.show_text_days = '1';
			} else if (550 > WM_instances[instance].widget_width && WM_instances[instance].widget_width >= 300) {
				wm_psp_charts.chart_options.area = {top: 10, left: 55, height: '77%', width: '82%'};
				wm_psp_charts.chart_options.area_legend = {top: 10, left: 55, height: '72%', width: '82%'};
				wm_psp_charts.chart_options.font_size = '10';
				wm_psp_charts.chart_options.show_text_hours = '4';
				wm_psp_charts.chart_options.show_text_days = '2';
			} else if (300 > WM_instances[instance].widget_width && WM_instances[instance].widget_width >= 220) {
				wm_psp_charts.chart_options.area = {top: 10, left: 55, height: '74%', width: '82%'};
				wm_psp_charts.chart_options.area_legend = {top: 10, left: 55, height: '67%', width: '82%'};
				wm_psp_charts.chart_options.font_size = '9';
				wm_psp_charts.chart_options.show_text_hours = '5';
				wm_psp_charts.chart_options.show_text_days = '2';
			} else if (220 > WM_instances[instance].widget_width && WM_instances[instance].widget_width >= 100) {
				wm_psp_charts.chart_options.area = {top: 3, left: 55, height: '70%', width: '88%'};
				wm_psp_charts.chart_options.area_legend = {top: 3, left: 55, height: '64%', width: '88%'};
				wm_psp_charts.chart_options.font_size = '8';
				wm_psp_charts.chart_options.show_text_hours = '10';
				wm_psp_charts.chart_options.show_text_days = '2';
			}
		}
			
		WM_instances[instance].widget_chart_gap = ((typeof(WM_instances[instance].widget_chart_gap) !== 'undefined') && filter_numbers.test(WM_instances[instance].widget_chart_gap) && WM_instances[instance].widget_chart_gap < 100) ? parseInt(WM_instances[instance].widget_chart_gap, 10) : 20;
		WM_instances[instance].widget_chart_padding = ((typeof(WM_instances[instance].widget_chart_padding) !== 'undefined') && filter_numbers.test(WM_instances[instance].widget_chart_padding) && WM_instances[instance].widget_chart_padding < 100) ? parseInt(WM_instances[instance].widget_chart_padding, 10) : 8;
	
		// two to fifteen letters, with none theme as default
		filter_theme = /^[a-z]{2,15}$/;
		WM_instances[instance].widget_theme = ((typeof(WM_instances[instance].widget_theme) !== 'undefined') && filter_theme.test(WM_instances[instance].widget_theme)) ? WM_instances[instance].widget_theme : 'none';
		WM_instances[instance].widget_layout = ((typeof(WM_instances[instance].widget_layout) !== 'undefined') && filter_theme.test(WM_instances[instance].widget_layout)) ? WM_instances[instance].widget_layout : 'vertical';
	
		// 0 or 1 (true or false), true is default value for captions
		filter_captions = /^[01]$/;
		WM_instances[instance].widget_captions = (filter_captions.test(WM_instances[instance].widget_captions)) ? WM_instances[instance].widget_captions : 1; 
		
		WM_instances[instance].assets_folder_com = (typeof(WM_instances[instance].assets_folder_com) !== 'undefined') ? WM_instances[instance].assets_folder_com : 'assets/';
		
		if (WM_instances[instance].widget_theme === 'light'){ wm_psp_charts.msgs.charts.backgroung_color = '#e0e0e0'; }
			
		return false;
	},
	
	moduleInstances : function(instance){
		wm_psp_charts.initiate(instance);

		// if no uid or rid was given then print message and skip execution of js
		if (typeof(WM_instances[instance].uid) === 'undefined' || WM_instances[instance].uid === 0){wm_psp_charts.handleError(wm_psp_charts.msgs.uid_not_valid, instance, true); return false;}
		if (typeof(WM_instances[instance].rid) === 'undefined') {
			if (typeof(WM_instances[instance].fid) === 'undefined' || WM_instances[instance].fid === 0){wm_psp_charts.handleError(wm_psp_charts.msgs.rid_not_valid, instance, true); return false;}
		}
		
		// jQuery is loaded and we execute our code from here 
		WM_instances[instance].fields = 'fields=info';		// basic fields needed to its call to API
		var chart_types_length = WM_instances[instance].chart_types.length,
			visualization_packages	= new Array();
		
		if (wm_psp_charts.iframe_version_widget === true && WM_instances[instance].widget_theme !== "none"){
			jQuery(WM_instances[instance].instance_container_id).addClass('wm-'+WM_instances[instance].widget_theme);
		}
		
		// for every chart type user requested run the code below
		for(i=0;i<chart_types_length;i++){
	
			// create the chart container in sites' html
			// only iframe version
			if (wm_psp_charts.iframe_version_widget === true){
				wm_psp_charts.renderChartArea(instance, WM_instances[instance].chart_types[i]);
			}
			
			// check whick chart type is called	
			switch (WM_instances[instance].chart_types[i]){
				case 'PSPPage':
					WM_instances[instance].fields += ';cur.status;24h.avg.ttime;24h.uptime;24h.period.from;daily.status;daily.uptime;daily.period.from;last.date';
					break;
				case 'HourlyUptime':
					WM_instances[instance].fields += ';hourly.uptime;hourly.downtime;hourly.period.from';
					visualization_packages[i] = 'corechart';
					break;
				case 'DailyUptime':
					WM_instances[instance].fields += ';daily.uptime;daily.downtime;daily.period.from';
					visualization_packages[i] = 'corechart';
					break;
				case 'WorldDailyPerformance':
					WM_instances[instance].fields += ';world.id;world.score';
					visualization_packages[i] = wm_psp_charts.browser.flash.version < 8 ? 'imagechart' : 'geomap';
					wm_psp_charts.loadCountryNames();			// get full country names
					break;
				case 'HourlyPageLoadTime':
					WM_instances[instance].fields += ';hourly.avg;hourly.period.from';
					visualization_packages[i] = 'corechart';
					break;
				case 'Sparkline':
					WM_instances[instance].fields += ';hourly.avg;cur.status;cur.period.from';
					//visualization_packages[i] = 'imagesparkline';
					break;
				case 'Gauge':
					WM_instances[instance].fields += ';cur.avg';
					visualization_packages[i] = 'gauge';
					break;
				case 'ChartPage':
					WM_instances[instance].fields += ';last.date;cur.status;daily.status;daily.period.from';
					break;
			}			
		}
	
		// remove duplicate values for loading in google visualization packages
		var sorted_arr = visualization_packages.sort();
		var results = [];
		for (i=0;i<sorted_arr.length;i++) {
			if (sorted_arr[i] !== sorted_arr[i+1]) {
				results.push(sorted_arr[i]);
			}
		}
		WM_instances[instance].visualization_packages = results;
	
		// style the html containers according to the style user selected (horizontal / vertical / 2 per row)
		if (WM_instances[instance].widget_html_markup !== 'table'){
			wm_psp_charts.styleChartArea(instance);
		} else {
			jQuery(WM_instances[instance].instance_container_id)
				.find('.chart-con')
				.removeClass('wm-hidden');
		}
		//console.info(WM_instances[instance]);
		
		// execute call to the API and then to the render of charts
		wm_psp_charts.initMap(instance);
	},
	
	// ========================== 
	// ! HELPER FUNCTIONS  
	// ========================== 
	makeDate : function(utcMillis,offset){
		return new Date(parseInt(utcMillis,10)+(offset - wm_psp_charts.browser.offset)*60*60*1000);
	},
	
	getDateStr : function(utcMillis,offset,type,compare){
		offset = parseInt(offset,10);
		var d = wm_psp_charts.makeDate(utcMillis,offset), result;
		
		if (type === 'date') {	// 24 Mar
			return wm_psp_charts.msgs.months[d.getMonth()]+' '+d.getDate();
		} else {		// hours
			var hours = d.getHours(); hours = hours<10 ? hours = '0'+hours : hours;
			var minutes = d.getMinutes(); 
			minutes = (minutes < 10) ? '0'+minutes : minutes;
			
			if (type === 'last') {	// Apr 3, 2011 19:34 UTC+3
				result = wm_psp_charts.msgs.months[d.getMonth()] + " " + d.getDate() + ", " +  d.getFullYear()+ ' ' + hours+':'+minutes;
				result += (offset? ' UTC' + ((offset>0 ? '+':'') + offset): ' UTC');
			} else {	// hours 00:00
				result = hours+':'+minutes;
			}
			
			return result;
		}
		return false;
	},
	
	fillDates : function(json_data){
		var startDate = null;
	
		for (i=0;i<json_data.result.length;i++){
			if (typeof(json_data.result[i].last) !== 'undefined'){
				var objectDate = wm_psp_charts.makeDate(json_data.result[i].last.date.sec*1000, json_data.result[i].info.tz),
					psp_last_update = wm_psp_charts.getDateStr(json_data.result[i].last.date.sec*1000, json_data.result[i].info.tz, 'last');
				
				if(startDate === null || startDate.getTime() < objectDate.getTime()){
					startDate = objectDate;
					monitor_last_update = psp_last_update;
				}
			}
		}
		
		startDateYear = startDate.getFullYear(); startDateMonth = startDate.getMonth(); startDateDay = startDate.getDate();
		
		if(monitor_last_update !== ''){ jQuery(wm_psp_charts.opts.psp_page_last_update).html(monitor_last_update).removeClass('wm-hidden'); }
		
		startDate = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate());
		var weekDates = [];
		jQuery('#hist_date_0').html(wm_psp_charts.msgs.months[startDate.getMonth()]+' '+startDate.getDate());
		weekDates[0] = startDate;
		for(i=1;i<7;i++){
			var d = new Date(startDateYear,startDateMonth,startDateDay-i);
			jQuery('#hist_date_'+i).html(wm_psp_charts.msgs.months[d.getMonth()]+' '+d.getDate());
			weekDates[i] = d;
		}
		wm_psp_charts.weekDates = weekDates;
	},
	
	loadCountryNames : function(){
		jQuery.jsonp({
			url:wm_psp_charts.urls.s3_url_assets+'/js/countries_en.js?callback=?',
			cache : true,
			timeout: 10000,
			callback: 'setCountries',
			error: function(d,msg) {},
			success: function(data){wm_psp_charts.country_names = data;}
		});
	},
	
	SortByName : function(x,y) {
		return ((x.info.name === y.info.name) ? 0 : ((x.info.name > y.info.name) ? 1 : -1 ));
	},
	
	round_number : function(number, demicals){
		return Math.round(number * Math.pow(10,demicals)) / Math.pow(10,demicals);
	},
	
	browser : {
		offset: -(new Date()).getTimezoneOffset()/60,
		navigator: navigator,
		flash	 : {"version": 0,"enabled": false},
		isIE	 : /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent),
		init: function () {
			this.checkFlash();
		},
		checkFlash: function () {
			if (typeof this.navigator.plugins !== "undefined" && typeof this.navigator.plugins["Shockwave Flash"] === "object") {
				this.d = this.navigator.plugins["Shockwave Flash"].description;
				if (this.d && !(typeof this.navigator.mimeTypes !== "undefined" && this.navigator.mimeTypes["application/x-shockwave-flash"] && !this.navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin)) {
					this.flash['enabled'] = true;
					this.d = this.d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
					this.flash['version'] = parseInt(this.d.replace(/^(.*)\..*$/, "$1"), 10);
				}
			} else if (typeof this.window.ActiveXObject !== "undefined") {
				try {
					this.a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
					if (this.a) {
						this.d = this.a.GetVariable("$version");
						if (this.d) {
							this.flash['enabled'] = true;
							this.d = this.d.split(" ")[1].split(",");
							this.flash['version'] = parseInt(this.d[0], 10);
						}
					}
				}catch(e) {}
			}
		}
	},
	
	render_psp : function() {	
		// ===============================================================
		// ! jquery.jsonp 2.1.4 (c)2010 Julian Aubourg | MIT License
		// ! http://code.google.com/p/jquery-jsonp/   
		// ===============================================================
		(function(e,b){function d(){}function t(C){c=[C]}function m(C){f.insertBefore(C,f.firstChild)}function l(E,C,D){return E&&E.apply(C.context||C,D)}function k(C){return/\?/.test(C)?"&":"?"}var n="async",s="charset",q="",A="error",r="_jqjsp",w="on",o=w+"click",p=w+A,a=w+"load",i=w+"readystatechange",z="removeChild",g="<script/>",v="success",y="timeout",x=e.browser,f=e("head")[0]||document.documentElement,u={},j=0,c,h={callback:r,url:location.href};function B(C){C=e.extend({},h,C);var Q=C.complete,E=C.dataFilter,M=C.callbackParameter,R=C.callback,G=C.cache,J=C.pageCache,I=C.charset,D=C.url,L=C.data,P=C.timeout,O,K=0,H=d;C.abort=function(){!K++&&H()};if(l(C.beforeSend,C,[C])===false||K){return C}D=D||q;L=L?((typeof L)=="string"?L:e.param(L,C.traditional)):q;D+=L?(k(D)+L):q;M&&(D+=k(D)+encodeURIComponent(M)+"=?");!G&&!J&&(D+=k(D)+"_"+(new Date()).getTime()+"=");D=D.replace(/=\?(&|$)/,"="+R+"$1");function N(S){!K++&&b(function(){H();J&&(u[D]={s:[S]});E&&(S=E.apply(C,[S]));l(C.success,C,[S,v]);l(Q,C,[C,v])},0)}function F(S){!K++&&b(function(){H();J&&S!=y&&(u[D]=S);l(C.error,C,[C,S]);l(Q,C,[C,S])},0)}J&&(O=u[D])?(O.s?N(O.s[0]):F(O)):b(function(T,S,U){if(!K){U=P>0&&b(function(){F(y)},P);H=function(){U&&clearTimeout(U);T[i]=T[o]=T[a]=T[p]=null;f[z](T);S&&f[z](S)};window[R]=t;T=e(g)[0];T.id=r+j++;if(I){T[s]=I}function V(W){(T[o]||d)();W=c;c=undefined;W?N(W[0]):F(A)}if(x.msie){T.event=o;T.htmlFor=T.id;T[i]=function(){/loaded|complete/.test(T.readyState)&&V()}}else{T[p]=T[a]=V;x.opera?((S=e(g)[0]).text="jQuery('#"+T.id+"')[0]."+p+"()"):T[n]=n}T.src=D;m(T);S&&m(S)}},0);return C}B.setup=function(C){e.extend(h,C)};e.jsonp=B})(jQuery,setTimeout);
		
		if (wm_psp_charts.iframe_version_widget !== true && (typeof(wm_assets_folder_mod) !== 'undefined') ){
			var sparkline = document.createElement('script'); sparkline.type = 'text/javascript'; sparkline.async = true;
			sparkline.src = wm_assets_folder_mod+'js/jquery.sparkline.min.js';
			var s = document.getElementsByTagName('head')[0]; s.appendChild(sparkline);
		}
		
		wm_psp_charts.browser.init();
		
		if (typeof(wm_lang) !== 'undefined'){
			// get language translations
			wm_psp_charts.msgs = jQuery.extend(wm_psp_charts.msgs, wm_lang);
		}
	
		for(var instance in WM_instances){
			wm_psp_charts.moduleInstances(instance);
		}		
		
		if (wm_psp_charts.iframe_version_widget !== true){
			jQuery('.wm-widget-module .toogle-info-charts').live('click', function() {
				jQuery(this).parent().parent().find('.info-charts').slideToggle();
			});
			
			jQuery('.wm-tooltip').live('mouseover mouseout', function(event) {
				if (event.type === 'mouseover') {
					var text = jQuery(this).attr('alt');
					
					// also it can be used as
					// jQuery(this).parent()
					jQuery('body')
						.append('<div class="wm-img-tooltip"><span class="wm-tooltip-inner">'+text+'</span></div>')
						.find('.wm-img-tooltip')
							.css("top",(event.pageY - 20) + "px")
							.css("left",(event.pageX - 280) + "px");
				} else {
					// also it can be used as
					// jQuery(this).parent()
					jQuery('body').find('.wm-img-tooltip').remove();
				}
			});
		}
	},
};

wm_psp_charts.opts					= wm_psp_charts.widget_defaults.defaults;
wm_psp_charts.msgs					= wm_psp_charts.widget_defaults.messages;
wm_psp_charts.chart_options			= wm_psp_charts.widget_defaults.chart_options;
wm_psp_charts.country_names			= wm_psp_charts.widget_defaults.country_names;
wm_psp_charts.urls					= wm_psp_charts.widget_defaults.urls;
wm_psp_charts.iframe_version_widget	= (typeof(wm_iframe_version_widget) !== 'undefined') ? true : false;
	
// ========== 
// ! action   
// ==========
jQuery(document).ready(function() {
	wm_psp_charts.render_psp();
});