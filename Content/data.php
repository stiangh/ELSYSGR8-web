<?php
    $query = (isset($_POST["query"]) ? $_POST["query"] : "No predefined query");
    //echo $query;
?>
<script>
	window.onload = oppstart;
			
	function oppstart() {
        var id_dataset = "data0";
        var handler_url = "Includes/getsamples-h.php";
        var spn_dataset = "spn_dataset";
        var export_handler_url = "Includes/export-csv.php";
        var spn_export_id = "spn_dataset_export";
        var id_table = "table0";
        var div_table = "div_table";
        var id_charts = "charts0";
        var div_charts = "div_charts";
        var aliases = {"id": "Id", "time": "Måletidspunkt", "temp": "Temperatur", "turb": "Turbiditet", "ph": "PH", "conc": "Konduktivitet", "red": "R", "blue": "B", "green": "G"};
                
        data0 = new Dataset(id_dataset, handler_url, spn_dataset, export_handler_url, spn_export_id);
        for (var key in aliases) {
            data0.setAlias(data0, key, aliases[key]);
        }
        table0 = new Table(id_table, div_table, data0);
        table0.setUser(user);
        charts0 = new Charts(id_charts, div_charts, data0);
        charts0.setUser(user);

        // <?php echo "q = ".$query." ;" ?>

    }
</script>
<span id="spn_dataset"></span>
<hr>
<div id="div_table"></div>
<div id="spn_dataset_export"></div> <!-- GOTTA CLEAN THIS UP -->
<div id="div_charts"></div>