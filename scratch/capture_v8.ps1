$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$shots = @(
    @{ name = 'shot_v8_kds_mobile.png'; url = 'http://localhost:5000/?nosse=1&device=mobile&role=kds#kds'; size = '1440,1100' },
    @{ name = 'shot_v8_kds_desktop.png'; url = 'http://localhost:5000/?nosse=1&role=kds#kds'; size = '1440,950' },
    @{ name = 'shot_v8_admin_cms_dishes.png'; url = 'http://localhost:5000/?nosse=1&role=admin#cms'; size = '1440,950' },
    @{ name = 'shot_v8_analytics.png'; url = 'http://localhost:5000/?nosse=1&role=analytics#analytics'; size = '1440,950' },
    @{ name = 'shot_v8_ai_lab.png'; url = 'http://localhost:5000/?nosse=1&role=ai_lab#ai_lab'; size = '1440,950' },
    @{ name = 'shot_v8_customer_party_view.png'; url = 'http://localhost:5000/?nosse=1&role=customer#party'; size = '1440,1050' }
)

foreach ($s in $shots) {
    $outPath = Join-Path $base $s.name
    $args = @('--headless=new', '--no-sandbox', '--disable-gpu', "--window-size=$($s.size)", '--virtual-time-budget=3000', "--screenshot=$outPath", $s.url)
    Start-Process -FilePath $chrome -ArgumentList $args -Wait
    Write-Output "$($s.name): $(Test-Path $outPath)"
}

