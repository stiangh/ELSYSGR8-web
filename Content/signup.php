<script>
    window.onload = oppstart_signup;

    function oppstart_signup() {
        let form = document.getElementById("signup");
        let inputs = form.getElementsByTagName("INPUT");
        for (let i = 0; i < inputs.length; i++) {
            let x = inputs[i];
            x.addEventListener('invalid', function() {this.style.borderColor = "red"; if (this.dataset.hasOwnProperty('ermsg')) {this.setCustomValidity(this.dataset.ermsg)}});
            x.addEventListener('input', function() {this.style.borderColor = "initial"; this.setCustomValidity('');});
        }
        form.pwd.addEventListener('input', function() {form.pwd2.pattern = this.value;});
    }
</script>
<h1>Registrer Bruker</h1>
<form method="POST" action="Includes/signup-h.php" name="signup" id="signup">
    <input name="email" type="email" placeholder="E-mail"><br>
    <input name="fname" type="text" placeholder="First Name"><br>
    <input name="sname" type="text" placeholder="Last Name"><br>
    <input name="pwd" type="password" pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" data-ermsg='Passordet må inneholde minst 8 karakterer, med minst én stor bokstav, liten bokstav og siffer.' placeholder="Password"><br>
    <input name="pwd2" type="password" data-ermsg='Dette feltet må være likt det forrige.' placeholder="Re-enter Password"><br>
    <button name="submit" type="submit" form="signup" value="mitsub">Submit</button><br>
</form>
<?php
    if (isset($_GET["success"]) && isset($_GET["msg"])) {
        $class = ($_GET["success"] == "1" ? "positive" : "negative");
        $msg = $_GET["msg"];
        echo "<div class='$class'><p>$msg</p></div>";
    }
?>