<?php
    session_start();
    include "dbh.php";

    if (!isset($_POST["auth"]) || ($_POST["auth"] != "mitsub")) {
        echo "No form submitted.";
        die();
    }
    else if (!isset($_SESSION["user"])) {
        echo "User not logged in.";
        die();
    }
    else if (!isset($_POST["json"])) {
        echo "No json submitted.";
        die();
    }
    else {
        $json = json_decode($_POST["json"], true);
        
        // check if user already has row
        $uid = mysqli_real_escape_string($conn, $_SESSION["user"]["uid"]);
        $sql_c = "SELECT * FROM $dbAlert WHERE uid=$uid";
        $res_c = mysqli_query($conn, $sql_c);
        
        if (mysqli_num_rows($res_c) < 1) {
            // Create new row
            $stmt = $conn->prepare("INSERT INTO $dbAlert (uid, email, temp_lower, temp_upper, temp_nbt, turb_lower, turb_upper, turb_nbt, ph_lower, ph_upper, ph_nbt, conc_lower, conc_upper, conc_nbt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param('isddsddsddsdds', $id, $email, $temp_lower, $temp_upper, $temp_nbt, $turb_lower, $turb_upper, $turb_nbt, $ph_lower, $ph_upper, $ph_nbt, $conc_lower, $conc_upper, $conc_nbt);
            
            $id = $uid;
            $email = $_SESSION["user"]["email"];
            $temp_lower = $json["temp"]["lower"];
            $temp_upper = $json["temp"]["upper"];
            $temp_nbt = $json["temp"]["nbt"];
            $turb_lower = $json["turb"]["lower"];
            $turb_upper = $json["turb"]["upper"];
            $turb_nbt = $json["turb"]["nbt"];
            $ph_lower = $json["ph"]["lower"];
            $ph_upper = $json["ph"]["upper"];
            $ph_nbt = $json["ph"]["nbt"];
            $conc_lower = $json["conc"]["lower"];
            $conc_upper = $json["conc"]["upper"];
            $conc_nbt = $json["conc"]["nbt"];

            $stmt->execute();
            $stmt->close();
        }
        else {
            // Update existing row
            $stmt = $conn->prepare("UPDATE $dbAlert SET temp_lower=?, temp_upper=?, temp_nbt=?, turb_lower=?, turb_upper=?, turb_nbt=?, ph_lower=?, ph_upper=?, ph_nbt=?, conc_lower=?, conc_upper=?, conc_nbt=? WHERE uid=?");
            $stmt->bind_param('ddsddsddsddsi', $temp_lower, $temp_upper, $temp_nbt, $turb_lower, $turb_upper, $turb_nbt, $ph_lower, $ph_upper, $ph_nbt, $conc_lower, $conc_upper, $conc_nbt, $id);

            $id = $uid;
            $temp_lower = $json["temp"]["lower"];
            $temp_upper = $json["temp"]["upper"];
            $temp_nbt = $json["temp"]["nbt"];
            $turb_lower = $json["turb"]["lower"];
            $turb_upper = $json["turb"]["upper"];
            $turb_nbt = $json["turb"]["nbt"];
            $ph_lower = $json["ph"]["lower"];
            $ph_upper = $json["ph"]["upper"];
            $ph_nbt = $json["ph"]["nbt"];
            $conc_lower = $json["conc"]["lower"];
            $conc_upper = $json["conc"]["upper"];
            $conc_nbt = $json["conc"]["nbt"];

            $stmt->execute();
            $stmt->close();
        }
        echo "success";
    }
    /*
        EKS:
        {
        "temp":
            {"nbt":"false","lower":30,"upper":1000},
        "turb":
            {"nbt":"false","lower":0.8,"upper":1000},
        "ph":
            {"nbt":"true","lower":5,"upper":9},
        "conc":
            {"nbt":"false","lower":-1000,"upper":0}
        }
    */