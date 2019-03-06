<?php
	include "dbh.php";
	
	if (!isset($_POST["metode"])) {
		echo "Error: Method not set";
		die();
	} 
	else {
		date_default_timezone_set("Europe/Oslo");
		$jsonArray = array("error"=>false, "message"=>"", "data"=>array());
		switch ($_POST["metode"]) {
			case "lxs":
				{
					if (!(isset($_POST["lxs"])) or (intval($_POST["lxs"]) <= 0)) {
						$jsonArray["error"] = true;
						$jsonArray["message"] = "LXS not set or invalid";
					} 
					else {
						$lxs = mysqli_real_escape_string($conn, $_POST["lxs"]);
						
						$sql = "SELECT * FROM $dbSamples ORDER BY id DESC LIMIT $lxs"; // Tester data_temp_turb
						$res = mysqli_query($conn, $sql);
						
						while ($row = mysqli_fetch_assoc($res)) {
							array_push($jsonArray["data"], $row);
						}
						$jsonArray["data"] = array_reverse($jsonArray["data"], false);
					}
					echo json_encode($jsonArray);
					die();
				}
				break;
			case "lxd":
				{
					if (!(isset($_POST["lxd"])) or (intval($_POST["lxd"]) < 0)) {
						$jsonArray["error"] = true;
						$jsonArray["message"] = "LXD not set or invalid";
					}
					else {
						$lxd = intval($_POST["lxd"]);
						$phpdate = strtotime("-$lxd days");
						$datestring = date('Y-m-d', $phpdate) . " 00:00:00";

						$sql = "SELECT * FROM $dbSamples WHERE time >= '$datestring' ORDER BY id DESC";
						$res = mysqli_query($conn, $sql);

						while ($row = mysqli_fetch_assoc($res)) {
							array_push($jsonArray["data"], $row);
						}
						$jsonArray["data"] = array_reverse($jsonArray["data"], false);
					}
					echo json_encode($jsonArray);
					die();
				}
				break;
			case "d2d":
				{
					if (!(isset($_POST["fd"])) || !(isset($_POST["td"])) || ($_POST["fd"] == "") || ($_POST["td"] == "")) {
						$jsonArray["error"] = true;
						$jsonArray["message"] = "FD and/or TD not set or invalid";
					}
					else {
						$fdate = strtotime($_POST["fd"]);
						$tdate = strtotime($_POST["td"]);
						$fd = min($fdate, $tdate);
						$td = max($fdate, $tdate);
						$fstring = date('Y-m-d', $fd)." 00:00:00";
						$tstring = date('Y-m-d', $td)." 23:59:59";

						$sql = "SELECT * FROM $dbSamples WHERE time BETWEEN '$fstring' AND '$tstring' ORDER BY id DESC";
						$res = mysqli_query($conn, $sql);

						while ($row = mysqli_fetch_assoc($res)) {
							array_push($jsonArray["data"], $row);
						}
						$jsonArray["data"] = array_reverse($jsonArray["data"], false);
					}
					echo json_encode($jsonArray);
					die();
				}
				break;
			default:
				{
					$jsonArray["error"] = true;
					$jsonArray["message"] = "Invalid method";
					echo json_encode($jsonArray);
					die();
				}
				break;
		}
	}
