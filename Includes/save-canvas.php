<?php
    if (!isset($_POST["auth"]) || ($_POST["auth"] != "mitsub")) {
        echo "Error: Not authorized";
        die();
    }
    else if (!isset($_POST["img"])) {
        echo "Error: No image.";
        die();
    }
    else {
        $img = $_POST["img"];
        $img = str_replace('data:image/png;base64,', '', $img);
        $img = str_replace(' ', '+', $img);
        $fileData = base64_decode($img);

        $fileName = "aq".uniqid().".png";
        file_put_contents($fileName, $fileData);

        $input = imagecreatefrompng($fileName);
        list($width, $height) = getimagesize($fileName);
        $output = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($output,  255, 255, 255);
        imagefilledrectangle($output, 0, 0, $width, $height, $white);
        imagecopy($output, $input, 0, 0, 0, 0, $width, $height);
        imagepng($output, $fileName);

        header("Content-Description: File Transfer"); 
        header("Content-Type: application/octet-stream"); 
        header('Content-Disposition: attachment; filename="'.basename($fileName).'"');
        header('Content-Length: ' . filesize($fileName));
        ob_clean();
        flush();
        readfile($fileName);

        unlink($fileName);
        exit;
    }