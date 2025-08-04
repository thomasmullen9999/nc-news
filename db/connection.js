const { Pool } = require("pg");

const isProduction = Boolean(process.env.DATABASE_URL);

if (!isProduction) {
  const ENV = process.env.NODE_ENV || "development";
  require("dotenv").config({
    path: `${__dirname}/../.env.${ENV}`,
  });
}

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const config = isProduction
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 2,
    }
  : {};

module.exports = new Pool(config);
