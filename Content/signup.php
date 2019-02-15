<h1>Registrer Bruker</h1>
<form method="POST" action="Includes/signup-h.php" name="signup" id="signup">
    <input name="email" type="email" placeholder="E-mail"><br>
    <input name="fname" type="text" placeholder="First Name"><br>
    <input name="sname" type="text" placeholder="Last Name"><br>
    <input name="pwd" type="password" placeholder="Password"><br>
    <input name="pwd2" type="password" placeholder="Re-enter Password"><br>
    <button name="submit" type="submit" form="signup" value="mitsub">Submit</button><br>
</form>
<?php
    if (isset($_GET["success"]) && isset($_GET["msg"])) {
        $class = ($_GET["success"] == "1" ? "positive" : "negative");
        $msg = $_GET["msg"];
        echo "<div class='$class'><p>$msg</p></div>";
    }
?>