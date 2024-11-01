/**
 * @package			WatchMouse PSP Widgets
 * @subpackage		PSP Widget - WordPress Plugin
 * @link			http://www.watchmouse.com
 * @copyright		Copyright (C) 2011 - 2012 WatchMouse b.v.. All rights reserved.
*/
var WM_API = 'https://api.watchmouse.com/1.6/',
	error_message = '';


script_injection = function(url){ 
	var sc = document.createElement('script'); sc.type = 'text/javascript'; sc.async = true;
	sc.src = WM_API+url;
	var s = document.getElementsByTagName('head')[0]; s.appendChild(sc);
};

validate_name = function(user){
	// Check username as email, because watchmouse use email address for user authentication.
	var filter_user = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
	if(user.val() === '' || !filter_user.test(user.val())){	// if it's NOT valid
		user.addClass('warning');		// add warning class to this field
		error_message += 'Username must be in mail format!<br />'; // set the error message
		user.focus();					// focus to that field
		user.select();
		return false;
	} else {							// if it's valid
		user.removeClass('warning');	// remove warnings
		return user.val();
	}
};

// this function works the same as the above function
validate_pass = function(pass){
	if(pass.val() === '' || pass.val().length < 7){			// check if it is at least 6 characters
		pass.addClass('warning');
		error_message += 'Password must be at least 5 characters, letters, numbers and "_"';
		pass.focus();
		pass.select();
		return false;
	} else { 							
		pass.removeClass('warning');
		return pass.val();
	}
};

show_error = function(msg){
	$j('div#progress-modal').html(msg);
};

set_token = function(data, folder, name){
	var el = $j('#wm_folder');
	if (typeof(data) !== 'undefined' && typeof(data.result) !== 'undefined' && typeof(data.result.nkey) !== 'undefined'){
		var token	= data.result.nkey,
			uid		= data.result.uid;
		
		el.val(token+', '+uid);
		
		call_folders();
	} else if (typeof(folder) !== 'undefined' && typeof(name) !== 'undefined'){
		var input_value = el.val();
		
		el.val(input_value+', '+folder+', '+name);
		$j('.wm-public-folder').html(name);
		
		tb_remove();
	} else {
		show_error(data.error);
	}
};

call_folders = function(value, name){
	var folders_modal = '<p>Please select a Public Folder:</p>'+
		'<form method="get" id="folder-form" action="" style="margin-top:15px;border-top:1px solid #c6c6c6;padding-top:15px;">'+
			'<select name="folders" id="select_folders" onchange="set_token(false, this.value, this.options[this.selectedIndex].text);">'+
				'<option value="Please select a public folder">Please select a public folder</option>'+
			'</select>'+
		'</form>';
	
	$j('#wm_modal_content').html(folders_modal);
	$j('div#progress-modal').html('');
	
	var token = $j('#wm_folder'),
		value = token.val().split(','),
		url = 'fldr_get?nkey='+value[0]+'&callback=get_folders';
	
	token.val(value[1]);
	
	script_injection(url);
}; 

get_folders = function(data){	
	var fieldset = $j('folders-modal');
	if (fieldset === null){
		setTimeout(get_folders,100,data);
		return false;
	}
	fieldset.attr('style', 'display:block;border:0;padding:12px 25px;');
		
	if (typeof(data) !== 'undefined' && typeof(data.result) !== 'undefined'){
		// get the number of folders returned in jsonp
		var folders_select = $j('select_folders'),
			folders_length = data.result.folders.length,
			options = [];		

		// build array for each monitor, the data will be formatted for the select element		
		for(i=0;i<folders_length;i++){
			var values = data.result.folders[i];
			if(values.active === 'y' && values.public === 'y'){
				options += '<option value=\"' + values.fid + '\">' + values.name + '</option>\n';
			}
		}
		
		// add select options to the monitor list 
		$j("#select_folders").append(options);
		
	} else {
		show_error(data.error);
	}
};

$j = jQuery.noConflict();
$j(function(){

	$j('#wm-login').live('click', function(e){	
		e.preventDefault();
		var wm_user		= $j('#wm_user'),
			wm_pass		= $j('#wm_pass'),
			wm_progress	= $j('div#progress-modal');
			
		var user		= validate_name(wm_user),
			password	= validate_pass(wm_pass);
		
		wm_progress.html('Retrieving Public Folders...');
		wm_progress.show();
		$j("#wm-login").attr('disabled', true);
		
		if (user !== false && password !== false){
			var url = 'acct_token?user='+user+'&password='+password+'&callback=set_token';
			script_injection(url);
		} else {
			show_error(error_message);
			$j("#wm-login").attr('disabled', false);
		}
		
		//tb_remove();
		//$j('.wm-public-folder').html(choice);
		
		//$j("#get-folders").trigger('click');
	});
	

/*
		$('.choice_button').live('click',
			function () {
				var choice = $(this).attr('id');
				tb_remove();
				$('.wm-public-folder').html(choice);
			}
		);
*/

});