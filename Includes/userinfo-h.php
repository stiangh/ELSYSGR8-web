<?php
    session_start();
    include "dbh.php";

    $out = array("er" => "false", "json" => "");
    $json_array = array();

    if (!isset($_SESSION["user"])) {
        $out["er"] = "user not logged in";
        echo json_encode($out);
        die();
    }
    else {
        if (!isset($_SESSION["user"]["uid"])) {
            $out["er"] = "uid not set";
            echo json_encode($out);
            die();
        }
        else {
            $uid = mysqli_real_escape_string($conn, $_SESSION["user"]["uid"]);

            $sql1 = "SELECT * from $dbUsers WHERE id = $uid";
            $res1 = mysqli_query($conn, $sql1);

            if (mysqli_num_rows($res1) != 1) {
                $out["er"] = "rows not 1";
                echo json_encode($out);
                die();
            }

            $row1 = mysqli_fetch_assoc($res1);
            $_SESSION["user"]["email"] = $row1["email"];
            $json_array["email"] = $row1["email"];
            $json_array["fname"] = $row1["fname"];
            $json_array["sname"] = $row1["sname"];

            $sql2 = "SELECT rules from $dbRules WHERE uid = $uid";
            $res2 = mysqli_query($conn, $sql2);

            if (mysqli_num_rows($res2) == 1) {
                $row2 = mysqli_fetch_assoc($res2);
                $json_array["rules"] = $row2["rules"];
                $out["bRules"] = "true";
            }
            else {
                $json_array["rules"] = json_encode(array());
                $out["bRules"] = "false";
            }

            $out["json"] = json_encode($json_array);
            echo json_encode($out);
            die();
        }
    }