const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');
const nlp = require('compromise');

function summarizeText(text, sentenceCount) {
    const doc = nlp(text);
    const sentences = doc.sentences().out('array');

    let sentenceScores = sentences.map(sentence => {
        const docSentence = nlp(sentence);
        const score = docSentence.terms().length;
        return { sentence: sentence, score: score };
    });

    sentenceScores.sort((a, b) => b.score - a.score);

    return sentenceScores.slice(0, sentenceCount).map(item => item.sentence).join(' ');
}

async function scrapeGoogle(query) {
    let browser = null;
    try {
        // Launch the browser with chrome-aws-lambda
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        // Go to Google search results page
        await page.goto(searchUrl);

        // Wait for search results to load and display the links
        await page.waitForSelector('a h3');

        // Get the first search result link
        const firstResultSelector = 'a h3';
        const firstResultHandle = await page.$(firstResultSelector);
        const firstResultLink = await page.evaluate(el => el.parentElement.href, firstResultHandle);

        console.log(`First result URL: ${firstResultLink}`);

        // Go to the first search result page
        await page.goto(firstResultLink);

        // Extract the content of the page
        const content = await page.content();
        const $ = cheerio.load(content);

        // Extract all paragraphs or other relevant content
        let paragraphs = '';
        $('p').each((i, el) => {
            const text = $(el).text();
            paragraphs += text + '\n\n'; // Add paragraph with spacing
        });

        await browser.close();
        return paragraphs;
    } catch (error) {
        console.error('Error in scrapeGoogle:', error);
        if (browser !== null) {
            await browser.close();
        }
        throw error;
    }
}

module.exports = {
    scrapeGoogle,
    summarizeText
};
