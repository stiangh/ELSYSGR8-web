<script>
    window.onload = setup_myrules;

    function setup_myrules() {
        u = new User("Includes/userinfo-h.php", "Includes/saverules-h.php");
        document.getElementById("div_rules").appendChild(u.HTML_create());
    }

    /* function waitOnInfo(user, counter = 25) {
        if (user.logged_in) {
            document.getElementById("div_rules").appendChild(user.HTML_create());
        }
        else if (counter > 0) {
            console.log("Waiting on info...");
            setTimeout(waitOnInfo.bind(null, user, counter - 1), 200);
        }
    } */

    function newRule() {
        let r = new Rule(false);
        rules.push(r);
        document.getElementById("div_rules").appendChild(r.HTML_create());
    }

</script>
<style>
    .rule-div {
        margin-bottom: 20px;
    }
    input:not([type='checkbox']), select, option {
        box-sizing: border-box;
        height: 25px;
    }
</style>
<div id="div_rules"></div>