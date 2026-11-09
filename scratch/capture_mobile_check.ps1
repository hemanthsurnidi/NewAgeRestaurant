$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$m_kds = "$base\shot_mobile_kds_no_header.png"
$args1 = @('--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=430,932', "--screenshot=$m_kds", 'http://localhost:5000/?device=mobile&nosse=1#kds')
Start-Process -FilePath $chrome -ArgumentList $args1 -Wait

$m_party = "$base\shot_mobile_party_centered.png"
$args2 = @('--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=430,932', "--screenshot=$m_party", 'http://localhost:5000/?device=mobile&nosse=1#party')
Start-Process -FilePath $chrome -ArgumentList $args2 -Wait

Write-Output "m_kds: $(Test-Path $m_kds), m_party: $(Test-Path $m_party)"

