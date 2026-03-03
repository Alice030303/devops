# MVC Express

## Description

This repository is a movie app

## Steps

1. Clone the repo from Github.
2. Run `npm install`
3. Create _.env_ from _.env.sample_ file and add your DB parameters. Don't delete the _.sample_ file, it must be kept.

4. **Locally**: run `npm run dev`. This will start `index.js` using _nodemon_.
4. **With Docker**: run `docker-compose up --build` to start both the app and MongoDB in containers.
5. Go to `localhost:5173` with your favorite browser.
6. From this starter kit, create your own web application.


## Test 
-Tests with MongoDB local
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
`npm test`


