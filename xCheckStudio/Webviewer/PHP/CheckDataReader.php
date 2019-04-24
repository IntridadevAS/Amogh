<?php
        include 'Utility.php';

        // if(!isset($_POST['ResultType']))
        // {
        //     echo 'fail';
        //     return;    
        // }

        session_start();
            
        // get project name
        $projectName = NULL;
        if(isset($_SESSION['projectname']))
        {
            $projectName =  $_SESSION['projectname'];              
        }
        else
        {
            echo 'fail';
            return;              
        }	

        $comparisonResult = readComparisonCheckData();

        $sourceAComplianceResult = readComplianceCheckData('SourceAComplianceCheckGroups',
                                                            'SourceAComplianceCheckComponents',
                                                            'SourceAComplianceCheckProperties');
        $sourceBComplianceResult = readComplianceCheckData('SourceBComplianceCheckGroups',
                                                           'SourceBComplianceCheckComponents',
                                                           'SourceBComplianceCheckProperties');

        $results = array();
        if($comparisonResult != NULL)
        {
            $results['Comparison'] = $comparisonResult;
        }
        
        if($sourceAComplianceResult != NULL)
        {
            $results['SourceACompliance'] = $sourceAComplianceResult;
        }                    

        if($sourceBComplianceResult != NULL)
        {
            $results['SourceBCompliance'] = $sourceAComplianceResult;
        }

        echo json_encode($results);

        //$ResultType = $_POST['ResultType'];
        // if($ResultType == 'Comparison')
        // {
        //     readComparisonCheckData();
        // }
        // else if($ResultType == 'SourceACompliance')
        // {
        //     readComplianceCheckData('SourceAComplianceCheckGroups',
        //                             'SourceAComplianceCheckComponents',
        //                             'SourceAComplianceCheckProperties');
        // }
        // else if($ResultType == 'SourceBCompliance')
        // {
        //     readComplianceCheckData('SourceBComplianceCheckGroups',
        //                             'SourceBComplianceCheckComponents',
        //                             'SourceBComplianceCheckProperties');
        // }
        // else
        // {
        //     echo 'fail';
        //     return;              
        // }	

        function readComplianceCheckData($checkGroupTable,
                                         $CheckComponentsTable,
                                         $CheckPropertiesTable)
        {
            global $projectName;
            
            try
            {   
                // open database
                $dbPath = getProjectDatabasePath($projectName);
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
   
                // begin the transaction
                $dbh->beginTransaction();

                // get comparison check data
                $result = readComplianceCheckResults($dbh, 
                                            $checkGroupTable,
                                            $CheckComponentsTable,
                                            $CheckPropertiesTable);
                // if(result == N)
                // {
                //     //echo "success"; 
                // }
                // else 
                // {
                //     echo "fail"; 
                // }

                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection

                return $result;
            }                
            catch(Exception $e) 
            {        
                echo "fail"; 
                return NULL;
            }    
            
            return NULL;
        }

        
        function readComparisonCheckData()
        {
            global $projectName;
            
            try
            {   
                // open database
                $dbPath = getProjectDatabasePath($projectName);
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
   
                // begin the transaction
                $dbh->beginTransaction();

                // get comparison check data
                $result = readComparisonCheckResults($dbh);
                // if(readComparisonCheckResults($dbh))
                // {
                //     //echo "success"; 
                // }
                // else 
                // {
                //     echo "fail"; 
                // }

                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection

                return $result;
            }                
            catch(Exception $e) 
            {        
                echo "fail"; 
                return NULL;
            }   
            
            return NULL;
        }

        function readComplianceCheckResults($dbh,
                                            $checkGroupTable,
                                            $CheckComponentsTable,
                                            $CheckPropertiesTable)
        {
            $complianceComponentGroups = array();
            // $complianceComponents = array();
            // $complianceProperties = array();

            // read components groups
            $checkGroupResults = $dbh->query("SELECT *FROM $checkGroupTable;");
            if($checkGroupResults) 
            {
               
                while ($groupRow = $checkGroupResults->fetch(\PDO::FETCH_ASSOC)) 
                {
                    
                    $complianceComponentGroups[$groupRow['id']] = array('id'=>$groupRow['id'], 
                                                                  'componentClass'=>$groupRow['componentClass'],  
                                                                  'componentCount'=>$groupRow['componentCount']); 
                    
                    $groupId = $groupRow['id'];
                    // read components                                                                  
                    $checkComponentsResults = $dbh->query("SELECT *FROM $CheckComponentsTable where ownerGroup= $groupId;");
                    if($checkComponentsResults) 
                    {
                        $components =array();
                        while ($componentRow = $checkComponentsResults->fetch(\PDO::FETCH_ASSOC)) 
                        {
                            $componentValues = array('id'=>$componentRow['id'], 
                                            'name'=>$componentRow['name'],                                              
                                            'subComponentClass'=>$componentRow['subComponentClass'],
                                            'status'=>$componentRow['status'],
                                            'nodeId'=>$componentRow['nodeId'],
                                            'ownerGroup'=>$componentRow['ownerGroup']);                                                         

                            $componentId = $componentRow['id'];
                             // read properties                                                                  
                            $checkPropertiesResults = $dbh->query("SELECT *FROM $CheckPropertiesTable where ownerComponent=$componentId;");
                            if($checkPropertiesResults) 
                            {
                                $properties =array();
                                while ($propertyRow = $checkPropertiesResults->fetch(\PDO::FETCH_ASSOC)) 
                                {

                                    $propertyValues = array('id'=>$propertyRow['id'], 
                                                            'name'=>$propertyRow['name'],  
                                                            'value'=>$propertyRow['value'],                                                            
                                                            'result'=>$propertyRow['result'],
                                                            'severity'=>$propertyRow['severity'],
                                                            'performCheck'=>$propertyRow['performCheck'],
                                                            'description'=>$propertyRow['description'],
                                                            'ownerComponent'=>$propertyRow['ownerComponent']); 
                    
                                    array_push($properties, $propertyValues);

                                }
                               
                                $componentValues["properties"] = $properties;
                            }
                            else
                            {
                                // ComparisonCheckProperties table doesn't exist
                                return NULL;
                                //return false;
                            }

                            $components[ $componentId ] =  $componentValues;                           
                        }

                         $complianceComponentGroups[$groupRow['id']]['components'] = $components;
                    }
                    else
                    {
                        // ComparisonCheckComponents table doesn't exist
                        return NULL;
                        //return false;
                    }
                }             
       
                return $complianceComponentGroups;              
                //return true;
            }
            else
            {
                // ComparisonCheckGroups table doesn't exist
                return NULL;
                //return false;
            }

            return NULL;
            //return false;
        }

        function readComparisonCheckResults($dbh)
        {
            $comparisonComponentGroups = array();
            // $comparisonComponents = array();
            // $comparisonProperties = array();

            // read components groups
            $checkGroupResults = $dbh->query("SELECT *FROM ComparisonCheckGroups;");
            if($checkGroupResults) 
            {
               
                while ($groupRow = $checkGroupResults->fetch(\PDO::FETCH_ASSOC)) 
                {
                    
                    $comparisonComponentGroups[$groupRow['id']] = array('id'=>$groupRow['id'], 
                                                                  'componentClass'=>$groupRow['componentClass'],  
                                                                  'componentCount'=>$groupRow['componentCount']); 
                    
                    $groupId = $groupRow['id'];
                    // read components                                                                  
                    $checkComponentsResults = $dbh->query("SELECT *FROM ComparisonCheckComponents where ownerGroup= $groupId;");
                    if($checkComponentsResults) 
                    {
                        $components =array();
                        while ($componentRow = $checkComponentsResults->fetch(\PDO::FETCH_ASSOC)) 
                        {
                            $componentValues = array('id'=>$componentRow['id'], 
                                            'sourceAName'=>$componentRow['sourceAName'],  
                                            'sourceBName'=>$componentRow['sourceBName'],
                                            'subComponentClass'=>$componentRow['subComponentClass'],
                                            'status'=>$componentRow['status'],
                                            'sourceANodeId'=>$componentRow['sourceANodeId'],
                                            'sourceBNodeId'=>$componentRow['sourceBNodeId'],
                                            'ownerGroup'=>$componentRow['ownerGroup']);                                                         

                            $componentId = $componentRow['id'];
                             // read properties                                                                  
                            $checkPropertiesResults = $dbh->query("SELECT *FROM ComparisonCheckProperties where ownerComponent=$componentId;");
                            if($checkPropertiesResults) 
                            {
                                $properties =array();
                                while ($propertyRow = $checkPropertiesResults->fetch(\PDO::FETCH_ASSOC)) 
                                {

                                    $propertyValues = array('id'=>$propertyRow['id'], 
                                                            'sourceAName'=>$propertyRow['sourceAName'],  
                                                            'sourceBName'=>$propertyRow['sourceBName'],
                                                            'sourceAValue'=>$propertyRow['sourceAValue'],
                                                            'sourceBValue'=>$propertyRow['sourceBValue'],
                                                            'result'=>$propertyRow['result'],
                                                            'severity'=>$propertyRow['severity'],
                                                            'performCheck'=>$propertyRow['performCheck'],
                                                            'description'=>$propertyRow['description'],
                                                            'ownerComponent'=>$propertyRow['ownerComponent']); 
                    
                                    array_push($properties, $propertyValues);

                                }

                                $componentValues["properties"] = $properties;
                            }
                            else
                            {
                                // ComparisonCheckProperties table doesn't exist
                                return NULL;
                                //return false;
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
            else
            {
                // ComparisonCheckGroups table doesn't exist
                return NULL;
                //return false;
            }

            return NULL;
            //return false;
        }
?>