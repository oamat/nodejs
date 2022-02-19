Remove-Item .\output\api -Recurse -Force
Copy-Item .\api_generated\swagger  -Destination .\output\api -Recurse -Force