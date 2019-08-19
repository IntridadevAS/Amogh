<?php
             class CheckComponentGroup
            {
                var $ComponentClass;        
                var $Components = array();
            
                function __construct( $par1 ) 
                {
                    $this->ComponentClass = $par1;
                }
            
                function AddCheckComponent($Component)
                {
                    array_push($this->Components, $Component);
                }
            }

            class CheckComponent
            {
                var $SourceAName;
                var $SourceBName;
                var $SourceASubComponentClass;
                var $SourceBSubComponentClass;
            
                var $Status;
                var $CheckProperties;
            
                var $SourceANodeId;
                var $SourceBNodeId;
            
                function __construct( $sourceAName,
                                    $sourceBName,
                                    $sourceASubComponentClass,
                                    $sourceBSubComponentClass,
                                    $sourceANodeId,
                                    $sourceBNodeId ) 
                {
                    $this->SourceAName = $sourceAName;
                    $this->SourceBName = $sourceBName; 
                    $this->SourceASubComponentClass = $sourceASubComponentClass;
                    $this->SourceBSubComponentClass = $sourceBSubComponentClass;
            
                    $this->Status = "OK";
                    $this->CheckProperties = array();
            
                    $this->SourceANodeId = $sourceANodeId;
                    $this->SourceBNodeId = $sourceBNodeId;
                }
            
                function AddCheckProperty($property){
                    array_push($this->CheckProperties, $property);
            
                    if(!$property->PerformCheck)
                    {
                        if(strtolower($property->Severity) == strtolower("Error"))
                        {
                            $this->Status = "Error";
                        }
                    }
                    else{
                        if(!$property->Result)
                        {
                            if(strtolower($property->Severity) == strtolower("Error"))
                            {
                                $this->Status = "Error";
                            }
                            else if(strtolower($property->Severity) == strtolower("Warning") &&
                                    strtolower($this->Status) != strtolower("Error")){
                                        $this->Status = "Warning";
                            }
                        }
                    }
                }                      
            }
        
            class CheckProperty
            {
            
                var $SourceAName;
                var $SourceAValue ;
                var $SourceBName ;
                var $SourceBValue ;
                var $Result;
                var $Severity;
                var $PerformCheck;
                var $Description;
            
                function __construct( $sourceAName,
                                        $sourceAValue,
                                        $sourceBName,
                                        $sourceBValue,
                                        $severity,
                                        $performCheck,
                                        $description ) 
                    {
                        $this->SourceAName = $sourceAName;
                        $this->SourceAValue = $sourceAValue;
                        $this->SourceBName = $sourceBName;
                        $this->SourceBValue = $sourceBValue;
                        $this->Result = $sourceAValue == $sourceBValue;
                        $this->Severity = $severity;
                        $this->PerformCheck = $performCheck;
                        $this->Description = $description;
                    }     
                    
            }

?>