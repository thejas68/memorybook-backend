const dotenv = require('dotenv');
dotenv.config();

const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});