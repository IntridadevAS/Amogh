REM powershell -Command "& (Get-Content HelloWorld.txt) | Foreach-Object {$_ -replace 'text', 'newString'} | Set-Content HelloWorld.txt"

Rem replace Host IPs in server.xml
set HOST=%1
set STRING_To_REPLACE=%2
set SourcePath=%3
set DestinationPath=%4

powershell -Command "(gc %SourcePath%\server.xml) -replace %STRING_To_REPLACE%, %HOST%  | Out-File -Encoding "UTF8" %DestinationPath%\server.xml" 

Rem replace Host IPs in viewer_csr.xml

powershell -Command "(gc  %SourcePath%\viewer_csr.xml) -replace %STRING_To_REPLACE%, %HOST% | Out-File -Encoding "UTF8" %DestinationPath%\viewer_csr.xml"

Rem replace Host IPs in viewer_ssr.xml

powershell -Command "(gc  %SourcePath%\viewer_ssr.xml) -replace %STRING_To_REPLACE%, %HOST% | Out-File -Encoding "UTF8" %DestinationPath%\viewer_ssr.xml"



