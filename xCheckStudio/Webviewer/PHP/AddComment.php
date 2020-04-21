<?php
require_once 'Utility.php';

if (
    !isset($_POST['projectName']) ||
    !isset($_POST['checkName']) ||
    !isset($_POST['commentData'])
) {
    echo 'fail';
    return;
}

AddComment();

function AddComment()
{
    $dbh = null;
    try {

        $commentData = $_POST['commentData'];

        // get project name
        $projectName = $_POST['projectName'];
        $checkName = $_POST['checkName'];

        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        $command = 'CREATE TABLE IF NOT EXISTS checkspaceComments(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            comment TEXT     
          )';
        $dbh->exec($command);

        $qry = 'INSERT INTO checkspaceComments(comment) VALUES(?) ';
        $stmt = $dbh->prepare($qry);
        $stmt->execute(array($commentData));

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection  

        echo $commentData;
    } catch (Exception $e) {
        echo "fail";
        return;
    }
}
