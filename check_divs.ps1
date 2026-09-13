$html = Get-Content index.html -Raw
$lines = $html -split '?
'
for ($i = 155; $i -le 168; $i++) {
    Write-Host ": $($lines[$i])"
}
