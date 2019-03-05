<?php
    session_start();
    include "dbh.php";

    $out = array("er"=>"false");

    if ($loggedIn = isset($_SESSION["user"])) {
        $email = mysqli_real_escape_string($conn, $_SESSION["user"]["email"]);
        $sql = "SELECT * FROM alert_limits WHERE email='$email'";
        $res = mysqli_query($conn, $sql);

        if (($nrows = mysqli_num_rows($res)) < 1) {
            $out["er"] = "No account";
            echo json_encode($out);
            die();
        }
        else if ($nrows > 1) {
            $out["er"] = "Multiple accounts";
            echo json_encode($out);
            die();
        }
        else {
            $row = mysqli_fetch_assoc($res);
            $out = array_merge($out, $row);
            echo json_encode($out);
        }
    }
    else {
        $out["er"] = "Not logged in";
        echo json_encode($out);
        die();
    }