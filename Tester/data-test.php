<?php
	session_start();

	if(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off"){
		$redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		header('HTTP/1.1 301 Moved Permanently');
		header('Location: ' . $redirect);
		exit();
	}
?>
<!DOCTYPE html>
<html lang="no">
	<head>
		<title>AquaTech</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" type="text/css" href="..\Includes\inno8_19.css">
        <script src="..\Includes\Chart.bundle.min.js"></script>
        <script src="..\Includes\data-classes.js"></script>
		<script>
			window.onload = oppstart;
			
			function oppstart() {
                var id_dataset = "data0";
                var handler_url = "../Includes/tablegetdata-h.php";
                var spn_dataset = "spn_dataset";
                var id_table = "table0";
                var div_table = "div_table";
                var id_charts = "charts0";
                var div_charts = "div_charts";
                
                data0 = new Dataset(id_dataset, handler_url, spn_dataset);
                table0 = new Table(id_table, div_table, data0);
                charts0 = new Charts(id_charts, div_charts, data0);
            }
			
		</script>
	</head>
	<body>
		<div id="header">
			<div id="header-wrapper">
				<div id="logobox">
					<h1 class="logo">AquaTech</h1>
				</div>
				<div id="loginbox">
					<form>
						<input type="text" name="email" placeholder="E-mail"><br>
						<input type="password" name="pwd" placeholder="Passord"><br>
						<input type="submit" name="submit" value="Logg inn">
					</form>
				</div>
			</div>
			<div class="nav-bar">
				<div class="nav-box"><a href="https://folk.ntnu.no/stiangh/">Forside</a></div>
				<div class="nav-box"><a href="table-test2.php">Data</a></div>
				<div class="nav-box"><a href="led.php">Registrer</a></div>
			</div>
			<div class="placeholder"></div>
		</div>
		<div id="content">

            <p><span id="spn_dataset"></span></p>
            <hr>
            <div id="div_table"></div>
            <div id="div_charts"></div>

        </div>
		<div id="footer">
		</div>
	</body>
</html>