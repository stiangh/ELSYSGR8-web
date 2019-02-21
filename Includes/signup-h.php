<?php
    include_once "dbh.php";
    $dbTableName = "signup_test";
    $params = ["email", "pwd", "pwd2", "fname", "sname"];
    $success = 0;
    $msg = "";

    function validateForm($email, $pwd, $pwd2) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {return "Mail-adressen er ikke gyldig.";}
        if ($pwd !== $pwd2) {return "Passordene er ikke like.";}
        return true;
    }

    function testIssets($method, $params) {
        $SUP;
        switch ($method) {
            case "post":
            case "POST":
                $SUP = $_POST;
                break;
            case "get":
            case "GET":
                $SUP = $_GET;
                break;
            default:
                return false;
                break;
        }
        foreach ($params as $value) {
            if (!isset($SUP[$value]) || ($SUP[$value] == "") || ($SUP[$value] == null)) {
                return false;
            }
        }
        return true;
    }

    if (!((isset($_POST["submit"])) && ($_POST["submit"] == "mitsub"))) {
        $msg = "Intet skjema funnet.";
        header("Location: ../signup.php?success=$success&msg=$msg");
        die();
    } 
    else {
        if (!testIssets("POST", $params)) {
            $msg = "Skjemaet er ikke fullstendig utfylt.";
            header("Location: ../signup.php?success=$success&msg=$msg");
            die();
        }
        else {
            $vRes = validateForm($_POST["email"], $_POST["pwd"], $_POST["pwd2"]);
            if (!($vRes === true)) {
                $msg = $vRes;
                header("Location: ../signup.php?success=$success&msg=$msg");
                die();
            }
            else {
                $email = $_POST["email"];
                $pwd = password_hash($_POST["pwd"], PASSWORD_DEFAULT);
                $fname = $_POST["fname"];
                $sname = $_POST["sname"];

                $t_email = mysqli_real_escape_string($conn, $email);
                $sql = "SELECT * FROM $dbTableName WHERE email='$t_email'";
                $res = mysqli_query($conn, $sql);

                if (mysqli_num_rows($res) != 0) {
                    $msg = "Det eksisterer allerede en bruker med denne mail-adressen.";
                    header("Location: ../signup.php?success=$success&msg=$msg");
                    die();
                }
                else {
                    $stmt = $conn->prepare("INSERT INTO $dbTableName (email, pwd, fname, sname) VALUES (?, ?, ?, ?)");
                    $stmt->bind_param('ssss', $p_email, $p_pwd, $p_fname, $p_sname);

                    $p_email = $email;
                    $p_pwd = $pwd;
                    $p_fname = $fname;
                    $p_sname = $sname;

                    $stmt->execute();
                    $stmt->close();

                    $success = true;
                    $msg = "Brukeren ble registrert.";
                    header("Location: ../signup.php?success=$success&msg=$msg");
                    die();
                }
            }
        } 
    }
