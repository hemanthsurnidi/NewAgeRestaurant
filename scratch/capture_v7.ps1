$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$shots = @(
    @{ name = 'shot_v7_admin_item_modal.png'; url = 'http://localhost:5000/?nosse=1&modal=cms_item#cms'; size = '1440,1050' },
    @{ name = 'shot_v7_staff_party_view.png'; url = 'http://localhost:5000/?nosse=1&role=party#party'; size = '1440,1050' },
    @{ name = 'shot_v7_mobile_cart_drawer.png'; url = 'http://localhost:5000/?nosse=1&device=mobile&cart=open'; size = '1440,1100' },
    @{ name = 'shot_v7_kds_header.png'; url = 'http://localhost:5000/?nosse=1&role=kds#kds'; size = '1440,1050' },
    @{ name = 'shot_v7_mobile_home.png'; url = 'http://localhost:5000/?nosse=1&device=mobile'; size = '1440,1100' }
)

foreach ($s in $shots) {
    $outPath = Join-Path $base $s.name
    $args = @('--headless=new', '--no-sandbox', '--disable-gpu', "--window-size=$($s.size)", '--virtual-time-budget=3000', "--screenshot=$outPath", $s.url)
    Start-Process -FilePath $chrome -ArgumentList $args -Wait
    Write-Output "$($s.name): $(Test-Path $outPath)"
}

