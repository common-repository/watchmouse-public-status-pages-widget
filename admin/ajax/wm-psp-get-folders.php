<style type="text/css">
	#login-form {margin-top:15px;border-top:1px solid #c6c6c6;padding-top:15px;}
	#login-form label {float:left; clear: left; width:150px;}
	#login-form input {float:left; margin:0 0 10px 5px;}
	#login-form #wm-login {float:right; margin:0; background-color:#FF7F1A;color:#fff;border:0;}
	#progress-modal {float: left; clear: both; color: #666;}
</style>
<div id="wm_modal_content">
	<p>To retrieve a list of your <b>Public Folders</b> please insert your <b>WatchMouse sign-in credentials</b>.</p>
	<p>If you do not have a Public Folder in your WatchMouse account click <a href="http://www.watchmouse.com/">here</a> for instructions on how to create one.</p>
	
	<form method="get" id="login-form" action="">
		<label for="wm_user">Username (email):</label>
		<input type="text" size="15" maxlength="40" id="wm_user" name="wm_user">
		<label for="wm_password">Password:</label>
		<input type="password" size="15" maxlength="40" id="wm_pass" name="wm_pass">
		<input type="text" size="10" maxlength="10" id="about" name="about" style="display:none">
		<input type="submit" id="wm-login" name="Submit" value="Get your Public Folders">
	</form>
</div>
<div id="progress-modal" style="display: none;">&nbsp;</div>
<?php
	exit();
?>