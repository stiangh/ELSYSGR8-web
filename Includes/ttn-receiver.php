<?php
	include_once "dbh.php";

// Dumps received JSON data, and inserts it into database
	$headers = getallheaders();
	// Check authorization
	if ($headers["Authorization"] == "inno19_8") {
		$json_str = file_get_contents('php://input'); // Pass incoming JSON content to the string $json_str
		$json_array = json_decode($json_str, true); // Decode JSON-string to an associative array
		$res = $json_array['payload_fields']['temp'];
		//$resString = ($res) ? 'true' : 'false';
		
		/*$file = fopen("received_json.txt", "w");
		fwrite($file, $json_str);
		fclose($file);*/
		
		/*$stmt = $conn->prepare("INSERT INTO temp (temp) VALUES (?)"); // Prepared statement for database
		$stmt->bind_param("d", $temp);
		
		$temp = $res;
		$stmt->execute();
		
		$stmt->close();*/
		
		// time-test
		
		/*$stmt = $conn->prepare("INSERT INTO time_test (time) VALUES (?)");
		$stmt->bind_param('s', $timestamp);*/
		
		$datetime = $json_array['metadata']['time'];
		str_replace('Z', '', $datetime);
		$time_array = explode('T', $datetime);
		$date = explode('-', $time_array[0]); // YYYY, MM, DD
		$time = explode(':', $time_array[1]); // HH, MI, SE
		$yyyy = $date[0];
		$mm = $date[1];
		$dd = $date[2];
		$hh = $time[0];
		$mi = $time[1];
		$se = substr($time[2], 0, 2);
		$timestampraw = "$yyyy-$mm-$dd $hh:$mi:$se";
		$phpdate = date("Y-m-d H:i:s", strtotime("+1 hour", strtotime($timestampraw)));
		$timestamp = $phpdate;
		
		/*$stmt->execute();
		$stmt->close();*/
		
		// Tempsensor
		
		/*$stmt1 = $conn->prepare("INSERT INTO temp_sensor (time, temp) VALUES (?, ?)");
		$stmt1->bind_param('sd', $time1, $temp1);
		
		$time1 = $phpdate;
		$temp1 = $json_array['payload_fields']['temp'];
		
		$stmt1->execute();
		$stmt1->close();*/
		
		/*$file = fopen('date-test.txt', 'w');
		fwrite($file, $time1);
		fclose($file);*/
		
		// Temp + Turbiditet
		
		$stmt2 = $conn->prepare("INSERT INTO data_temp_turb (time, temp, turb) VALUES (?, ?, ?)");
		$stmt2->bind_param('sdd', $time2, $temp2, $turb2);
		
		$time2 = $phpdate;
		$temp2 = $json_array['payload_fields']['temp'];
		$turb2 = $json_array['payload_fields']['turb'];
		
		$stmt2->execute();
		$stmt2->close();
	}
	
?>