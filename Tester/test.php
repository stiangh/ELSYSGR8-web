<?php

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
	</head>
	<body>
		<form method="POST" action="../Includes/tablegetdata-h.php">
			<input type="text" name="metode" value="lxs" style="display:none;"><br>
			<input type="number" name="lxs" value=30><br>
			<input type="submit" name="submit" value="submit">
		</form>
	</body>
</html>