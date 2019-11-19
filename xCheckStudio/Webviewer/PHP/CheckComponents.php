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
                var $SourceCName;
                var $SourceDName;

                var $SourceASubComponentClass;
                var $SourceBSubComponentClass;
                var $SourceCSubComponentClass;
                var $SourceDSubComponentClass;

                var $Status;
                var $CheckProperties;
            
                var $SourceANodeId;
                var $SourceBNodeId;
                var $SourceCNodeId;
                var $SourceDNodeId;

                var $SourceAId;
                var $SourceBId;
                var $SourceCId;
                var $SourceDId;
            
                function __construct($sourceAName,
                                     $sourceBName,
                                     $sourceCName,
                                     $sourceDName,
                                     $sourceASubComponentClass,
                                     $sourceBSubComponentClass,
                                     $sourceCSubComponentClass,
                                     $sourceDSubComponentClass,
                                     $sourceANodeId,
                                     $sourceBNodeId,
                                     $sourceCNodeId,
                                     $sourceDNodeId,
                                     $sourceAId,
                                     $sourceBId,
                                     $sourceCId,
                                     $sourceDId ) 
                {
                    $this->SourceAName = $sourceAName;
                    $this->SourceBName = $sourceBName; 
                    $this->SourceCName = $sourceCName;
                    $this->SourceDName = $sourceDName; 

                    $this->SourceASubComponentClass = $sourceASubComponentClass;
                    $this->SourceBSubComponentClass = $sourceBSubComponentClass;
                    $this->SourceCSubComponentClass = $sourceCSubComponentClass;
                    $this->SourceDSubComponentClass = $sourceDSubComponentClass;

                    $this->Status = "OK";
                    $this->CheckProperties = array();
            
                    $this->SourceANodeId = $sourceANodeId;
                    $this->SourceBNodeId = $sourceBNodeId;
                    $this->SourceCNodeId = $sourceCNodeId;
                    $this->SourceDNodeId = $sourceDNodeId;

                    $this->SourceAId = $sourceAId;
                    $this->SourceBId = $sourceBId;
                    $this->SourceCId = $sourceCId;
                    $this->SourceDId = $sourceDId;
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
                var $SourceCName;
                var $SourceCValue ;
                var $SourceDName ;
                var $SourceDValue ;

                var $Result;
                var $Severity;
                var $PerformCheck;
                var $Description;
                var $Rule;
            
                function __construct( $sourceAValue,
                                      $sourceBName,
                                      $sourceBValue,
                                      $sourceCName,
                                      $sourceCValue,
                                      $sourceDName,
                                      $sourceDValue,
                                      $severity,
                                      $performCheck,
                                      $description ,
                                      $rule) 
                    {
                        $this->SourceAName = $sourceAName;
                        $this->SourceAValue = $sourceAValue;
                        $this->SourceBName = $sourceBName;
                        $this->SourceBValue = $sourceBValue;
                        $this->SourceCName = $sourceCName;
                        $this->SourceCValue = $sourceCValue;
                        $this->SourceDName = $sourceDName;
                        $this->SourceDValue = $sourceDValue;

                        $this->Result = $sourceAValue == $sourceBValue;
                        $this->Severity = $severity;
                        $this->PerformCheck = $performCheck;
                        $this->Description = $description;
                        $this->Rule = $rule;
                    }     
                    
            }

?>