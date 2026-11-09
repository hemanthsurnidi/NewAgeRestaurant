$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$shots = @(
    @{ name = 'shot_desktop_tracking_v4.png'; url = 'http://localhost:5000/?nosse=1#tracking'; size = '1440,1000' },
    @{ name = 'shot_mobile_tracking_v4.png'; url = 'http://localhost:5000/?nosse=1&device=mobile#tracking'; size = '1440,1100' }
)

foreach ($s in $shots) {
    $outPath = Join-Path $base $s.name
    $args = @('--headless=new', '--no-sandbox', '--disable-gpu', "--window-size=$($s.size)", "--screenshot=$outPath", $s.url)
    Start-Process -FilePath $chrome -ArgumentList $args -Wait
    Write-Output "$($s.name): $(Test-Path $outPath)"
}
