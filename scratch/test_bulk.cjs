const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  
  console.log('1. Initial view:');
  console.log('Role dropdown:', await page.$eval('#top-role-select', el => el.value));
  console.log('Body classes:', await page.$eval('body', el => el.className));
  console.log('Nav links:', await page.$eval('#main-nav-links', el => el.innerText.trim().replace(/\n+/g, ' | ')));

  console.log('\n2. Switching to admin role via dropdown:');
  await page.select('#top-role-select', 'admin');
  await new Promise(r => setTimeout(r, 600));
  console.log('Role dropdown:', await page.$eval('#top-role-select', el => el.value));
  console.log('Body classes:', await page.$eval('body', el => el.className));
  console.log('Nav links:', await page.$eval('#main-nav-links', el => el.innerText.trim().replace(/\n+/g, ' | ')));

  console.log('\n3. Clicking Bulk Orders button in nav:');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#main-nav-links button'));
    const btn = btns.find(b => b.innerText.includes('Bulk Orders'));
    if (btn) btn.click();
    else console.log('Bulk Orders button NOT FOUND!');
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Role dropdown:', await page.$eval('#top-role-select', el => el.value));
  console.log('Body classes:', await page.$eval('body', el => el.className));
  console.log('Nav links:', await page.$eval('#main-nav-links', el => el.innerText.trim().replace(/\n+/g, ' | ')));
  console.log('Page title on view:', await page.$eval('#app-view-container h1, #app-view-container h3', el => el ? el.innerText : 'none'));

  console.log('\n4. What about clicking the tabs inside CMS page?');
  const cmsTabButtons = await page.$$eval('.party-tab-btn', els => els.map(el => el.innerText.trim()));
  console.log('CMS tabs:', cmsTabButtons);

  console.log('\n5. What happens if user navigates to party or clicks party button anywhere?');
  // Check what happens if user clicks link-party or role=party
  await page.evaluate(() => {
    // What if user clicked a link with href="#party" or App.navigate('party')?
    window.location.hash = '#party';
  });
  await new Promise(r => setTimeout(r, 600));
  console.log('After hash change to #party:');
  console.log('Role dropdown:', await page.$eval('#top-role-select', el => el.value));
  console.log('Body classes:', await page.$eval('body', el => el.className));
  console.log('Nav links:', await page.$eval('#main-nav-links', el => el.innerText.trim().replace(/\n+/g, ' | ')));

  await browser.close();
})();
