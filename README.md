# DevCamper API

> Backend API for DevCamper application, which is a bootcamp directory website

> > The API allows for management of bootcamps, courses and reviews, with different user role authorized to access different routes

> > User and account management include signup and login, edit account details, or reset password for forgotten passwords

## Usage

In the `config/` directory, rename `config.env.env` to `config.env` and update the values/settings to your own

## Install Dependencies

```
npm install
```

## Run App

### Run in development mode

```
npm run dev
```

### Run in production mode

```
npm start
```

## Database Seeder

To seed the database with users, bootcamps, courses and reviews with data from the `models/_data` directory, run the relevant command below, either for importing or destroying data respectively

### Import data to database

```
npm run populate-data
```

### Destroy all data

```
npm run clear-data
```

## Demo

### API documentation

The API is live at [devcamper.io](https://devcamper.io)

Extensive documentation with examples [here](https://documenter.getpostman.com/view/8923145/SVtVVTzd?version=latest)

-   Version: 1.0.0
-   License: MIT
-   Author: Brad Traversy
