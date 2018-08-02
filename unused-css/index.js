const puppeteer = require('puppeteer');

function sleep(ms = 1000) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function findCSSFile(haystack, needle) {
	return haystack.filter(({url}) => url.startsWith(needle))
}

async function hoverEachSpeaker(page) {
	const speakers = await page.$$(`.ss > li`);

	console.log(`Hovering over ${speakers.length} speaker images`);

	let index = 1;
	for (const speaker of speakers) {
		const selector = `.ss > li:nth-child(${index++})`;
		await page.hover(selector);
		await sleep();
	}
}

function logUnusedCoverage(coverage) {
	const [london18css] = findCSSFile(coverage, 'https://smashingconf.com/assets/styles/fr18.css')
	let usedBytes = 0;
	const totalBytes = london18css.text.length;
	for (const range of london18css.ranges)
		usedBytes += range.end - range.start - 1;
	console.log(`Unused CSS: ${100 - Math.round(usedBytes / totalBytes * 100)}%`);
}

(async function() {
	console.log('\n');
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();

	await page.coverage.startCSSCoverage();
	await page.goto('https://smashingconf.com/');

	const startCoverage = await page.coverage.stopCSSCoverage();
	logUnusedCoverage(startCoverage);

	await page.coverage.startCSSCoverage();

	await hoverEachSpeaker(page);

	const endCoverage = await page.coverage.stopCSSCoverage();
	logUnusedCoverage(endCoverage);

	await browser.close();
	console.log('\n');
})();