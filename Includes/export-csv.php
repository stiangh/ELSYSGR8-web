<?php
    if (!isset($_POST["auth"]) || ($_POST["auth"] != "mitsub")) {
        echo "Form not authorized";
        die();
    }
    else {
        if (!isset($_POST["json"])) {
            echo "No data submitted";
            die();
        }
        else {
            $json_string = $_POST["json"];
            $json_array = json_decode($json_string);
            $ignore = (isset($_POST["ignore"]) ? json_decode($_POST["ignore"]) : array());

            $filename = "aq".uniqid().".csv";
            $file = fopen($filename, 'w');

            foreach ($json_array[0] as $key => $value) {
                if (!in_array($key, $ignore)) {
                    fwrite($file, $key.",");
                }
            }
            fwrite($file, PHP_EOL);
            foreach ($json_array as $sample) {
                foreach ($sample as $key => $value) {
                    if (!in_array($key, $ignore)) {
                        fwrite($file, $value.",");
                    }
                }
                fwrite($file, PHP_EOL);
            }

            fclose($file);

            header("Content-Description: File Transfer"); 
            header("Content-Type: application/octet-stream"); 
            header('Content-Disposition: attachment; filename="'.basename($filename).'"');
            header('Content-Length: ' . filesize($filename));
            header('Cache-Control: must-revalidate');
            ob_clean();
            flush();
            readfile($filename);

            unlink($filename);
            exit;
        }
    }
