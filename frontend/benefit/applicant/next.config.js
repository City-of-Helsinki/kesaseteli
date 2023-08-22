const nextConfig = require('../../next.config');
const { i18n } = require('./next-i18next.config');
const { parsed: env } = require('dotenv').config({
  path: '../../../.env.benefit-applicant',
});
module.exports = nextConfig({
  i18n,
  env,
});
