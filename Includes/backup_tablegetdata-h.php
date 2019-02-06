<?php
	include_once "dbh.php";
	
	if (!isset($_POST["metode"])) {
		die();
		echo "Error: Method not set";
	} 
	else {
		if ($_POST["metode"] == "lxs") {
			if (!(isset($_POST["lxs"])) or (intval($_POST["lxs"]) <= 0)) {
				die();
				echo "Error: LXS not set";
			} 
			else {
				$jsonArray = array("data"=>array());
				$lxs = mysqli_real_escape_string($conn, $_POST["lxs"]);
				
				$sql = "SELECT * FROM data_temp_turb ORDER BY id DESC LIMIT $lxs"; // Tester data_temp_turb
				$res = mysqli_query($conn, $sql);
				
				while ($row = mysqli_fetch_assoc($res)) {
					array_push($jsonArray["data"], $row);
				}
				$jsonArray["data"] = array_reverse($jsonArray["data"], false);
				
				echo json_encode($jsonArray);
				
			}
		}
		else {
			echo $_POST["metode"];
		}
	}
?>