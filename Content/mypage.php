<script>
    window.onload = oppstart;

    function oppstart() {
        aliases = {"temp": "Temperature", "turb": "Turbidity", "ph": "PH", "conc": "Conductivity"};
        let div = document.getElementById("limits");
        for (let key in aliases) {
            let p = document.createElement("P");
            let s = document.createElement("SELECT");
            s.id = key + "_slc";
            let opAb = document.createElement("OPTION");
            opAb.innerHTML = "above";
            opAb.value = ">";
            s.appendChild(opAb);
            let opBt = document.createElement("OPTION");
            opBt.innerHTML = "between";
            opBt.value = "<>";
            s.appendChild(opBt)
            let opNBt = document.createElement("OPTION");
            opNBt.innerHTML = "not between";
            opNBt.value = "!<>";
            s.appendChild(opNBt);
            let opBl = document.createElement("OPTION");
            opBl.innerHTML = "below";
            opBl.value = "<";
            s.appendChild(opBl);

            let v1 = document.createElement("INPUT");
            v1.type = "number";
            v1.id = key + "_v1";

            let SpanV2 = document.createElement("SPAN");
            SpanV2.id = key + "_spnV2";
            let v2 = document.createElement("INPUT");
            v2.type = "number";
            v2.id = key + "_v2";
            SpanV2.innerHTML = " and ";
            SpanV2.appendChild(v2);
            
            p.innerHTML = aliases[key] + " is ";
            p.appendChild(s);
            p.innerHTML += " ";
            p.appendChild(v1);
            p.appendChild(SpanV2);
            p.innerHTML += ".";
            div.appendChild(p);
        }
        let b = document.createElement("BUTTON");
        b.innerHTML = "Save Rules";
        b.addEventListener('click', saveAlert);
        div.appendChild(b);

        let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let rt = xhttp.responseText;
				let jsonArray = JSON.parse(rt);
				if (jsonArray.er == "false") {
                    console.log("Limits set and fetched.");
                    let keys = ["temp", "turb", "ph", "conc"];
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i];
                        let slc = document.getElementById(key + "_slc");
                        let v1 = document.getElementById(key + "_v1");
                        let v2 = document.getElementById(key + "_v2");
                        let lower = jsonArray[key + "_lower"];
                        let upper = jsonArray[key + "_upper"];
                        let nbt = jsonArray[key + "_nbt"];
                        if (lower == -1000) {
                            slc.value = "<";
                            v1.value = parseFloat(upper);
                        }
                        else if (upper == 1000) {
                            slc.value = ">";
                            v1.value = parseFloat(lower);
                        }
                        else {
                            slc.value = (nbt == "true" ? "!<>" : "<>");
                            v1.value = lower;
                            v2.value = upper;
                        }
                        slcOnInput(key);
                    }
                }
                else if (jsonArray.er == "No account") {
                    console.log("Limits not set.");
                }
                else {
                    console.log("loadError: " + jsonArray.er + ".");
                    return;
                }
			}
        }
        xhttp.open("POST", "Includes/mypage-h.php", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send();

        for (let key in aliases) {
            document.getElementById(key + "_slc").addEventListener('change', slcOnInput.bind(null, key));
        }
    }

    function slcOnInput(key) {
        let value = document.getElementById(key + "_slc").value;
        let v2 = document.getElementById(key + "_spnV2");
        v2.style.display = (((value == "<>" ) || (value == "!<>")) ? "initial" : "none");
        return;
    }

    function saveAlert() {
        let out = {};
        for (let key in aliases) {
            out[key] = {"nbt": "false"};
            let val = document.getElementById(key + "_slc").value;
            let v1 = parseFloat(document.getElementById(key + "_v1").value);
            let v2 = parseFloat(document.getElementById(key + "_v2").value);
            if (isNaN(v1)) {
                console.log(key + ": v1 is NaN");
                return;
            }
            else if (val == "<") {
                out[key]["lower"] = -1000;
                out[key]["upper"] = v1;
            }
            else if (val == ">") {
                out[key]["lower"] = v1;
                out[key]["upper"] = 1000;
            }
            else if (isNaN(v2)) {
                console.log(key + ": v2 is NaN");
                return;
            }
            else if (v1 == v2) {
                console.log(key + ": v2 equals v1.");
                return;
            }
            else if (val == "<>") {
                out[key]["lower"] = Math.min(v1, v2);
                out[key]["upper"] = Math.max(v1, v2);
            }
            else if (val == "!<>") {
                out[key]["lower"] = Math.min(v1, v2);
                out[key]["upper"] = Math.max(v1, v2);
                out[key]["nbt"] = "true";
            }
            else {
                console.log(key + ": Invalid select");
                return;
            }
        }
        let json = JSON.stringify(out);
        console.log(json);

        let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
                if (this.responseText != "success") {
                    console.log(this.responseText);
                }
                else {
                    alert("De nye verdiene ble lagret!");
                }
            }
        }
        xhttp.open("POST", "Includes/updateal-h.php", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("auth=mitsub&json=" + json);
    }

</script>
<h1>My Page</h1>
<p>Alert me on email when one of these holds true: </p>
<div id="limits">
</div>