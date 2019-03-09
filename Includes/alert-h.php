<?php
    include "dbh.php";

    $headers = getallheaders();
    $json_str = file_get_contents('php://input');

    $json_array = json_decode($json_str, true);

    if ((!isset($json_array["temp"])) || (!isset($json_array["turb"])) || (!isset($json_array["ph"]))) {
        echo "Sample not complete";
        die();
    }

    $temp = (float) $json_array["temp"];
    $turb = (float) $json_array["turb"];
    $ph = (float) $json_array["ph"];
    $dateraw = (isset($json_array["time"]) ? $json_array["time"] : "now");
    $date = strtotime($dateraw);
    $time = date("Y-m-d H:i:s", $date);

    $sql = "SELECT * FROM $dbAlert";
    $res = mysqli_query($conn, $sql);

    while ($row = mysqli_fetch_assoc($res)) {
        $flag = ($row["flag"] == NULL ? "1970-01-01 00:00:00" : $row["flag"]);
        if (strtotime($flag) >= strtotime("-30 minutes")) {
            continue;
        }
        $bTemp = (($row["temp_nbt"] == 'false') && ($row["temp_lower"] <= $temp) && ($row["temp_upper"] >= $temp)) || (($row["temp_nbt"] == 'true') && (($row["temp_lower"] >= $temp) || ($row["temp_upper"] <= $temp)));
        $bTurb = (($row["turb_nbt"] == 'false') && ($row["turb_lower"] <= $turb) && ($row["turb_upper"] >= $turb)) || (($row["turb_nbt"] == 'true') && (($row["turb_lower"] >= $turb) || ($row["turb_upper"] <= $turb)));
        $bPh = (($row["ph_nbt"] == 'false') && ($row["ph_lower"] <= $ph) && ($row["ph_upper"] >= $ph)) || (($row["ph_nbt"] == 'true') && (($row["ph_lower"] >= $ph) || ($row["ph_upper"] <= $ph)));

        if ($bTemp || $bTurb || $bPh) {
            $sTemp = ($bTemp ? "color: red;" : "");
            $sTurb = ($bTurb ? "color: red;" : "");
            $sPh = ($bPh ? "color: red;" : "");

            $to = $row["email"];
            $subject = "AquaTech Alert";
            $msg = "Dette er et automatisk varsel fra <a href='https://folk.ntnu.no/stiangh/AquaTech' style='text-decoration: none;'>AquaTech</a>.<br>På bakgrunn av dine egendefinerte varselregler, får du beskjed om at vår siste måling var i konflikt med disse. Målingen følger under.<br><br>Tid: $time <br> <span style='$sTemp'>Temp: $temp </span><br> <span style='$sTurb'>Turb: $turb </span><br> <span style='$sPh'>PH: $ph </span><br><br> Du kan se alle målingene <a href='https://folk.ntnu.no/stiangh/AquaTech/data.php' style='text-decoration: none;'>på nettsiden</a>.";
            
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= "From: AquaTech <AquaTech>";

            mail($to, $subject, $msg, $headers);

            $stamp = Date("Y-m-d H:i:s");
            $sql2 = "UPDATE $dbAlert SET flag = (?) WHERE email = (?)";
            $stmt = $conn->prepare($sql2);
            $stmt->bind_param("ss", $p_flag, $p_mail);
            $p_flag = $stamp;
            $p_mail = $to;
            $stmt->execute();
            $stmt->close();
        }
    }

    exit;