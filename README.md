# FUTURA API (E-Commerce on Fashion and Tech) - Backend

## Coding Format

+ Framework: Express.js v5.1.0

[![Express](https://img.shields.io/badge/Framework-ExpressJS-brightgreen.svg?style=flat)](https://github.com/expressjs/express)
[![ES-JS](https://img.shields.io/badge/Coding%20Style-Javascript%20ES%202025-brightgreen.svg?style=flat)](https://github.com/standard/standard)

## Resource

Here're the resource toolkit applied in the source code, which require you at least a basic understand on their usage:

1. [Express.js Framework](https://expressjs.com/)
2. [Neon Console](https://neon.tech/docs/get-started-with-neon/signing-up)
3. [PostgreSQL](https://www.postgresql.org/docs/)
4. [REST APIs](https://www.geeksforgeeks.org/rest-api-introduction/)
5. [Environment variables / secrets](https://vite.dev/guide/env-and-mode)
6. [Stripe APIS](https://docs.stripe.com/)

## Setup Guidance

+ In the github, you can either **clone/download** the source code as zip version.
+ Ensure **npm** or **node package** is installed before proceeding, otherwise you aren't able to run the project
+ Edit the source code based on your prefer **IDE Editor** (Visual Code, Rider Editor)
+ Run `npm install` in terminal, the system will automatically install required package. You can manually installed based on **package.json** if prefer.
+ Create a `.env` file at the base directory, ensure you filled them correctly:

```sql
#Neon Console
DATABASE_URL = INSERT_VALUE_HERE

#Stripe 
STRIPE_SECRET_KEY = INSERT_VALUE_HERE

#Frontend URL without "/" (example: https://something:9999)
CLIENT_URL= INSERT_VALUE_HERE

```

## Deploy Guidance

+ **Local Development** - Run `node index` to generate a local host backend. (Full Experience required frontend activate);
+ **Publish Deployment** - Upload it to GitHub, then navigate to Vercel and select from there.

#### Active Deployment - [Vercel](https://futura-api.vercel.app/)

#### Important - This project was created as part of the Sigma School Bootcamp's Module (#4) - the capstone project

#### License: MIT © [David Tang / Project Futura](https://github.com/RandomWinter89)