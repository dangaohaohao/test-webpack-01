// 添加 hack
if (typeof window === 'undefined') {
  global.window = {};
}
const express = require('express');
const {
  renderToString
} = require('react-dom/server');
const SSR = require('../dist/search-server');

const server = (port) => {
  const app = express();
  app.use(express.static('dist'));
  app.get('/search', (req, res) => {
    const html = renderMarkup(renderToString(SSR));
    res.status(200).send(html);
  });
  app.listen(port, () => {
    console.log(`server is running on ${port}`);
  });
};

const renderMarkup = (str) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <title>search</title>
  </head>
  <body>
    <div id="root">${str}</div>
  </body>
  </html>
  `;
};

server(process.env.port || 3000);
