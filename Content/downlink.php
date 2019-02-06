<?php
    $gotMsg = false;
    if (isset($_GET["msg"])) {
        $gotMsg = true;
        switch ($_GET["msg"]) {
            case 'incomplete':
                $msg = "<p class='negative'>Noe gikk galt. Sjekk at skjemaet er riktig utfylt.</p>";
                break;
            case 'success':
                $msg = "<p class='positive'>Downlink ble registrert.</p>";
                break;
            default:
                $msg = "";
                break;
        }
    }

    if (isset($_GET["slpt"])) {
        $slpt = intval($_GET["slpt"]);
    } else {
        $slpt = 15;
    }
?>
<script>
    window.onload = oppstart;

    function oppstart() {
        var slpt = parseInt( <?php echo $slpt; ?> ) ;
        document.getElementsByTagName("select")["slpt"].value = slpt;
    }

</script>
<style>
    p.positive {
        display: inline-block;
	    background: hsl(120, 75%, 75%);
		border: 2px solid hsl(120, 100%, 30%);
		border-radius: 8px;
		padding: 4px;
		max-width: 300px;
        text-align: center;
        margin: auto;
	}
	p.negative {
        display: inline-block;
        background: hsl(348, 75%, 75%);
		border: 2px solid hsl(348, 100%, 30%);
		border-radius: 8px;
		padding: 4px;
        max-width: 300px;
        text-align: center;
        margin: auto;
	}
</style>
<form action="Includes/downlink-h.php" method="POST" name="dwnlnk" id="dwnlnk" style="text-align: center;">
    <p style="line-height: 25px;">
        Sleep time: 
        <select name="slpt" style="box-sizing: border-box; height: 25px; width: 140px;">
            <option value=15>15 sekunder</option>
            <option value=30>30 sekunder</option>
            <option value=60>60 sekunder</option>
        </select>
        <button type="submit" form="dwnlnk" name="submit" value="mitsub" style="box-sizing: border-box; height: 25px; width: 80px;">Link Down</button>
    </p>
</form>
<div style="margin: auto; text-align: center;">
<?php if ($gotMsg) { echo $msg; } ?>
</div>