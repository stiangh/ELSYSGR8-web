<script src="Includes\Chart.bundle.min.js"></script>
<script src="Includes\data-classes.js"></script>
<script>
	window.onload = oppstart;
			
	function oppstart() {
        var id_dataset = "data0";
        var handler_url = "Includes/tablegetdata-h.php";
        var spn_dataset = "spn_dataset";
        var id_table = "table0";
        var div_table = "div_table";
        var id_charts = "charts0";
        var div_charts = "div_charts";
        var aliases = {"id": "Id", "time": "Måletidspunkt", "temp": "Temperatur", "turb": "Turbiditet"};
                
        data0 = new Dataset(id_dataset, handler_url, spn_dataset);
        for (var key in aliases) {
            data0.setAlias(data0, key, aliases[key]);
        }
        table0 = new Table(id_table, div_table, data0);
        charts0 = new Charts(id_charts, div_charts, data0);
    }
</script>
<span id="spn_dataset"></span>
<hr>
<div id="div_table"></div>
<div id="div_charts"></div>