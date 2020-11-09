const express = require('express');
const UserRouter = require('./user/UserRouter');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: 'c:/projects/tutorials/TDDWithNodejs/backend/src/locales/{{lng}}/{{ns}}.json'
      //./locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      lookupHeader: 'accept-language'
    }
  }, (err, t) => {
    if (err) return console.log('something went wrong loading', err);
  });

const app = express();

app.use(middleware.handle(i18next));

app.use(express.json());

app.use(UserRouter);

module.exports = app;
