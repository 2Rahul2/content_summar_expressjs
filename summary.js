// const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

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
// Example usage
// summarizeText("Your long text content goes here...");

async function scrapeGoogle(query) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    // Fetch the HTML content of the search results page
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);

    // Attempt to find the first result link
    let firstResultLink = $('a h3').first().closest('a').attr('href');

    console.log(`Original First result URL: ${firstResultLink}`);

    if (!firstResultLink) {
        throw new Error('No result link found');
    }

    // Extract the actual URL from the Google redirect link
    const parsedUrl = new URL(firstResultLink, 'https://www.google.com');
    firstResultLink = parsedUrl.searchParams.get('q');

    console.log(`Extracted First result URL: ${firstResultLink}`);

    // Fetch the HTML content of the first result page
    const resultResponse = await axios.get(firstResultLink);
    const $$ = cheerio.load(resultResponse.data);

    // Extract all paragraphs or other relevant content
    let paragraphs = '';
    $$('p').each((i, el) => {
        const text = $$(el).text();
        paragraphs += text + '\n\n'; // Add paragraph with spacing
    });

    return paragraphs;
}

module.exports = {
    scrapeGoogle,
    summarizeText
}