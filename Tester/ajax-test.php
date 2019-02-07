<?php
	include_once "../Includes/dbh.php";
	
	$sql = "SELECT * FROM ttn_test ORDER BY id DESC LIMIT 1";
	$res = mysqli_query($conn, $sql);
	
	if (!(mysqli_num_rows($res) == 1)) {
		echo "Noe gikk galt.";
	} else {
		$row1 = mysqli_fetch_assoc($res);
		$led = $row1['led'];
		echo $led;
	}
?>