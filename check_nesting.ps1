$content = Get-Content js\app.js -Raw
$lines = $content -split '?
'
$level = 0
$lastLevel1Open = -1
for ($i=0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $openCount = ($line.ToCharArray() | Where-Object {$_ -eq '{'}).Count
    $closeCount = ($line.ToCharArray() | Where-Object {$_ -eq '}'}).Count
    
    if ($level -eq 1 -and $openCount -gt 0) {
        $lastLevel1Open = $i
    }
    
    $level += $openCount
    if ($i -eq 2948) {
        Write-Host "Line 2949 is inside block opened at line $($lastLevel1Open+1): $($lines[$lastLevel1Open])"
    }
    $level -= $closeCount
}
