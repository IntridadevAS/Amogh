<?php
        class GenericComponent 
        {
            var $TableName; 
            var $properties = array();
            var $categoryPresent =  false;
            public function __construct($name) {
                $this->TableName = $name;
            }
            public function addProperty($genericProperty) {
                return array_push ( $this->properties, $genericProperty ) ;
            }   
        }
?>