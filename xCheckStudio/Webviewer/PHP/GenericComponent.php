<?php
                        
            function restoreProperties ($ComponentsList) 
            {
                $Components = array();
                foreach($ComponentsList as $key => $value) {

                    $component = new GenericComponent( $value->Name, 
                                                       $value->MainComponentClass, 
                                                       $value->SubComponentClass, 
                                                       $value->NodeId,
                                                       $value->ParentNodeId);

                    foreach($value->properties as $propertyKey => $propertyValue) {
                        $property = new GenericProperty($propertyValue->Name, $propertyValue->Format, $propertyValue->Value);
                        $component->addProperty( $property );
                    }    
                    
                    array_push ( $Components, $component ) ;
                  }

                  return $Components;
            }
            
               // classes
                class GenericComponent
            {
                var $Name; 
                var $MainComponentClass; 
                var $SubComponentClass;
                var $NodeId; 
                var $ParentNodeId;
                var $properties = array(); 

                // constructor
                public function __construct($name, $mainComponentClass, $subComponentClass, $nodeId, $parentNodeId) {
                    $this->Name = $name;
                    $this->MainComponentClass = $mainComponentClass;
                    $this->SubComponentClass = $subComponentClass;
                    $this->NodeId = $nodeId;
                    $this->ParentNodeId= $parentNodeId;
                }

                public function addProperty($genericProperty) {

                    // returns number of elements in an array
                    return array_push ( $this->properties, $genericProperty ) ;
                }
                
                public function propertyExists($propertyName) {

                    for ($i = 0; $i < count($this->properties); $i++) {           
                        if ( strtolower($this->properties[$i]->Name) ===  strtolower($propertyName)) {
                            return true;
                        }
                    }

                    return false;
                }

                public function getProperty($propertyName) {

                    for ($i = 0; $i < count($this->properties); $i++) {           
                        if ( strtolower($this->properties[$i]->Name) ===  strtolower($propertyName)) {
                            return $this->properties[$i];
                        }
                    }

                    return NULL;
                }   
            }

            class GenericProperty
            {            
                var $Name ;  
                var $Format ;  
                var $Value ;  

                // constructor
                public function __construct($name, $format, $value) {
                    $this->Name = str_replace("world","", $name);                  
                    $this->Format = $format;
                    $this->Value = $value;                    
                }
            }

?>