$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$shots = @(
    @{ name = 'shot_party_centered.png'; url = 'http://localhost:5000/?nosse=1#party' },
    @{ name = 'shot_kds_no_header.png'; url = 'http://localhost:5000/?nosse=1#kds' },
    @{ name = 'shot_cms_staff_header.png'; url = 'http://localhost:5000/?nosse=1#cms' },
    @{ name = 'shot_tracking_centered.png'; url = 'http://localhost:5000/?nosse=1#tracking' },
    @{ name = 'shot_account_centered.png'; url = 'http://localhost:5000/?nosse=1#account' }
)

foreach ($s in $shots) {
    $outPath = Join-Path $base $s.name
    $args = @('--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=1440,1000', "--screenshot=$outPath", $s.url)
    Start-Process -FilePath $chrome -ArgumentList $args -Wait
    Write-Output "$($s.name): $(Test-Path $outPath)"
}

