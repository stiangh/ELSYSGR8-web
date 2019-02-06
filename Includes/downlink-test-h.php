<?php
	if (!isset($_POST['tfd']) || ($_POST['tfd'] == "")) {
		header("Location: ../Tester/downlink-test.php?msg=incomplete");
		die();
	} 
	else {
		$url = "https://integrations.thethingsnetwork.org/ttn-eu/api/v2/down/elsys-inno-2019/folk-ntnu-test?key=ttn-account-v2.kkW-kQVt57pcjnoUnUWglE4feVVeBuJ6CysANgAEl3M";
		$dev_id = "ttn-uno-gr8-1";
		$port = 1;
		$confirmed = false;
		
		$tfd = $_POST['tfd'];
		$payload_fields = array( "auth" => "lolz", "led" => $tfd );
		
		$json_array = array( "dev_id" => $dev_id, "port" => $port, "confirmed" => $confirmed, "payload_fields" => $payload_fields );
		$json_string = json_encode($json_array);
		
		$ch = curl_init($url);
		
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $json_string);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
		
		$res = curl_exec($ch);

		curl_close($ch);
		
		header("Location: ../Tester/downlink-test.php?msg=success&tfd=$tfd");
	}
?>