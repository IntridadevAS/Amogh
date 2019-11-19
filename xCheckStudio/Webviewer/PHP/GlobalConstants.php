<?php
    
    define('CREATE_COMPARISONCOMPONETS_TABLE', 'CREATE TABLE ComparisonCheckComponents(
                                                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                                                sourceAName TEXT,
                                                sourceBName TEXT,
                                                sourceCName TEXT,
                                                sourceDName TEXT,
                                                sourceAMainClass TEXT,
                                                sourceBMainClass TEXT,
                                                sourceCMainClass TEXT,
                                                sourceDMainClass TEXT,
                                                sourceASubComponentClass TEXT,
                                                sourceBSubComponentClass TEXT,
                                                sourceCSubComponentClass TEXT,
                                                sourceDSubComponentClass TEXT,
                                                status TEXT,
                                                accepted TEXT,
                                                sourceANodeId TEXT,
                                                sourceBNodeId TEXT,
                                                sourceCNodeId TEXT,
                                                sourceDNodeId TEXT,
                                                sourceAId TEXT,
                                                sourceBId TEXT,
                                                sourceCId TEXT,
                                                sourceDId TEXT,
                                                ownerGroup INTEGER NOT NULL,
                                                transpose TEXT)');


    
    
    define('INSERT_ALLCOMPARISONCOMPONETS_TABLE', 'INSERT INTO ComparisonCheckComponents(
                                                sourceAName, 
                                                sourceBName, 
                                                sourceCName, 
                                                sourceDName,
                                                sourceAMainClass,
                                                sourceBMainClass,
                                                sourceCMainClass,
                                                sourceDMainClass, 
                                                sourceASubComponentClass, 
                                                sourceBSubComponentClass,
                                                sourceCSubComponentClass, 
                                                sourceDSubComponentClass,
                                                status,
                                                accepted, 
                                                sourceANodeId, 
                                                sourceBNodeId,
                                                sourceCNodeId, 
                                                sourceDNodeId,
                                                sourceAId, 
                                                sourceBId,
                                                sourceCId, 
                                                sourceDId,
                                                ownerGroup,
                                                transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ');


define('CREATE_COMPARISONPROPERTIES_TABLE', 'CREATE TABLE ComparisonCheckProperties(
                                                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                                                sourceAName TEXT,
                                                sourceBName TEXT,
                                                sourceCName TEXT,
                                                sourceDName TEXT,
                                                sourceAValue TEXT,
                                                sourceBValue TEXT,
                                                sourceCValue TEXT,
                                                sourceDValue TEXT,
                                                result TEXT,
                                                severity TEXT,
                                                accepted TEXT,
                                                performCheck TEXT,
                                                description TEXT,
                                                ownerComponent INTEGER NOT NULL,
                                                transpose TEXT)');

define('INSERT_ALLCOMPARISONPROPERTIES_TABLE', 'INSERT INTO ComparisonCheckProperties(
                                                sourceAName, 
                                                sourceBName,
                                                sourceCName, 
                                                sourceDName,  
                                                sourceAValue, 
                                                sourceBValue, 
                                                sourceCValue, 
                                                sourceDValue, 
                                                result, 
                                                severity,
                                                accepted,
                                                performCheck,
                                                description,
                                                ownerComponent,
                                                transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ');
?>