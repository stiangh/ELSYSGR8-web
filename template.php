<?php
	session_start();

	if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off") {
		$redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		header('HTTP/1.1 301 Moved Permanently');
		header('Location: ' . $redirect);
		exit();
	}

	$loggedIn = false;
	if (isset($_SESSION["user"])) {
		$loggedIn = true;
		$user = $_SESSION["user"];
	}
?>
<!DOCTYPE html>
<html lang="no">
	<head>
		<title>AquaTech</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" type="text/css" href="Includes\inno8_19.css">
		<script src="Includes\Chart.bundle.min.js"></script>
		<script src="Includes\data-classes.js"></script>
	</head>
	<body>
		<div id="header">
			<div id="header-wrapper">
				<div id="logobox">
					<h1 class="logo">AquaTech</h1>
				</div>
				<div id="loginbox">
					<?php
						if (!$loggedIn) {include "Content/login-form.php";}
						else {include "Content/logged-in.php";}
					?>
				</div>
			</div>
			<div class="nav-bar">
				<div class="nav-box"><a href="https://folk.ntnu.no/stiangh/AquaTech/">Forside</a></div>
				<div class="nav-box"><a href="data.php">Data</a></div>
				<?php
					if ($loggedIn) {
						echo '<div class="nav-box"><a href="downlink.php">Downlink</a></div>';
						echo '<div class="nav-box"><a href="mypage.php">Min Side</a></div>';
					}
					else {
						echo '<div class="nav-box"><a href="signup.php">Registrer</a></div>';
					}
				?>
			</div>
			<div class="placeholder"></div>
		</div>
		<div id="content">

			<?php
				$uri = str_replace("/stiangh/AquaTech", "Content", $_SERVER['SCRIPT_NAME']);
				include $uri;
			?>
			
		</div>
		<div id="footer" style="padding-top: 10px;">
			<h2 style="color: white; text-align: center;">POWERED BY</h2>
			<a style="display: block; font-size: 175%; color: white; font-variant: small-caps; text-align: center;" href="https://www.rittal.com" target="_blank">Rittal AS</a>
		</div>
	</body>
</html>