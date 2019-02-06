<?php
    session_start();

	if(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off"){
		$redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		header('HTTP/1.1 301 Moved Permanently');
		header('Location: ' . $redirect);
		exit();
    }
?>
<!DOCTYPE html>
<html lang=no>
    <head>
        <title>Canvas-test</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" type="text/css" href="..\Includes\inno8_19.css">
        <script src="..\Includes\data-classes.js"></script>
        <script>
            window.onload = oppstart;

            function oppstart() {
                var dataset_id = "data0";
                var handler_url = "../Includes/tablegetdata-h.php";
                var dataset_spnbox_id = "spnData";
                data0 = new Dataset(dataset_id, handler_url, dataset_spnbox_id);


                var graph_id = "graph0";
                var graph_div_id = "divGraph";
                var k = 1.5;
                var width = 640 * k;
                var height = 360 * k;
                graph0 = new Graph(graph_id, graph_div_id, data0, width, height);
            }

        </script>
    </head>
    <body>
        <span id="spnData"></span>
        <hr>
        <div id="divGraph"></div>
    </body>
</html>