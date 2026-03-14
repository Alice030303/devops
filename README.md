# MVC Express

## Description

This repository contains a movie web application.
Users can register, log in and manage different movie lists such as wishlist, favorites, and watched movies.
The application also provides movie recommendations based on the user's favorite movies.

The project is composed of:

1. a React frontend
2. a Node.js / Express backend
3. a MongoDB database

The project also includes Docker support, automated tests, and CI with GitHub Actions.

## Steps

1. Clone the repo from Github.
2. Run `npm install`
3. Create _.env_ from _.env.sample_ file and add your DB parameters. Don't delete the _.sample_ file, it must be kept.

4. 
**Locally**: 
    Backend: 
        1. npm install 
        2. run `npm run dev`. This will start `index.js` using _nodemon_.
    Frontend :
        1. cd front/reactPFR 
        2. npm install 
        3. npm run dev

**With Docker**: 
    run `docker-compose up --build` to start both the app and MongoDB in containers.
    
5. Go to `localhost:5173` with your favorite browser.
6. From this starter kit, create your own web application.


## Test 
-Tests with MongoDB local
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
`npm test`


## Lint

The project uses ESLint to ensure code quality.
Run linting for the frontend:
1. cd front/reactPFR
2. npm run lint
OR in github actions