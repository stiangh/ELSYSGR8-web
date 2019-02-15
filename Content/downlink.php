<?php
    $gotMsg = false;
    if (isset($_GET["msg"])) {
        $gotMsg = true;
        switch ($_GET["msg"]) {
            case 'incomplete':
                $msg = "<div class='negative'><p>Noe gikk galt. Sjekk at skjemaet er riktig utfylt.</p></div>";
                break;
            case 'success':
                $msg = "<div class='positive'><p>Downlink ble registrert.</p></div>";
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