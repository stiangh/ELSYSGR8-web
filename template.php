<?php
	session_start();

	if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off") {
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
		<link rel="stylesheet" type="text/css" href="Includes\inno8_19.css">
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
				<div class="nav-box"><a href="https://folk.ntnu.no/stiangh/AquaTech/">Forside</a></div>
				<div class="nav-box"><a href="data.php">Data</a></div>
				<div class="nav-box"><a href="downlink.php">Downlink</a></div>
				<div class="nav-box"><a href="signup.php">Registrer</a></div>
			</div>
			<div class="placeholder"></div>
		</div>
		<div id="content">

			<?php
				$uri = str_replace("/stiangh/AquaTech", "Content", $_SERVER['SCRIPT_NAME']);
				include $uri;
			?>
			
		</div>
		<div id="footer">
		</div>
	</body>
</html>