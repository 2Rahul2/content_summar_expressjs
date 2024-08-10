const summary = require('./summary')
const express = require('express');
const app = express();
const port = 3000;




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
    summary.scrapeGoogle(data).then(text => {
        text_contents = text
        const summary_content = summary.summarizeText(text_contents , para_count)
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
