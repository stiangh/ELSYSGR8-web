<?php
    session_start();
    include_once "dbh.php";

    $dbTableName = "signup_test";

    if (!(isset($_POST["submit"]) && ($_POST["submit"] == "mitsub"))) {
        echo "Not successful.";
    } else {
        $email = mysqli_real_escape_string($conn, $_POST["email"]);
        $pwd = $_POST["pwd"];

        $sql = "SELECT * FROM $dbTableName WHERE email = '$email'";
        $res = mysqli_query($conn, $sql);
        if (mysqli_num_rows($res) == 1) {
            $row = mysqli_fetch_assoc($res);
            if (isset($row["pwd"])) {
                $db_pwd = $row["pwd"];
                if (password_verify($pwd, $db_pwd)) {
                    // LOGIN
                    $user = array("uid"=>$row["id"], "email"=>$row["email"], "fname"=>$row["fname"], "sname"=>$row["sname"]);
                    $_SESSION["user"] = $user;
                    header("Location: ../index.php");
                    // LOGIN
                    echo "Successful login";
                }
                else {
                    echo "Wrong email or password";
                }
            }
            else {
                echo "Something else went wrong";
            }
        }
        else if (mysqli_num_rows($res) == 0) {
            echo "Wrong email or password.";
        }
        else {
            echo "Something went wrong.";
        }
    }
