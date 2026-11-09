const puppeteer = require('puppeteer');
const path = require('path');

const brainDir = 'C:\\Users\\heman\\.gemini\\antigravity\\brain\\77db5490-f1e2-49ad-8d02-6dc410e6a52d';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Admin Add Item Modal
  console.log('Capturing Admin Item Modal...');
  await page.goto('http://localhost:5000/?role=admin', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    App.openCmsItemModal();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(brainDir, 'verify_admin_item_modal.png') });

  // 2. Staff Party Catering View
  console.log('Capturing Staff Party Catering View...');
  await page.goto('http://localhost:5000/?role=party', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    App.handleTopRoleChange('party');
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(brainDir, 'verify_staff_party_view.png') });

  // 3. Mobile Simulator Cart Drawer (Sliding Up Inside Phone Frame)
  console.log('Capturing Mobile Simulator Cart Drawer...');
  await page.goto('http://localhost:5000/?device=mobile', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    App.setDeviceMode('mobile');
    App.fillDemoCart(); // fills cart and calls openCartDrawer()
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(brainDir, 'verify_mobile_cart_drawer.png') });

  // 4. KDS Header Metrics & No Test Bell
  console.log('Capturing KDS View...');
  await page.goto('http://localhost:5000/?role=kds', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    App.handleTopRoleChange('kds');
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(brainDir, 'verify_kds_view.png') });

  // 5. Mobile Header (Clean Company A & Unclipped Cart Pill)
  console.log('Capturing Mobile Home Header...');
  await page.goto('http://localhost:5000/?device=mobile', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    App.setDeviceMode('mobile');
    App.navigate('ordering');
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(brainDir, 'verify_mobile_header.png') });

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

