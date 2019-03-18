<?php
	$dbServer = "mysql.stud.ntnu.no";
	$dbUsername = "stiangh_i8";
	$dbPwd = "inno8_19";
	$dbName = "stiangh_inno19";
	
	$conn = mysqli_connect($dbServer, $dbUsername, $dbPwd, $dbName);

	$dbSamples = "phtest";
	$dbAlert = "alert_limits";
	$dbUsers = "signup_test";
	$dbRules = "rules_test";