$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$shots = @(
    @{ name = 'shot_v13_admin_bulk_header.png'; url = 'http://localhost:5000/?nosse=1&role=admin&cms_tab=party_approvals#cms'; size = '1440,950' },
    @{ name = 'shot_v13_party_role_header.png'; url = 'http://localhost:5000/?nosse=1&role=party#party'; size = '1440,950' }
)

foreach ($s in $shots) {
    $outPath = Join-Path $base $s.name
    $args = @('--headless=new', '--no-sandbox', '--disable-gpu', "--window-size=$($s.size)", '--virtual-time-budget=3000', "--screenshot=$outPath", $s.url)
    Start-Process -FilePath $chrome -ArgumentList $args -Wait
    Write-Output "$($s.name): $(Test-Path $outPath)"
}

