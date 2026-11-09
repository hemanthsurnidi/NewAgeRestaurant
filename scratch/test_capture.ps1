$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$m1 = "$base\shot_party_mobile_v3.png"
$args1 = @('--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=430,932', "--screenshot=$m1", 'http://localhost:5000/?device=mobile&nosse=1#party')
Start-Process -FilePath $chrome -ArgumentList $args1 -Wait

$m2 = "$base\shot_party_mobile_drawer_v3.png"
$args2 = @('--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=430,932', '--virtual-time-budget=2000', "--screenshot=$m2", 'http://localhost:5000/?device=mobile&nosse=1&drawer=party#party')
Start-Process -FilePath $chrome -ArgumentList $args2 -Wait

Write-Output "m1: $(Test-Path $m1), m2: $(Test-Path $m2)"
