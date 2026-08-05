/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://7thheavenband.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: 'public',
};
