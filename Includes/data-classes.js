function compareArrays(ar1, ar2) { // Funksjonen sjekker om to arrayer er like. Ulik rekkefølge på elementer vil gi false
	if (ar1.length != ar2.length) {
		return false;
	}
	for (var i = 0; i < ar1.length; i++) {
		if (ar1[i] != ar2[i]) {
			return false;
		}
	}
	return true;
}

function trimOnBlur(ev) {
	let t = ev.currentTarget;
	t.value = t.value.trim();
}

function r2c(rData, header) {
	var cData = [];
		for (var i = 0; i < rData.length; i++) {
			var point = {};
			point.x = new Date(rData[i]['time']);
			point.y = rData[i][header];
			cData.push(point);
		}
	return cData;
}

function dateValue(dt) { 
	var yyyy = dt.getFullYear();
	var m = dt.getMonth() + 1;
	var mm = (m < 10 ? "0" : "") + m;
	var d = dt.getDate();
	var dd = (d < 10 ? "0" : "") + d;
	return yyyy + "-" + mm + "-" + dd;


}

function loadWithRequest(method, content, page_url, newTab = false) { // Laster en nettside med f.eks POST
	var f = document.createElement("form");
	f.style.display = "none";
	f.action = page_url;
	f.method = method.toUpperCase();
	f.name = "lwr_form";
	f.id = "lwr_form";
	if (newTab) {
		f.target = "_blank";
	}
	for (var key in content) {
		var input = document.createElement("input");
		input.type = "text";
		input.name = key;
		input.value = content[key];
		f.appendChild(input);
	}
	document.body.appendChild(f);
	f.submit();
	if (newTab) {
		document.body.removeChild(f);
	}
}

class Dataset { // Klasse som innhenter data baser på bruker-input, og informerer Table, Charts om endringer
	constructor(id, handler_url, spanbox_id, export_handler_url = false, spn_export_id = false) {
		this.id = id;
		this.handler = handler_url;
		this.export_handler_url = export_handler_url;
		this.AJAXInterval = null;
		this.paused = false;
		this.frequency = 5000; // ms
		this.spanBox = document.getElementById(spanbox_id);
		this.spn_export = ((spn_export_id == false) || (export_handler_url == false) ? false : document.getElementById(spn_export_id));
		this.query = "";
		this.method = "";
		this.headers = [];
		this.headerBools = {};
		this.data = [];
		this.listeners = [];
		this.aliases = {};
		
		this.slcMethod = document.createElement("select");
		this.slcMethod.id = this.id + "_slc_method";
		this.slcMethod.addEventListener('change', this.updateMethod.bind(null, this));
		var opt1 = document.createElement("option");
		opt1.innerHTML = "Dato - Dato";
		opt1.value = "d2d";
		this.slcMethod.appendChild(opt1);
		var opt2 = document.createElement("option");
		opt2.innerHTML = "Siste x dager";
		opt2.value = "lxd";
		this.slcMethod.appendChild(opt2);
		var opt3 = document.createElement("option");
		opt3.innerHTML = "Siste x målinger";
		opt3.value = "lxs";
		opt3.selected = true;
		this.slcMethod.appendChild(opt3);
		this.spanBox.appendChild(this.slcMethod);
		
		this.slcFD = document.createElement("input");
		this.slcFD.type = "date";
		this.slcFD.id = this.id + "slc_fd";
		this.slcFD.value = dateValue(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
		this.spanBox.appendChild(this.slcFD);
		this.slcTD = document.createElement("input");
		this.slcTD.type = "date";
		this.slcTD.id = this.id + "slc_td";
		this.slcTD.value = dateValue(new Date());
		this.spanBox.appendChild(this.slcTD);
		this.slcLXD = document.createElement("input");
		this.slcLXD.type = "number";
		this.slcLXD.id = this.id + "_slc_lxd";
		this.slcLXD.value = 7;
		this.slcLXD.min = 0;
		this.spanBox.appendChild(this.slcLXD);
		this.slcLXS = document.createElement("input");
		this.slcLXS.type = "number";
		this.slcLXS.id = this.id + "_slc_lxs";
		this.slcLXS.value = 20;
		this.slcLXS.min = 1;
		this.spanBox.appendChild(this.slcLXS);
		
		this.btnUpdate = document.createElement("button");
		this.btnUpdate.id = this.id + "_btn_update";
		this.btnUpdate.innerHTML = "Oppdater";
		this.btnUpdate.addEventListener('click', this.updateQuery.bind(null, this));
		this.spanBox.appendChild(this.btnUpdate);
		this.btnPause = document.createElement("button");
		this.btnPause.id = this.id + "_btn_pause";
		this.btnPause.innerHTML = "Pause";
		this.btnPause.addEventListener('click', this.pauseClicked.bind(null, this));
		this.spanBox.appendChild(this.btnPause);

		this.spnHeaders = document.createElement("p");
		this.spanBox.appendChild(this.spnHeaders);

		if (this.spn_export != false) {
			this.btnExport = document.createElement("BUTTON");
			this.btnExport.innerHTML = "Eksporter som CSV-fil";
			this.btnExport.addEventListener('click', this.exportCSV.bind(null, this));
			this.btnExport.id = this.id + "_btn_export";
			this.spn_export.appendChild(this.btnExport);
		}
		
		this.updateMethod(this);
		this.updateQuery(this);
	}
	
	updateMethod(obj) {
		console.log("updateMethod called")
		var method = obj.slcMethod.value;
		
		switch(method) {
			case "d2d":
				obj.showInputs(obj, true, true, false, false);
				obj.method = method;
				break;
			case "lxd":
				obj.showInputs(obj, false, false, true, false);
				obj.method = method;
				break;
			case "lxs":
				obj.showInputs(obj, false, false, false, true);
				obj.method = method;
				break;
			default:
				console.log("Invalid method");
				return;
				break;
		}
		
		return;
	}
	
	updateQuery(obj) {
		console.log("updateQuery callled");

		obj.checkForm(obj);
		
		switch(obj.method) {
			case "d2d":
				var fd = obj.slcFD.value;
				var td = obj.slcTD.value;
				obj.query = "metode=d2d&fd=" + fd + "&td=" + td;
				break;
			case "lxd":
				var lxd = obj.slcLXD.value;
				obj.query = "metode=lxd&lxd=" + lxd;
				break;
			case "lxs":
				var lxs = obj.slcLXS.value;
				obj.query = "metode=lxs&lxs=" + lxs;
				break;
			default:
				console.log("Invalid method");
				return;
				break;
		}
		
		if (obj.paused) { obj.pauseClicked(obj); }
		obj.requestData(obj);
		obj.AJAXInterval = setInterval(obj.requestData.bind(null, obj), obj.frequency);
		return;
	}
	
	checkForm(obj) {
		if (obj.slcLXD.value == "") {obj.slcLXD.value = 7;}
		else {
			if (parseInt(obj.slcLXD.value) !== obj.slcLXD.value) {obj.slcLXD.value = Math.round(obj.slcLXD.value);}
			if (parseInt(obj.slcLXD.value) < 0) {obj.slcLXD.value = 1;}
		}
		if (obj.slcLXS.value == "") {obj.slcLXS.value = 20;}
		else {
			if (parseInt(obj.slcLXS.value) !== obj.slcLXS.value) {obj.slcLXS.value = Math.round(obj.slcLXS.value);}
			if (parseInt(obj.slcLXS.value) <= 0) {obj.slcLXS.value = 1;}
		}
	}

	pauseClicked(obj) {
		console.log("pauseClicked called");
		
		obj.paused = !obj.paused;
		obj.btnPause.innerHTML = (obj.paused ? "Resume" : "Pause");
		
		return;
	}
	
	showInputs(obj, bFD, bTD, bLXD, bLXS) {
		console.log("showInputs called");
		obj.slcFD.style.display = (bFD ? "initial" : "none");
		obj.slcTD.style.display = (bTD ? "initial" : "none");
		obj.slcLXD.style.display = (bLXD ? "initial" : "none");
		obj.slcLXS.style.display = (bLXS ? "initial" : "none");
		return;
	}
	
	requestData(obj) {
		if (obj.paused) {
			return;
		}
		console.log("requestData called");
		
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var rt = xhttp.responseText;
				var jsonArray = JSON.parse(rt);
				//console.log(jsonArray.message);
				if (jsonArray.error) {
					console.log("AJAX Request failed");
					console.log(jsonArray.message);
				}
				else {
					obj.setData(obj, jsonArray.data);
				}
				return;
			}
		}
		xhttp.open("POST", obj.handler, true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send(obj.query);
		return;
	}
	
	addListener(obj, sub) {
		console.log("addListener called");
		obj.listeners.push(sub);
		return;
	}
	
	notifyListeners(obj, newHeaders) {
		console.log("notifyListeners called");
		
		for (var i = 0; i < obj.listeners.length; i++) {
			obj.listeners[i].getNotification(obj.listeners[i], newHeaders);
		}
		
		return;
	}
	
	setFrequency(obj, frequency) {
		console.log("setFrequency called");
		obj.frequency = frequency;
		return;
	}
	
	setData(obj, data) {
		console.log("setData called");
		
		obj.data = data;
		var headers = [];
		for (var key in data[0]) {
			headers.push(key);
		}
		var newHeaders = false;
		if (!compareArrays(obj.headers, headers)) {
			obj.headers = headers;
			newHeaders = true;
			obj.headerBools = {};
			obj.spnHeaders.innerHTML = "";
			for (var i = 0; i < obj.headers.length; i++) {
				var h = obj.headers[i];
				obj.headerBools[h] = true;
				var s = document.createElement("span");
				if (i != 0) {s.innerHTML = " | ";}
				s.innerHTML += (h in obj.aliases ? obj.aliases[h] : h);
				var cb = document.createElement("input");
				cb.type = "checkbox";
				cb.checked = true;
				cb.id = obj.id + "_chk" + h;
				cb.addEventListener('change', obj.setHeaderBools.bind(null, obj, h));
				obj.spnHeaders.appendChild(s);
				obj.spnHeaders.appendChild(cb);
			}
		}
		obj.notifyListeners(obj, newHeaders)
		
		return;
	}

	setHeaderBools(obj, header) {
		obj.headerBools[header] = !obj.headerBools[header];
		obj.notifyListeners(obj, false);
	}

	setAlias(obj, header, alias) {
		obj.aliases[header] = alias;
		return;
	}

	reloadPage(obj) {
		var method = "POST";
		var query = obj.query;
		var url = window.location.origin + window.location.pathname;
		loadWithRequest(method, {"query": query }, url);
	}

	exportCSV(obj) {
		if (obj.export_handler_url == false) {
			return;
		}
		let content = {};
		content.auth = "mitsub";
		content.json = JSON.stringify(obj.data);
		
		let ignore = [];
		for (let key in obj.headerBools) {
			if (obj.headerBools[key] === false) {
				ignore.push(key);
			}
		}
		content.ignore = JSON.stringify(ignore);

		loadWithRequest("POST", content, "Includes/export-csv.php", false);
	}
}

class Table { // Klasse som lager tabell basert på data fra data-settet
	constructor(id, tdiv_id, data_set) {
		this.id = id;
		this.tableDiv = document.getElementById(tdiv_id);
		this.dataSet = data_set;
		this.dataSet.addListener(this.dataSet, this);
		
		return;
	}
	
	getNotification(obj, newHeaders) {
		console.log("getNotification called");
		obj.createTable(obj);
		return;
	}
	
	createTable(obj) {
		var data = obj.dataSet.data;
		var headers = obj.dataSet.headers;
		var headerBools = obj.dataSet.headerBools;
		var aliases = obj.dataSet.aliases;
		
		var table = document.createElement("table");
		table.className = "dataTable";
		var tr = document.createElement("tr");
		for (var i = 0; i < headers.length; i++) {
			if (!headerBools[headers[i]]) {
				continue;
			}
			var th = document.createElement("th");
			var h = headers[i];
			th.innerHTML = (h in aliases ? aliases[h] : h);
			tr.appendChild(th);
		}
		table.appendChild(tr);
		for (var i = 0; i < data.length; i++) {
			var tr = document.createElement("tr");
			var rowData = data[i];
			for (var key in rowData) {
				if (!headerBools[key]) {
					continue;
				}
				var td = document.createElement("td");
				td.innerHTML = rowData[key];
				if ((key == "temp") && (parseFloat(rowData[key]) > 100)) {
					td.style.color = "red";
				}
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
		obj.tableDiv.innerHTML = "";
		obj.tableDiv.appendChild(table);
		
		return;
	}
}

class Charts { // Grafer implementert vha Chart.js (Chart.bundle.min.js må inkluderes for at denne skal virke)
	constructor(id, div_id, data_set) {
		this.id = id;
		this.div = document.getElementById(div_id);
		this.dataset = data_set;
		this.dataset.addListener(this.dataset, this);
		this.headers = [];
		this.charts = {}; // "header/key": chart.js;
	}

	getNotification(obj, newHeaders) {
		console.log("getNotification called");

		if (newHeaders) {
			obj.getHeaders(obj);
		}
		else {
			obj.updateCharts(obj);
		}

		return;
	}

	getHeaders(obj) {
		console.log("getHeaders called.");

		obj.headers = obj.dataset.headers;
		var rData = obj.dataset.data;
		this.div.innerHTML = "";
		
		for (var i = 0; i < obj.headers.length; i++) {
			var h = obj.headers[i];
			if ((h == "id") || (h == "time")) {
				continue;
			}
			obj.addChart(obj, h, rData);
		}

		return;
	}

	addChart(obj, header, rData) {
		console.log("addChart called");
		var aliases = obj.dataset.aliases;

		var cdiv = document.createElement("div");
		cdiv.className = "chartContainer";
		obj.div.appendChild(cdiv);
		var canvas = document.createElement("canvas");
		canvas.id = obj.id + "_cvs_" + header;
		cdiv.appendChild(canvas);
		var ctx = canvas.getContext("2d");

		var cData = r2c(rData, header);

		obj.charts[header] = new Chart(ctx, {
			type: 'line',
			data: {
				datasets: [{
					label: (header in aliases ? aliases[header] : header),
					backgroundColor: 'hsla(0, 100%, 70%, 0.6)',
					borderColor: 'hsla(0, 100%, 70%, 1.0)',
					data: cData
				}]
			},
			options: {
				aspectRatio: 2,
				scales: {
					xAxes: [{
						type: 'time',
						distribution: 'linear'
					}]
				}
			}
		});

		return;
	}

	updateCharts(obj) {
		console.log("updateCharts called");

		var rData = obj.dataset.data;
		var headerBools = obj.dataset.headerBools;
		var aliases = obj.dataset.aliases;

		for (var header in obj.charts) {
			var chart = obj.charts[header];
			chart.data.datasets[0].data = r2c(rData, header);
			chart.data.datasets[0].label = (header in aliases ? aliases[header] : header);
			document.getElementById(obj.id + "_cvs_" + header).style.display = (headerBools[header] ? "initial" : "none");
			chart.update();
		}

		return;
	}
}