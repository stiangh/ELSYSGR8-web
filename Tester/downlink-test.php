<?php
	session_start();

	if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off") {
		$redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		header('HTTP/1.1 301 Moved Permanently');
		header('Location: ' . $redirect);
		exit();
	}

	$gotMsg = false;
	if (isset($_GET["msg"])) {
		$gotMsg = true;
		$msg;
		switch($_GET["msg"]) {
			case "incomplete":
				$msg = "<p class='negative'>Skjemaet er ikke fullstendig utfylt.</p>";
				break;
			case "success":
				$msg = "<p class='positive'>Downlink ble registrert, og lagt i kø.</p>";
				break;
			default:
				$msg = "";
				break;
		}
	}

	$tc = true;
	if (isset($_GET["tfd"])) {
		$tc = ($_GET["tfd"] == "true" ? true : false);
	}
?>
<!DOCTYPE html>
<html lang="no">
<!-- Dette er en kommentar -->
	<head>
		<title>Tittel på siden</title>
		<meta charset="utf-8" />
		<script>
			window.onload = oppstart;
			
			function oppstart() {
				/*kode her*/
			}
			
		</script>
		<style>
			:root {
				font-family: Arial, sans-serif;
			}
			input {
				margin: 4px;
			}
			input:checked + span {
				font-weight: 600;
			}
			p.positive {
				background: hsl(120, 75%, 75%);
				border: 2px solid hsl(120, 100%, 30%);
				border-radius: 8px;
				padding: 4px;
				width: 120px;
				text-align: center;
			}
			p.negative {
				background: hsl(348, 75%, 75%);
				border: 2px solid hsl(348, 100%, 30%);
				border-radius: 8px;
				padding: 4px;
				width: 120px;
				text-align: center;
			}
		</style>
	</head>
	<body>
	<!-- <form method="GET" name="dwnlnkform"> -->
		<form action="../Includes/downlink-test-h.php" method="POST" name="dwnlnkform">
			<p><input type="radio" name="tfd" value=true <?php if ($tc) { echo "checked"; } ?> > <span>Skru på led</span></p>
			<p><input type="radio" name="tfd" value=false <?php if (!$tc) { echo "checked"; } ?> ><span>Skru av led</span></p>
			<input name="submit"type="submit" value="Submit">
		</form>

		<?php if ($gotMsg) {echo $msg;} ?>

	</body>
</html>