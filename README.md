# Architect OAuth Plugin
A plugin for adding OAuth to Architect apps. It includes mocking for local development to avoid setting up oauth providers until you are ready to deploy for the first time.

## Getting started
The following are the minimal steps to use the plugin for a new app before a real OAuth provider is setup using the mock provider.
1. `npm i arc-plugin-oauth`
2. Add plugin to Architect manifest:
```
@app
oauth-example

@http
get /

@plugins
arc-plugin-oauth

@oauth
use-mock true

```
3. Add a list of mock accounts to the shared folder:
```javascript
//src/shared/mock-allow.mjs
export default {
  mockProviderAccounts: {
    'Jane Doe': {
      login: 'janedoe',
      name: 'Jane Doe'
    },
    'John Smith': {
      login: 'johnsmith',
      name: 'John Smith'
    }
  },
  appAccounts: {
    janedoe: {
      role: 'member',
      name: 'Jane Doe'
    },
    johnsmith: {
      role: 'member',
      name: 'John Smith'
    }
  }
}
```

4. Add the auth helper middleware to any protected routes:
```javascript
//src/http/get-index/index.mjs
import arc from '@architect/functions'
import arcOauth from 'arc-plugin-oauth'
const auth = arcOauth.auth
export const handler = arc.http.async(auth, index)

async function index(req) {
  return {
    html: `
    <html>
      <head>
      </head>
      <body>
        <p> You are Authenticated </p>
        <form method="post" action="/logout" >
          <button type="submit">Logout</button>
        </form>
      </body>
    </html>
    `
  }
}
```

## Built-in routes 
The plugin adds the following built-in routes:
- `get /auth`: The primary route for decoding and verifying OAuth tokens from providers. This is the route that OAuth redirects are pointed to. This is the minimal route that must be enabled for this plugin to work. 
- `get /login`: A basic login page. As the app is designed it can be replaced by a styled version using the [loginHref](#loginHref) helper.
- `post /logout`: Post route that clears the session causing the user to be logged out.
- `get /mock/auth`: Provides the mock provider for local development. If mocking is disabled this route is not included.

By default all routes are included. They can be customized using the [`routes`](#route) parameter. 


## Configuration
The plugin is configured under the `@oauth` pragma in the app manifest file. With zero config it provides a working OAuth setup for Github.

### Zero Config
```
@plugins
arc-plugin-oauth

@oauth
```

### Fully Configured
```
@plugins
arc-plugin-oauth

@oauth
provider github 
use-mock true 
match-property login
include-properties name login
routes login auth logout mock
allow-list allow.mjs
mock-list mock-allow.mjs
after-auth-redirect /
un-auth-redirect /login
```

### Configuration API
- `provider`: 
  OAuth provider to use
  - default: github
  - Currently only supports Github
- `use-mock`:
  Use mock OAuth provider for local development 
  - default: false
- `match-property`:
  Provider property to match against app accounts for authorization.
  - default: `login`
- `include-properties`: 
  Additional provider account properties to keep in session.
  - default: 'login'
- `routes`:
  Built-in routes to include.
  - default: login auth logout mock
  - All routes are included by default. To remove routes use the explicit form to show the routes to include (i.e. `routes auth logout mock` will remove the `login` route)
- `allow-list`:
  Use simple allow list for authorization.
  - default: false
  - This parameter can specify a custom allow list file name or use the default. 
    - `allow-list custom-allow-file.mjs`
- `mock-list`:
  Custom mock allow list. 
  - default: mock-allow.mjs
- `after-auth-redirect`:
  URL to redirect to after authentication.
  - default: '/'
- `un-auth-redirect`:
  URL to redirect to for unauthorized users.
  - default: '/login'


## Helper Functions API

### Custom Login Page and `loginHref` helper
Provides url for a login button. The built-in login route provides basic functionality to get started. It is un-styled. To build a custom login page or to add a login button from anywhere in the app do the following:
```
# app.arc manifest
...
@http
get /login # adds a custom '/login' route
@oauth
routes auth logout # removes the built-in '/login' route
```

```javascript
// src/http/get-login/index.mjs
import arc from '@architect/functions'
import arcOauth from 'arc-plugin-oauth'
const href = arcOauth.loginHref()

export const handler = arc.http.async(login)

async function login () {
  return {
    statusCode: 200,
    html: `<a href="${href}">Login with Github</a>`
  }
}

```

### Authentication Middleware using `auth` and `authRedirect` helpers
The `auth` middleware checks to see if the user is authenticated before passing execution to the next middleware. In the example below if the user is not authenticated they will be redirected to the login page instead of passing to the `index` handler.
```javascript
//src/http/get-index/index.mjs
import arc from '@architect/functions'
import arcOauth from 'arc-plugin-oauth'
const auth = arcOauth.auth
export const handler = arc.http.async(auth, index)

async function index(req) {
  return {
    html: `
      <body>
        <p> You are Authenticated </p>
      </body>
    `
  }
}
```

In order to redirect to a custom route instead of to the configured default use the `authRedirect` handler as follows:
```javascript
//src/http/get-index/index.mjs
import arc from '@architect/functions'
import arcOauth from 'arc-plugin-oauth'
const authRedirect = arcOauth.authRedirect
export const handler = arc.http.async(authRedirect('/signup'), index)

```

### Checking authentication using `checkAuth` helper
If you want to check authentication status without using the middleware to redirect you can use the `checkAuth` helper. This helper returns the authentication status for branching or other logic. 

```javascript
//src/http/get-index/index.mjs
import arc from '@architect/functions'
import arcOauth from 'arc-plugin-oauth'
const checkAuth = arcOauth.checkAuth

export const handler = arc.http.async(index)

async function index(req) {
  const authenticated = checkAuth(req)
  if(authenticated) {
    return {
      html: ` <p> You are Authenticated </p> `
    }
  } else{
    return {
      html: ` <p> You are a Guest </p> `
    }
  }
}
```


## Authorization 
Authentication and authorization are tightly coupled. Authentication is verifying that a user is who they say they are. Authorization is verifying that they are allowed to do what they are requesting. OAuth handles the first concern, but the application must handle the second. 

This plugin has a simple way to specify a list of authorized users covering authorization for many use cases. If your application requires database backed user accounts or other advanced authorization needs see [advanced authorization](#advanced-authorization) below.

### allow-list authorization
The allow-list is a file that exports a map from oauth users to authorized application users. For a basic application where a small number of users can be manually added to the allow list this may work for the full application authorization. The allow list is specified in the manifest file as:
```
@oauth
allow-list allow.mjs
```
This file should be put in the `src/shared/` folder. The default is `allow.mjs`. A sample list is shown below:
```javascript
export default {
  appAccounts: {
    janedoe: {
      role: 'member',
      name: 'Jane Doe'
    },
    johnsmith: {
      role: 'member',
      name: 'John Smith'
    }
  }
}
```
In this example the oauth user with a login of 'janedoe' will be assigned an application user account `{ role: 'member', name: 'Jane Doe' }`. 

### Mock user accounts
The Mocking for user accounts is similar to the allow list above, but it adds mock values for the oauth provider accounts as well. The mock list defaults to `src/shared/mock-allow.mjs` or it can be specified with `mock-list custom-mock.mjs` in the `@oauth` pragma. A sample mock-allow is shown below.
```javascript
//src/shared/mock-allow.mjs
export default {
  mockProviderAccounts: {
    'Jane Doe': {
      login: 'janedoe',
      name: 'Jane Doe'
    },
    'John Smith': {
      login: 'johnsmith',
      name: 'John Smith'
    }
  },
  appAccounts: {
    janedoe: {
      role: 'member',
      name: 'Jane Doe'
    },
    johnsmith: {
      role: 'member',
      name: 'John Smith'
    }
  }
}
```
In this example the `mockProviderAccounts` are shown as options in the login flow. The corresponding app accounts are exported from the mock file as well. 

### Advanced authorization 
Authorization can be done against user accounts stored in a database or other source. To do this allow-list must be disabled, which is the default configuration if there is no `allow-list` setting under the `@oauth` pragma. 

Next an '/authorization' route can be setup in the app that contains the user authorization logic. 
```
# app.arc manifest
@http
get /authorization 
```

Finally the authorization handler can be added as follows:

```javascript
// src/http/get-authorization/index.mjs
import arc from '@architect/functions'
import begin from '@begin/data'

export const handler = arc.http.async(authorize)


async function authorize (req) {
  const data = await begin()
  const providerAccount = req?.session?.oauth
  const session = req?.session

  if (providerAccount) {
    const matchOn = process.env.ARC_OAUTH_MATCH_PROPERTY
    const appUser = await data.get({table:'users',key:providerAccount[matchOn]})
    if (appUser) {
      const newSession = { ...session, account:appUser}
      return {
        session:newSession,
        location: process.env.ARC_OAUTH_AFTER_AUTH
      }
    } 
    else {
      return {
        statusCode: 401,
        body: 'not authorized'
      }
    }
  }
  else {
    return {
      statusCode: 302,
      location: process.env.ARC_OAUTH_UN_AUTH_REDIRECT
    }
  }
}
```
If the new application user account is assigned to `sessions.account` then all the auth helper functions (`auth`, `checkAuth` etc.) will work as before. 

## Session User Info
The application user object should be stored in `session.account` to ensure auth helper functions work correctly. Any of the application account user properties can be accessed there. The oauth account properties that are included with the `include-properties` configuration can be found in the `req.session.oauth` object. 

## Setup OAuth Provider
To configure an OAuth provider (i.e. Gituhub) for a staging or production environment the following environment variables should be set:

- ARC_APP_SECRET: Not specifically related to the plugin this is an Architect environment variable for ensuring sessions are encoded securely. 
- ARC_OAUTH_CLIENT_ID: This is the client ID obtained from registering your OAuth app in the provider console.
- ARC_OAUTH_CLIENT_SECRET: This is the client secret from the OAuth provider.
- ARC_OAUTH_REDIRECT_URL: This should be the full URL for redirecting back to your '/auth' endpoint from the third party provider. For instance this might be 'https://staging.mycustomdomain.com/auth'.