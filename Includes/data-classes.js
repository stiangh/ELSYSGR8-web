function isEqual(var1, var2) { // Funksjonen sjekker om to arrayer er like. Ulik rekkefølge på elementer vil gi false
	if (typeof var1 == "object") {
		if (typeof var2 != "object") {
			return false;
		}
		if (Object.keys(var1).length != Object.keys(var2).length) {
			return false;
		}
		for (let key in var1) {
			if (!(key in var2)) {
				return false;
			}
			if (!isEqual(var1[key], var2[key])) {
				return false;
			}
		}
		return true;
	}
	return var1 == var2;
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

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {"r": Math.round(r * 255), "g": Math.round(g * 255), "b": Math.round(b * 255)};
}

function colorToRgbComponents(color) {
	if (color[0] == "#") {return hexToRgb(color);}
	if (color[0] == "h") { // 'hsla(h, s, l, a)'
		let ca = color.replace('hsla(', '').replace('hsl(', '').replace(')', '').split(',');
		let h = ca[0];
		let s = ca[1];
		if (s.includes('%')) {
			let s = parseInt(s.replace('%', '')) / 100;
		}
		let l = ca[2];
		if (l.includes('%')) {
			let l = parseInt(l.replace('%', '')) / 100;
		}
		return hslToRgb(parseInt(h), parseFloat(s), parseFloat(l));
	}
	if (color[0] == "r") { // 'rgba(r, g, b, a)
		let ca = color.replace('rgba(', '').replace('rgb(', '').replace(')', '').split(',');
		let r = parseInt(ca[0]);
		let g = parseInt(ca[1]);
		let b = parseInt(ca[2]);
		return {"r": r, "g": g, "b": b};
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
		this.headerCbs = {};
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
		
		if ((this.export_handler_url != false) && (this.spn_export != false)) {
			this.exportBtn = document.createElement("BUTTON");
			this.exportBtn.innerHTML = "Eksporter som CSV-fil";
			this.exportBtn.addEventListener('click', this.exportCSV.bind(null, this));
			this.exportBtn.className = "exportBtn";
			this.spn_export.appendChild(this.exportBtn);
		}
		
		this.spnHeaders = document.createElement("p");
		this.spanBox.appendChild(this.spnHeaders);

		this.slcAll = document.createElement("SPAN");
		this.slcAll.innerHTML = "(Deselect All)";
		this.slcAll.style.textDecoration = "underline";
		this.slcAll.onclick = this.selectAll.bind(null, this, true);
		this.slcAll.style.cursor = "pointer";
		
		this.updateMethod(this);
		this.updateQuery(this);
	}
	
	updateMethod(obj) {
		// console.log("updateMethod called")
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
		// console.log("updateQuery callled");

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
		// console.log("pauseClicked called");
		
		obj.paused = !obj.paused;
		obj.btnPause.innerHTML = (obj.paused ? "Resume" : "Pause");
		
		return;
	}
	
	showInputs(obj, bFD, bTD, bLXD, bLXS) {
		// console.log("showInputs called");
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
		// console.log("requestData called");
		
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
		// console.log("addListener called");
		obj.listeners.push(sub);
		return;
	}
	
	notifyListeners(obj, newHeaders) {
		// console.log("notifyListeners called");
		
		for (var i = 0; i < obj.listeners.length; i++) {
			obj.listeners[i].getNotification(obj.listeners[i], newHeaders);
		}
		
		return;
	}
	
	setFrequency(obj, frequency) {
		// console.log("setFrequency called");
		obj.frequency = frequency;
		return;
	}
	
	setData(obj, data) {
		// console.log("setData called");
		
		let oldData = obj.data.slice(0);
		obj.data = data;
		if (isEqual(oldData, obj.data)) {
			return;
		}
		var headers = [];
		for (var key in data[0]) {
			headers.push(key);
		}
		var newHeaders = false;
		if (!isEqual(obj.headers, headers)) {
			obj.headers = headers;
			newHeaders = true;
			obj.headerBools = {};
			obj.spnHeaders.innerHTML = "";
			obj.headerCbs = {};
			for (var i = 0; i < obj.headers.length; i++) { // Legge til checkboxes headers
				var h = obj.headers[i];
				obj.headerBools[h] = true;
				var s = document.createElement("span");
				if (i != 0) {s.innerHTML = " | ";}
				// s.innerHTML += (h in obj.aliases ? obj.aliases[h] : h);
				s.insertAdjacentHTML('beforeend', (h in obj.aliases ? obj.aliases[h] : h));
				var cb = document.createElement("input");
				cb.type = "checkbox";
				cb.checked = true;
				cb.id = obj.id + "_chk" + h;
				cb.addEventListener('change', obj.setHeaderBools.bind(null, obj, h));
				obj.headerCbs[h] = cb;
				obj.spnHeaders.appendChild(s);
				obj.spnHeaders.appendChild(cb);
			}
			obj.spnHeaders.appendChild(obj.slcAll);
		}
		obj.notifyListeners(obj, newHeaders)
		
		return;
	}

	setHeaderBools(obj, header) {
		// console.log("setHeaderBools called.");
		obj.headerBools[header] = !obj.headerBools[header];
		obj.notifyListeners(obj, false);
		obj.updateSelectAll(obj);
	}

	selectAll(obj, bDe) {
		let b = !bDe;
		for (let key in obj.headerBools) {
			console.log(key);
			obj.headerBools[key] = b;
			obj.headerCbs[key].checked = b;
		}
		obj.updateSelectAll(obj);
		obj.notifyListeners(obj, false);
	}

	updateSelectAll(obj) {
		let b = false;
		let c = false;
		for (let header in obj.headerBools) {
			if (obj.headerBools[header] == false) {
				b = true;
			} else {
				c = true;
			}
		}
		if (b) {
			obj.slcAll.innerHTML = "(Select All)";
			obj.slcAll.onclick = obj.selectAll.bind(null, obj, false);
		} 
		else {
			obj.slcAll.innerHTML = "(Deselect All)";
			obj.slcAll.onclick = obj.selectAll.bind(null, obj, true);
		}
		obj.exportBtn.style.display = (c == false ? "none" : "block");
	}

	setAlias(obj, header, alias) {
		obj.aliases[header] = alias;
		return;
	}

	reloadPage(obj) {
		var method = "POST";
		var query = obj.query;
		var url = window.location.origin + window.location.pathname;
		loadWithRequest(method, {"query": query }, url); // Ikke implementert
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
		/* this.exportBtn = document.createElement("BUTTON");
		this.exportBtn.innerHTML = "Eksporter som CSV-fil";
		this.exportBtn.addEventListener('click', this.dataSet.exportCSV.bind(null, this.dataSet));
		this.exportBtn.className = "exportBtn"; */
		this.user = false;
		
		return;
	}
	
	getNotification(obj, newHeaders) {
		// console.log("getNotification called");
		obj.createTable(obj);
		return;
	}
	
	createTable(obj) {
		var data = obj.dataSet.data;
		var headers = obj.dataSet.headers;
		var headerBools = obj.dataSet.headerBools;
		var aliases = obj.dataSet.aliases;

		let rules = obj.user.rulesByParam;
		
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
				if (typeof rowData[key] == "string") {
					let split = rowData[key].split(' ');
					for (let j = 0; j < split.length; j++) {
						td.innerHTML += split[j];
						if (j != split.length - 1) {
							td.innerHTML += "<wbr> ";
						}
					}
				}
				else {
					td.innerHTML = rowData[key];
				}
				if ((key == "temp") && (parseFloat(rowData[key]) == 528.36)) {
					td.style.color = "red";
				}
				if (key in rules) {
					for (let ri = 0; ri < rules[key].length; ri++) {
						let rule = rules[key][ri];
						if (rule.testValue(rowData[key])) {
							td.style.color = rule.color;
						}
					}
				}
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
		obj.tableDiv.innerHTML = "";
		obj.tableDiv.appendChild(table);
		// obj.dataSet.spn_export.appendChild(obj.exportBtn);
		
		return;
	}

	setUser(user) {
		this.user = user;
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
		this.options = {
			"sMin": {"temp": 0, "turb": 0, "ph": 0, "conc": 0}, 
			"sMax": {"temp": 30, "turb": 1, "ph": 14, "conc": 1}
		}
		this.user = false;
		this.defaultBorderColor = 'rgba(173, 216, 230, 1.0)';
		this.defaultBackgroundColor = 'rgba(173, 216, 230, 0.6)';
	}

	getNotification(obj, newHeaders) {
		// console.log("getNotification called");

		if (newHeaders) {
			obj.getHeaders(obj);
		}
		else {
			obj.updateCharts(obj);
		}

		return;
	}

	getHeaders(obj) {
		// console.log("getHeaders called.");

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
		// console.log("addChart called");
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
					// backgroundColor: 'hsla(0, 100%, 70%, 0.6)',
					backgroundColor: obj.defaultBackgroundColor,
					// borderColor: 'hsla(0, 100%, 70%, 1.0)',
					borderColor: obj.defaultBorderColor,
					data: cData
				}]
			},
			options: {
				aspectRatio: (window.innerWidth > window.innerHeight ? 2 : 1.33),
				elements: {
					line: {
						tension: 0
					}
				},
				scales: {
					xAxes: [{
						type: 'time',
						distribution: 'linear'
					}],
					yAxes: [{
						type: 'linear'
					}]
				}
			}
		});

		if (header in obj.options["sMin"]) {
			obj.charts[header].options.scales.yAxes[0].ticks.suggestedMin = parseFloat(obj.options["sMin"][header]);
		}
		if (header in obj.options["sMax"]) {
			obj.charts[header].options.scales.yAxes[0].ticks.suggestedMax = parseFloat(obj.options["sMax"][header]);
		}
		if ((obj.user != false) && (header in obj.user.rulesByParam)) {
			let grd = this.makeGradientsBOBW(obj.charts[header], obj.user.rulesByParam[header]);
			obj.charts[header].data.datasets[0].borderColor = grd.background;
			obj.charts[header].data.datasets[0].backgroundColor = grd.background;
		}
		obj.charts[header].update();

		obj.charts[header].exportBtn = document.createElement("BUTTON");
		obj.charts[header].exportBtn.innerHTML = "Eksporter som bilde";
		obj.charts[header].exportBtn.addEventListener('click', obj.exportPNG.bind(null, obj, header));
		obj.charts[header].exportBtn.className = "exportBtn";
		obj.div.appendChild(obj.charts[header].exportBtn);

		return;
	}

	updateCharts(obj) {
		// console.log("updateCharts called");

		var rData = obj.dataset.data;
		var headerBools = obj.dataset.headerBools;
		var aliases = obj.dataset.aliases;

		for (var header in obj.charts) {
			var chart = obj.charts[header];
			chart.data.datasets[0].data = r2c(rData, header);
			chart.data.datasets[0].label = (header in aliases ? aliases[header] : header);
			chart.canvas.style.display = (headerBools[header] ? "initial" : "none");
			chart.exportBtn.style.display = (headerBools[header] ? "block" : "none");
			if (header in obj.options["sMin"]) {
				chart.options.scales.yAxes[0].ticks.suggestedMin = parseFloat(obj.options["sMin"][header]);
			}
			if (header in obj.options["sMax"]) {
				chart.options.scales.yAxes[0].ticks.suggestedMax = parseFloat(obj.options["sMax"][header]);
			}

			if (header in obj.user.rulesByParam) {
				let grd = this.makeGradientsBOBW(chart, obj.user.rulesByParam[header]);
				chart.data.datasets[0].borderColor = grd.background;
				chart.data.datasets[0].backgroundColor = grd.background;
			}

			chart.update();
		}

		return;
	}

	exportPNG(obj, header) {
		let cvs = obj.charts[header].canvas;
		let content = {"auth": "mitsub"};
		content.img = cvs.toDataURL("image/png");

		loadWithRequest("POST", content, "Includes/save-canvas.php", false);
	}

	setUser(user) {
		this.user = user;
	}

	makeGradientsY(chart, rules) {
		let top = chart.chartArea.top;
		let bottom = chart.chartArea.bottom;
		let grdBorder = chart.ctx.createLinearGradient(0, top, 0, bottom);
		let grdBackground = chart.ctx.createLinearGradient(0, top, 0, bottom);
		let vTop = chart.scales["y-axis-0"].ticksAsNumbers[0];
		let vBottom = chart.scales["y-axis-0"].ticksAsNumbers[chart.scales["y-axis-0"].ticksAsNumbers.length - 1];
		let ranges = [];
		for (let i = 0; i < rules.length; i++) {
			let rule = rules[i];
			if (rule.type != "nbt") {
				let range = {};
				range.color = rule.color;
				if (rule.type == "ab") {
					range.start = rule.v1;
					range.stop = vTop;
				}
				else if (rule.type == "be") {
					range.start = vBottom;
					range.stop = rule.v1;
				}
				else if (rule.type == "bt") {
					range.start = rule.v1;
					range.stop = rule.v2;
				}
				if (range.start < range.stop) {
					ranges.push(range);
				}
			}
			else {
				let range1 = {};
				let range2 = {};
				range1.color = rule.color;
				range2.color = rule.color;
				range1.start = vBottom;
				range1.stop = rule.v1;
				range2.start = rule.v2;
				range2.stop = vTop;
				if (range1.start < range1.stop) {
					ranges.push(range1);
				}
				if (range2.start < range2.stop) {
					ranges.push(range2);
				}
			}
		}
		for (let i = 0; i < ranges.length; i++) {
			let iRange = ranges[i];
			if (iRange.start < vBottom) {iRange.start = vBottom;}
			if (iRange.stop > vTop) {iRange.stop = vtop;}
			if (iRange.start >= iRange.stop) {
				ranges.splice(i, 1);
				i--;
				continue;
			}
			for (let n = i + 1; n < ranges.length; n++) {
				let nRange = ranges[n];
				if ((iRange.start >= nRange.stop) || (iRange.stop <= nRange.start)) {
					// Case 5 || Case 6
					continue;
				}
				if (iRange.start < nRange.start) {
					// Case 1 || 3
					if (iRange.stop < nRange.stop) {
						// Case 1
						nRange.start = iRange.stop;
					}
					else {
						// Case 3
						ranges.splice(n, 1);
						n--;
					}
				}
				else {
					// Case 2 || 4
					if (iRange.stop < nRange.stop) {
						// Case 4
						let range1 = {"start": nRange.start, "stop": iRange.start, "color": nRange.color};
						let range2 = {"start": iRange.stop, "stop": nRange.stop, "color": nRange.color};
						ranges.splice(n, 1, range1, range2);
						n++;
					}
					else {
						// Case 2
						nRange.stop = iRange.start;
					}
				}
			}
		}
		if (ranges.length == 0) {
			return {"border": this.defaultBorderColor, "background": this.defaultBackgroundColor};
		}
		ranges.sort(function(a,b) {return a.start - b.start;});
		if (ranges[0].start != vBottom) {
			let range = {"start": vBottom, "stop": ranges[0].start, "color": this.defaultBorderColor};
			ranges.splice(0, 0, range);
		}
		for (let i = 0; i < ranges.length - 1; i++) {
			if (ranges[i].stop != ranges[i + 1].start) {
				let range = {"start": ranges[i].stop, "stop": ranges[i + 1].start, "color": this.defaultBorderColor};
				ranges.splice(i + 1, 0, range);
			}
		}
		if (ranges[ranges.length - 1].stop != vTop) {
			let range = {"start": ranges[ranges.length - 1].stop, "stop": vTop, "color": this.defaultBorderColor};
			ranges.push(range);
		}
		console.log(rules[0].param + ": ");
		console.log(ranges);
		for (let i = 0; i < ranges.length; i++) {
			let range = ranges[i];
			let p0 = 1 - range.start / (vTop - vBottom);
			let p1 = 1 - range.stop / (vTop - vBottom);
			let gap = p1 - p0;
			p0 += gap * 0.05;
			p1 -= gap * 0.05;
			let rgb = colorToRgbComponents(range.color);
			let colorBorder = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1.0)';
			let colorBackground = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.6)';
			grdBorder.addColorStop(p0, colorBorder);
			grdBackground.addColorStop(p0, colorBackground);
			grdBorder.addColorStop(p1, colorBorder);
			grdBackground.addColorStop(p1, colorBackground);
		}
		return {"border": grdBorder, "background": grdBackground};
	}

	makeGradientsX(chart, rules) {
		let left = chart.chartArea.left;
		let right = chart.chartArea.right;
		let grdBorder = chart.ctx.createLinearGradient(left, 0, right, 0);
		let grdBackground = chart.ctx.createLinearGradient(left, 0, right, 0);
		let data = chart.data.datasets[0].data;
		let metadata = chart.getDatasetMeta(0).data;
		let points = [];
		let pointColors = [];
		for (let i = 0; i < data.length; i++) {
			let point = {};
			point.value = parseFloat(data[i].y);
			point.posX = metadata[i]._model.x;
			point.posY = metadata[i]._model.y
			let flag = false;
			for (let n = 0; n < rules.length; n++) {
				let rule = rules[n];
				if (rule.testValue(point.value)) {
					flag = true;
					point.color = rule.color;
					break;
				}
			}
			if (flag == false) {
				point.color = this.defaultBorderColor;
			}
			points.push(point);
		}
		for (let i = 0; i < points.length; i++) {
			let point = points[i];
			let rgb = colorToRgbComponents(point.color);
			let colorBorder = 'rgba(' + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1.0)";
			let colorBackground = 'rgba(' + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.6)";
			pointColors.push(colorBorder);
			let p0;
			let p1;
			if (i == 0) {
				p0 = 0;
			}
			else {
				let x0 = (points[i - 1].posX + point.posX) / 2;
				p0 = (x0 - left) / (right - left);
			}
			if (i == points.length - 1) {
				p1 = 1;
			}
			else {
				let x1 = (point.posX + points[i + 1].posX) / 2;
				p1 = (x1 - left) / (right - left);
			}
			let gap = p1 - p0;
			if (i != 0) {
				p0 += 0.05 * gap;
			}
			if (i != points.length - 1) {
				p1 -= 0.05 * gap;
			}
			grdBorder.addColorStop(p0, colorBorder);
			grdBackground.addColorStop(p0, colorBackground);
			grdBorder.addColorStop(p1, colorBorder);
			grdBackground.addColorStop(p1, colorBackground);
		}
		chart.data.datasets[0].pointBorderColor = pointColors;
		chart.data.datasets[0].pointBackgroundColor = pointColors;
		return {"border": grdBorder, "background": grdBackground};
		/* let rgb0 = colorToRgbComponents(points[0].color);
		let colorBorder0 = 'rgba(' + rgb0.r + ", " + rgb0.g + ", " + rgb0.b + ", 1.0)";
		let colorBackground0 = 'rgba(' + rgb0.r + ", " + rgb0.g + ", " + rgb0.b + ", 0.6)";
		let rgb1 = colorToRgbComponents(points[points.length - 1].color);
		let colorBorder1 = 'rgba(' + rgb1.r + ", " + rgb1.g + ", " + rgb1.b + ", 1.0)";
		let colorBackground1 = 'rgba(' + rgb1.r + ", " + rgb1.g + ", " + rgb1.b + ", 0.6)";
		grdBorder.addColorStop(0, colorBorder0);
		grdBackground.addColorStop(0, colorBackground0); */

	}

	makeGradientsBOBW(chart, rules) {
		let left = chart.chartArea.left;
		let right = chart.chartArea.right;
		let grdBorder = chart.ctx.createLinearGradient(left, 0, right, 0);
		let grdBackground = chart.ctx.createLinearGradient(left, 0, right, 0);
		let grds = {border: grdBorder, background: grdBackground};
		let data = chart.data.datasets[0].data;
		let metadata = chart.getDatasetMeta(0).data;
		let vTop = chart.scales["y-axis-0"].ticksAsNumbers[0];
		let vBottom = chart.scales["y-axis-0"].ticksAsNumbers[chart.scales["y-axis-0"].ticksAsNumbers.length - 1];
		let ranges = [];
		let points = [];
		let pointColors = [];
		for (let i = 0; i < rules.length; i++) {
			let rule = rules[i];
			if (rule.type != "nbt") {
				let range = {};
				range.color = rule.color;
				if (rule.type == "ab") {
					range.start = rule.v1;
					range.stop = vTop;
				}
				else if (rule.type == "be") {
					range.start = vBottom;
					range.stop = rule.v1;
				}
				else if (rule.type == "bt") {
					range.start = rule.v1;
					range.stop = rule.v2;
				}
				if (range.start < range.stop) {
					ranges.push(range);
				}
			}
			else {
				let range1 = {};
				let range2 = {};
				range1.color = rule.color;
				range2.color = rule.color;
				range1.start = vBottom;
				range1.stop = rule.v1;
				range2.start = rule.v2;
				range2.stop = vTop;
				if (range1.start < range1.stop) {
					ranges.push(range1);
				}
				if (range2.start < range2.stop) {
					ranges.push(range2);
				}
			}
		}
		for (let i = 0; i < ranges.length; i++) {
			let iRange = ranges[i];
			if (iRange.start < vBottom) {iRange.start = vBottom;}
			if (iRange.stop > vTop) {iRange.stop = vtop;}
			if (iRange.start >= iRange.stop) {
				ranges.splice(i, 1);
				i--;
				continue;
			}
			for (let n = i + 1; n < ranges.length; n++) {
				let nRange = ranges[n];
				if ((iRange.start >= nRange.stop) || (iRange.stop <= nRange.start)) {
					continue;
				}
				if (iRange.start < nRange.start) {
					if (iRange.stop < nRange.stop) {
						nRange.start = iRange.stop;
					}
					else {
						ranges.splice(n, 1);
						n--;
					}
				}
				else {
					if (iRange.stop < nRange.stop) {
						let range1 = {"start": nRange.start, "stop": iRange.start, "color": nRange.color};
						let range2 = {"start": iRange.stop, "stop": nRange.stop, "color": nRange.color};
						ranges.splice(n, 1, range1, range2);
						n++;
					}
					else {
						nRange.stop = iRange.start;
					}
				}
			}
		}
		if (ranges.length == 0) {
			return {"border": this.defaultBorderColor, "background": this.defaultBackgroundColor};
		}
		ranges.sort(function(a,b) {return a.start - b.start;});
		if (ranges[0].start != vBottom) {
			let range = {"start": vBottom, "stop": ranges[0].start, "color": this.defaultBorderColor};
			ranges.splice(0, 0, range);
		}
		for (let i = 0; i < ranges.length - 1; i++) {
			if (ranges[i].stop != ranges[i + 1].start) {
				let range = {"start": ranges[i].stop, "stop": ranges[i + 1].start, "color": this.defaultBorderColor};
				ranges.splice(i + 1, 0, range);
			}
		}
		if (ranges[ranges.length - 1].stop != vTop) {
			let range = {"start": ranges[ranges.length - 1].stop, "stop": vTop, "color": this.defaultBorderColor};
			ranges.push(range);
		}
		if (ranges.length == 0) {
			let rgb = colorToRgbComponents(ranges[0].color);
			let borderColor = 'rgba(' + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1.0)";
			let backgroundColor = 'rgba(' + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.6)";
			return {border: borderColor, background: backgroundColor};
		}
		for (let i = 0; i < data.length; i++) {
			let point = {};
			point.value = parseFloat(data[i].y);
			point.posX = metadata[i]._model.x;
			let flag = false;
			for (let n = 0; n < rules.length; n++) {
				let rule = rules[n];
				if (rule.testValue(point.value)) {
					flag = true;
					point.color = rule.color;
					break;
				}
			}
			if (flag == false) {
				point.color = this.defaultBorderColor;
			}
			pointColors.push(point.color);
			points.push(point);
		}
		for (let i = 0; i < points.length; i++) {
			let point = points[i];
			if (i == 0) {
				this.gradientsAddColorStop(grds, 0, point.color);
			}
			if (i == points.length - 1) {
				this.gradientsAddColorStop(grds, 1, point.color);
			}
			else {
				let nextPoint = points[i+1];
				let a = (nextPoint.value - point.value) / (nextPoint.posX - point.posX);
				let relevantRanges = [];
				for (let n = 0; n < ranges.length; n++) {
					let range = ranges[n];
					if (!((range.stop < Math.min(point.value, nextPoint.value)) || (range.start > Math.max(nextPoint.value, point.value)))) {
						relevantRanges.push(range);
						if (a >= 0) {
							if (range.start > Math.min(point.value, nextPoint.value)) {
								let y0 = range.start;
								// y0 = point.value + a * x0 - a * point.posX
								// x0 = (y0 + a * point.posX - point.value) / a
								let x0 = point.posX + (y0 - point.value) / a;
								let p0 = (x0 - left) / (right - left);
								this.gradientsAddColorStop(grds, p0, range.color);
							}
							if (range.stop < Math.max(point.value, nextPoint.value)) {
								let y0 = range.stop;
								let x0 = point.posX + (y0 - point.value) / a;
								let p0 = (x0 - left) / (right - left);
								this.gradientsAddColorStop(grds, p0, range.color);
							}
						}
					}
				}
				if (a < 0) {
					for (let n = relevantRanges.length - 1; n >= 0; n--) {
						let range = relevantRanges[n];
						if (range.start > Math.min(point.value, nextPoint.value)) {
							let y0 = range.start;
							let x0 = point.posX + (y0 - point.value) / a;
							let p0 = (x0 - left) / (right - left);
							this.gradientsAddColorStop(grds, p0, range.color);
						}
						if (range.stop < Math.max(point.value, nextPoint.value)) {
							let y0 = range.stop;
							let x0 = point.posX + (y0 - point.value) / a;
							let p0 = (x0 - left) / (right - left);
							this.gradientsAddColorStop(grds, p0, range.color);
						}
					}
				}
			}
		}
		chart.data.datasets[0].pointBorderColor = pointColors;
		chart.data.datasets[0].pointBackgroundColor = pointColors;
		return grds;
	}

	gradientsAddColorStop(grds, p, color) {
		let rgb = colorToRgbComponents(color);
		let borderColor = 'rgba(' + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1.0)";
		let backgroundColor = 'rgba(' + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.6)";
		grds.border.addColorStop(p, borderColor);
		grds.background.addColorStop(p, backgroundColor);
	}
}

class Rule {
	constructor(bJson, json, param, type, v1, v2, color, doColorCode, doAlert) {
		this.html = false;
		this.ALLOWED_PARAMS = {"temp": "Temperatur", "turb": "Turbiditet", "ph": "PH", "conc": "Konduktivitet"};
		this.ALLOWED_TYPES = {"ab": "over", "be": "under", "bt": "mellom", "nbt": "ikke mellom"};
		if (bJson) {
			this.JSON_modify(json);
		}
		else {
			this.modify(param, type, v1, v2, color, doColorCode, doAlert);
		}
	}

	modify(param, type, v1, v2, color, doColorCode, doAlert) {
		this.param = ((typeof param == undefined) || (param == "") || (param == null) ? "temp" : param);
		this.type = ((typeof type == undefined) || (type == "") || (type == null) ? "ab" : type);
		this.v1 = ((typeof v1 == undefined) || isNaN(v1) ? "" : parseFloat(v1));
		this.v2 = ((typeof v2 == undefined) || isNaN(v2) ? "" : parseFloat(v2));
		this.color = ((typeof color == undefined) || (color == "") || (color == null) ? "#ff0000" : color);
		this.doColorCode = ((typeof doColorCode == undefined) || (doColorCode == "") || (doColorCode == null) ? false : doColorCode);
		this.doAlert = ((typeof doAlert == undefined) || (doAlert == "") || (doAlert == null) ? false : doAlert);

		this.HTML_update();
	}

	JSON_modify(json) {
		let j = JSON.parse(json);
		this.modify(j.param, j.type, j.v1, j.v2, j.color, j.doColorCode, j.doAlert);
	}
	
	HTML_modify() {
		if (this.html == false) {
			console.log("No html to modify from.");
			return;
		}
		let param = this.slcParam.value;
		let type = this.slcType.value;
		let v1 = parseFloat(this.slcV1.value);
		let v2 = parseFloat(this.slcV2.value);
		let color = this.slcColor.value;
		let doColorCode = this.slcDoColorCode.checked;
		let doAlert = this.slcAlert.checked;
		this.modify(param, type, v1, v2, color, doColorCode, doAlert);
		return;
	}
	
	HTML_create() {
		if (this.html != false) {
			return this.HTML_update();
		}
		this.html = document.createElement("DIV");
		this.html.className = "rule-div";
		let p = document.createElement("P");

		p.innerHTML = "Når ";

		this.slcParam = document.createElement("SELECT");
		for (let key in this.ALLOWED_PARAMS) {
			let op = document.createElement("OPTION");
			op.value = key;
			op.innerHTML = this.ALLOWED_PARAMS[key];
			this.slcParam.appendChild(op);
		}
		this.slcParam.value = this.param;
		p.appendChild(this.slcParam);

		p.insertAdjacentHTML('beforeend', " er ");
		
		this.slcType = document.createElement("SELECT");
		for (let key in this.ALLOWED_TYPES) {
			let op = document.createElement("OPTION");
			op.value = key;
			op.innerHTML = this.ALLOWED_TYPES[key];
			this.slcType.appendChild(op);
		}
		this.slcType.value = this.type;
		p.appendChild(this.slcType);

		p.insertAdjacentHTML('beforeend', ' ');

		this.slcV1 = document.createElement("INPUT");
		this.slcV1.type = "number";
		this.slcV1.value = this.v1;
		p.appendChild(this.slcV1);

		this.spnV2 = document.createElement("SPAN");
		this.spnV2.innerHTML = " og ";
		this.slcV2 = document.createElement("INPUT");
		this.slcV2.type = "number";
		this.slcV2.value = (isNaN(this.v2) ? "" : parseFloat(this.v2));
		this.spnV2.appendChild(this.slcV2);
		p.appendChild(this.spnV2);

		this.html.appendChild(p);
		p = document.createElement("P");

		p.innerHTML = "&rarr; Benytt fargekoding ";

		this.slcDoColorCode = document.createElement("INPUT");
		this.slcDoColorCode.type = "checkbox";
		this.slcDoColorCode.checked = this.doColorCode;
		p.appendChild(this.slcDoColorCode);

		this.spnColor = document.createElement("SPAN");
		this.spnColor.innerHTML = " Velg Farge: ";
		this.slcColor = document.createElement("INPUT");
		this.slcColor.type = "color";
		this.slcColor.value = this.color;
		this.spnColor.appendChild(this.slcColor);
		p.appendChild(this.spnColor);

		this.html.appendChild(p);
		p = document.createElement("P");

		p.innerHTML = "&rarr; Varsling på E-mail "

		this.slcAlert = document.createElement("INPUT");
		this.slcAlert.type = "checkbox";
		this.slcAlert.checked = this.doAlert;
		p.appendChild(this.slcAlert);

		this.html.appendChild(p);
		this.HTML_showVs();
		this.html.addEventListener('change', this.HTML_onchange.bind(null, this));
		return this.html;
	}

	HTML_onchange(obj) {
		obj.HTML_modify();
	}

	HTML_update() {
		if (this.html == false) {
			return;
		}
		this.slcParam.value = this.param;
		this.slcType.value = this.type;
		this.slcV1.value = this.v1;
		this.slcV2.value = this.v2;
		this.slcColor.value = this.color;
		this.slcDoColorCode.checked = this.doColorCode;
		this.slcAlert.checked = this.doAlert;

		this.HTML_showVs();
		return this.html;
	}

	HTML_showVs() {
		if (this.html == false) {
			return;
		}
		switch (this.slcType.value) {
			case "ab":
			case "be":
				this.spnV2.style.display = "none";
				break;
			case "bt":
			case "nbt":
				this.spnV2.style.display = "initial";
				break;
			default:
				console.log("Invalid rule type.")
				break;
		}
		this.spnColor.style.display = (this.slcDoColorCode.checked ? "initial" : "none");
		return;
	}
	
	verify() {
		if (!(["temp", "turb", "ph", "conc"].includes(this.param))) {
			return false;
		}
		if (!(["ab", "be", "bt", "nbt"].includes(this.type))) {
			return false;
		}
		if (isNaN(this.v1)) {
			return false;
		}
		if ((["bt", "nbt"].includes(this.type)) && ((isNaN(this.v2)) || (this.v2 < this.v1))) {
			return false;
		}
		return true;
	}
		

	testValue(value) {
		switch(this.type) {
			case "ab":
				if (parseFloat(value) > parseFloat(this.v1)) {
					return true;
				}
				else {
					return false;
				}
			case "be":
				if (parseFloat(value) < parseFloat(this.v1)) {
					return true;
				}
				else {
					return false;
				}
			case "bt":
				if ((parseFloat(value) >= parseFloat(this.v1)) && (parseFloat(value) <= parseFloat(this.v2))) {
					return true;
				}
				else {
					return false;
				}
			case "nbt":
				if (!((parseFloat(value) >= parseFloat(this.v1)) && (parseFloat(value) <= parseFloat(this.v2)))) {
					return true;
				}
				else {
					return false;
				}
			default:
				console.log("Invalid rule type.");
				return false;
		}
	}

	stringify() {
		this.HTML_modify();
		let j = {};
		j.param = this.param;
		j.type = this.type;
		j.v1 = this.v1;
		j.v2 = this.v2;
		j.color = this.color;
		j.doColorCode = this.doColorCode;
		j.doAlert = this.doAlert;
		return JSON.stringify(j);
	}

	minmax() {
		if (["bt", "nbt"].includes(this.type)) {
			// console.log("minmax");
			let min = Math.min(this.v1, this.v2);
			let max = Math.max(this.v1, this.v2);
			this.v1 = min;
			this.v2 = max;
		}
	}
}

class User {
	constructor(handler_url, save_url, cbWhenLoaded=false) {
		this.handler_url = handler_url;
		this.save_url = save_url;
		this.html = false;
		this.logged_in = false;
		this.uid;
		this.email;
		this.fname;
		this.sname;
		this.rules = [];
		this.rulesByParam = {};
		this.requestUserInfo(this);
		this.cbWhenLoaded = cbWhenLoaded;
	}

	requestUserInfo(obj) {
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let rt = xhttp.responseText;
				let jsonArray = JSON.parse(rt);
				if (jsonArray.er != "false") {
					console.log("AJAX Request failed");
					console.log(jsonArray.er);
				}
				else {
					let ui = JSON.parse(jsonArray["json"]);
					obj.uid = ui["uid"];
					obj.email = ui["email"];
					obj.fname = ui["fname"];
					obj.sname = ui["sname"];

					if (jsonArray["bRules"] == "true") {
						obj.jsonUI = ui;
	
						let jr = JSON.parse(ui["rules"])["r"];
						for (let i = 0; i < jr.length; i++) {
							let rule = new Rule(true, jr[i]);
							obj.rules.push(rule);
							if (!(rule.param in obj.rulesByParam)) {
								obj.rulesByParam[rule.param] = [];
							}
							obj.rulesByParam[rule.param].push(rule);
						}
					}
					obj.logged_in = true;
					if (obj.cbWhenLoaded != false) {
						obj.cbWhenLoaded();
					}
				}
				return;
			}
		}
		xhttp.open("POST", this.handler_url, true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send();
		return;
	}

	HTML_create() {
		if (!this.logged_in) {
			this.html = document.createElement("DIV");
			return this.html;
		}
		if (this.html != false) {
			this.html.innerHTML = "";
		}
		else {
			this.html = document.createElement("DIV");
		}

		for (let i = 0; i < this.rules.length; i++) {
			let d = document.createElement("DIV");
			d.className = "rule-container";
			/* d.insertAdjacentHTML("beforeend", "&uarr;");
			d.insertAdjacentHTML("beforeend", "X");
			d.insertAdjacentHTML("beforeend", "&darr;"); */

			let panel = document.createElement("DIV");
			panel.className = "rule-panel";

			let up = document.createElement("DIV");
			up.className = "rule-panel-box";
			let ub = document.createElement("BUTTON");
			ub.innerHTML = "&uarr;";
			ub.addEventListener('click', this.btn_moveRule.bind(null, this, i, "up"));
			up.appendChild(ub)
			if (i == 0) {
				ub.style.visibility = "hidden";
			}
			panel.appendChild(up);

			let delp = document.createElement("DIV");
			delp.className = "rule-panel-box";
			let delb = document.createElement("BUTTON");
			delb.innerHTML = "&#10006;";
			delb.addEventListener('click', this.btn_delRule.bind(null, this, i));
			delp.appendChild(delb);
			panel.appendChild(delp);

			let dp = document.createElement("DIV");
			dp.className = "rule-panel-box";
			let db = document.createElement("BUTTON");
			db.innerHTML = "&darr;";
			db.addEventListener('click', this.btn_moveRule.bind(null, this, i, "down"));
			dp.appendChild(db);
			if (i == this.rules.length - 1) {
				db.style.visibility = "hidden";
			}
			panel.append(dp);

			d.appendChild(panel);

			let rd = this.rules[i].HTML_create();
			// rd.style.display = "inline-block";
			d.appendChild(rd);
			this.html.appendChild(d);
		}

		let btndiv = document.createElement("DIV");
		btndiv.className = "rule-button-container";

		this.btnAddRule = document.createElement("BUTTON");
		this.btnAddRule.innerHTML = "Ny Regel";
		this.btnAddRule.addEventListener('click', this.btn_addRule.bind(null, this));
		btndiv.appendChild(this.btnAddRule);

		this.btnSaveRules = document.createElement("BUTTON");
		this.btnSaveRules.innerHTML = "Lagre regler";
		this.btnSaveRules.addEventListener('click', this.btn_saveRules.bind(null, this));
		btndiv.appendChild(this.btnSaveRules);
		this.html.appendChild(btndiv);
		return this.html;
	}

	addRule() {
		this.rules.push( new Rule(false) );
		this.HTML_create();
	}

	delRule(index) {
		if (!Number.isInteger(index) || (index < 0) || (index >= this.rules.length)) {
			console.log("Index out of bounds.");
			return;
		}
		this.rules.splice(index, 1);
		this.HTML_create();
	}

	moveRule(index, dir) {
		if (!Number.isInteger(index) || (index < 0) || (index >= this.rules.length)) {
			console.log("Index out of bounds.");
			return;
		}
		if (dir == "up") {
			if (index < 1) {
				console.log("Index out of bounds.");
				return;
			}
			let temp = this.rules.splice(index, 1)[0];
			this.rules.splice(index - 1, 0, temp);
		}
		else if (dir == "down") {
			if (index >= this.rules.length - 1) {
				console.log("Index out of bounds.");
				return;
			}
			let temp = this.rules.splice(index, 1)[0];
			this.rules.splice(index + 1, 0, temp);
		}
		else {
			console.log("Invalid direction");
			return;
		}
		this.HTML_create();
		return;
	}

	btn_addRule(obj) {
		obj.addRule();
	}

	getRulesJson() {
		let out = {"r": []};
		for (let i = 0; i < this.rules.length; i++) {
			out["r"].push(this.rules[i].stringify());
		}
		return JSON.stringify(out);
	}

	saveRules() {
		for (let i = 0; i < this.rules.length; i++) {
			this.rules[i].minmax();
			this.rules[i].HTML_update();
		}

		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log(xhttp.responseText);
			}
		}
		xhttp.open("POST", this.save_url, true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send("json=" + this.getRulesJson());
		return;
	}

	btn_saveRules(obj) {
		obj.saveRules();
	}

	btn_delRule(obj, index) {
		obj.delRule(index);
	}

	btn_moveRule(obj, index, dir) {
		obj.moveRule(index, dir);
	}
}