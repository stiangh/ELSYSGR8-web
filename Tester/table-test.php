<?php
	if(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off"){
		$redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		header('HTTP/1.1 301 Moved Permanently');
		header('Location: ' . $redirect);
		exit();
	}
?>
<!DOCTYPE html>
<html lang="no">
<!-- Dette er en kommentar -->
	<head>
		<title>Tabell</title>
		<meta charset="utf-8" />
		<script>
			window.onload = oppstart;
			
			var AJAXInterval;
			var paused = false;
			
			class Table {
				constructor(tdiv_id, sdiv_id) {
					this.headers = {};
					this.data = []; // [row]{sample}
					this.table = false;
					this.tableDiv = document.getElementById(tdiv_id);
					this.checkDiv = document.getElementById(sdiv_id);
				}
				
				setData(datatable) {
					if (datatable.lenght == 0) {
						console.log("no data");
						return;
					}
					this.data = datatable;
					this.headers = {};
					for (var key in this.data[0]) {
						this.headers[key] = true;
					}
				}
				
				createTable() {
					if (this.data.lenght == 0) {
						console.log("no data");
						return;
					}
					var table = document.createElement("TABLE");
					var row = document.createElement("TR");
					for (var x in this.headers) {
						if (this.headers[x] != false) {
							var th = document.createElement("TH");
							th.innerHTML = x;
							row.appendChild(th);
						}
					}
					table.appendChild(row);
					for (var i = 0; i < this.data.length; i++) {
						var row = document.createElement("TR");
						for (var x in this.data[i]) {
							if (this.headers[x] != false) {
								var td = document.createElement("TD");
								td.innerHTML = this.data[i][x];
								row.appendChild(td);
							}
						}
						table.appendChild(row);
					}
					this.tableDiv.innerHTML = null;
					this.tableDiv.appendChild(table);
					
				}
			}
			
			function oppstart() {
				methodChange();
				document.getElementById("slc_method").addEventListener('change', methodChange);
				document.getElementById("btn_rd").addEventListener('click', updateQuery);
				document.getElementById("btn_pause").addEventListener('click', pauseClicked);
				window.tbl = new Table("div_table", "spn_chks");
				
				/*var test = [];
				test.push({"nr": 0, "counter": 0, "led": false});
				for (var i = 1; i <= 10; i++) {
					var obj = {"nr": i, "counter": i, "led": true};
					test.push(obj);
				}
				tbl.setData(test);
				tbl.createTable();*/
				
				updateQuery();
			}
			
			function methodChange() {
				var m = document.getElementById("slc_method").value;
				if (m == "d2d") {
					showInputs(true, true, false, false);
				} else if (m == "lxd") {
					showInputs(false, false, true, false);
				} else if (m == "lxs") {
					showInputs(false, false, false, true);
				}
			}
			
			function showInputs(bool_fd, bool_td, bool_lxd, bool_lxs) {
				document.getElementById("slc_fd").style.display = (bool_fd ? "initial" : "none");
				document.getElementById("slc_td").style.display = (bool_td ? "initial" : "none");
				document.getElementById("slc_lxd").style.display = (bool_lxd ? "initial" : "none");
				document.getElementById("slc_lxs").style.display = (bool_lxs ? "initial" : "none");
			}
			
			function updateQuery() {
				var method = document.getElementById("slc_method").value;
				var qry = "";
				
				if (method == "lxs") {
					var n = parseInt(document.getElementById("slc_lxs").value);
					qry = "metode=lxs&lxs=" + n;
				}
				else {
					return;
				}
				if (paused) {
					pauseClicked();
				}
				clearInterval(AJAXInterval)
				requestData(qry);
				AJAXInterval = setInterval(requestData.bind(null, qry), 3000);
			}
			
			function requestData(qry) {
				if (paused) {return;}
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var rt = xhttp.responseText;
						//console.log(rt);
						window.jsonArray = JSON.parse(rt);
						tbl.setData(jsonArray.data);
						tbl.createTable();
					}
				};
				xhttp.open("POST", "../Includes/tablegetdata-h.php", true);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.send(qry);
			}
			
			function pauseClicked() {
				paused = !paused;
				document.getElementById("btn_pause").innerHTML = (paused ? "Resume" : "Pause");
			}
			
		</script>
		<style>
			body {
				font-family: Arial;
			}
			table {
				border-collapse: collapse;
				margin: auto;
				min-width: 50%;
			}
			td, th {
				border: solid 1px black;
				text-align: center;
				padding-left: 10px;
				padding-right: 10px;
				padding-top: 2px;
				padding-bottom: 2px;
			}
			tr:nth-child(even) {
				background: lightBlue;
			}
			th:first-letter {
				text-transform: uppercase;
			}
			.hidden {
				display: none;
			}
			hr {
				width: 100%;
			}
			p {
				text-align: center;
			}
			input, button, select {
				box-sizing: border-box;
			}
			button {
				width: 80px;
			}
		</style>
	</head>
	<body>
		<p>
			Metode: 
			<select id="slc_method">
				<option value="d2d">Dato - Dato</option>
				<option value="lxd">Siste x dager</option>
				<option value="lxs" selected=true>Siste x målinger</option>
			</select>
			Utvalg: 
			<input id="slc_fd" type="date"> <input id="slc_td" type="date"> <input id="slc_lxd" type="number" value=7 min=1>
			<input id="slc_lxs" type="number" value=20 min=1>
			<button id="btn_rd">Oppdater</button>
			<button id="btn_pause">Pause</button>
			<br>
			<span "spn_chks"></span>
		</p>
		<hr>
		<div id="div_table"></div>
	</body>
</html>