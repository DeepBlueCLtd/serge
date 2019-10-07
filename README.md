This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Serge

### Offline Installation

The Serge application runs with a NodeJS backend server. When a NodeJS application is configured & installed, it traditionally downloads a up to date versions of all of its dependencies.  To allow Serge to run on a PC that lacks an Internet connection, perform the following:

1. Gain access to a PC of the same operating system as the destination PC
2. Unpack Serge
3. From the top level folder, run `npm run save-modules` to download and install the front and backend dependencies
4. Zip up this installation
5. Unzip the installation on the destination PC
6. From the top level folder, run `npm run offline-install` - this will install the dependencies in the correct locations

### Installing as a service
On a MS Windows PC, Serge can be installed as a service - meaning it starts whenever that machine starts.  Perform this by executing `installSergeService.bat`.  Windows will popup up a series of confirmation boxes to approve the installation. On completion, Serge will be installed under MS Windows as `Serge Server`.   You can find the script to uninstall the service.  It's not imaginagively named.

### For development
The live demo version of Serge requires a hard-coded path to the backend server.

This path is configured from the top-level `.env` data-file, according to the `locally` and `heroku` sections further down.

ensure line 6&7 uncommented in `client/src/api/consts.js`

change "homepage" to `http://localhost:8080/client/build` from `https://serge-dev.herokuapp.com/client/build` in `client/package.json`

`npm run start` at `/client` for local dev (as well as `npm run start` at `/`)

`npm run start` at `/` for testing heroku environment

#### to run locally
`localhost:3000` or `localhost:8080` (heroku env)

### for heroku
ensure line 6&7 commented in `client/src/api/consts.js`

change "homepage" to `https://serge-dev.herokuapp.com/client/build` from `http://localhost:8080/client/build` in `client/package.json`

push to heroku

### Build executable files
In project root directory
Run `npm run pkg-build` to create a server with last build client version and server.
