$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$shots = @(
    @{ name = 'shot_v6_mobile_location_dropdown.png'; url = 'http://localhost:5000/?nosse=1&device=mobile&dropdown=outlet'; size = '1440,1100' },
    @{ name = 'shot_v6_mobile_kds.png'; url = 'http://localhost:5000/?nosse=1&device=mobile#kds'; size = '1440,1100' },
    @{ name = 'shot_v6_mobile_cms.png'; url = 'http://localhost:5000/?nosse=1&device=mobile#cms'; size = '1440,1100' },
    @{ name = 'shot_v6_city_pricing_modal.png'; url = 'http://localhost:5000/?nosse=1&modal=city_price#cms'; size = '1440,1000' },
    @{ name = 'shot_v6_desktop_home.png'; url = 'http://localhost:5000/?nosse=1'; size = '1440,1000' }
)

foreach ($s in $shots) {
    $outPath = Join-Path $base $s.name
    $args = @('--headless=new', '--no-sandbox', '--disable-gpu', "--window-size=$($s.size)", '--virtual-time-budget=2500', "--screenshot=$outPath", $s.url)
    Start-Process -FilePath $chrome -ArgumentList $args -Wait
    Write-Output "$($s.name): $(Test-Path $outPath)"
}

