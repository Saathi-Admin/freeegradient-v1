const {chromium}=require('C:/Users/Sathi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:2000/gradients/sunset-terrace-01-01/');
 await page.waitForSelector('.gradient-hex button');assert.equal(await page.locator('.palette-swatch').count(),8);
 await page.locator('.gradient-hex button').first().click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'#071526');
 await page.getByRole('button',{name:'Copy stylesheet link'}).click();assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/sunset-terrace-01\.[a-f0-9]+\.css/);
 await page.screenshot({path:'reports/details-desktop.png'});
 await page.goto('http://localhost:2000/gradients/');await page.locator('#gradient-search').fill('metallic lattice 03');await page.waitForTimeout(800);assert.equal(await page.locator('#search-grid a').count(),1);
 await page.goto('http://localhost:2000/playground/');assert.equal(await page.locator('[data-template-choice]').count(),24);await page.locator('#playground-search').fill('metallic lattice 03');await page.waitForTimeout(800);await page.locator('[data-template-choice="metallic-lattice-03"]').click();await page.waitForSelector('[data-variation-choice]');
 await page.goto('http://localhost:2000/guides/');assert.equal(await page.locator('main article').count(),3);
 await page.setViewportSize({width:390,height:844});
 for(const url of ['/','/gradients/sunset-terrace-01-01/','/collections/metallic/','/guides/use-css-gradients/','/playground/']){
 await page.goto('http://localhost:2000'+url);await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),url+' overflow');
 }
 await page.goto('http://localhost:2000/gradients/sunset-terrace-01-01/');await page.screenshot({path:'reports/details-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Browser passed: new template, 8 variants, copy hex/stylesheet, full search, lazy playground, guides, mobile overflow.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
