$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = 'C:\Users\heman\.gemini\antigravity\scratch\nizami-biryani'
$artifactDir = 'C:\Users\heman\.gemini\antigravity\brain\77db5490-f1e2-49ad-8d02-6dc410e6a52d'

$f1 = "$base\shot_party_big_form.png"
Start-Process -FilePath $chrome -ArgumentList @('--headless=new', '--disable-gpu', '--window-size=1440,1100', "--screenshot=$f1", 'http://localhost:5000/#party') -Wait
Copy-Item $f1 -Destination "$artifactDir\shot_party_big_form.png" -Force
Write-Output "Captured and copied shot_party_big_form.png"

$f2 = "$base\shot_party_drawer_open.png"
Start-Process -FilePath $chrome -ArgumentList @('--headless=new', '--disable-gpu', '--window-size=1440,1100', "--screenshot=$f2", 'http://localhost:5000/?drawer=party#party') -Wait
Copy-Item $f2 -Destination "$artifactDir\shot_party_drawer_open.png" -Force
Write-Output "Captured and copied shot_party_drawer_open.png"
