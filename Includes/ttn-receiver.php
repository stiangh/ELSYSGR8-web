<?php // This file receives the json-object from TTN, and inserts data into the database
	include_once "dbh.php";

	$headers = getallheaders();
	
	// Check authorization
	if ($headers["Authorization"] == "inno19_8") {
		$json_str = file_get_contents('php://input'); // Pass incoming JSON content to the string $json_str
		$json_array = json_decode($json_str, true); // Decode JSON-string to an associative array

		// Converting TTN-timestamp to a usable format
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
		$dateraw = strtotime("+1 hour", strtotime($timestampraw));
		$phpdate = date("Y-m-d H:i:s", $dateraw);
		
		// Prepare statements for MySQL-database
		// The name of the table, the structure and the variables will need to change when we implement more parameters
		$stmt = $conn->prepare("INSERT INTO $dbSamples (time, temp, turb, ph) VALUES (?, ?, ?, ?)");
		$stmt->bind_param('sddd', $p_time, $p_temp, $p_turb, $p_ph);
		
		$p_time = $phpdate;
		if (isset($json_array['payload_fields']['data'])) {
			$p_temp = $json_array['payload_fields']['data'][0]['value'];
			$p_turb = $json_array['payload_fields']['data'][1]['value'];
			$p_ph = $json_array['payload_fields']['data'][2]['value'];
		}
		else {
			$p_temp = $json_array['payload_fields']['temp'];
			$p_turb = $json_array['payload_fields']['turb'];
			$p_ph = $json_array['payload_fields']['ph'];
		}
		
		// Send and close
		$stmt->execute();
		$stmt->close();
	}
