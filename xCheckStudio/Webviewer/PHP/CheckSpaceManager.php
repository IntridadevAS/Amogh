<?php
require_once 'Utility.php';
require_once 'UserManagerUtility.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction) {
        case "CreateCheckSpace":
            CreateCheckSpace();
            break;
        case "CopyCheckSpace":
            CopyCheckSpace();
            break;
        case "GetCheckSpaces":
            GetCheckSpaces();
            break;
        case "UpdateCheckspace":
            UpdateCheckspace();
            break;
        case "DeleteCheckSpace":
            DeleteCheckSpace();
            break;
        case "SetCheckAsFavourite":
            SetCheckAsFavourite();
            break;
        case "SetReviewStatus":
            SetReviewStatus();
            break;
        case "CheckoutCheckspace":
            CheckoutCheckspace();
            break;
        case "CheckinCheckspace":
            CheckinCheckspace();
            break;
        default:
            echo "No Function Found!";
    }
}

function CopyCheckSpace()
{
    $result = CopyCheckSpaceToProjDB();
    if ($result["MsgCode"] !== 1) {
        echo json_encode($result);
        return;
    }

    $projectName = $_POST['ProjectName'];
    $source = getCheckDirectoryPath($projectName, $_POST["source"]);
    $dest = getCheckDirectoryPath($projectName, $result["Data"]["checkname"]);
    if (!CopyDirRecursively($source, $dest)) {
        echo json_encode(array("Msg" => "Failed to copy Checkspace dir(s) and file(s).",
            "MsgCode" => 0));
        return;
    }

    // rename the checkspace db
    $DbPath = getCheckDirectoryPath($projectName, $result["Data"]["checkname"]) . "/" . $_POST["source"] . ".db";
    if (file_exists($DbPath)) {
        $newDbPath = getSavedCheckDatabasePath($projectName, $result["Data"]["checkname"]);
        rename($DbPath, $newDbPath);
    }

    echo json_encode($result);
}

function CopyCheckSpaceToProjDB()
{
    $projectName = $_POST['ProjectName'];
    $ProjectId = $_POST['ProjectId'];
    $CheckSpaceInfo = $_POST['CheckSpaceInfo'];
    $obj = json_decode($CheckSpaceInfo, true);

    $name = $obj["name"];
    $status = $obj["status"];
    $config = $obj["config"];
    $description = $obj["description"];
    $comments = $obj["comments"];
    $isFav = $obj["isFav"];
    $date = $obj["date"];
    $projId = $obj["projId"];
    $userId = $obj["userId"];
    $review = $obj["review"];

    if (CheckIfCheckSpaceExists($projectName, $ProjectId, $name)) {
        return array("Msg" => "Checkspace '$name' already exists.",
            "MsgCode" => 0);
    }

    try
    {
        $dbPath = getProjectDatabasePath($projectName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        $query = 'INSERT INTO CheckSpace (checkname,
                                        checkstatus,
                                        checkconfiguration,
                                        checkdescription,
                                        checkcomments,
                                        checkisfavourite,
                                        checkdate,
                                        projectid,
                                        userid,
                                        review,
                                        locked,
                                        lockedBy) 
                                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';

        $stmt = $dbh->prepare($query);
        $stmt->execute(array(
            $name,
            $status,
            $config,
            $description,
            $comments,
            $isFav,
            $date,
            $projId,
            $userId,
            $review,
            0,
            NULL
        ));

        $array = array("checkid" => $dbh->lastInsertId(),
            "checkname" => $name,
            "checkstatus" => $status,
            "checkconfiguration" => $config,
            "checkdescription" => $description,
            "checkcomments" => $comments,
            "favoriteCheck" => $isFav,
            "checkdate" => $date,
            "projectid" => $projId,
            "userid" => $userId,
            "review" => $review,
            "locked" => 0,
            "lockedBy" => NULL);

        $dbh = null; //This is how you close a PDO connection
        return array("Msg" => "Success",
            "Data" => $array,
            "MsgCode" => 1);
    } catch (Exception $e) {
    }

    return array("Msg" => "Failed to create to Checkspace.",
        "MsgCode" => 0);
}

function CreateCheckSpace()
{
    // get project name
    $UserId = trim($_POST["userid"], " ");
    $projectName = $_POST['ProjectName'];
    $ProjectId = $_POST['ProjectId'];
    $CheckSpaceInfo = $_POST['CheckSpaceInfo'];
    $obj = json_decode($CheckSpaceInfo, true);

    $CheckName = $obj['checkName'];
    $CheckStatus = $obj['status'];
    $CheckConfiguration = $obj['config'];
    $CheckDescription = $obj['checkDescription'];
    $CheckComments = $obj['checkComments'];
    $CheckIsFavourite = $obj['favoriteCheck'];
    $CheckCreateDate = $obj['checkdate'];
    $review = $obj['review'];

    $returnData  = array();
    if (CheckIfCheckSpaceExists($projectName, $ProjectId, $CheckName) == false) {
        try
        {
            $dbPath = getProjectDatabasePath($projectName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");
            if (CreateCheckSpaceSchemaIfNot($dbh) == true) {
                $query = 'INSERT INTO CheckSpace (
                    checkname,
                    checkstatus,
                    checkconfiguration,
                    checkdescription,
                    checkcomments,
                    checkisfavourite,
                    checkdate,
                    projectid, 
                    userid, 
                    review,
                    locked,
                    lockedBy) 
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
                $stmt = $dbh->prepare($query);
                $stmt->execute(array(
                    $CheckName,
                    $CheckStatus,
                    $CheckConfiguration,
                    $CheckDescription,
                    $CheckComments,
                    $CheckIsFavourite,
                    $CheckCreateDate,
                    $ProjectId,
                    $UserId,
                    $review,
                    0,
                    NULL
                ));
                $returnData = array(
                    "checkid" => $dbh->lastInsertId(),
                    "checkname" => $CheckName,
                    "checkstatus" => $CheckStatus,
                    "checkconfiguration" => $CheckConfiguration,
                    "checkdescription" => $CheckDescription,
                    "checkcomments" => $CheckComments,
                    "favoriteCheck" => $CheckIsFavourite,
                    "checkdate" => $CheckCreateDate,
                    "projectid" => $ProjectId,
                    "userid" => $UserId,
                    "review" => $review,
                    "locked" => 0,
                    "lockedBy" => NULL
                );
                // echo json_encode($array);

                $dbh = null; //This is how you close a PDO connection
                mkdir(getCheckDirectoryPath($projectName, $CheckName), 0777, true);
                mkdir(getCheckSourceAPath($projectName, $CheckName), 0777, true);
                mkdir(getCheckSourceBPath($projectName, $CheckName), 0777, true);
                mkdir(getCheckSourceCPath($projectName, $CheckName), 0777, true);
                mkdir(getCheckSourceDPath($projectName, $CheckName), 0777, true);
                $database = new SQLite3(getCheckDatabasePath($projectName, $CheckName));
            }
        } catch (Exception $e) {
            $returnData = array(
                "checkid" => -1,
            );
            // echo json_encode($array);
            // return;
        }
    } else {
        $returnData = array(
            "checkid" => 0,
        );
        // echo json_encode($array);
        // return;
    }

    echo json_encode($returnData);
}

function CheckIfCheckSpaceExists($projectName, $projectId, $checkName)
{
    $dbh = new PDO("sqlite:" . getProjectDatabasePath($projectName)) or die("cannot open the database");
    $query = "select checkname from CheckSpace where checkname=\"" . $checkName . "\" and projectid=" . $projectId . " COLLATE NOCASE;";
    $count = 0;
    foreach ($dbh->query($query) as $row) {
        $count = $count + 1;
        break;
    }
    $dbh = null;
    if ($count != 0) {
        return true;
    } else {
        return false;
    }
}

function GetCheckSpaces()
{
    // get project name
    $userid = trim($_POST["userid"], " ");
    $projectName = $_POST['ProjectName'];
  
    try
    {
        $dbPath = getProjectDatabasePath($projectName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");
        CreateCheckSpaceSchemaIfNot($dbh);       
        $query = "select * from CheckSpace";
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        $dbh = null;
        return;
    } catch (Exception $e) {
        echo "Fail ";
        return;
    }
}

function GetPublicCheckSpaces()
{
    // get project name
    $userid = trim($_POST["userid"], " ");
    $projectName = $_POST['ProjectName'];
    $ProjectId = trim($_POST["ProjectId"], " ");

    try
    {
        $dbPath = getProjectDatabasePath($projectName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");
        CreateCheckSpaceSchemaIfNot($dbh);
        $query = "select * from CheckSpace where userid=" . $userid;
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        $dbh = null;
        return;
    } catch (Exception $e) {
        echo "Fail ";
        return;
    }
}

function CreateCheckSpaceSchemaIfNot($dbh)
{
    try
    {
        $table_name = 'CheckSpace';
        $test = "SELECT 1 FROM " . $table_name . " LIMIT 1";
        $test = $dbh->query($test); 

        if ($test) {
            return true;
        } else {
            $dbh->beginTransaction();

            $command = "CREATE TABLE 'CheckSpace' (
                checkid	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                checkname	TEXT NOT NULL,
                checkstatus	TEXT NOT NULL,
                checkconfiguration	TEXT,
                checkdescription	TEXT,
                checkcomments	TEXT,
                checkisfavourite	INTEGER,
                checkdate	TEXT NOT NULL,
                projectid	INTEGER NOT NULL,
                userid	INTEGER NOT NULL,
                review INTEGER,
                locked INTEGER,
                lockedBy INTEGER)";
            $dbh->exec($command);
            $dbh->commit();
        }
    } catch (Exception $e) {
        return false;
    }
    return true;
}

function DeleteCheckSpace()
{
    $CheckId = $_POST['CheckId'];
    $ProjectName = trim($_POST["ProjectName"], " ");
    $CheckName = trim($_POST["CheckName"], " ");
    if ($CheckId == "") {
        echo "CheckId Id cannot be empty";
        return;
    }
    try {
        $dbh = new PDO("sqlite:" . getProjectDatabasePath($ProjectName)) or die("cannot open the database");
        $query = "Delete from CheckSpace where checkid='" . $CheckId . "';";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        echo $stmt->rowCount();
        $dbh = null;
        deleteFolder(getCheckDirectoryPath($ProjectName, $CheckName));
        return;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
        return;
    }
}

function SetCheckAsFavourite()
{
    $userid = trim($_POST["userid"], " ");
    $CheckId = trim($_POST["CheckId"], " ");
    $ProjectName = trim($_POST["ProjectName"], " ");
    $favourite = trim($_POST["Favourite"], " ");
    if ($CheckId === -1) {
        echo 'fail';
        return;
    }

    try {
        $dbh = new PDO("sqlite:" . getProjectDatabasePath($ProjectName)) or die("cannot open the database");
        $query = "UPDATE CheckSpace SET checkisfavourite=? WHERE checkid=?";
        $response = $dbh->prepare($query)->execute([$favourite, $CheckId]);
        echo json_encode($response);
        $dbh = null;
    } catch (Exception $e) {
        echo 'fail';
        return;
    }
}

function SetReviewStatus()
{
    $CheckId = trim($_POST["CheckId"], " ");
    $ProjectName = trim($_POST["ProjectName"], " ");
    $review = trim($_POST["Review"], " ");
    if ($CheckId === -1) {
        echo 'fail';
        return;
    }

    try {
        $dbh = new PDO("sqlite:" . getProjectDatabasePath($ProjectName)) or die("cannot open the database");
        $query = "UPDATE CheckSpace SET review=? WHERE checkid=?";
        $response = $dbh->prepare($query)->execute([$review, $CheckId]);
        echo json_encode($response);
        $dbh = null;
    } catch (Exception $e) {
        echo 'fail';
        return;
    }
}

function UpdateCheckspace()
{
    $userid = trim($_POST["userid"], " ");
    $CheckId = trim($_POST["CheckId"], " ");
    $projectName = trim($_POST["projectname"], " ");
    $checkdescription = trim($_POST["checkdescription"], " ");
    $checkstatus = trim($_POST["checkstatus"], " ");
    $checkconfiguration = trim($_POST["checkconfiguration"], " ");
    $checkcomments = trim($_POST["checkcomments"], " ");
    $checkIsFavorite = trim($_POST["checkIsFavorite"], " ");
    try {
        $dbh = new PDO("sqlite:" . getProjectDatabasePath($projectName)) or die("cannot open the database");
        $query = 'UPDATE CheckSpace Set checkstatus=?, checkconfiguration=?, checkdescription=?, checkcomments=? WHERE checkid=?';
        $stmt = $dbh->prepare($query);
        $response = $stmt->execute(array($checkstatus, $checkconfiguration, $checkdescription, $checkcomments, $CheckId));
        echo json_encode($response);
        $dbh = null; //This is how you close a PDO connection
        return;
    } catch (Exception $e) {
        echo "failed";
        return;
    }
}

function CheckoutCheckspace()
{
    if (
        !isset($_POST["projectName"]) ||
        !isset($_POST["checkId"]) ||
        !isset($_POST["userId"])
    )
    {
        echo json_encode(
            array(
                "Msg" => "Invalid Inputs",
                "MsgCode" => 0
            )
        );
        return;
    }

    try
    {
        $projectName = trim($_POST["projectName"], " ");
        $checkId = trim($_POST["checkId"], " ");
        $userId = trim($_POST["userId"], " ");

        $checkedOutBy = IsCheckspaceAlreadyCheckedout(
            $projectName,
            $checkId,
            $userId
        );
        if ($checkedOutBy !== null)
        {
            // get locked by user name
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");

            $stmt = $dbh->query("SELECT * FROM LoginInfo where userid=" . $checkedOutBy);
            $lockedBy = null;
            if ($stmt)
            {
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC))
                {
                    $lockedBy = $row['alias'];
                    break;
                }
            }

            echo json_encode(
                array(
                    "Msg" => "Already Checkout by other user.",
                    "Data" => $lockedBy,
                    "MsgCode" => -1
                )
            );
            return;
        }

        $response = LockUnlockCheckspace(
            $projectName,
            $checkId,
            $userId,
            true
        );

        echo json_encode(            
            array(
                "Msg" => "Success",
                "Data" => $response,
                "MsgCode" => 1
            )
        );
    }
    catch (Exception $e)
    {
        echo json_encode(
            array(
                "Msg" => "Failed",
                "MsgCode" => 0
            )
        );
        return;
    }
}

function CheckinCheckspace()
{
    if (
        !isset($_POST["projectName"]) ||
        !isset($_POST["checkId"])
    )
    {
        echo json_encode(
            array(
                "Msg" => "Invalid Inputs",
                "MsgCode" => 0
            )
        );
        return;
    }

    try
    {
        $projectName = trim($_POST["projectName"], " ");
        $checkId = trim($_POST["checkId"], " ");       

        $response = LockUnlockCheckspace(
            $projectName,
            $checkId,
            NULL,
            false
        );

        echo json_encode(            
            array(
                "Msg" => "Success",
                "Data" => $response,
                "MsgCode" => 1
            )
        );   
    }
    catch (Exception $e)
    {
        echo json_encode(
            array(
                "Msg" => "Failed",
                "MsgCode" => 0
            )
        );
        return;
    }
}

function IsCheckspaceAlreadyCheckedout(
    $projectName,
    $checkId,
    $userId
)
{
    try
    { 
        $dbh = new PDO("sqlite:" . getProjectDatabasePath($projectName)) or die("cannot open the database");

        $selectResults = $dbh->query("SELECT * FROM CheckSpace where checkid=" . $checkId);

        if ($selectResults)
        {
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC))
            {
                if (
                    $row['locked'] === "1" &&
                    $row['lockedBy'] !== $userId
                )
                {
                    return $row['lockedBy'];
                }
                break;
            }
        }
    }
    catch (Exception $e)
    {
        
    }

    return null;
}

function LockUnlockCheckspace(
    $projectName, 
    $checkId, 
    $userId, 
    $lock)
{
    try
    {       
        $dbh = new PDO("sqlite:" . getProjectDatabasePath($projectName)) or die("cannot open the database");
        $query = 'UPDATE CheckSpace Set locked=?, lockedBy=? WHERE checkid=?';
        $stmt = $dbh->prepare($query);

        $response = null;
        if ($lock === true
        )
        {
            $response = $stmt->execute(array(1, $userId, $checkId));
        }
        else
        {
            $response = $stmt->execute(array(0, NULL, $checkId));
        }       
               
        $dbh = null; 
        return $response;
    }
    catch (Exception $e)
    {
        
    }

    return null;
}