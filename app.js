// const summary = require('./summary')
const express = require('express');
const app = express();
const port = 3000;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const nlp = require('compromise');



app.use(express.json());
app.get('/', (req, res) => {
  // console.log(req[])
  res.send("hello world!");
});
app.post('/summary', (req, res) => {
  try{
    const data = req.body.data; // Access the POST data
    const para_count = 15
    let text_contents = ""
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
      const browser = await puppeteer.launch({ headless: true });
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
  
      // console.log(`Extracted content:\n${paragraphs}`);
      await browser.close();
      return paragraphs
  }
    scrapeGoogle(data).then(text => {
        text_contents = text
        const summary_content = summarizeText(text_contents , para_count)
        res.send({"message":summary_content})
        // console.log(summary_content)
    })
  }catch(err){
    res.send({"message":"error"+err})
  }
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app