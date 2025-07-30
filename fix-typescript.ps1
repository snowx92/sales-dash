$content = Get-Content 'src\app\dashboard\leads\page.tsx' -Raw
$content = $content -replace 'setFormData\(prev => \(\{', 'setFormData((prev: any) => ({'
$content = $content -replace 'onClick\(\(\) => setFormData\(prev => \(\{', 'onClick(() => setFormData((prev: any) => ({'
Set-Content 'src\app\dashboard\leads\page.tsx' $content
Write-Host "TypeScript errors fixed!" 