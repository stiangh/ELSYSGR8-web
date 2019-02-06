<?php
	include_once "Includes/dbh.php";
	
	$sql = "SELECT * FROM ttn_test ORDER BY id DESC LIMIT 1";
	$res = mysqli_query($conn, $sql);
	if (mysqli_num_rows($res) > 0) {
		$row1 = mysqli_fetch_assoc($res);
		$led = $row1['led'];
	} else {
		$led = "fail";
	}
?>
<!DOCTYPE html>
<html lang="no">
	<head>
		<title>Inno8_2019</title>
		<meta charset="utf-8" />
		<script>
			window.onload = oppstart;
			var interval;
			
			function oppstart() {
				setInterval(checkLedAJAX, 5000);
			}
			
			function checkLedAJAX() {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var rt = xhttp.responseText;
						var text = ((rt == "true" ? "påskrudd" : "avskrudd"));
						document.getElementById("txtLed").innerHTML = text;
						document.getElementById("txtLed").style.color = ((rt == "true") ? "green" : "red");
					}
				};
				xhttp.open("POST", "Includes/ajax-test.php", true);
				xhttp.send();
			}
		</script>
	</head>
	<body>
		<p>Sist vi sjekket var LED <span id="txtLed">
		<?php 
			if ($led == "fail") {echo "Noe gikk galt.";}
			elseif ($led == "true") {echo "påskrudd";}
			else {echo "avskrudd";}
		?>
		</span>.</p>
	</body>
</html>