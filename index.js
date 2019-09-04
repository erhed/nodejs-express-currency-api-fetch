let express = require("express");
let app = express();
let async  = require('express-async-await');
let fetch = require('node-fetch');

const apiUrl = 'https://api.exchangeratesapi.io/latest?';
let currency = '';
let currencyBase = '';

async function getDataForCurrencyPair(currencyPair) {
  currencyBase = currencyPair.substring(0,3);
  currency = currencyPair.substring(3,6);
  let url = apiUrl + "base=" + currencyBase + "&symbols=" + currency;
  return fetch(url);
}

const head = `
  <head>
    <style>
      * {
        font-size: 14;
        font-family: "arial";
      }
      body {
        padding: 30;
      }
      .input {
        width: 40;
        border-color: 'red';
      }
    </style>
  </head>
`;

const form = `
  <form id="form" onsubmit="formAction()">
    <p>Currency pair: <input type="text" class="input" id="base"> / <input type="text" class="input" id="currency"></p>
    <p><input type="submit" value="Submit"></p>
  </form>
`;

const formAction = `
  function formAction() {
    let base = document.getElementById("base").value;
    let currency = document.getElementById("currency").value;
    let form = document.getElementById("form");
    
    form.action = "http://localhost:3000/currencypair/" + base + currency;
    form.submit();
  }
`;

app.get('/currencypair/', async (req, res) => {
  const html = `
    <html>
      ${head}
      <body>
        ${form}
        <script>
          ${formAction}
        </script>
      </body>
    </html>
  `;
  return res.send(html);
});

app.get('/currencypair/:pair', async (req, res) => {
  const currencies = `${req.params.pair}`;
  const currencyData = await getDataForCurrencyPair(currencies.toUpperCase());
  const json = await currencyData.json();
  console.log(json);
  if (currencyData.status !== 200) {
    const html = `
      <html>
      ${head}
      <body>
        <p>Input correct currency names, please.</p>
        <br>
        ${form}
        <script>
          ${formAction}
        </script>
      </body>
      </html>
    `;
    return res.send(html);
  } else {
    const html = `
      <html>
        ${head}
        <body>
          <p>API response: <i>${JSON.stringify(json)}</i></p>
          <p>Date: <b>${json.date}</b></p>
          <p>Pair: <b>${currencyBase}/${currency}</b></p>
          <p>Price: <b>${json.rates[currency]}</b></p>
          <br>
          ${form}
          <script>
            ${formAction}
          </script>
        </body>
      </html>
    `;
    return res.send(html);
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});