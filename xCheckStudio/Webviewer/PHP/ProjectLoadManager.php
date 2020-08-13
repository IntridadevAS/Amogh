<?php
    require_once 'Utility.php';
    require_once 'GlobalConstants.php';
    
    if(!isset($_POST["ProjectName"]) || !isset($_POST['CheckName']))
    {
        echo 'fail';
        return;
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST")
    {
        $InvokeFunction = trim($_POST["InvokeFunction"], " ");
        switch ($InvokeFunction)
        {
            case "InitTempCheckSpaceDB":
                InitTempCheckSpaceDB();
                break;
            case "CreateTempCheckSpaceDBByCopy":
                CreateTempCheckSpaceDBByCopy();
                break;
            case "ReadSavedComparisonCheckData":
                ReadSavedComparisonCheckData();
                break;
            case "ReadComplianceSavedCheckData":
                ReadComplianceSavedCheckData();
                break;
            case "ReadAllSavedDatasets":
                ReadAllSavedDatasets();
                break;
            default:
                echo "No Function Found!";
        }
    }

    function CreateTempCheckSpaceDBByCopy(){
        $projectName = $_POST["ProjectName"];
        $checkName = $_POST['CheckName'];
        try{
            $destinationPath = getCheckDatabasePath($projectName, $checkName);
            $sourcePath = getSavedCheckDatabasePath($projectName, $checkName);
            if (CopyFile($sourcePath, $destinationPath) === true){
                echo "success"; 
                return;
            }
            else{
                echo 'Fail';
                return;
            }
            
        }
        catch(Exception $e){
            echo 'Fail';
            return;
        }
    }

    function InitTempCheckSpaceDB()
    {
        if(!isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName']) ||
        !isset($_POST['Context']))
        {
            echo json_encode(array("Msg" =>  "Invalid input.",
            "MsgCode" => 0));  
            return;
        }

        // get project name       
        $projectName = $_POST["ProjectName"];
        $checkName = $_POST['CheckName'];

        $results;
        try
        {
            // project DB
            $dbPath = getSavedCheckDatabasePath($projectName, $checkName);    
            if(!file_exists ($dbPath ))
            { 
                echo json_encode(array("Msg" =>  "Saved data not found",
                "MsgCode" => 0));  

                // create temp checkspace db
                $tempDBPath = getCheckDatabasePath($projectName, $checkName);
                if(!file_exists ($tempDBPath ))
                { 
                    $database = new SQLite3($tempDBPath);
                } 
                return;
            }       

            // create temp checkspace db
            $tempDBPath = getCheckDatabasePath($projectName, $checkName);
            if(file_exists ($tempDBPath ))
            { 
                unlink($tempDBPath);
            }   
            $database = new SQLite3($tempDBPath);                      
            
            // open database                        
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 
            $tempDbh = new PDO("sqlite:$tempDBPath") or die("cannot open the database");

            // begin the transaction
            $dbh->beginTransaction();
            $tempDbh->beginTransaction();            
          
            // copy data tables to temp DB
            // comparison result tables table                               
            CopyComponents( $dbh, $tempDbh, "SourceAComponents", "SourceAProperties");          
            CopyComponents( $dbh, $tempDbh, "SourceBComponents", "SourceBProperties");
            CopyComponents( $dbh, $tempDbh, "SourceCComponents", "SourceCProperties");          
            CopyComponents( $dbh, $tempDbh, "SourceDComponents", "SourceDProperties");

            // save check case info 
            CopyCheckCaseInfo($dbh, $tempDbh);

            CopyCheckModuleControlsStateToCheckSpaceDB($dbh, $tempDbh);
            CopyDataSourceInfoToCheckSpaceDB($dbh, $tempDbh);              

            CopyVieweroptions($dbh, $tempDbh, "SourceAViewerOptions");
            CopyVieweroptions($dbh, $tempDbh, "SourceBViewerOptions");
            CopyVieweroptions($dbh, $tempDbh, "SourceCViewerOptions");
            CopyVieweroptions($dbh, $tempDbh, "SourceDViewerOptions");

            CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceASelectedComponents");
            CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceBSelectedComponents");
            CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceCSelectedComponents");
            CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceDSelectedComponents");

            CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceANotSelectedComponents");
            CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceBNotSelectedComponents");
            CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceCNotSelectedComponents");
            CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceDNotSelectedComponents");

            // comparison result tables table                               
            CopyComparisonCheckGroups( $dbh, $tempDbh);                 
            CopyComparisonCheckComponents( $dbh, $tempDbh);
            CopyComparisonCheckProperties( $dbh, $tempDbh);
            CopyNotMatchedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceANotMatchedComponents");
            CopyNotMatchedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceBNotMatchedComponents");
            CopyNotMatchedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceCNotMatchedComponents");
            CopyNotMatchedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceDNotMatchedComponents");

            // source a compliance result tables table     
            CopySourceAComplianceCheckGroups($dbh, $tempDbh);
            CopySourceAComplianceCheckComponents($dbh, $tempDbh);
            CopySourceAComplianceCheckProperties($dbh, $tempDbh);

            // source b compliance result tables table          
            CopySourceBComplianceCheckGroups($dbh, $tempDbh);
            CopySourceBComplianceCheckComponents($dbh, $tempDbh);
            CopySourceBComplianceCheckProperties($dbh, $tempDbh);  
            
            // source C compliance result tables table          
            CopySourceCComplianceCheckGroups($dbh, $tempDbh);
            CopySourceCComplianceCheckComponents($dbh, $tempDbh);
            CopySourceCComplianceCheckProperties($dbh, $tempDbh);  

            // source d compliance result tables table          
            CopySourceDComplianceCheckGroups($dbh, $tempDbh);
            CopySourceDComplianceCheckComponents($dbh, $tempDbh);
            CopySourceDComplianceCheckProperties($dbh, $tempDbh); 

            // save check result statistics
            CopyCheckStatistics($dbh, $tempDbh);

            // save refrences
            CopyCheckReferences($dbh, $tempDbh, "a_References");
            CopyCheckReferences($dbh, $tempDbh, "b_References");
            CopyCheckReferences($dbh, $tempDbh, "c_References");
            CopyCheckReferences($dbh, $tempDbh, "d_References");            
            
            // copy hidden components
            CopyHiddenComponents($dbh, $tempDbh);
            
            // copy versions
            CopyVersions($dbh, $tempDbh);

            // copy revisions
            CopyRevisions($dbh, $tempDbh);

            // copy checkspace comments
            CopyCheckspaceComments($dbh, $tempDbh);

            // copy all components
            CopyAllComponents($dbh, $tempDbh, "AllComponentsa");
            CopyAllComponents($dbh, $tempDbh, "AllComponentsb");
            CopyAllComponents($dbh, $tempDbh, "AllComponentsc");
            CopyAllComponents($dbh, $tempDbh, "AllComponentsd");

            // copy group templates
            CopyPropertyGroups($dbh, $tempDbh);
            CopyPropertyHighlightGroups($dbh, $tempDbh);

            // copy data change highlight templates
            CopyDataChangeHighlightTemplates($dbh, $tempDbh);

            // Copy markup views
            CopyMarkupViews($dbh, $tempDbh);
            // Copy bookmark views
            CopyBookmarkViews($dbh, $tempDbh);
            // Copy annotations
            CopyAnnotations($dbh, $tempDbh);

            // Copy annotations
            CopyReviewTagsAndViews($dbh, $tempDbh);

            $tempDbh->commit();
            $tempDbh->beginTransaction();     
            
            // read data to load checkspace
            $results = ReadCheckSpaceData($dbh, $tempDbh, $_POST['Context']);

            // commit changes
            $dbh->commit();
            $tempDbh->commit();
            $dbh = null; //This is how you close a PDO connection                    
            $tempDbh = null; //This is how you close a PDO connection        
        }
        catch(Exception $e) 
        {     
            echo json_encode(array("Msg" =>  "Failed",
            "MsgCode" => 0));               
            return;
        } 

        echo json_encode(array("Msg" =>  "success",
        "Data" => $results,
        "MsgCode" => 1));                      
        return;
    }

function  CopyRevisions($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM DataChangeRevisions;");
    if ($results) {

        $command = 'DROP TABLE IF EXISTS DataChangeRevisions;';
        $toDbh->exec($command);
        $command = 'CREATE TABLE IF NOT EXISTS DataChangeRevisions(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,
            description TEXT,
            comments TEXT,
            createdById TEXT,
            createdByAlias TEXT,
            createdOn TEXT,
            IsFav INTEGER,
            dataSourceName TEXT,       
            dataSourceType TEXT)';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare("INSERT INTO DataChangeRevisions(
            id,
            name, 
            description, 
            comments,
            createdById, 
            createdByAlias,
            createdOn, 
            IsFav,
            dataSourceName,
            dataSourceType) VALUES(?,?,?,?,?,?,?,?,?,?)");

        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['description'],
                $row['comments'],
                $row['createdById'],
                $row['createdByAlias'],
                $row['createdOn'],
                $row['IsFav'],
                $row['dataSourceName'],
                $row['dataSourceType']
            ));
        }
    }
}

function  CopyVersions($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM Versions;");
    if ($results) {

        $command = 'DROP TABLE IF EXISTS Versions;';
        $toDbh->exec($command);
        $command = 'CREATE TABLE IF NOT EXISTS Versions(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,
                description TEXT,
                comments TEXT,
                createdById TEXT,
                createdByAlias TEXT,
                createdOn TEXT,
                IsFav INTEGER       
                )';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare("INSERT INTO Versions(id, 
            name, 
            description, 
            comments, 
            createdById, 
            createdByAlias, 
            createdOn, 
            IsFav) VALUES(?,?,?,?,?,?,?,?)");

        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['description'],
                $row['comments'],
                $row['createdById'],
                $row['createdByAlias'],
                $row['createdOn'],
                $row['IsFav']
            ));
        }
    }
}

// Copy markup views
function CopyMarkupViews($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM markupViews;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS markupViews;';
        $toDbh->exec($command);

        $command = 'CREATE TABLE markupViews(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            a TEXT,
            b TEXT,
            c TEXT,
            d TEXT)';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare('INSERT INTO markupViews(id, a, b, c, d) VALUES(?,?,?,?,?) ');
        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['a'],
                $row['b'],
                $row['c'],
                $row['d']
            ));
        }
    }
}

// Copy bookmark views
function CopyBookmarkViews($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM bookmarkViews;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS bookmarkViews;';
        $toDbh->exec($command);

        $command = 'CREATE TABLE bookmarkViews(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            a TEXT,
            b TEXT,
            c TEXT,
            d TEXT)';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare('INSERT INTO bookmarkViews(id, a, b, c, d) VALUES(?,?,?,?,?) ');
        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['a'],
                $row['b'],
                $row['c'],
                $row['d']
            ));
        }
    }
}
// Copy annotations
function CopyAnnotations($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM annotations;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS annotations;';
        $toDbh->exec($command);

        $command = 'CREATE TABLE annotations(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            a TEXT,
            b TEXT,
            c TEXT,
            d TEXT)';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare('INSERT INTO annotations(id, a, b, c, d) VALUES(?,?,?,?,?) ');
        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['a'],
                $row['b'],
                $row['c'],
                $row['d']
            ));
        }
    }
}

function CopyReviewTagsAndViews($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM reviewViewsAndTags;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS reviewViewsAndTags;';
        $toDbh->exec($command);

        $command = 'CREATE TABLE reviewViewsAndTags(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            value TEXT)';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare('INSERT INTO reviewViewsAndTags(id, value) VALUES(?,?) ');
        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['value']
            ));
        }
    }
}

// function CopyHighlightPropertyTemplates($fromDbh, $toDbh)
// {
//     $results = $fromDbh->query("SELECT * FROM highlightPropertyTemplates;");
//     if ($results) {
//         $command = 'DROP TABLE IF EXISTS highlightPropertyTemplates;';
//         $toDbh->exec($command);

//         $command = 'CREATE TABLE IF NOT EXISTS highlightPropertyTemplates(
//             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
//             value TEXT NOT NULL     
//           )';
//         $toDbh->exec($command);

//         $insertStmt = $toDbh->prepare("INSERT INTO highlightPropertyTemplates(id, value) VALUES(?,?)");
//         while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
//             $insertStmt->execute(array(
//                 $row['id'],
//                 $row['value']
//             ));
//         }
//     }
// }

function CopyDataChangeHighlightTemplates($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM dataChangeHighlightTemplates;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS dataChangeHighlightTemplates;';
        $toDbh->exec($command);

        $command = 'CREATE TABLE IF NOT EXISTS dataChangeHighlightTemplates(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            value TEXT NOT NULL     
          )';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare("INSERT INTO dataChangeHighlightTemplates(id, value) VALUES(?,?)");
        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['value']
            ));
        }
    }
}

function CopyPropertyHighlightGroups($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM highlightPropertyTemplates;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS highlightPropertyTemplates;';
        $toDbh->exec($command);

        $command = 'CREATE TABLE IF NOT EXISTS highlightPropertyTemplates(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            value TEXT NOT NULL     
          )';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare("INSERT INTO highlightPropertyTemplates(id, value) VALUES(?,?)");
        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['value']
            ));
        }
    }
}

function CopyPropertyGroups($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM propertyGroups;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS propertyGroups;';
        $toDbh->exec($command);

        $command = 'CREATE TABLE IF NOT EXISTS propertyGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            value TEXT NOT NULL     
          )';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare("INSERT INTO propertyGroups(id, value) VALUES(?,?)");
        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['value']
            ));
        }
    }
}

function CopyAllComponents($fromDbh, $toDbh, $table)
{
    $results = $fromDbh->query("SELECT * FROM $table;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS '.$table.';';
        $toDbh->exec($command);

        $command = 'CREATE TABLE IF NOT EXISTS '.$table.'(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            value TEXT NOT NULL     
          )';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare("INSERT INTO $table(id, value) VALUES(?,?)");

        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['value']
            ));
        }
    }
}

function CopyCheckspaceComments($fromDbh, $toDbh)
{
    $results = $fromDbh->query("SELECT * FROM checkspaceComments;");
    if ($results) {
        $command = 'DROP TABLE IF EXISTS checkspaceComments;';
        $toDbh->exec($command);

        $command = 'CREATE TABLE IF NOT EXISTS checkspaceComments(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            comment TEXT     
          )';
        $toDbh->exec($command);

        $insertStmt = $toDbh->prepare("INSERT INTO checkspaceComments(id, comment) VALUES(?,?)");

        while ($row = $results->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['comment']
            ));
        }
    }
}

function ReadCheckspaceComments($tempDbh)
{
    $comments = array();
    if ($tempDbh) {
        try {
            $results = $tempDbh->query("SELECT *FROM checkspaceComments;");

            if ($results) {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                    array_push($comments, $record['comment']);
                }
            }
        } catch (Exception $e) {
            return NULL;
        }
    }

    return $comments;
}

function ReadMarkupViews($dbh)
{
    $markupViews = array();
    if ($dbh) {
        try {
            $results = $dbh->query("SELECT *FROM markupViews;");

            if ($results) {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                    $markupViews["a"] = $record['a'];
                    $markupViews["b"] = $record['b'];
                    $markupViews["c"] = $record['c'];
                    $markupViews["d"] = $record['d'];
                }
            }
        } catch (Exception $e) {
            return NULL;
        }
    }

    return $markupViews;
}

function ReadBookmarkViews($dbh)
{
    $markupViews = array();
    if ($dbh) {
        try {
            $results = $dbh->query("SELECT *FROM bookmarkViews;");

            if ($results) {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                    $markupViews["a"] = $record['a'];
                    $markupViews["b"] = $record['b'];
                    $markupViews["c"] = $record['c'];
                    $markupViews["d"] = $record['d'];
                }
            }
        } catch (Exception $e) {
            return NULL;
        }
    }

    return $markupViews;
}

function ReadAnnotations($dbh)
{
    $annotations = array();
    if ($dbh) {
        try {
            $results = $dbh->query("SELECT *FROM annotations;");

            if ($results) {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                    $annotations["a"] = $record['a'];
                    $annotations["b"] = $record['b'];
                    $annotations["c"] = $record['c'];
                    $annotations["d"] = $record['d'];
                }
            }
        } catch (Exception $e) {
            return NULL;
        }
    }

    return $annotations;
}

    function readReviewTagsAndViews($dbh)
    {
        $tagsAndViews = NULL;
        if ($dbh) {
            try {
                $results = $dbh->query("SELECT *FROM reviewViewsAndTags;");

                if ($results) {
                    while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                        $tagsAndViews = $record['value'];
                    }
                }
            } catch (Exception $e) {
                return NULL;
            }
        }

        return $tagsAndViews;
    }

    function  CopyHiddenComponents($fromDbh, $toDbh)
    {     
        $results = $fromDbh->query("SELECT * FROM hiddenComponents;");
        if($results)
        {

            $command = 'DROP TABLE IF EXISTS hiddenComponents;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE hiddenComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                hiddenComponents TEXT,
                visibleComponents TEXT)'; 
            $toDbh->exec($command);
           
            $insertStmt = $toDbh->prepare("INSERT INTO hiddenComponents(id, hiddenComponents, visibleComponents) VALUES(?,?,?)");            

            while ($row = $results->fetch(\PDO::FETCH_ASSOC)) 
            {  
                $insertStmt->execute(array($row['id'], 
                                    $row['hiddenComponents'],
                                    $row['visibleComponents']));
            }   
        }     
    }

function ReadCheckSpaceData($dbh, $tempDbh, $context)
{
    $results = array();
    try {
        if (strtolower($context) === 'check') {
            $controlsStates = ReadCheckModuleControlStates($tempDbh);
            $results["controlStates"] = $controlsStates;

            $checkCaseInfo = ReadCheckCaseInfo($tempDbh);
            $results["checkCaseInfo"] = $checkCaseInfo;

            $sourceViewerOptions = ReadSourceViewerOptions($tempDbh);
            $results["sourceViewerOptions"] = $sourceViewerOptions;

            $classWiseComponents = ReadClassWiseComponents($tempDbh, 'mainclass');
            $results["classWiseComponents"] = $classWiseComponents;

            $selectedComponents = ReadSelectedComponents($tempDbh);
            $results["selectedComponents"] = $selectedComponents;

            $hiddenComponents = ReadHiddenComponents($tempDbh);
            $results["hiddenComponents"] = $hiddenComponents;
           
            $propertyGroups =  ReadPropertyGroups($dbh);
            $results["propertyGroups"] = $propertyGroups;

            $highlightPropertyTemplates =  ReadHighlightPropertyTemplates($dbh);
            $results["highlightPropertyTemplates"] = $highlightPropertyTemplates;

            $dataChangeHighlightTemplates =  ReadDataChangeHighlightTemplates($dbh);
            $results["dataChangeHighlightTemplates"] = $dataChangeHighlightTemplates;

            $markupViews = ReadMarkupViews($dbh);
            $results["markupViews"] = $markupViews;
    
            $bookmarkViews = ReadBookmarkViews($dbh);
            $results["bookmarkViews"] = $bookmarkViews;
    
            $annotations = ReadAnnotations($dbh);
            $results["annotations"] = $annotations;
        } 
        else if (strtolower($context) === 'review') {
            // read datasource info
            $datasourceInfo = readDataSourceInfo($tempDbh);
            if ($datasourceInfo != NULL) {
                $results['sourceInfo'] = $datasourceInfo;
            }

            // read comparison results
            $comparisonResult = readComparisonCheckResults($tempDbh);
            if ($comparisonResult != NULL) {
                $results['Comparisons'] = array();
                $comparison = array();
                $comparison["sources"] = array(
                    $datasourceInfo["sourceAFileName"],
                    $datasourceInfo["sourceBFileName"]
                );

                if ($datasourceInfo["sourceCFileName"] !== NULL) {
                    array_push($comparison["sources"], $datasourceInfo["sourceCFileName"]);
                }
                if ($datasourceInfo["sourceDFileName"] !== NULL) {
                    array_push($comparison["sources"], $datasourceInfo["sourceDFileName"]);
                }

                $comparison["results"] = $comparisonResult;
                array_push($results['Comparisons'], $comparison);

                // create component hierarchy
                createComparisonComponentsHierarchy(
                    $tempDbh,
                    $datasourceInfo,
                    $comparisonResult,
                    $results
                );
            }

            // read source a compliance results
            $sourceAComplianceResult = readComplianceCheckResults(
                $tempDbh,
                'SourceAComplianceCheckGroups',
                'SourceAComplianceCheckComponents',
                'SourceAComplianceCheckProperties'
            );
            if ($sourceAComplianceResult != NULL) {
                if (!array_key_exists("Compliances", $results)) {
                    $results['Compliances'] = array();
                }

                $compliance = array();
                $compliance["source"] = $datasourceInfo["sourceAFileName"];
                $compliance["results"] = $sourceAComplianceResult;

                // create component hierarchy
                $sourceAComplianceComponentsHierarchy = createComplianceComponentsHierarchy(
                    $tempDbh,
                    $sourceAComplianceResult,
                    "a",
                    $datasourceInfo
                );
                if ($sourceAComplianceComponentsHierarchy !== null) {
                    $compliance['ComponentsHierarchy'] = $sourceAComplianceComponentsHierarchy;
                }

                array_push($results['Compliances'], $compliance);
            }

            // read source b compliance results
            $sourceBComplianceResult = readComplianceCheckResults(
                $tempDbh,
                'SourceBComplianceCheckGroups',
                'SourceBComplianceCheckComponents',
                'SourceBComplianceCheckProperties'
            );
            if ($sourceBComplianceResult != NULL) {
                if (!array_key_exists("Compliances", $results)) {
                    $results['Compliances'] = array();
                }

                $compliance = array();
                $compliance["source"] = $datasourceInfo["sourceBFileName"];
                $compliance["results"] = $sourceBComplianceResult;

                // create component hierarchy
                $sourceBComplianceComponentsHierarchy = createComplianceComponentsHierarchy(
                    $tempDbh,
                    $sourceBComplianceResult,
                    "b",
                    $datasourceInfo
                );
                if ($sourceBComplianceComponentsHierarchy !== null) {
                    $compliance['ComponentsHierarchy'] = $sourceBComplianceComponentsHierarchy;
                }

                array_push($results['Compliances'], $compliance);
            }


            // read source c compliance results
            $sourceCComplianceResult = readComplianceCheckResults(
                $tempDbh,
                'SourceCComplianceCheckGroups',
                'SourceCComplianceCheckComponents',
                'SourceCComplianceCheckProperties'
            );
            if ($sourceCComplianceResult != NULL) {
                if (!array_key_exists("Compliances", $results)) {
                    $results['Compliances'] = array();
                }

                $compliance = array();
                $compliance["source"] = $datasourceInfo["sourceCFileName"];
                $compliance["results"] = $sourceCComplianceResult;

                // create component hierarchy
                $sourceCComplianceComponentsHierarchy = createComplianceComponentsHierarchy(
                    $tempDbh,
                    $sourceCComplianceResult,
                    "c",
                    $datasourceInfo
                );
                if ($sourceCComplianceComponentsHierarchy !== null) {
                    $compliance['ComponentsHierarchy'] = $sourceCComplianceComponentsHierarchy;
                }

                array_push($results['Compliances'], $compliance);
            }

            // read source d compliance results
            $sourceDComplianceResult = readComplianceCheckResults(
                $tempDbh,
                'SourceDComplianceCheckGroups',
                'SourceDComplianceCheckComponents',
                'SourceDComplianceCheckProperties'
            );
            if ($sourceDComplianceResult != NULL) {
                if (!array_key_exists("Compliances", $results)) {
                    $results['Compliances'] = array();
                }

                $compliance = array();
                $compliance["source"] = $datasourceInfo["sourceDFileName"];
                $compliance["results"] = $sourceDComplianceResult;

                // create component hierarchy
                $sourceDComplianceComponentsHierarchy = createComplianceComponentsHierarchy(
                    $tempDbh,
                    $sourceDComplianceResult,
                    "d",
                    $datasourceInfo
                );
                if ($sourceDComplianceComponentsHierarchy !== null) {
                    $compliance['ComponentsHierarchy'] = $sourceDComplianceComponentsHierarchy;
                }

                array_push($results['Compliances'], $compliance);
            }

            // source A components
            $sourceAComponents = readComponents($tempDbh, "a");
            if ($sourceAComponents) {
                $results['sourceAComponents'] = $sourceAComponents;
            }

            // source b components
            $sourceBComponents = readComponents($tempDbh, "b");
            if ($sourceBComponents) {
                $results['sourceBComponents'] = $sourceBComponents;
            }

            // source c components
            $sourceCComponents = readComponents($tempDbh, "c");
            if ($sourceCComponents) {
                $results['sourceCComponents'] = $sourceCComponents;
            }

            // source d components
            $sourceDComponents = readComponents($tempDbh, "d");
            if ($sourceDComponents) {
                $results['sourceDComponents'] = $sourceDComponents;
            }

            // read checkcase info               
            $checkcaseInfo =  ReadCheckCaseInfo($tempDbh);
            $results['checkcaseInfo'] = $checkcaseInfo;

            // read review tags and views
            $reviewTagsAndViews = readReviewTagsAndViews($tempDbh);
            if ($reviewTagsAndViews != NULL) {
                $results['reviewTagsAndViews'] = $reviewTagsAndViews;
            }
        }

        $checkspaceComments = ReadCheckspaceComments($tempDbh);
        $results["checkspaceComments"] = $checkspaceComments;      

        $results["allComponents"] = array();
        $allComponents = ReadAllComponents($tempDbh, "AllComponentsa");
        if ($allComponents != NULL) {
            $results["allComponents"]["a"] = $allComponents;
        }
        $allComponents = ReadAllComponents($tempDbh, "AllComponentsb");
        if ($allComponents != NULL) {
            $results["allComponents"]["b"] = $allComponents;
        }
        $allComponents = ReadAllComponents($tempDbh, "AllComponentsc");
        if ($allComponents != NULL) {
            $results["allComponents"]["c"] = $allComponents;
        }
        $allComponents = ReadAllComponents($tempDbh, "AllComponentsd");
        if ($allComponents != NULL) {
            $results["allComponents"]["d"] = $allComponents;
        }
    } catch (Exception $e) {
    }

    return $results;
}

    function readComponents($dbh, $source)
    {
        try
        { 
            if($source === "a") {
                $componentsTable = "SourceAComponents";  
                $propertiesTable = "SourceAProperties";                
            }
            else if($source === "b") {
                $componentsTable = "SourceBComponents"; 
                $propertiesTable = "SourceBProperties";                           
            }
            else if($source === "c") {   
                $componentsTable = "SourceCComponents";
                $propertiesTable = "SourceCProperties";                              
            }
            else if($source === "d") {                 
                $componentsTable = "SourceDComponents";
                $propertiesTable = "SourceDProperties";        
            }

            // read component main class and subclass
            $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable.";"); 
            $result = null;
            if($compStmt)
            {
                $result = $compStmt->fetchAll(PDO::FETCH_ASSOC);
                for($i = 0; $i < count($result); $i++) {
                    $componentId = $result[$i]["id"];
                    $command = $dbh->prepare("SELECT * FROM $propertiesTable WHERE ownerComponent=?");
                    $command->execute(array($componentId));
                    $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                    $result[$i]["properties"] = $properties;
                }
            }

            return $result;
        }                
        catch(Exception $e) 
        {  
        } 

        return NULL;
    }

    function createComplianceComponentsHierarchy($dbh,
                                                 $complianceResult,                                                     
                                                 $source,
                                                 $datasourceInfo)
    {  
        if($complianceResult === NULL)
        { 
            return;
        }
        
        $componentsHierarchy =  array();
        try
        { 
            if(($source === "a" && isDataSource3D($datasourceInfo["sourceAType"])) || 
                ($source === "b"  && isDataSource3D($datasourceInfo["sourceBType"])) ||
                ($source === "c"  && isDataSource3D($datasourceInfo["sourceCType"])) ||
                ($source === "d"  && isDataSource3D($datasourceInfo["sourceDType"])))
            {                   
                $traversedNodes = [];
                for($index = 1 ; $index <= count($complianceResult); $index++) {
                    $group = $complianceResult[$index];

                    foreach($group['components'] as $key =>  $value) {
                        $status = $value['status'];                           
                        $nodeId = $value['nodeId'];   

                        $comp = traverseRecursivelyFor3DCompliance($dbh, 
                                                                $nodeId, 
                                                                $traversedNodes, 
                                                                $source); 
                                                                
                        if($comp !== NULL && 
                        !array_key_exists($comp['NodeId'], $componentsHierarchy)) 
                        {   
                            $componentsHierarchy[$comp['NodeId']] =  $comp;          
                        
                        }
                    }
                }
            }
            else if(($source === "a" && isDataSourceVisio($datasourceInfo["sourceAType"])) || 
            ($source === "b"  && isDataSourceVisio($datasourceInfo["sourceBType"])) ||
            ($source === "c"  && isDataSourceVisio($datasourceInfo["sourceCType"])) ||
            ($source === "d"  && isDataSourceVisio($datasourceInfo["sourceDType"])))
            {
                $traversedNodes = [];
                for($index = 1 ; $index <= count($complianceResult); $index++) {
                    $group = $complianceResult[$index];

                    foreach($group['components'] as $key =>  $value) {
                        $status = $value['status'];                           
                        $name = $value['name'];   

                        $comp = traverseRecursivelyForVisioCompliance($dbh, 
                                                                $name, 
                                                                $traversedNodes, 
                                                                $source); 
                                                                
                        if($comp !== NULL && 
                        !array_key_exists($comp['Name'], $componentsHierarchy)) 
                        {   
                            $componentsHierarchy[$comp['Name']] =  $comp;          
                        
                        }
                    }
                }
            }
            else
            {
                // 1D data source
                $componentsHierarchy = traverseRecursivelyFor1DCompliance($dbh, $source);
            }

            return  $componentsHierarchy;
        }                
        catch(Exception $e) 
        {               
        }   

        return NULL; 
    }

    function traverseRecursivelyFor1DCompliance($dbh,                                                                         
                                                $source)
    {  
        $componentsTable = NULL;
        $complianceComponentsTable = NULL;
        $idAttribute = "sourceId";            
        if($source === "a") {
            $componentsTable = "SourceAComponents";      
            $complianceComponentsTable = "SourceAComplianceCheckComponents";     
        }
        else  if($source === "b"){
            $componentsTable = "SourceBComponents";
            $complianceComponentsTable = "SourceBComplianceCheckComponents";     
        }
        else  if($source === "c"){
            $componentsTable = "SourceCComponents";
            $complianceComponentsTable = "SourceCComplianceCheckComponents";     
        }
        else  if($source === "d"){
            $componentsTable = "SourceDComponents";
            $complianceComponentsTable = "SourceDComplianceCheckComponents";     
        }

        // read component main class and subclass
        $components = [];

        $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable); 
        if($compStmt) 
        {               
            while ($compRow = $compStmt->fetch(\PDO::FETCH_ASSOC)) 
            {
                $component = array();  
                $component["Id"] = $compRow['id'];
                $component["Name"] = $compRow['name'];
                $component["MainClass"] = $compRow['mainclass'];
                $component["SubClass"] = $compRow['subclass'];       
                
                    // read an additional info
                $stmt = $dbh->query("SELECT * FROM  ".$complianceComponentsTable." where ".$idAttribute." = ". $component['Id']);
                $complianceComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
                if(!$complianceComponentRow)
                {
                    $component["ResultId"] =  NULL;
                    $component["GroupId"]  = NULL;
                    $component["accepted"] = NULL;                        
                    $component["Status"] =  "Not Checked";
                }
                else
                {
                    $component["ResultId"] =  $complianceComponentRow['id'];
                    $component["GroupId"]  = $complianceComponentRow['ownerGroup'];
                    $component["accepted"] = $complianceComponentRow['accepted'];                        
                    $component["Status"] =  $complianceComponentRow['status'];
                }

                $components[$compRow['id']] = $component;
            }
        }     
        
        return $components;
    }


    function traverseRecursivelyFor3DCompliance($dbh, 
                                                    $nodeId, 
                                                    &$traversedNodes, 
                                                    $source)
    {
        if($nodeId == null)
        {
            return NULL;
        }
        if($traversedNodes != null &&
            in_array($nodeId, $traversedNodes))
        {               
            return NULL;
        }              
        array_push($traversedNodes, $nodeId);           

        $component = [];
        $component["NodeId"] = $nodeId;
        $component["accepted"] = '';         
        $component["Children"] = [];
        $component["Status"] = '';
        
        $componentsTable = NULL;
        $nodeIdAttribute = NULL;
        if($source === "a") {
            $componentsTable = "SourceAComponents";      
            $complianceComponentsTable = "SourceAComplianceCheckComponents";     
        }
        else  if($source === "b")  {
            $componentsTable = "SourceBComponents";                         
            $complianceComponentsTable = "SourceBComplianceCheckComponents";        
        }
        else  if($source === "c")  {
            $componentsTable = "SourceCComponents";                         
            $complianceComponentsTable = "SourceCComplianceCheckComponents";        
        }
        else  if($source === "d")  {
            $componentsTable = "SourceDComponents";                         
            $complianceComponentsTable = "SourceDComplianceCheckComponents";        
        }

        // read component main class and subclass
        $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where nodeid =$nodeId"); 
        $compRow = $compStmt->fetch(\PDO::FETCH_ASSOC);
        $component["Name"] = $compRow['name'];
        $component["MainClass"] = $compRow['mainclass'];
        $component["SubClass"] = $compRow['subclass'];

        // read an additional info
        $stmt = $dbh->query("SELECT * FROM  ".$complianceComponentsTable." where nodeId =$nodeId");
        $complianceComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
        if(!$complianceComponentRow)
        {
            $component["accepted"] = NULL;
            $component["Status"] =  "Not Checked";
        }
        else
        {
            $component["Id"] =  $complianceComponentRow['id'];
            $component["GroupId"]  = $complianceComponentRow['ownerGroup'];
            $component["CompId"] =  $complianceComponentRow['sourceId'];
            $component["accepted"] = $complianceComponentRow['accepted'];           
            $component["Status"] =  $complianceComponentRow['status'];
        }
        // traverse children, if any
        $childrenStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where parentid =$nodeId"); 
        while ($childRow = $childrenStmt->fetch(\PDO::FETCH_ASSOC)) 
        {               
            $childComponent = traverseRecursivelyFor3DCompliance($dbh, $childRow['nodeid'], $traversedNodes, $source);

            if($childComponent !== NULL)
            {
                array_push($component["Children"], $childComponent);
            }
        }

        // traverse parent, if any
        $parentComponent = NULL;
        $parentNode = $compRow['parentid'];
        $parentStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where nodeid =".$parentNode);
        
        if($parentStmt)
        {
            while ($parentRow = $parentStmt->fetch(\PDO::FETCH_ASSOC)) 
        {    
            $parentComponent = traverseRecursivelyFor3DCompliance($dbh, $parentRow['nodeid'], $traversedNodes, $source);

            if($parentComponent !== NULL)
            {
                array_push($parentComponent["Children"], $component);
            }
            
            break;
        }

        if($parentComponent != NULL)
        {
            return $parentComponent;
        }
    }

        return $component;                   
    }

    function traverseRecursivelyForVisioCompliance(
        $dbh,
        $name,
        &$traversedNodes,
        $source
    ) {
        if ($name == null) {
            return NULL;
        }
        if (
            $traversedNodes != null &&
            in_array($name, $traversedNodes)
        ) {
            return NULL;
        }
        array_push($traversedNodes, $name);

        $component = [];
        $component["Name"] = $name;
        $component["accepted"] = '';
        $component["Children"] = [];
        $component["Status"] = '';

        $componentsTable = NULL;
        $nodeIdAttribute = NULL;
        if ($source === "a") {
            $componentsTable = "SourceAComponents";
            $complianceComponentsTable = "SourceAComplianceCheckComponents";
        } else  if ($source === "b") {
            $componentsTable = "SourceBComponents";
            $complianceComponentsTable = "SourceBComplianceCheckComponents";
        } else  if ($source === "c") {
            $componentsTable = "SourceCComponents";
            $complianceComponentsTable = "SourceCComplianceCheckComponents";
        } else  if ($source === "d") {
            $componentsTable = "SourceDComponents";
            $complianceComponentsTable = "SourceDComplianceCheckComponents";
        }

        // read component main class and subclass
        $compStmt = $dbh->query("SELECT * FROM  " . $componentsTable . " where name ='$name'");
        $compRow = $compStmt->fetch(\PDO::FETCH_ASSOC);
        $component["NodeId"] = $compRow['nodeid'];
        $component["MainClass"] = $compRow['mainclass'];
        $component["SubClass"] = $compRow['subclass'];

        // read an additional info
        $stmt = $dbh->query("SELECT * FROM  " . $complianceComponentsTable . " where name ='$name'");
        $complianceComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$complianceComponentRow) {
            $component["accepted"] = NULL;
            $component["Status"] =  "Not Checked";
        } else {
            $component["Id"] =  $complianceComponentRow['id'];
            $component["GroupId"]  = $complianceComponentRow['ownerGroup'];
            $component["CompId"] =  $complianceComponentRow['sourceId'];
            $component["accepted"] = $complianceComponentRow['accepted'];
            $component["Status"] =  $complianceComponentRow['status'];
        }
        // traverse children, if any
        $childrenStmt = $dbh->query("SELECT * FROM  " . $componentsTable . " where parentid ='$name'");
        while ($childRow = $childrenStmt->fetch(\PDO::FETCH_ASSOC)) {
            $childComponent = traverseRecursivelyForVisioCompliance($dbh, $childRow['name'], $traversedNodes, $source);

            if ($childComponent !== NULL) {
                array_push($component["Children"], $childComponent);
            }
        }

        // traverse parent, if any
        $parentComponent = NULL;
        $parentNode = $compRow['parentid'];
        $parentStmt = $dbh->query("SELECT * FROM  " . $componentsTable . " where name ='" . $parentNode."'");

        while ($parentRow = $parentStmt->fetch(\PDO::FETCH_ASSOC)) {
            $parentComponent = traverseRecursivelyForVisioCompliance($dbh, $parentRow['name'], $traversedNodes, $source);

            if ($parentComponent !== NULL) {
                array_push($parentComponent["Children"], $component);
            }

            break;
        }

        if ($parentComponent != NULL) {
            return $parentComponent;
        }

        return $component;
    }

    function ReadComplianceSavedCheckData()
    {   
        if (
            !isset($_POST['ProjectName']) ||
            !isset($_POST['CheckName']) ||
            !isset($_POST['Source'])
        ) {
            echo json_encode(array(
                "Msg" =>  "Invalid input.",
                "MsgCode" => 0
            ));
            return;
        }

        try {
            $projectName = $_POST['ProjectName'];
            $checkName = $_POST['CheckName'];
            $source = $_POST['Source'];
           
            $checkGroupTable = null;
            $CheckComponentsTable = null;
            $CheckPropertiesTable = null;
            if ($source === "a") {
                $checkGroupTable = 'SourceAComplianceCheckGroups';
                $CheckComponentsTable = 'SourceAComplianceCheckComponents';
                $CheckPropertiesTable = 'SourceAComplianceCheckProperties';
            } else if ($source === "b") {
                $checkGroupTable = 'SourceBComplianceCheckGroups';
                $CheckComponentsTable = 'SourceBComplianceCheckComponents';
                $CheckPropertiesTable = 'SourceBComplianceCheckProperties';
            } else if ($source === "c") {
                $checkGroupTable = 'SourceCComplianceCheckGroups';
                $CheckComponentsTable = 'SourceCComplianceCheckComponents';
                $CheckPropertiesTable = 'SourceCComplianceCheckProperties';
            } else if ($source === "d") {
                $checkGroupTable = 'SourceDComplianceCheckGroups';
                $CheckComponentsTable = 'SourceDComplianceCheckComponents';
                $CheckPropertiesTable = 'SourceDComplianceCheckProperties';
            } else {
                echo json_encode(array(
                    "Msg" =>  "Failed",
                    "MsgCode" => 0
                ));
                return;
            }

            // open database            
            $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

            // begin the transaction
            $dbh->beginTransaction();          

            // get comparison check data
            $result = readComplianceCheckResults($dbh, 
                                        $checkGroupTable,
                                        $CheckComponentsTable,
                                        $CheckPropertiesTable);

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection

            echo json_encode(array(
                "Msg" =>  "Success",
                "Data" => $result,
                "MsgCode" => 1
            ));
            return;
        } catch (Exception $e) {
        }

        echo json_encode(array(
            "Msg" =>  "Failed",
            "MsgCode" => 0
        ));       
    }

    function readComplianceCheckResults($dbh,
                                    $checkGroupTable,
                                    $CheckComponentsTable,
                                    $CheckPropertiesTable)
    {
        $complianceComponentGroups = array();

        // read components groups
        $checkGroupResults = $dbh->query("SELECT *FROM $checkGroupTable;");
        if($checkGroupResults) 
        {

            while ($groupRow = $checkGroupResults->fetch(\PDO::FETCH_ASSOC)) 
            {

                $complianceComponentGroups[$groupRow['id']] = array('id'=>$groupRow['id'], 
                                        'componentClass'=>$groupRow['componentClass'],  
                                        'componentCount'=>$groupRow['componentCount'],
                                        'categoryStatus' => $groupRow['categoryStatus']); 

                $groupId = $groupRow['id'];
                // read components                                                                  
                $checkComponentsResults = $dbh->query("SELECT *FROM $CheckComponentsTable where ownerGroup= $groupId;");
                if($checkComponentsResults) 
                {
                    // $changedStatus;
                    $components =array();
                    while ($componentRow = $checkComponentsResults->fetch(\PDO::FETCH_ASSOC)) 
                    {                    
                        $componentValues = array('id'=>$componentRow['id'], 
                            'name'=>$componentRow['name'],                                              
                            'subComponentClass'=>$componentRow['subComponentClass'],                                           
                            'status'=>$componentRow['status'],
                            'nodeId'=>$componentRow['nodeId'],
                            'sourceId'=>$componentRow['sourceId'],
                            'ownerGroup'=>$componentRow['ownerGroup'],
                            'accepted' => $componentRow['accepted']);                                                         

                        $componentId = $componentRow['id'];
                        // read properties                                                                  
                        $checkPropertiesResults = $dbh->query("SELECT *FROM $CheckPropertiesTable where ownerComponent=$componentId;");
                        if($checkPropertiesResults) 
                        {
                            // $changedStatus;
                            // $isPropertyAcceped = false;
                            // $worstSeverity = "OK";
                            $properties =array();
                            while ($propertyRow = $checkPropertiesResults->fetch(\PDO::FETCH_ASSOC)) 
                            {

                                // if($propertyRow['accepted'] == "true"){
                                //     $isPropertyAcceped = true;
                                // }

                                // if(($propertyRow['severity'] !== 'OK' && $propertyRow['severity'] !== 'No Value')) {
                                //     if($propertyRow['accepted'] == "false") {
                                //         if(strtolower($propertyRow['severity']) == "error") {
                                //             $worstSeverity = $propertyRow['severity'];
                                //         }
                                //         else if(strtolower($propertyRow['severity']) == "warning" && strtolower($propertyRow['severity']) !== "error") {
                                //             $worstSeverity = $propertyRow['severity'];
                                //         }
                                //         else if(strtolower($propertyRow['severity']) == "no match" && 
                                //         (strtolower($propertyRow['severity']) !== "error" && strtolower($propertyRow['severity']) !== "warning")) {
                                //             $worstSeverity = $propertyRow['severity'];
                                //         }
                                //     }
                                // }

                                $propertyValues = array('id'=>$propertyRow['id'], 
                                                    'name'=>$propertyRow['name'],  
                                                    'value'=>$propertyRow['value'],                                                            
                                                    'result'=>$propertyRow['result'],
                                                    'severity'=>$propertyRow['severity'],
                                                    'performCheck'=>$propertyRow['performCheck'],
                                                    'description'=>$propertyRow['description'],
                                                    'ownerComponent'=>$propertyRow['ownerComponent'],
                                                    'accepted' => $propertyRow['accepted'],
                                                    'rule'=>$propertyRow['rule']); 

                                array_push($properties, $propertyValues);

                            }

                            // if($isPropertyAcceped) {
                            //     $worstSeverity = $worstSeverity . "(A)";
                            //     $componentValues['status'] = $worstSeverity;
                            // }

                            $componentValues["properties"] = $properties;
                        }                      

                        $components[ $componentId ] =  $componentValues;                           
                    }

                    $complianceComponentGroups[$groupRow['id']]['components'] = $components;
                }               
            }             

            return $complianceComponentGroups; 
        }
      

        return NULL;        
    }

    function createComparisonComponentsHierarchy($dbh, 
                                                 $datasourceInfo, 
                                                 $comparisonResult,
                                                 &$results) {    
        $sourceAComparisonComponentsHierarchy = array();
        $sourceBComparisonComponentsHierarchy = array();
        $sourceCComparisonComponentsHierarchy = array();
        $sourceDComparisonComponentsHierarchy = array();   

        if($comparisonResult != NULL)
        {                
                // source A
                if(isDataSource3D($datasourceInfo["sourceAType"]))
                {
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
                    
                        foreach($group['components'] as $key =>  $value) {                     
                        
                            // $compIndex = $value['id'];
                            $status = $value['status'];    
                            $sourceANodeId = $value['sourceANodeId'];                          

                            $comp = traverseRecursivelyFor3DComparison($dbh, $sourceANodeId, $traversedNodes, "a");
                            if($comp !== NULL && 
                            !array_key_exists($comp['NodeId'], $sourceAComparisonComponentsHierarchy)) {                                
                                $sourceAComparisonComponentsHierarchy[$comp['NodeId']] = $comp;                                
                            }
                        }
                    }
                }
                else if(isDataSourceVisio($datasourceInfo["sourceAType"]))
                {
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
            
                        foreach($group['components'] as $key =>  $value) {                         
                                                
                            $sourceAName = $value['sourceAName'];

                            $comp = traverseRecursivelyForVisioComparison($dbh, $sourceAName, $traversedNodes, "a");                     
                        
                            if($comp !== NULL && 
                            !array_key_exists($comp['Name'], $sourceAComparisonComponentsHierarchy)) {                                
                                $sourceAComparisonComponentsHierarchy[$comp['Name']] = $comp;                                
                            }
                        }
                    }
                }
                else
                {
                    // 1D data source                       
                    $sourceAComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, "a");                    
                }
                if($sourceAComparisonComponentsHierarchy !== null) {
                    $results['SourceAComparisonComponentsHierarchy'] = $sourceAComparisonComponentsHierarchy;
                }
               
                // source B
                if(isDataSource3D($datasourceInfo["sourceBType"]))
                {
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
            
                        foreach($group['components'] as $key =>  $value) {                           
                            $status = $value['status'];
                            $sourceBNodeId = $value['sourceBNodeId'];

                            $comp = traverseRecursivelyFor3DComparison($dbh, $sourceBNodeId, $traversedNodes, "b");                     
                        
                            if($comp !== NULL && 
                            !array_key_exists($comp['NodeId'], $sourceBComparisonComponentsHierarchy)) {                                
                                $sourceBComparisonComponentsHierarchy[$comp['NodeId']] = $comp;                                
                            }
                        }
                    }
                }
                else if(isDataSourceVisio($datasourceInfo["sourceBType"]))
                {
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
            
                        foreach($group['components'] as $key =>  $value) {                         
                                                
                            $sourceBName = $value['sourceBName'];

                            $comp = traverseRecursivelyForVisioComparison($dbh, $sourceBName, $traversedNodes, "b");                     
                        
                            if($comp !== NULL && 
                            !array_key_exists($comp['Name'], $sourceBComparisonComponentsHierarchy)) {                                
                                $sourceBComparisonComponentsHierarchy[$comp['Name']] = $comp;                                
                            }
                        }
                    }
                }
                else
                {
                    // 1D data source
                    $sourceBComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, "b");
                }      
                if($sourceBComparisonComponentsHierarchy !== null) {
                    $results['SourceBComparisonComponentsHierarchy'] = $sourceBComparisonComponentsHierarchy;
                }               

                 // source C
                 if(isDataSource3D($datasourceInfo["sourceCType"]))
                 {
                     $traversedNodes = [];
                     for($index = 1 ; $index <= count($comparisonResult); $index++) {
                         $group = $comparisonResult[$index];
             
                         foreach($group['components'] as $key =>  $value) {                           
                             $status = $value['status'];                            
                             $sourceCNodeId = $value['sourceCNodeId'];

                             $comp = traverseRecursivelyFor3DComparison($dbh, $sourceCNodeId, $traversedNodes, "c");                     
                         
                             if($comp !== NULL && 
                             !array_key_exists($comp['NodeId'], $sourceCComparisonComponentsHierarchy)) {                                
                                 $sourceCComparisonComponentsHierarchy[$comp['NodeId']] = $comp;                                
                             }
                         }
                     }
                 }
                 else if(isDataSourceVisio($datasourceInfo["sourceCType"]))
                 {
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
            
                        foreach($group['components'] as $key =>  $value) {                         
                                                
                            $sourceCName = $value['sourceCName'];

                            $comp = traverseRecursivelyForVisioComparison($dbh, $sourceCName, $traversedNodes, "c");                     
                        
                            if($comp !== NULL && 
                            !array_key_exists($comp['Name'], $sourceCComparisonComponentsHierarchy)) {                                
                                $sourceCComparisonComponentsHierarchy[$comp['Name']] = $comp;                                
                            }
                        }
                    }
                 }
                 else
                 {
                     // 1D data source
                     $sourceCComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, "c");
                 } 
                 if($sourceCComparisonComponentsHierarchy !== null) {
                    $results['SourceCComparisonComponentsHierarchy'] = $sourceCComparisonComponentsHierarchy;
                }
                

                  // source D
                if(isDataSource3D($datasourceInfo["sourceDType"]))
                {
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
            
                        foreach($group['components'] as $key =>  $value) {                           
                            $status = $value['status'];                            
                            $sourceDNodeId = $value['sourceDNodeId'];

                            $comp = traverseRecursivelyFor3DComparison($dbh, $sourceDNodeId, $traversedNodes, "d");                     
                        
                            if($comp !== NULL && 
                            !array_key_exists($comp['NodeId'], $sourceDComparisonComponentsHierarchy)) {                                
                                $sourceDComparisonComponentsHierarchy[$comp['NodeId']] = $comp;                                
                            }
                        }
                    }
                }
                else if(isDataSourceVisio($datasourceInfo["sourceDType"]))
                {
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
            
                        foreach($group['components'] as $key =>  $value) {                           
                            // $status = $value['status'];                            
                            $sourceDName = $value['sourceDName'];

                            $comp = traverseRecursivelyForVisioComparison($dbh, $sourceDName, $traversedNodes, "d");                     
                        
                            if($comp !== NULL && 
                            !array_key_exists($comp['Name'], $sourceDComparisonComponentsHierarchy)) {                                
                                $sourceDComparisonComponentsHierarchy[$comp['Name']] = $comp;                                
                            }
                        }
                    }
                }
                else
                {
                    // 1D data source
                    $sourceDComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, "d");
                } 
                if($sourceDComparisonComponentsHierarchy !== null) {
                    $results['SourceDComparisonComponentsHierarchy'] = $sourceDComparisonComponentsHierarchy;
                }
            }                  
    }

    function traverseRecursivelyFor1DComparison($dbh,                                                                         
                                                $source)
    {  
        $componentsTable = NULL;
        $idAttribute = NULL;            
        if($source === "a") {
            $componentsTable = "SourceAComponents";      
            $idAttribute = "sourceAId";        
        }
        else if($source === "b") {
            $componentsTable = "SourceBComponents";                               
            $idAttribute = "sourceBId";
        }
        else if($source === "c") {
            $componentsTable = "SourceCComponents";                               
            $idAttribute = "sourceCId";
        }
        else if($source === "d") {
            $componentsTable = "SourceDComponents";                               
            $idAttribute = "sourceDId";
        }

        // read component main class and subclass
        $components = [];

        $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable); 
        if($compStmt) 
        {               
            while ($compRow = $compStmt->fetch(\PDO::FETCH_ASSOC)) 
            {
                $component = array();  
                $component["Id"] = $compRow['id'];
                $component["Name"] = $compRow['name'];
                $component["MainClass"] = $compRow['mainclass'];
                $component["SubClass"] = $compRow['subclass'];       
                
                // read an additional info
                $stmt = $dbh->query("SELECT * FROM  ComparisonCheckComponents where ".$idAttribute." = ". $component['Id']);
                $comparisonComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
                if(!$comparisonComponentRow)
                {
                    $component["ResultId"] =  NULL;
                    $component["GroupId"]  = NULL;
                    $component["accepted"] = NULL;
                    $component["transpose"] = NULL;
                    $component["Status"] =  "Not Checked";
                }
                else
                {
                    $component["ResultId"] =  $comparisonComponentRow['id'];
                    $component["GroupId"]  = $comparisonComponentRow['ownerGroup'];
                    $component["accepted"] = $comparisonComponentRow['accepted'];
                    $component["transpose"] = $comparisonComponentRow['transpose'];
                    $component["Status"] =  $comparisonComponentRow['status'];
                }

                $components[$compRow['id']] = $component;
            }
        }     
        
        return $components;
    }

    function traverseRecursivelyFor3DComparison($dbh, 
                                                $nodeId, 
                                                &$traversedNodes, 
                                                $source)
    {      
        
        if($nodeId == null)
        {
            return NULL;
        }
        if($traversedNodes != null &&
        in_array($nodeId, $traversedNodes))
        {          
            return NULL;
        }              
        array_push($traversedNodes, $nodeId);   

        $component = [];
        $component["NodeId"] = $nodeId;
        $component["accepted"] = '';
        $component["transpose"] = '';
        $component["Children"] = [];
        $component["Status"] = '';

        $componentsTable = NULL;
        $nodeIdAttribute = NULL;
        if($source === "a") {
            $componentsTable = "SourceAComponents";
            $nodeIdAttribute ="sourceANodeId";
        }
        else if($source === "b") {
            $componentsTable = "SourceBComponents";
            $nodeIdAttribute ="sourceBNodeId";                    
        }
        else if($source === "c") {
            $componentsTable = "SourceCComponents";
            $nodeIdAttribute ="sourceCNodeId";                    
        }
        else if($source === "d") {
            $componentsTable = "SourceDComponents";
            $nodeIdAttribute ="sourceDNodeId";                    
        }

        // read component main class and subclass
        $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where nodeid =$nodeId"); 
        $compRow = $compStmt->fetch(\PDO::FETCH_ASSOC);
        $component["Name"] = $compRow['name'];
        $component["MainClass"] = $compRow['mainclass'];
        $component["SubClass"] = $compRow['subclass'];

        // read an additional info
        $stmt = $dbh->query("SELECT * FROM  ComparisonCheckComponents where ".$nodeIdAttribute." =$nodeId");
        $comparisonComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
        if(!$comparisonComponentRow)
        {
            $component["Id"] =  NULL;
            $component["GroupId"]  = NULL;
            $component["accepted"] = NULL;
            $component["transpose"] = NULL;
            $component["Status"] =  "Not Checked";
        }
        else
        {
            $component["Id"] =  $comparisonComponentRow['id'];
            $component["GroupId"]  = $comparisonComponentRow['ownerGroup'];
            $component["accepted"] = $comparisonComponentRow['accepted'];
            $component["transpose"] = $comparisonComponentRow['transpose'];
            $component["Status"] =  $comparisonComponentRow['status'];
        }

        // traverse child if any
        $childrenStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where parentid =$nodeId"); 
        while ($childRow = $childrenStmt->fetch(\PDO::FETCH_ASSOC)) 
        {               
            $childComponent = traverseRecursivelyFor3DComparison($dbh, $childRow['nodeid'], $traversedNodes, $source);

            if($childComponent !== NULL)
            {
                array_push($component["Children"], $childComponent);
            }
        }          

        // traverse parent, if any
        $parentComponent = NULL;
        $parentNode = $compRow['parentid'];
        $parentStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where nodeid =".$parentNode);

        while ($parentRow = $parentStmt->fetch(\PDO::FETCH_ASSOC)) 
        {    
            $parentComponent = traverseRecursivelyFor3DComparison($dbh, $parentRow['nodeid'], $traversedNodes, $source);

            if($parentComponent !== NULL)
            {
                array_push($parentComponent["Children"], $component);
            }

            break;
        }

        if($parentComponent != NULL)
        {
            return $parentComponent;
        }

        return $component;                   
    }

    function traverseRecursivelyForVisioComparison(
        $dbh,
        $name,
        &$traversedNodes,
        $source) {
    
        if ($name == null) {
            return NULL;
        }
        if (
            $traversedNodes != null &&
            in_array($name, $traversedNodes)
        ) {
            return NULL;
        }
        array_push($traversedNodes, $name);
    
        $component = [];
        $component["Name"] = $name;
        $component["accepted"] = '';
        $component["transpose"] = '';
        $component["Children"] = [];
        $component["Status"] = '';
    
        $componentsTable = NULL;
        $nameAttribute = NULL;
        if ($source === "a") {
            $componentsTable = "SourceAComponents";
            $nameAttribute = "sourceAName";
        } else if ($source === "b") {
            $componentsTable = "SourceBComponents";
            $nameAttribute = "sourceBName";
        } else if ($source === "c") {
            $componentsTable = "SourceCComponents";
            $nameAttribute = "sourceCName";
        } else if ($source === "d") {
            $componentsTable = "SourceDComponents";
            $nameAttribute = "sourceDName";
        }
    
        // read component main class and subclass
        $compStmt = $dbh->query("SELECT * FROM  " . $componentsTable . " where name ='$name'");
        $compRow = $compStmt->fetch(\PDO::FETCH_ASSOC);
        $component["NodeId"] = $compRow['nodeid'];
        $component["MainClass"] = $compRow['mainclass'];
        $component["SubClass"] = $compRow['subclass'];
    
        // read an additional info
        $stmt = $dbh->query("SELECT * FROM  ComparisonCheckComponents where " . $nameAttribute . " ='$name'");
        $comparisonComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$comparisonComponentRow) {
            $component["Id"] =  NULL;
            $component["GroupId"]  = NULL;
            $component["accepted"] = NULL;
            $component["transpose"] = NULL;
            $component["Status"] =  "Not Checked";
        } else {
            $component["Id"] =  $comparisonComponentRow['id'];
            $component["GroupId"]  = $comparisonComponentRow['ownerGroup'];
            $component["accepted"] = $comparisonComponentRow['accepted'];
            $component["transpose"] = $comparisonComponentRow['transpose'];
            $component["Status"] =  $comparisonComponentRow['status'];
        }
    
        // traverse child if any
        $childrenStmt = $dbh->query("SELECT * FROM  " . $componentsTable . " where parentid ='$name'");
        while ($childRow = $childrenStmt->fetch(\PDO::FETCH_ASSOC)) {
            $childComponent = traverseRecursivelyForVisioComparison($dbh, $childRow['name'], $traversedNodes, $source);
    
            if ($childComponent !== NULL) {
                array_push($component["Children"], $childComponent);
            }
        }
    
        // traverse parent, if any
        $parentComponent = NULL;
        $parentNode = $compRow['parentid'];
        $parentStmt = $dbh->query("SELECT * FROM  " . $componentsTable . " where name ='" . $parentNode."'");    
        while ($parentRow = $parentStmt->fetch(\PDO::FETCH_ASSOC)) {
            $parentComponent = traverseRecursivelyForVisioComparison($dbh, $parentRow['name'], $traversedNodes, $source);
    
            if ($parentComponent !== NULL) {
                array_push($parentComponent["Children"], $component);
            }
    
            break;
        }
    
        if ($parentComponent != NULL) {
            return $parentComponent;
        }
    
        return $component;
    } 
    
    function isDataSource3D($sourceExt) {
        $is3D = true;

    $validSources = array(
        "xml", "rvm",  "sldasm",
        "dwg", "dxf",  "dwf", "dwfx",
        "sldprt", "rvt", "rfa", "ifc",
        "step", "stp", "ste", "igs", 
        "jt","prt", "mf1", "arc", "unv", "pkg", "model", "session", "dlv", "exp",
        "catdrawing", "catpart", "catproduct", "catshape", "cgr",
        "3dxml", "obj", "asm", "neu", "prt", "xas", "xpr",
        "ipt", "iam", "asm", "par", "pwd", "psm",
        "3ds", "u3d", "sat", "sab"
    );
           // open database
           if(in_array(strtolower($sourceExt), $validSources) == false) {
                $is3D = false;
           }
           return $is3D;
    }

    function isDataSourceVisio($sourceExt) {        
        $validSources = array("vsd", "vsdx");                    
        if(in_array(strtolower($sourceExt), $validSources) == true) {
            return true;
        }
        return false;
    }

    function readDataSourceInfo($dbh)
    {
        try
        {
            $results = $dbh->query("SELECT *FROM  DatasourceInfo;");

            $data = array();
            while ($record = $results->fetch(\PDO::FETCH_ASSOC))
            {
                $data = array(
                    'sourceAFileName' => $record['sourceAFileName'],
                    'sourceBFileName' => $record['sourceBFileName'],
                    'sourceCFileName' => $record['sourceCFileName'],
                    'sourceDFileName' => $record['sourceDFileName'],
                    'sourceAType' => $record['sourceAType'],
                    'sourceBType' => $record['sourceBType'],
                    'sourceCType' => $record['sourceCType'],
                    'sourceDType' => $record['sourceDType'],
                    'orderMaintained' => $record['orderMaintained']
                );
            }

            return  $data;
        }
        catch (Exception $e)
        {
        }

        return NULL;
    }

    function ReadSavedComparisonCheckData()
    {
        if (
            !isset($_POST['ProjectName']) ||
            !isset($_POST['CheckName'])
        ) {
            echo json_encode(array(
                "Msg" =>  "Invalid input.",
                "MsgCode" => 0
            ));
            return;
        }

        try {
            $projectName = $_POST['ProjectName'];
            $checkName = $_POST['CheckName'];

            // open database
            $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

            // begin the transaction
            $dbh->beginTransaction();

            // get comparison check data
            $result = readComparisonCheckResults($dbh);

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection

            echo json_encode(array(
                "Msg" =>  "Success",
                "Data" => $result,
                "MsgCode" => 1
            ));
            return;
        } catch (Exception $e) {
        }

        echo json_encode(array(
            "Msg" =>  "Failed",
            "MsgCode" => 0
        ));
    }

    function readComparisonCheckResults($dbh)
    {
        $comparisonComponentGroups = array();     

        // read components groups
        $checkGroupResults = $dbh->query("SELECT *FROM ComparisonCheckGroups;");
        if($checkGroupResults) 
        {
           
            while ($groupRow = $checkGroupResults->fetch(\PDO::FETCH_ASSOC)) 
            {
                
                $comparisonComponentGroups[$groupRow['id']] = array('id'=>$groupRow['id'], 
                                                              'componentClass'=>$groupRow['componentClass'],  
                                                              'componentCount'=>$groupRow['componentCount'],
                                                              'categoryStatus' => $groupRow['categoryStatus']); 
                
                $groupId = $groupRow['id'];
                // read components                                                                  
                $checkComponentsResults = $dbh->query("SELECT *FROM ComparisonCheckComponents where ownerGroup= $groupId;");
                if($checkComponentsResults) 
                {
                    // $changedStatus;
                    $components =array();
                    while ($componentRow = $checkComponentsResults->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $componentValues = array('id'=> $componentRow['id'], 
                                        'sourceAName'=> $componentRow['sourceAName'],  
                                        'sourceBName'=> $componentRow['sourceBName'],
                                        'sourceCName'=> $componentRow['sourceCName'],  
                                        'sourceDName'=> $componentRow['sourceDName'],
                                        'sourceAMainClass'=> $componentRow['sourceAMainClass'],  
                                        'sourceBMainClass'=> $componentRow['sourceBMainClass'],
                                        'sourceCMainClass'=> $componentRow['sourceCMainClass'],  
                                        'sourceDMainClass'=> $componentRow['sourceDMainClass'],
                                        'sourceASubComponentClass'=>$componentRow['sourceASubComponentClass'],
                                        'sourceBSubComponentClass'=>$componentRow['sourceBSubComponentClass'],
                                        'sourceCSubComponentClass'=>$componentRow['sourceCSubComponentClass'],
                                        'sourceDSubComponentClass'=>$componentRow['sourceDSubComponentClass'],
                                        'status'=>$componentRow['status'],
                                        'sourceANodeId'=>$componentRow['sourceANodeId'],
                                        'sourceBNodeId'=>$componentRow['sourceBNodeId'],
                                        'sourceCNodeId'=>$componentRow['sourceCNodeId'],
                                        'sourceDNodeId'=>$componentRow['sourceDNodeId'],
                                        'sourceAId'=>$componentRow['sourceAId'],
                                        'sourceBId'=>$componentRow['sourceBId'],
                                        'sourceCId'=>$componentRow['sourceCId'],
                                        'sourceDId'=>$componentRow['sourceDId'],
                                        'ownerGroup'=>$componentRow['ownerGroup'],                                                        
                                        'transpose' => $componentRow['transpose'],
                                        'accepted' => $componentRow['accepted'],
                                        'classMappingInfo' => $componentRow['classMappingInfo']); 

                        $componentId = $componentRow['id'];

                         // read properties                                                                  
                        $checkPropertiesResults = $dbh->query("SELECT *FROM ComparisonCheckProperties where ownerComponent=$componentId;");
                        if($checkPropertiesResults) 
                        {
                            // $changedStatus;
                            $properties =array();
                            while ($propertyRow = $checkPropertiesResults->fetch(\PDO::FETCH_ASSOC)) 
                            {
                                
                                $propertyValues = array('id'=>$propertyRow['id'], 
                                                        'sourceAName'=>$propertyRow['sourceAName'],  
                                                        'sourceBName'=>$propertyRow['sourceBName'],
                                                        'sourceCName'=>$propertyRow['sourceCName'],  
                                                        'sourceDName'=>$propertyRow['sourceDName'],
                                                        'sourceAValue'=>$propertyRow['sourceAValue'],
                                                        'sourceBValue'=>$propertyRow['sourceBValue'],
                                                        'sourceCValue'=>$propertyRow['sourceCValue'],  
                                                        'sourceDValue'=>$propertyRow['sourceDValue'],
                                                        'result'=>$propertyRow['result'],
                                                        'severity'=>$propertyRow['severity'],
                                                        'performCheck'=>$propertyRow['performCheck'],
                                                        'description'=>$propertyRow['description'],
                                                        'ownerComponent'=>$propertyRow['ownerComponent'],
                                                        'transpose' => $propertyRow['transpose'],
                                                        'accepted' => $propertyRow['accepted']); 
                
                                array_push($properties, $propertyValues);

                            }
                            $componentValues["properties"] = $properties;
                        }
                        

                        $components[ $componentId ] =  $componentValues;                           
                    }                      

                    $comparisonComponentGroups[$groupRow['id']]['components'] = $components;
                }
                else
                {
                    // ComparisonCheckComponents table doesn't exist
                    return NULL;
                    //return false;
                }
            }             
   
           return $comparisonComponentGroups;
           
            //return true;
        }       

        return NULL;        
    }


function ReadDataChangeHighlightTemplates($tempDbh)
{
    try {
        $results = $tempDbh->query("SELECT *FROM dataChangeHighlightTemplates;");

        if ($results) {
            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                return  $record['value'];
            }
        }
    } catch (Exception $e) {
    }

    return NULL;
}

function ReadHighlightPropertyTemplates($tempDbh)
{
    try {
        $results = $tempDbh->query("SELECT *FROM highlightPropertyTemplates;");

        if ($results) {
            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                return  $record['value'];
            }
        }
    } catch (Exception $e) {
    }

    return NULL;
}

function ReadPropertyGroups($tempDbh)
{
    try {
        $results = $tempDbh->query("SELECT *FROM propertyGroups;");

        if ($results) {
            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                return  $record['value'];
            }
        }
    } catch (Exception $e) {
    }

    return NULL;
}

function ReadAllComponents($tempDbh, $table)
{
    try {
        $results = $tempDbh->query("SELECT *FROM $table;");

        if ($results) {
            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                return  $record['value'];
            }
        }
    } catch (Exception $e) {
    }

    return NULL;
}

    function ReadHiddenComponents($tempDbh)
    {
        try
        {               
            $results = $tempDbh->query("SELECT *FROM hiddenComponents;");     

            if($results)
            {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    return array('hiddenComponents' => $record['hiddenComponents'],
                    'visibleComponents' => $record['visibleComponents']);                                 
                } 
            }            
        }
        catch(Exception $e) 
        {              
        }    
        
        return NULL;
    }

    function ReadSelectedComponents($tempDbh)
    {
        $selectedComponents = array();   

        $srcA = ReadSelectedComponentsForSource($tempDbh, "SourceA");
        $srcB = ReadSelectedComponentsForSource($tempDbh, "SourceB");
        $srcC = ReadSelectedComponentsForSource($tempDbh, "SourceC");
        $srcD = ReadSelectedComponentsForSource($tempDbh, "SourceD");

        $selectedComponents["SourceA"] = $srcA;
        $selectedComponents["SourceB"] = $srcB;
        $selectedComponents["SourceC"] = $srcC;
        $selectedComponents["SourceD"] = $srcD;

        return $selectedComponents;
    }

    function ReadSelectedComponentsForSource($tempDbh, $source)
    {           
        try
        { 
            $table;
            if(strtolower($source) === 'sourcea')
            {
                $table = "SourceASelectedComponents";
            }
            else if(strtolower($source) === 'sourceb')
            {
                $table = "SourceBSelectedComponents";
            }
            else if(strtolower($source) === 'sourcec')
            {
                $table = "SourceCSelectedComponents";
            }
            else if(strtolower($source) === 'sourced')
            {
                $table = "SourceDSelectedComponents";
            }

            return ReadSelectedComponentsFromDB($tempDbh, $table);
        }
        catch(Exception $e) 
        {   
        } 
           
        return NULL;
    }

    function ReadSelectedComponentsFromDB($tempDbh, $table)
    {
        $idwiseComponents = NULL;
        $nodeIdwiseComponents = [];

        $results = $tempDbh->query("SELECT *FROM  ".$table);     
        if($results)
        {
            while ($component = $results->fetch(\PDO::FETCH_ASSOC)) 
            {
                $comp = array('id'=>$component['id'], 
                            'name'=>$component['name'],  
                            'mainClass'=>$component['mainClass'],
                            'subClass'=>$component['subClass'],
                            'nodeId'=>$component['nodeId'],
                            'mainComponentId'=>$component['mainComponentId']);

                // id wise components
                $idwiseComponents[$component['id']] = $comp;                       

                if($component['nodeId'] !== NULL)
                {                           
                    // // node id wise components             
                    // if(array_key_exists($component['nodeId'], $nodeIdwiseComponents))
                    // {
                    //     array_push($nodeIdwiseComponents[$component['nodeId']], $comp );
                    // }
                    // else
                    // {
                        // $nodeIdwiseComponents[$component['nodeId']] = array( $comp );
                    // }                            
                    $nodeIdwiseComponents[$component['nodeId']] =  $comp;
                }
                else
                {
                    // class wise components             
                    // if(array_key_exists($component['mainClass'], $nodeIdwiseComponents))
                    // {
                    //     array_push($nodeIdwiseComponents[$component['mainClass']], $comp );
                    // }
                    // else
                    // {
                    //     $nodeIdwiseComponents[$component['mainClass']] = array( $comp );
                    // }
                    $nodeIdwiseComponents[$component['componentId']] =  $comp;
                }
            }    
        }

        $selectedComponents =array();
        if( $idwiseComponents !== NULL && 
            $nodeIdwiseComponents !== NULL)    
        {
            $selectedComponents['IdwiseSelectedComps'] = $idwiseComponents;
            $selectedComponents['NodeIdwiseSelectedComps'] = $nodeIdwiseComponents;
        }  
        
        return $selectedComponents;
    }

    function ReadClassWiseComponents($tempDbh, $mainClassProperty)
    { 
        $ClasswiseComponents = array();   

        $srcA = ReadClassWiseComponentsForSource($tempDbh, $mainClassProperty, "SourceAComponents", "SourceAProperties");
        $srcB = ReadClassWiseComponentsForSource($tempDbh, $mainClassProperty, "SourceBComponents", "SourceBProperties");
        $srcC = ReadClassWiseComponentsForSource($tempDbh, $mainClassProperty, "SourceCComponents", "SourceCProperties");
        $srcD = ReadClassWiseComponentsForSource($tempDbh, $mainClassProperty, "SourceDComponents", "SourceDProperties");

        $ClasswiseComponents["SourceA"] = $srcA;
        $ClasswiseComponents["SourceB"] = $srcB;
        $ClasswiseComponents["SourceC"] = $srcC;
        $ClasswiseComponents["SourceD"] = $srcD;

        return $ClasswiseComponents;
    }

    function ReadClassWiseComponentsForSource(
        $tempDbh, 
        $mainClassProperty, 
        $componentsTableName,
        $propertiesTableName)
    { 
        $ClasswiseComponents = array();   
        try
        {  
            // Components table
            // $source = $_POST['Source'];   
            // $componentsTableName;
            // $propertiesTableName;         
            // if(strtolower($source) == "sourcea")
            // {
            //     $componentsTableName = "SourceAComponents";
            //     $propertiesTableName = "SourceAProperties";
            // }
            // else if(strtolower($source) == "sourceb")
            // {
            //     $componentsTableName = "SourceBComponents";
            //     $propertiesTableName = "SourceBProperties";
            // }
            // else
            // {                
            //     return NULL;
            // }  

            $mainClasses = $tempDbh->query("SELECT DISTINCT $mainClassProperty FROM  $componentsTableName;");
            if($mainClasses) 
            { 
                while ($mainClass = $mainClasses->fetch(\PDO::FETCH_ASSOC)) 
                {                     
                    $componetWiseProperties = array();

                    $ids = $tempDbh->query("SELECT id FROM ".$componentsTableName." where $mainClassProperty='".$mainClass[$mainClassProperty]."';");  
                    while ($compIdResult = $ids->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $id = (int)$compIdResult['id'];
                       
                        $propertyList = array();

                        $properties = $tempDbh->query("SELECT *FROM  $propertiesTableName where ownercomponent=".$id.';');                        
                        while ($property = $properties->fetch(\PDO::FETCH_ASSOC)) 
                        {
                            $propertyArray = array('id' => $property['id'], 'name'=> $property['name'], 'format'=>$property['format'], 'value'=>$property['value']);   
                            
                            array_push($propertyList, $propertyArray);
                        }

                        $componetWiseProperties[$id] =  $propertyList;
                    }

                    $ClasswiseComponents[$mainClass[$mainClassProperty]] = $componetWiseProperties;
                }              
              
            } 
            else
            {
                // Properties table doesn't exist                
                return NULL;                
            }
            
         }
         catch(Exception $e) 
         {        
            return NULL;          
         } 

         return $ClasswiseComponents;
    }

    function ReadSourceViewerOptions($tempDbh)
    {      
        $sourceViewerOptions = array();
            try
            {    
                // read sources                
                $results = $tempDbh->query("SELECT *FROM  DatasourceInfo;");
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                    if (
                        $record['sourceAFileName'] !== NULL &&
                        $record['sourceAType'] !== NULL
                    ) {
                        $sourceViewerOptions['a']  = array();
                        $sourceViewerOptions['a']['source'] =  $record['sourceAFileName'];
                        $sourceViewerOptions['a']['sourceType'] =  $record['sourceAType'];
                    }

                    if (
                        $record['sourceBFileName'] !== NULL &&
                        $record['sourceBType'] !== NULL
                    ) {
                        $sourceViewerOptions['b']  = array();
                        $sourceViewerOptions['b']['source'] = $record['sourceBFileName'];
                        $sourceViewerOptions['b']['sourceType'] = $record['sourceBType'];
                    }

                    if (
                        $record['sourceCFileName'] !== NULL &&
                        $record['sourceCType'] !== NULL
                    ) {
                        $sourceViewerOptions['c']  = array();
                        $sourceViewerOptions['c']['source'] = $record['sourceCFileName'];
                        $sourceViewerOptions['c']['sourceType'] = $record['sourceCType'];
                    }

                    if (
                        $record['sourceDFileName'] !== NULL &&
                        $record['sourceDType'] !== NULL
                    ) {
                        $sourceViewerOptions['d']  = array();
                        $sourceViewerOptions['d']['source'] = $record['sourceDFileName'];
                        $sourceViewerOptions['d']['sourceType'] = $record['sourceDType'];
                    }
                }

                // read sourceAViewerOptions
                $sourceAViewerOptions = $tempDbh->query("SELECT *FROM SourceAViewerOptions;");
                if($sourceAViewerOptions) 
                {
                    while ($viewerOptions = $sourceAViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {                        
                        $sourceViewerOptions['a']['endPointUri'] = $viewerOptions['endpointUri'];                     
                        break;
                    }
                }               

                 // read sourceBViewerOptions
                 $sourceBViewerOptions = $tempDbh->query("SELECT *FROM SourceBViewerOptions;");
                 if($sourceBViewerOptions) 
                 {
                    while ($viewerOptions = $sourceBViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {  
                        $sourceViewerOptions['b']['endPointUri'] = $viewerOptions['endpointUri'];                      
                        break;
                    }
                 } 

                  // read sourceCViewerOptions
                  $sourceCViewerOptions = $tempDbh->query("SELECT *FROM SourceCViewerOptions;");
                  if($sourceCViewerOptions) 
                  {
                     while ($viewerOptions = $sourceCViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                     {  
                         $sourceViewerOptions['c']['endPointUri'] = $viewerOptions['endpointUri'];                      
                         break;
                     }
                  } 

                   // read sourceDViewerOptions
                 $sourceDViewerOptions = $tempDbh->query("SELECT *FROM SourceDViewerOptions;");
                 if($sourceDViewerOptions) 
                 {
                    while ($viewerOptions = $sourceDViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {  
                        $sourceViewerOptions['d']['endPointUri'] = $viewerOptions['endpointUri'];                      
                        break;
                    }
                 } 
            }                
            catch(Exception $e)
            {  
                return NULL;
            }  
            
            return $sourceViewerOptions;
    }

    function ReadCheckCaseInfo($tempDbh)
    {       
        try
        {               
            $results = $tempDbh->query("SELECT *FROM CheckCaseInfo;");     

            if($results)
            {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    return array('checkCaseData' => $record['checkCaseData']);                                 
                }  
            }          
        }
        catch(Exception $e) 
        {              
        }    
        
        return NULL;
    }

    function ReadCheckModuleControlStates($tempDbh)
    {
        $checkModuleControlsState = array();
        // $projectName = $_POST['ProjectName'];
        // $checkName = $_POST['CheckName'];
        // $dbh;
        try
        {   
            // // open database
            // $dbPath = getCheckDatabasePath($projectName, $checkName);
            // if(!CheckIfFileExists($dbPath)){
            //     echo 'fail';
            //     return;
            // }

            // $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // // begin the transaction
            // $dbh->beginTransaction();  
            
            $results = $tempDbh->query("SELECT *FROM  CheckModuleControlsState;");  
            
            if($results)
            {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $checkModuleControlsState = array('comparisonSwith'=>$record['comparisonSwith'], 
                                                    'sourceAComplianceSwitch'=>$record['sourceAComplianceSwitch'],  
                                                    'sourceBComplianceSwitch'=>$record['sourceBComplianceSwitch'],
                                                    'sourceCComplianceSwitch'=>$record['sourceCComplianceSwitch'],
                                                    'sourceDComplianceSwitch'=>$record['sourceDComplianceSwitch'],
                                                    'selectedDataSetTab'=>$record['selectedDataSetTab'],
                                                    'selectedCheckCase'=>$record['selectedCheckCase']);
                    break;
                }
            }

            // // commit update
            // $dbh->commit();
            // $dbh = null; //This is how you close a PDO connection    
        }
        catch(Exception $e) 
        {        
            return NULL;
        } 

        return $checkModuleControlsState;
    }

    function  CopyCheckReferences($fromDbh, $toDbh, $tableName)
    {     
        $results = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($results)
        {

            $command = 'DROP TABLE IF EXISTS '.$tableName.';';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE '.$tableName.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                webAddress TEXT,
                document TEXT,
                pic TEXT,
                comment TEXT,
                component INTEGER NOT NULL    
              )';         
            $toDbh->exec($command);  
    
            $insertStmt = $toDbh->prepare("INSERT INTO ".$tableName."(id, webAddress, document, pic, comment,
            component) VALUES(?,?,?,?,?,?)");            

            while ($row = $results->fetch(\PDO::FETCH_ASSOC)) 
            {  
                $insertStmt->execute(array($row['id'], 
                                    $row['webAddress'], 
                                    $row['document'],
                                    $row['pic'], 
                                    $row['comment'], 
                                    $row['component']));
            }   
        }     
    }

    function  CopyCheckStatistics($fromDbh, $toDbh)
    {     
        $results = $fromDbh->query("SELECT * FROM CheckStatistics");
        if($results)
        {

            $command = 'DROP TABLE IF EXISTS CheckStatistics;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE IF NOT EXISTS CheckStatistics(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        comparisonOK TEXT ,
                        comparisonError TEXT ,
                        comparisonWarning TEXT ,
                        comparisonNoMatch TEXT ,
                        comparisonUndefined TEXT ,
                        comparisonCheckGroupsInfo TEXT ,
                        sourceAComplianceOK TEXT ,
                        sourceAComplianceError TEXT ,
                        sourceAComplianceWarning TEXT ,
                        sourceAComplianceCheckGroupsInfo TEXT ,
                        sourceBComplianceOK TEXT ,
                        sourceBComplianceError TEXT ,
                        sourceBComplianceWarning TEXT ,
                        sourceBComplianceCheckGroupsInfo TEXT )'; 
            $toDbh->exec($command);  
    
            $insertStmt = $toDbh->prepare("INSERT INTO CheckStatistics(id, comparisonOK, comparisonError, comparisonWarning, comparisonNoMatch,
            comparisonUndefined,comparisonCheckGroupsInfo, sourceAComplianceOK, sourceAComplianceError, sourceAComplianceWarning, sourceAComplianceCheckGroupsInfo,
            sourceBComplianceOK, sourceBComplianceError, sourceBComplianceWarning, sourceBComplianceCheckGroupsInfo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"); 

           

            while ($row = $results->fetch(\PDO::FETCH_ASSOC)) 
            {  
                $insertStmt->execute(array($row['id'], 
                                    $row['comparisonOK'], 
                                    $row['comparisonError'],
                                    $row['comparisonWarning'], 
                                    $row['comparisonNoMatch'], 
                                    $row['comparisonUndefined'],
                                    $row['comparisonCheckGroupsInfo'], 
                                    $row['sourceAComplianceOK'], 
                                    $row['sourceAComplianceError'],
                                    $row['sourceAComplianceWarning'], 
                                    $row['sourceAComplianceCheckGroupsInfo'], 
                                    $row['sourceBComplianceOK'],
                                    $row['sourceBComplianceError'], 
                                    $row['sourceBComplianceWarning'],
                                    $row['sourceBComplianceCheckGroupsInfo']));
            }   
        }     
    }

    function CopySourceDComplianceCheckGroups($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM SourceDComplianceCheckGroups");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckGroups;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceDComplianceCheckGroups(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $toDbh->exec($command);  

            $insertStmt = $toDbh->prepare("INSERT INTO SourceDComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['componentClass'], 
                                        $row['componentCount'], 
                                        $row['categoryStatus']));
            }   
        }
    }

    function CopySourceDComplianceCheckComponents($fromDbh, $toDbh)
    {  
        $selectResults = $fromDbh->query("SELECT * FROM SourceDComplianceCheckComponents");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckComponents;';
            $toDbh->exec($command);    
            $command = 'CREATE TABLE SourceDComplianceCheckComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,  
                mainComponentClass TEXT,              
                subComponentClass TEXT,
                status TEXT,
                accepted TEXT,
                nodeId TEXT,
                sourceId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceDComplianceCheckComponents(id, name, mainComponentClass, subComponentClass, status,
                                        accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['mainComponentClass'],
                                        $row['subComponentClass'],
                                        $row['status'], 
                                        $row['accepted'], 
                                        $row['nodeId'], 
                                        $row['sourceId'], 
                                        $row['ownerGroup']));
            }   
        }  
    }

    function CopySourceDComplianceCheckProperties($fromDbh, $toDbh)
    {   
        $selectResults = $fromDbh->query("SELECT * FROM SourceDComplianceCheckProperties");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckProperties;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceDComplianceCheckProperties(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,              
                value TEXT,
                result TEXT,
                severity TEXT,
                accepted TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL,
                rule TEXT)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceDComplianceCheckProperties(id, name, value, result,
                                        severity, accepted, performCheck, description, ownerComponent, rule) VALUES(?,?,?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['value'],
                                        $row['result'], 
                                        $row['severity'], 
                                        $row['accepted'], 
                                        $row['performCheck'], 
                                        $row['description'], 
                                        $row['ownerComponent'],
                                        $row['rule']));
            }   
        }
    }

    function CopySourceCComplianceCheckGroups($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM SourceCComplianceCheckGroups");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckGroups;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceCComplianceCheckGroups(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $toDbh->exec($command);  

            $insertStmt = $toDbh->prepare("INSERT INTO SourceCComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['componentClass'], 
                                        $row['componentCount'], 
                                        $row['categoryStatus']));
            }   
        }
    }

    function CopySourceCComplianceCheckComponents($fromDbh, $toDbh)
    {  
        $selectResults = $fromDbh->query("SELECT * FROM SourceCComplianceCheckComponents");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckComponents;';
            $toDbh->exec($command);    
            $command = 'CREATE TABLE SourceCComplianceCheckComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,   
                mainComponentClass TEXT,              
                subComponentClass TEXT,
                status TEXT,
                accepted TEXT,
                nodeId TEXT,
                sourceId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceCComplianceCheckComponents(id, name, mainComponentClass, subComponentClass, status,
                                        accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['mainComponentClass'],
                                        $row['subComponentClass'],
                                        $row['status'], 
                                        $row['accepted'], 
                                        $row['nodeId'], 
                                        $row['sourceId'], 
                                        $row['ownerGroup']));
            }   
        }  
    }

    function CopySourceCComplianceCheckProperties($fromDbh, $toDbh)
    {   
        $selectResults = $fromDbh->query("SELECT * FROM SourceCComplianceCheckProperties");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckProperties;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceCComplianceCheckProperties(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,              
                value TEXT,
                result TEXT,
                severity TEXT,
                accepted TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL,
                rule TEXT)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceCComplianceCheckProperties(id, name, value, result,
                                        severity, accepted, performCheck, description, ownerComponent, rule) VALUES(?,?,?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['value'],
                                        $row['result'], 
                                        $row['severity'], 
                                        $row['accepted'], 
                                        $row['performCheck'], 
                                        $row['description'], 
                                        $row['ownerComponent'],
                                        $row['rule']));
            }   
        }
    }

    function CopySourceBComplianceCheckGroups($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM SourceBComplianceCheckGroups");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckGroups;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceBComplianceCheckGroups(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $toDbh->exec($command);  

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['componentClass'], 
                                        $row['componentCount'], 
                                        $row['categoryStatus']));
            }   
        }
    }

    function CopySourceBComplianceCheckComponents($fromDbh, $toDbh)
    {  
        $selectResults = $fromDbh->query("SELECT * FROM SourceBComplianceCheckComponents");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckComponents;';
            $toDbh->exec($command);    
            $command = 'CREATE TABLE SourceBComplianceCheckComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,  
                mainComponentClass TEXT,               
                subComponentClass TEXT,
                status TEXT,
                accepted TEXT,
                nodeId TEXT,
                sourceId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckComponents(id, name, mainComponentClass, subComponentClass, status,
                                        accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['mainComponentClass'],
                                        $row['subComponentClass'],
                                        $row['status'], 
                                        $row['accepted'], 
                                        $row['nodeId'], 
                                        $row['sourceId'], 
                                        $row['ownerGroup']));
            }   
        }  
    }

    function CopySourceBComplianceCheckProperties($fromDbh, $toDbh)
    {   
        $selectResults = $fromDbh->query("SELECT * FROM SourceBComplianceCheckProperties");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckProperties;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceBComplianceCheckProperties(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,              
                value TEXT,
                result TEXT,
                severity TEXT,
                accepted TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL,
                rule TEXT)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckProperties(id, name, value, result,
                                        severity, accepted, performCheck, description, ownerComponent, rule) VALUES(?,?,?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['value'],
                                        $row['result'], 
                                        $row['severity'], 
                                        $row['accepted'], 
                                        $row['performCheck'], 
                                        $row['description'], 
                                        $row['ownerComponent'],
                                        $row['rule']));
            }   
        }
    }

    function CopySourceAComplianceCheckGroups($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM SourceAComplianceCheckGroups");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckGroups;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceAComplianceCheckGroups(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $toDbh->exec($command);  

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['componentClass'], 
                                        $row['componentCount'],
                                        $row['categoryStatus']));
            }   
        }
    }

    function CopySourceAComplianceCheckComponents($fromDbh, $toDbh)
    {  
        $selectResults = $fromDbh->query("SELECT * FROM SourceAComplianceCheckComponents");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckComponents;';
            $toDbh->exec($command);   
            $command = 'CREATE TABLE SourceAComplianceCheckComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,
                mainComponentClass TEXT,       
                subComponentClass TEXT,
                status TEXT,
                accepted TEXT,
                nodeId TEXT,
                sourceId INTEGER,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckComponents(id, name, mainComponentClass, subComponentClass, status, accepted,
                                        nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['mainComponentClass'],
                                        $row['subComponentClass'],
                                        $row['status'], 
                                        $row['accepted'], 
                                        $row['nodeId'], 
                                        $row['sourceId'], 
                                        $row['ownerGroup']));
            }   
        }  
    }

    function CopySourceAComplianceCheckProperties($fromDbh, $toDbh)
    {   
        $selectResults = $fromDbh->query("SELECT * FROM SourceAComplianceCheckProperties");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckProperties;';
            $toDbh->exec($command);   
            $command = 'CREATE TABLE SourceAComplianceCheckProperties(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,              
                value TEXT,
                result TEXT,
                severity TEXT,
                accepted TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL,
                rule TEXT)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckProperties(id, name, value, result,
                                        severity, accepted, performCheck, description, ownerComponent, rule) VALUES(?,?,?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['value'],
                                        $row['result'], 
                                        $row['severity'], 
                                        $row['accepted'],
                                        $row['performCheck'], 
                                        $row['description'], 
                                        $row['ownerComponent'],
                                        $row['rule']));
            }   
        }
    }

    function   CopyNotMatchedComponentsToCheckSpaceDB($fromDbh, $toDbh, $tableName)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($selectResults) 
        {

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '.$tableName.';';
            $toDbh->exec($command);

            $command = 'CREATE TABLE '.$tableName.'(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    name TEXT,
                    mainClass TEXT,
                    subClass TEXT,
                    nodeId TEXT,
                    mainTableId TEXT)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare('INSERT INTO '.$tableName.'(id, name, mainClass, subClass, nodeId, mainTableId) VALUES(?, ?, ?, ?, ?, ?) ');                                        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                            $row['name'], 
                                            $row['mainClass'],
                                            $row['subClass'], 
                                            $row['nodeId'], 
                                            $row['mainTableId']));
            }      
        }
    }

    function CopyComparisonCheckComponents($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ComparisonCheckComponents");
        if($selectResults) 
        {
            // create table
            $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
            $toDbh->exec($command); 
            // $command = 'CREATE TABLE ComparisonCheckComponents(
            //     id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            //     sourceAName TEXT,
            //     sourceBName TEXT,
            //     sourceCName TEXT,
            //     sourceDName TEXT,
            //     sourceASubComponentClass TEXT,
            //     sourceBSubComponentClass TEXT,
            //     status TEXT,
            //     accepted TEXT,
            //     sourceANodeId TEXT,
            //     sourceBNodeId TEXT,
            //     sourceAId TEXT,
            //     sourceBId TEXT,
            //     ownerGroup INTEGER NOT NULL,
            //     transpose TEXT)'; 
            $command = CREATE_COMPARISONCOMPONETS_TABLE;
            $toDbh->exec($command);    
        
            // $insertStmt = $toDbh->prepare("INSERT INTO ComparisonCheckComponents(id, 
            //             sourceAName, 
            //             sourceBName, 
            //             sourceASubComponentClass, 
            //             sourceBSubComponentClass,
            //             status, 
            //             accepted, 
            //             sourceANodeId, 
            //             sourceBNodeId, 
            //             sourceAId,
            //             sourceBId,
            //             ownerGroup, 
            //             transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
            $insertStmt = $toDbh->prepare(INSERT_ALLCOMPARISONCOMPONETSWITHID_TABLE);
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                    $row['sourceAName'], 
                                    $row['sourceBName'],
                                    $row['sourceCName'], 
                                    $row['sourceDName'],
                                    $row['sourceAMainClass'], 
                                    $row['sourceBMainClass'],
                                    $row['sourceCMainClass'], 
                                    $row['sourceDMainClass'], 
                                    $row['sourceASubComponentClass'], 
                                    $row['sourceBSubComponentClass'],
                                    $row['sourceCSubComponentClass'], 
                                    $row['sourceDSubComponentClass'], 
                                    $row['status'], 
                                    $row['accepted'], 
                                    $row['sourceANodeId'],
                                    $row['sourceBNodeId'], 
                                    $row['sourceCNodeId'],
                                    $row['sourceDNodeId'], 
                                    $row['sourceAId'],
                                    $row['sourceBId'], 
                                    $row['sourceCId'],
                                    $row['sourceDId'],
                                    $row['ownerGroup'],
                                    $row['transpose'],
                                    $row['classMappingInfo']));
            }                    
        } 
    }

    function CopyComparisonCheckProperties($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ComparisonCheckProperties");
        if($selectResults) 
        {
            // create table
            $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
            $toDbh->exec($command); 
    
            $command = CREATE_COMPARISONPROPERTIES_TABLE; 
            $toDbh->exec($command);             
            
            $insertStmt = $toDbh->prepare(INSERT_ALLCOMPARISONPROPERTIESWITHID_TABLE);        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['sourceAName'], 
                                        $row['sourceBName'],
                                        $row['sourceCName'], 
                                        $row['sourceDName'],
                                        $row['sourceAValue'], 
                                        $row['sourceBValue'], 
                                        $row['sourceCValue'], 
                                        $row['sourceDValue'], 
                                        $row['result'],
                                        $row['severity'], 
                                        $row['accepted'], 
                                        $row['performCheck'], 
                                        $row['description'],
                                        $row['ownerComponent'],
                                        $row['transpose']));
            }                    
        }  
    }

    function CopyComparisonCheckGroups($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ComparisonCheckGroups");
        if($selectResults) 
        {
            // create table
            $command = 'DROP TABLE IF EXISTS ComparisonCheckGroups;';
            $toDbh->exec($command);    
            $command = 'CREATE TABLE ComparisonCheckGroups(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $toDbh->exec($command);    
            
            $insertStmt = $toDbh->prepare("INSERT INTO ComparisonCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], $row['componentClass'], $row['componentCount'], $row['categoryStatus']));
            }                    
        }      
    }

    function CopyNotSelectedComponentsToCheckSpaceDB($fromDbh, $toDbh, $tableName)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS '.$tableName.';';
            $toDbh->exec($command); 
            $command = 'CREATE TABLE '.$tableName.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,
                mainClass TEXT,
                subClass TEXT,
                nodeId TEXT,
                mainTableId TEXT)'; 
            $toDbh->exec($command);  
            
            $insertStmt = $toDbh->prepare("INSERT INTO ".$tableName."(id, name, mainClass, subClass, nodeId ,mainTableId) VALUES(?,?,?,?,?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['mainClass'],
                                        $row['subClass'], 
                                        $row['nodeId'], 
                                        $row['mainTableId']));
            } 
        }
    }

    function CopySelectedComponentsToCheckSpaceDB($fromDbh, $toDbh, $tableName)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($selectResults) 
        {
            // create table
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '.$tableName. ';';
            $toDbh->exec($command);

            $command = 'CREATE TABLE '. $tableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT NOT NULL,
                mainClass TEXT,
                subClass TEXT,
                nodeId INTEGER,
                mainComponentId INTEGER,
                componentId INTEGER
                )';         
            $toDbh->exec($command);   
            
            $insertStmt = $toDbh->prepare("INSERT INTO ". $tableName. "(id, name, mainClass, subClass, 
                        nodeId, mainComponentId, componentId) VALUES(?,?,?,?,?,?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['mainClass'],
                                        $row['subClass'], 
                                        $row['nodeId'], 
                                        $row['mainComponentId'],
                                        $row['componentId']));
            }                    
        }  
    }

    function CopyVieweroptions($fromDbh, $toDbh, $tableName)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($selectResults) 
        {
            // create table
            // drop table if exists
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS '.$tableName. ';';
        $toDbh->exec($command);

        $command = 'CREATE TABLE '.$tableName.'(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    endpointUri TEXT)';            
        $toDbh->exec($command);  

        $insertStmt = $toDbh->prepare('INSERT INTO '.$tableName.'(id, endpointUri) VALUES(?,?) ');                                        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'],                                        
                                        $row['endpointUri']));
            }           
        }
    }

    function CopyDataSourceInfoToCheckSpaceDB($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM DatasourceInfo;");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS DatasourceInfo;';
            $toDbh->exec($command);      
            $command = 'CREATE TABLE DatasourceInfo(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        sourceAFileName TEXT,
                        sourceBFileName TEXT,
                        sourceCFileName TEXT,
                        sourceDFileName TEXT,
                        sourceAType TEXT,
                        sourceBType TEXT,
                        sourceCType TEXT,
                        sourceDType TEXT,
                        orderMaintained Text)';         
            $toDbh->exec($command);      
            
            $insertStmt = $toDbh->prepare("INSERT INTO DatasourceInfo(id, sourceAFileName, sourceBFileName, 
            sourceCFileName, sourceDFileName, sourceAType, sourceBType , sourceCType, sourceDType , orderMaintained) VALUES(?,?,?,?,?,?,?,?,?,?)");    
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['sourceAFileName'], 
                                        $row['sourceBFileName'],
                                        $row['sourceCFileName'], 
                                        $row['sourceDFileName'],
                                        $row['sourceAType'], 
                                        $row['sourceBType'], 
                                        $row['sourceCType'], 
                                        $row['sourceDType'],
                                        $row['orderMaintained']));
            } 
        }
    }

    function CopyCheckModuleControlsStateToCheckSpaceDB($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM CheckModuleControlsState;");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS CheckModuleControlsState;';
            $toDbh->exec($command); 
            $command = 'CREATE TABLE CheckModuleControlsState(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        comparisonSwith TEXT,
                        sourceAComplianceSwitch TEXT,
                        sourceBComplianceSwitch TEXT,
                        sourceCComplianceSwitch TEXT,
                        sourceDComplianceSwitch TEXT,
                        selectedDataSetTab TEXT,
                        selectedCheckCase TEXT)';         
            $toDbh->exec($command);    
            
            $insertStmt = $toDbh->prepare("INSERT INTO CheckModuleControlsState(id, comparisonSwith, sourceAComplianceSwitch, sourceBComplianceSwitch, 
            sourceCComplianceSwitch ,sourceDComplianceSwitch, selectedDataSetTab ,selectedCheckCase) VALUES(?,?,?,?,?,?,?,?)");    
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['comparisonSwith'], 
                                        $row['sourceAComplianceSwitch'],
                                        $row['sourceBComplianceSwitch'], 
                                        $row['sourceCComplianceSwitch'], 
                                        $row['sourceDComplianceSwitch'],
                                        $row['selectedDataSetTab'],
                                        $row['selectedCheckCase']));
            } 
        }
    }

    function CopyCheckCaseInfo($dbh, $tempDbh)
    {
        $selectResults = $dbh->query("SELECT * FROM CheckCaseInfo");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS CheckCaseInfo;';
            $tempDbh->exec($command);

            $command = 'CREATE TABLE CheckCaseInfo(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        checkCaseData TEXT)';         
            $tempDbh->exec($command);      

            $insertStmt = $tempDbh->prepare("INSERT INTO CheckCaseInfo(id, checkCaseData) VALUES(?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['checkCaseData']));
            }  
        }
    }

    function CopyComponents( $dbh, $tempDbh, $componentTable, $propertiesTable)
    {
        $selectResults = $dbh->query("SELECT * FROM ".$componentTable.";");  
        if($selectResults) 
        {

            // create table
            $command = 'DROP TABLE IF EXISTS '.$componentTable.';';
            $tempDbh->exec($command);    

            // ischecked can have values 'true' or 'false'
            $command = 'CREATE TABLE '.$componentTable.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT NOT NULL,
                mainclass TEXT,
                subclass TEXT,
                nodeid INTEGER,
                ischecked TEXT,
                parentid INTEGER,
                componentid INTEGER
            )';         
            $tempDbh->exec($command);    

            $insertComponentStmt = $tempDbh->prepare("INSERT INTO ".$componentTable."(id, name, mainclass, subclass, nodeid, 
                        ischecked, parentid, componentid) VALUES(?,?,?,?,?,?,?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertComponentStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['mainclass'],
                                        $row['subclass'], 
                                        $row['nodeid'], 
                                        $row['ischecked'],
                                        $row['parentid'],
                                        $row['componentid']));
            }  
            
            // save properties
            $selectPropertiesResults = $dbh->query("SELECT * FROM ".$propertiesTable.";");  
            if($selectPropertiesResults) 
            {
                // create table
                $command = 'DROP TABLE IF EXISTS '.$propertiesTable.';';
                $tempDbh->exec($command);    

                // create properties table
                $command = 'CREATE TABLE '.$propertiesTable.'(
                            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                            name TEXT NOT NULL,
                            format TEXT,
                            value TEXT,                
                            ownercomponent INTEGER NOT NULL,
                            userdefined INTEGER default 0              
                )';         
                $tempDbh->exec($command);  
                
                $insertPropertiesStmt = $tempDbh->prepare("INSERT INTO  ".$propertiesTable."(id, name, format, value, 
                        ownercomponent, userdefined) VALUES(?,?,?,?,?,?)");
        
        
                while ($row = $selectPropertiesResults->fetch(\PDO::FETCH_ASSOC)) 
                {           
                    $insertPropertiesStmt->execute(array($row['id'], 
                                            $row['name'], 
                                            $row['format'],
                                            $row['value'], 
                                            $row['ownercomponent'],
                                            $row['userdefined']));
                }  
            }
        }     
    
    }

    function ReadAllSavedDatasets()
    {
        if (
            !isset($_POST['ProjectName']) ||
            !isset($_POST['CheckName'])
        )
        {
            echo json_encode(array(
                "Msg" =>  "Invalid input.",
                "MsgCode" => 0
            ));
            return;
        }

        // get project name       
        $projectName = $_POST["ProjectName"];
        $checkName = $_POST['CheckName'];

        $results = array();
        try
        {
            // project DB
            $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
            if (!file_exists($dbPath))
            {
                echo json_encode(array(
                    "Msg" =>  "Saved data not found",
                    "MsgCode" => 0
                ));
                return;
            }
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

            // begin the transaction
            $dbh->beginTransaction();

            $allComponents = ReadAllComponents($dbh, "AllComponentsa");
            if ($allComponents != NULL)
            {
                $results["a"] =  json_decode($allComponents,true);
            }
            $allComponents = ReadAllComponents($dbh, "AllComponentsb");
            if ($allComponents != NULL)
            {
                $results["b"] = json_decode($allComponents,true);
            }
            $allComponents = ReadAllComponents($dbh, "AllComponentsc");
            if ($allComponents != NULL)
            {
                $results["c"] = json_decode($allComponents,true);
            }
            $allComponents = ReadAllComponents($dbh, "AllComponentsd");
            if ($allComponents != NULL)
            {
                $results["d"] = json_decode($allComponents,true);
            }

            // now read all datasource info
            // read datasource info
            $datasourceInfo = readDataSourceInfo($dbh);
            if (
                $datasourceInfo != NULL &&
                (array_key_exists("a",  $results) ||
                array_key_exists("b",  $results) ||
                array_key_exists("c",  $results) ||
                array_key_exists("d",  $results))
            )
            {
                $results['sourceInfo'] = $datasourceInfo;
            }

            // commit changes
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection     
        }
        catch (Exception $e)
        {
            echo json_encode(array(
                "Msg" =>  "Failed",
                "MsgCode" => 0
            ));
            return;
        }

        echo json_encode(array(
            "Msg" =>  "success",
            "Data" => $results,
            "MsgCode" => 1
        ));
        return;
    }