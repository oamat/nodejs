
Copy-Item -Path .\api_generated\swagger\api\ -Destination .\output\api\api\ -recurse -Force
Copy-Item -Path .\api_generated\swagger\.swagger-codegen\ -Destination .\output\api\.swagger-codegen\ -recurse -Force
Copy-Item -Path .\api_generated\swagger\controllers\ -Destination .\output\api\controllers\ -recurse -Force
Copy-Item -Path .\api_generated\swagger\utils\ -Destination .\output\api\utils\ -recurse -Force

Write-Host "Folders have been copied." -ForegroundColor DarkGreen 

$source = '.\api_generated\swagger\'
$destination = '.\output\api\'
foreach($file in (get-childitem $source))
{    
    $dest = $destination + $file.name
    $src = $source + $file.name
    if (  (($file.name -eq 'package.json')  -and  (test-path -Path $dest))  -or  (($file.name -eq 'package-lock.json')  -and  (test-path -Path $dest)) ){             
        Write-Host $file.name + " hasn't been copied." -ForegroundColor DarkGreen        
    } else {
        Copy-Item -path $src -destination $dest -Force
    } 
}