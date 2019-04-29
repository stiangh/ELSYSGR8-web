<?php
    include_once "dbh.php"; // Setter opp kontakt med database og inneholder tabellnavn etc.
    date_default_timezone_set("Europe/Oslo");
    
    $out = array("error" => false, "msg" => "", "data" => array()); // Instansierer respons-objektet

    function error($msg) { // Denne funksjonen benyttes når det oppstår en feil
        $out["error"] = true;
        $out["msg"] = $msg;
        die(json_encode($out));
    }

    $res; // Instansierer res som en global variabel

    if (!isset($_POST["metode"])) { // Sjekker om metode er definert
        error("Method not set"); // Argumentene i forespørselen ligger i den superglobale variabelen $_POST
    }
    switch ($_POST["metode"]) { // Velger fremgangsmåte basert på metoden
        case "lxs": // Siste x målinger
            {
                if (!(isset($_POST["lxs"])) or (intval($_POST["lxs"]) <= 0)) { // Sjekker at nødvendige variabler er definerte og rimelige
                    error("LXS not set or invalid");
                } 
                else {
                    $lxs = mysqli_real_escape_string($conn, $_POST["lxs"]);
                    
                    $sql = "SELECT * FROM $dbSamples ORDER BY id DESC LIMIT $lxs";
                    $res = mysqli_query($conn, $sql);
                    // ^Henter ut målinger fra databasen, res holder resultatet
                }
            }
            break;
        case "lxd": // Målinger fra siste x dager
            {
                if (!(isset($_POST["lxd"])) or (intval($_POST["lxd"]) < 0)) { // Sjekker at nødvendige variabler er definerte og rimelige
                    error("LXD not set or invalid");
                }
                else {
                    $lxd = intval($_POST["lxd"]);
                    $phpdate = strtotime("-$lxd days");
                    $datestring = date('Y-m-d', $phpdate) . " 00:00:00";

                    $sql = "SELECT * FROM $dbSamples WHERE time >= '$datestring' ORDER BY id DESC";
                    $res = mysqli_query($conn, $sql);
                    // ^Henter ut målinger fra databasen, res holder resultatet
                }
            }
            break;
        case "d2d": // Målinger basert på Dato - Dato
            {
                if (!(isset($_POST["fd"])) || !(isset($_POST["td"])) || ($_POST["fd"] == "") || ($_POST["td"] == "")) { // Sjekker at nødvendige variabler er definerte og rimelige
                    error("FD and/or TD not set or invalid");
                }
                else {
                    $fdate = strtotime($_POST["fd"]);
                    $tdate = strtotime($_POST["td"]);
                    $fd = min($fdate, $tdate);
                    $td = max($fdate, $tdate);
                    $fstring = date('Y-m-d', $fd)." 00:00:00";
                    $tstring = date('Y-m-d', $td)." 23:59:59";

                    $sql = "SELECT * FROM $dbSamples WHERE time BETWEEN '$fstring' AND '$tstring' ORDER BY id DESC";
                    $res = mysqli_query($conn, $sql);
                    // ^Henter ut målinger fra databasen, res holder resultatet
                }
            }
            break;
        case "s2s": // Målinger basert på ID - ID
            {
                if (!isset($_POST["fs"]) || !isset($_POST["ts"]) || ($_POST["fs"] == "") || ($_POST["ts"] == "") || (intval($_POST["fs"]) < 0) || (intval($_POST["ts"]) < 0)) { // Sjekker at nødvendige variabler er definerte og rimelige
                    error("FS and/or TS not set or invalid");
                }
                else {
                    $from_id = intval($_POST["fs"]);
                    $to_id = intval($_POST["ts"]);
                    if ($from_id > $to_id) { // Sørger for at minste verdi kommer først
                        $temp_id = $from_id;
                        $from_id = $to_id;
                        $to_id = $temp_id;
                    }

                    $sql = "SELECT * FROM $dbSamples WHERE id BETWEEN $from_id AND $to_id ORDER BY id DESC";
                    $res = mysqli_query($conn, $sql);
                    // ^Henter ut målinger fra databasen, res holder resultatet
                }
            }
            break;
        default: // default-koden kjøres dersom metoden ikke er en av de ovennevnte
            {
                error("Invalid method"); // Vi returnerer da en feil
            }
            break;
    }

    while ($row = mysqli_fetch_assoc($res)) {
        array_push($out["data"], $row); // Plasserer alle målingene i respons-objektet...
    }
    $out["data"] = array_reverse($out["data"], false);  //...og reverserer de så de kommer i riktig rekkefølge

    die(json_encode($out)); // Returnerer resultatet