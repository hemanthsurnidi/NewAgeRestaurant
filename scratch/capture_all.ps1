$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\scratch\nizami-biryani'
$dest = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$pages = @(
    @{ name = 'shot_party_v2.png'; url = 'http://localhost:5000/#party' },
    @{ name = 'shot_party_drawer_v2.png'; url = 'http://localhost:5000/?drawer=party#party' }
)

foreach ($p in $pages) {
    $outFile = Join-Path $base $p.name
    $argList = @('--headless=new', '--disable-gpu', '--window-size=1440,1050', '--virtual-time-budget=3000', "--screenshot=$outFile", $p.url)
    Start-Process -FilePath $chrome -ArgumentList $argList -Wait
    Write-Output "Captured: $($p.name)"
    $destFile = Join-Path $dest $p.name
    Copy-Item $outFile $destFile -Force
    Write-Output "Copied to brain: $($p.name)"
}
