# Content Summary API
### This is a simple API built with Express.js that takes a user query, searches the web, and generates a summary based on the content it finds. This API can be used for various applications where quick and concise information retrieval is needed.
## Features
- **Web Scraping**: Uses web scraping to retrieve information from search results.
- **Content Summarization**: Summarizes the retrieved content to provide a concise answer.
- **Flexible Input**: Accepts user queries in JSON format.
- **Express.js**: Built using the Express.js framework for simplicity and scalability.

### Installation

1. **Clone the repository**:
   `https://github.com/2Rahul2/content_summar_expressjs.git`
2. **Run**:
   `npm start`
## API Endpoints
/summary
- Method: POST
- Description: Generates a summary for a given query by scraping web search results.
- Request Body:
  - data: The search query you want to summarize.
#### Example:
`{
  "data": "What is web scraping?"
}`
#### output:
`{
  "message": "Web scraping is the process of extracting data from websites using automated tools..."
}`
