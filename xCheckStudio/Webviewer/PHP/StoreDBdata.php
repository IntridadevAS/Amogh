<?php
        class GenericComponent 
        {
            var $TableName; 
            var $properties = array();
            public function __construct($name) {
                $this->TableName = $name;
            }
            public function addProperty($genericProperty) {
                return array_push ( $this->properties, $genericProperty ) ;
            }   
        }
?>