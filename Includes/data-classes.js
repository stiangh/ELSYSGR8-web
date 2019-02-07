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

class Dataset { // Klasse som innhenter data baser på bruker-input, og informerer Table,Graph om endringer
	constructor(id, handler_url, spanbox_id) {
		this.id = id;
		this.handler = handler_url;
		this.AJAXInterval = null;
		this.paused = false;
		this.frequency = 5000; // ms
		this.spanBox = document.getElementById(spanbox_id);
		this.query = "";
		this.method = "";
		this.headers = [];
		this.headerBools = {};
		this.data = [];
		this.listeners = [];
		
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
		// Not implemented yet, low priority
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
				s.innerHTML = h + ": ";
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
		
		var table = document.createElement("table");
		table.className = "dataTable";
		var tr = document.createElement("tr");
		for (var i = 0; i < headers.length; i++) {
			if (!headerBools[headers[i]]) {
				continue;
			}
			var th = document.createElement("th");
			th.innerHTML = headers[i];
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

class Graph {
	constructor(id, div_id, data_set, width, height) {
		this.id = id;
		this.div = document.getElementById(div_id);
		this.width = width;
		this.height = height;
		this.bgColor = "ghostWhite";
		this.dtColor = "navy";
		this.lgdColor = "dimGray";
		this.font = "18px Arial";

		this.canvas = document.createElement("CANVAS");
		this.canvas.id = this.id + "_cvs";
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.canvas.style.border = "1px solid black";
		this.div.style.paddingLeft = "10px";
		this.div.style.paddingTop = "10px";
		this.div.appendChild(this.canvas);
		this.ctx = this.canvas.getContext("2d");

		this.dataset = data_set;
		this.dataset.addListener(this.dataset, this);
	}

	getNotification(obj, newHeaders) {
		console.log("getNotification callled");
		obj.dataset.pauseClicked(this.dataset);
		obj.plot(obj);
		return;
	}

	plot(obj) {
		obj.ctx.fillStyle = obj.bgColor;
		obj.ctx.fillRect(0, 0, obj.width, obj.height);
		obj.ctx.fillStyle = obj.dtColor;
		obj.ctx.strokeStyle = obj.dtColor;
		var data = obj.dataset.data;

		var paddingLeft = 60;
		var paddingRight = 30;
		var paddingTop = 30;
		var paddingBottom = 60;

		var dx = (obj.width - paddingLeft - paddingRight) / (data.length - 1);
		
		var tempMin = Infinity;
		var tempMax = - Infinity;
		for (var i = 0; i < data.length; i++) {
			var temp = data[i]["temp"];
			if (temp > tempMax) {tempMax = temp;}
			if (temp < tempMin) {tempMin = temp;}
		}
		var dy = (obj.height - paddingTop - paddingBottom) / (tempMax - tempMin);
		
		for (var i = 0; i < data.length; i++) {
			var temp = data[i]["temp"];
			var x = paddingLeft + dx * i;
			var y = obj.height - paddingBottom - dy * (temp - tempMin);
			
			if (i > 0) {
				obj.ctx.lineTo(x, y);
				obj.ctx.stroke();
			}

			obj.ctx.beginPath();
			obj.ctx.arc(x, y, 3, 0, 2 * Math.PI);
			obj.ctx.fill();

			if (i != data.lenght - 1) {
				obj.ctx.beginPath();
				obj.ctx.moveTo(x, y);
			}
		}

		obj.ctx.strokeStyle = obj.lgdColor;
		obj.ctx.fillStyle = obj.lgdColor;
		obj.ctx.textAlign = "center";
		obj.ctx.beginPath();
		obj.ctx.moveTo(paddingLeft, obj.height - paddingBottom);
		obj.ctx.lineTo(obj.width - paddingRight, obj.height - paddingBottom);
		obj.ctx.lineTo(obj.width - paddingRight, paddingTop);
		obj.ctx.lineTo(paddingLeft, paddingTop);
		obj.ctx.lineTo(paddingLeft, obj.height - paddingBottom);
		obj.ctx.stroke();

		obj.ctx.font = obj.font;
		obj.ctx.fillText(tempMin, paddingLeft / 2, obj.height - paddingBottom);
		obj.ctx.fillText(tempMax, paddingLeft / 2, paddingTop);
		obj.ctx.fillText("Temp", paddingLeft / 2, paddingTop + (obj.height - paddingTop - paddingBottom) / 2);
		obj.ctx.fillText("Tid", paddingLeft + (obj.width - paddingLeft - paddingRight) / 2, obj.height - paddingBottom / 2);
		obj.ctx.textAlign = "left";
		obj.ctx.fillText(data[0]["time"], paddingLeft, obj.height - paddingBottom / 2);
		obj.ctx.textAlign = "right";
		obj.ctx.fillText(data[data.length - 1]["time"], obj.width - paddingRight, obj.height - paddingBottom / 2);
	}
}

class Charts {
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
					label: header,
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

		for (var header in obj.charts) {
			var chart = obj.charts[header];
			chart.data.datasets[0].data = r2c(rData, header);
			document.getElementById(obj.id + "_cvs_" + header).style.display = (headerBools[header] ? "initial" : "none");
			chart.update();
		}

		return;
	}
}