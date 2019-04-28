<?php // This file receives the json-object from TTN, and inserts data into the database
	include_once "dbh.php";

	function ttn_timestamp_to_timestring($timestamp) {
		str_replace('Z', '', $timestamp);
		$time_array = explode('T', $timestamp);
		$date = explode('-', $time_array[0]);
		$time = explode(':', $time_array[1]);
		$gmt_string = $date[0]."-".$date[1]."-".$date[2]." ".$time[0].":".$time[1].":".substr($time[2], 0, 2);
		return date("Y-m-d H:i:s", strtotime("+2 hour", strtotime($gmt_string))); // Arduino kan ikke sommertid, og tror den er i Storbritannia
	}

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
		// $phpdate = date("Y-m-d H:i:s", $dateraw);
		$phpdate = ttn_timestamp_to_timestring($json_array['metadata']['time']);
		
		// Prepare statements for MySQL-database
		// The name of the table, the structure and the variables will need to change when we implement more parameters
		$stmt = $conn->prepare("INSERT INTO $dbSamples (time, temp, turb, ph, conc, red, green, blue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
		$stmt->bind_param('sddddiii', $p_time, $p_temp, $p_turb, $p_ph, $p_conc, $p_red, $p_green, $p_blue);
		
		$p_time = $phpdate;
		if (isset($json_array['payload_fields']['data'])) {
			$p_temp = $json_array['payload_fields']['data'][0]['value'];
			$p_turb = $json_array['payload_fields']['data'][1]['value'];
			$p_ph = $json_array['payload_fields']['data'][2]['value'];
			$p_conc = $json_array['payload_fields']['data'][3]['value'];
			$p_red = $json_array['payload_fields']['data'][4]['value'];
			$p_green = $json_array['payload_fields']['data'][5]['value'];
			$p_blue = $json_array['payload_fields']['data'][6]['value'];
		}
		else {
			$p_temp = $json_array['payload_fields']['temp'];
			$p_turb = $json_array['payload_fields']['turb'];
			$p_ph = $json_array['payload_fields']['ph'];
		}
		
		// Send and close
		$stmt->execute();
		$stmt->close();

		$content_ar = array("time" => $phpdate, "temp" => $p_temp, "turb" => $p_turb, "ph" => $p_ph);
		$content = json_encode($content_ar);

		$ch = curl_init("https://folk.ntnu.no/stiangh/AquaTech/Includes/alert-h.php");
		
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
		
		$res = curl_exec($ch);

		curl_close($ch);
	}

	exit;
