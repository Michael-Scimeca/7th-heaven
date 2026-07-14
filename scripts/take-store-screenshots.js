const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'public', 'sitemap-screenshots');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // ============================================================
  // STEP 1: STORE LANDING — Band Merch hero
  // ============================================================
  console.log('STEP 1: Store Landing Page...');
  await page.goto(`${BASE}/store`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, 'store.png') });
  console.log('   ✅ store.png');

  // ============================================================
  // STEP 2: PRODUCT LIST — scrolled to show product grid
  // ============================================================
  console.log('STEP 2: Product List...');
  await page.evaluate(() => window.scrollTo(0, 480));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT, 'store-products.png') });
  console.log('   ✅ store-products.png');

  // ============================================================
  // STEP 3: PRODUCT DETAIL — individual product page
  // ============================================================
  console.log('STEP 3: Product Detail...');
  await page.goto(`${BASE}/store/7h-classic-logo-tee`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, 'store-detail.png') });
  console.log('   ✅ store-detail.png');

  // ============================================================
  // STEP 4: CART VIEW — click Add to Cart using Puppeteer's page.click()
  // This properly triggers React's onClick handler
  // ============================================================
  console.log('STEP 4: Added to Cart...');
  // Find and click the "Add to Cart" button using Puppeteer's native click
  const addToCartBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => /Add to Cart/i.test(b.textContent));
  });
  
  if (addToCartBtn) {
    const element = addToCartBtn.asElement();
    if (element) {
      // Use Puppeteer's click which properly dispatches events for React
      await element.click();
      console.log('   Clicked Add to Cart button');
      // Wait for the state change - button should now show "✓ Added to Cart!"
      await new Promise(r => setTimeout(r, 800));
    }
  }
  
  // Verify the button text changed
  const buttonText = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => /Added to Cart|Add to Cart/i.test(b.textContent));
    return btn ? btn.textContent : 'NOT FOUND';
  });
  console.log('   Button now says:', buttonText);
  
  await page.screenshot({ path: path.join(OUT, 'store-cart.png') });
  console.log('   ✅ store-cart.png');

  // ============================================================
  // STEP 5: CHECKOUT MODAL — click BUY NOW on store grid
  // ============================================================
  console.log('STEP 5: Checkout Modal...');
  await page.goto(`${BASE}/store`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  
  // Find and click BUY NOW button
  const buyNowBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => /BUY NOW/i.test(b.textContent) && !b.disabled);
  });
  
  if (buyNowBtn) {
    const element = buyNowBtn.asElement();
    if (element) {
      await element.click();
      console.log('   Clicked BUY NOW');
    }
  }
  await new Promise(r => setTimeout(r, 2500));

  // Fill form fields using Puppeteer's type() for proper React state updates
  const formFields = await page.$$('input');
  for (const field of formFields) {
    const fieldInfo = await page.evaluate(el => {
      const label = el.closest('div')?.querySelector('label')?.textContent?.toLowerCase() || '';
      const name = (el.name || '').toLowerCase();
      const type = (el.type || '').toLowerCase();
      return { label, name, type, readOnly: el.readOnly, disabled: el.disabled };
    }, field);
    
    if (fieldInfo.readOnly || fieldInfo.disabled) continue;
    
    let value = '';
    if (fieldInfo.label.includes('name') || fieldInfo.name.includes('name')) value = 'Michael Scimeca';
    else if (fieldInfo.label.includes('email') || fieldInfo.name.includes('email') || fieldInfo.type === 'email') value = 'michael@7thheaven.com';
    else if (fieldInfo.label.includes('phone') || fieldInfo.name.includes('phone') || fieldInfo.type === 'tel') value = '312-555-7777';
    else if (fieldInfo.label.includes('address') || fieldInfo.name.includes('address')) value = '123 Band Street';
    else if (fieldInfo.label.includes('city') || fieldInfo.name.includes('city')) value = 'Chicago';
    else if (fieldInfo.label.includes('zip') || fieldInfo.name.includes('zip') || fieldInfo.label.includes('postal')) value = '60614';
    
    if (value) {
      await field.click({ clickCount: 3 }); // Select all existing text
      await field.type(value);
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT, 'store-checkout.png') });
  console.log('   ✅ store-checkout.png');

  // ============================================================
  // STEP 6: LOGIN MODAL
  // ============================================================
  console.log('STEP 6: Login Modal...');
  // Close checkout modal
  const closeBtn = await page.evaluateHandle(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
      const btn = modal.querySelector('button');
      return btn;
    }
    return null;
  });
  if (closeBtn && closeBtn.asElement()) {
    await closeBtn.asElement().click();
    await new Promise(r => setTimeout(r, 800));
  }
  
  // Click SIGN IN
  const signInBtn = await page.evaluateHandle(() => {
    const els = Array.from(document.querySelectorAll('button, a'));
    return els.find(el => el.textContent?.trim().match(/^SIGN IN$/i));
  });
  if (signInBtn && signInBtn.asElement()) {
    await signInBtn.asElement().click();
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT, 'login-modal.png') });
  console.log('   ✅ login-modal.png');

  // ============================================================  
  // STEP 7: SIGNUP MODAL
  // ============================================================
  console.log('STEP 7: Signup Modal...');
  const closeBtn2 = await page.evaluateHandle(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
      const btn = modal.querySelector('button');
      return btn;
    }
    return null;
  });
  if (closeBtn2 && closeBtn2.asElement()) {
    await closeBtn2.asElement().click();
    await new Promise(r => setTimeout(r, 800));
  }
  
  const signUpBtn = await page.evaluateHandle(() => {
    const els = Array.from(document.querySelectorAll('button, a'));
    return els.find(el => el.textContent?.trim().match(/^SIGN UP$/i));
  });
  if (signUpBtn && signUpBtn.asElement()) {
    await signUpBtn.asElement().click();
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT, 'signup-modal.png') });
  console.log('   ✅ signup-modal.png');

  // ============================================================
  // STEP 8: ADMIN INVENTORY
  // ============================================================
  console.log('STEP 8: Admin Dashboard...');
  await page.goto(`${BASE}/admin?bypass=admin-dev-local`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  const merchTab = await page.evaluateHandle(() => {
    const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
    return tabs.find(t => /merch|shopify|sales|inventory/i.test(t.textContent));
  });
  if (merchTab && merchTab.asElement()) {
    await merchTab.asElement().click();
    await new Promise(r => setTimeout(r, 2000));
  }
  await page.screenshot({ path: path.join(OUT, 'admin-inventory.png') });
  console.log('   ✅ admin-inventory.png');

  await browser.close();

  // Verify
  console.log('\n📋 Verification:');
  const files = ['store.png', 'store-products.png', 'store-detail.png', 'store-cart.png', 'store-checkout.png', 'login-modal.png', 'signup-modal.png', 'admin-inventory.png'];
  for (const f of files) {
    const fp = path.join(OUT, f);
    if (fs.existsSync(fp)) {
      const stats = fs.statSync(fp);
      console.log(`   ✅ ${f} — ${(stats.size / 1024).toFixed(0)} KB`);
    } else {
      console.log(`   ❌ ${f} — MISSING!`);
    }
  }
  console.log('\n🎉 Done!');
})();
