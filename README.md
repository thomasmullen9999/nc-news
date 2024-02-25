# Northcoders News API

This project was created as a consolidation of my learning during the backend portion of my time on the Northcoders software development course. Its purpose is to create an API for accessing application data, in a similar fashion to real world backend services such as Reddit or Quora. The project uses node.js and PostgreSQL to store data relating to articles, users, topics and comments.

The hosted version of the website that this project creates can be found here: https://nc-news-evv6.onrender.com/

For developers who wish to clone and run this project locally:

System requirements
Minimum version of node.js required: v21.3.0
Minimum version of Postgres required: v16

1) Cloning the repo

The repo can be cloned using this url:
https://github.com/thomasmullen9999/nc-news.git

2) To install the relevant dependencies required to run this project locally, run the following commands in the terminal whilst in this project's directory:

npm install dotenv
npm install express
npm install pg
npm install supertest
npm install husky

Alternatively, to install all of these dependencies at once, simply run:

npm install

3) Creating the appropriate .env files

Create two files in the root directory: 
.env.test and .env.development. 
Into each, add PGDATABASE=, with the correct database name for that environment.

Normally, it would not be safe to include the names of our databases in a public readme file, but since this is a portfolio piece designed for other users to view and use, it is acceptable to include them in this example. Ergo, the following should be added to each file:

.env.test
PGDATABASE=nc_news_test

.env.development
PGDATABASE=nc_news

It is important that you add both of these files to the .gitignore file, as this prevents other users from being able to view these database names.

4) Setting up and seeding the database

To setup and seed the local database, enter the following commands in the terminal of the project directory:
npm run setup-dbs
npm run seed

5) Running tests

The following commands can be entered in the terminal to run the test files: 

To run all test files: 
npm test

To run just the endpoint tests: 
npm test app

