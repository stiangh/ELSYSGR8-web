<?php
    session_start();
    include "dbh.php";

    if (!isset($_SESSION["user"])) {
        echo "false 1";
        die();
    }
    else if (!isset($_SESSION["user"]["uid"])) {
        echo "false 2";
        die();
    }
    else if (!isset($_POST["json"])) {
        echo "false 3";
        die();
    }
    else {
        $json = $_POST["json"];
        $uid = mysqli_real_escape_string($conn, $_SESSION["user"]["uid"]);
        $sql = "SELECT * FROM $dbRules WHERE uid = $uid";
        $res = mysqli_query($conn, $sql);

        if (($nRows = mysqli_num_rows($res)) == 0) {
            // Ny rad
            if (!isset($_SESSION["user"]["email"])) {
                echo "false 4";
                die();
            }
            $email = $_SESSION["user"]["email"];

            $stmt = $conn->prepare("INSERT INTO $dbRules (uid, email, rules) VALUES (?, ?, ?)");
            $stmt->bind_param('iss', $p_uid, $p_email, $p_rules);

            $p_rules = $json;
            $p_uid = $uid;
            $p_email = $email;

            $stmt->execute();
            $stmt->close();

            echo "true";
            die();
        }
        else if ($nRows == 1) {
            // Oppdater rad
            $stmt = $conn->prepare("UPDATE $dbRules SET rules = ? WHERE uid = ?");
            $stmt->bind_param('si', $p_rules, $p_uid);

            $p_rules = $json;
            $p_uid = $uid;

            $stmt->execute();
            $stmt->close();

            echo "true";
            die();
        }
        else {
            echo "false 5";
            die();
        }
    }