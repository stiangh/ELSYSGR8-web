<?php
    session_start();

    $fname = $_SESSION["user"]["fname"];
    $sname = $_SESSION["user"]["sname"];
    echo "<p style='color: white;'>Du er logget inn som $fname $sname.</p>"
?>
<form action="Includes/logout-h.php" id="logout">
    <button type="submit" form="logout">Logg ut</button>
</form>