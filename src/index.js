module.exports = {
  loginHref: function (req) {
    const redirectAfterAuth = req?.session?.redirectAfterAuth

    const redirectUrlPart = process.env.ARC_OAUTH_REDIRECT_URL
      ? `&redirect_uri=${process.env.ARC_OAUTH_REDIRECT_URL}`
      : ''
    if (process.env.ARC_OAUTH_USE_MOCK)
      return `http://localhost:3333/mock/auth/login${
        redirectAfterAuth
          ? `?state=${encodeURIComponent(
              JSON.stringify({ redirectAfterAuth })
            )}`
          : ''
      }`
    else
      return `https://github.com/login/oauth/authorize?client_id=${
        process.env.ARC_OAUTH_CLIENT_ID
      }${redirectUrlPart}${
        redirectAfterAuth
          ? `&state=${encodeURIComponent(
              JSON.stringify({ redirectAfterAuth })
            )}`
          : ''
      }`
  },
  checkAuth: function (req) {
    return req?.session?.account
  },
  authRedirect: function (redirect) {
    return function (req) {
      return authenticate(req, redirect)
    }
  },
  auth: function (req) {
    return authenticate(req, false)
  },
  set: {
    env: ({ arc }) => {
      const afterAuthRedirect = arc.oauth.find(
        (i) => i[0] === 'after-auth-redirect'
      )?.[1]
      const customAuthorize = arc.oauth.find(
        (i) => i[0] === 'custom-authorize'
      )?.[1]
      const unAuthRedirect = arc.oauth.find(
        (i) => i[0] === 'un-auth-redirect'
      )?.[1]
      const matchProperty =
        arc.oauth.find((i) => i[0] === 'match-property')?.[1] || 'login'
      const includeProperties = arc.oauth.find(
        (i) => i[0] === 'include-properties'
      )
        ? JSON.stringify(
            arc.oauth.find((i) => i[0] === 'include-properties').slice(1)
          )
        : [matchProperty]
      const useMock = arc.oauth.find((i) => i[0] === 'use-mock')?.[1]
      const mockAllowList = arc.oauth.find((i) => i[0] === 'mock-list')
        ? arc.oauth.find((i) => i[0] === 'mock-list')[1]
        : 'mock-allow.mjs'
      const useAllowList = arc.oauth.find((i) => i[0] === 'allow-list')
      const allowList = useAllowList
        ? arc.oauth.find((i) => i[0] === 'allow-list')?.[1]
        : ''
      const testing = {
        ARC_OAUTH_AFTER_AUTH: afterAuthRedirect ? afterAuthRedirect : '/',
        ARC_OAUTH_CUSTOM_AUTHORIZE: customAuthorize ? customAuthorize : '',
        ARC_OAUTH_UN_AUTH_REDIRECT: unAuthRedirect ? unAuthRedirect : '/login',
        ARC_OAUTH_INCLUDE_PROPERTIES: includeProperties,
        ARC_OAUTH_MATCH_PROPERTY: matchProperty,
        ARC_OAUTH_USE_MOCK: useMock ? 'true' : '',
        ARC_OAUTH_USE_ALLOW_LIST: useAllowList ? 'true' : '',
        ARC_OAUTH_ALLOW_LIST: allowList,
        ARC_OAUTH_AUTH_URI: 'http://localhost:3333/auth',
        ARC_OAUTH_TOKEN_URI: 'https://github.com/login/oauth/access_token',
        ARC_OAUTH_USER_INFO_URI: `https://api.github.com/user`
      }
      if (useMock) {
        testing.ARC_OAUTH_TOKEN_URI = `http://localhost:3333/mock/auth/token`
        testing.ARC_OAUTH_CODE_URI = `http://localhost:3333/mock/auth/code`
        testing.ARC_OAUTH_USER_INFO_URI = `http://localhost:3333/mock/auth/user`
        testing.ARC_OAUTH_MOCK_ALLOW_LIST = mockAllowList
      }
      return {
        testing,
        staging: {
          ARC_OAUTH_INCLUDE_PROPERTIES: includeProperties,
          ARC_OAUTH_CUSTOM_AUTHORIZE: customAuthorize ? customAuthorize : '',
          ARC_OAUTH_MATCH_PROPERTY: matchProperty,
          ARC_OAUTH_AFTER_AUTH: afterAuthRedirect ? afterAuthRedirect : '/',
          ARC_OAUTH_UN_AUTH_REDIRECT: unAuthRedirect
            ? unAuthRedirect
            : '/login',
          ARC_OAUTH_USE_ALLOW_LIST: useAllowList ? 'true' : '',
          ARC_OAUTH_ALLOW_LIST: allowList,
          ARC_OAUTH_TOKEN_URI: 'https://github.com/login/oauth/access_token',
          ARC_OAUTH_USER_INFO_URI: 'https://api.github.com/user'
        },
        production: {
          ARC_OAUTH_INCLUDE_PROPERTIES: includeProperties,
          ARC_OAUTH_CUSTOM_AUTHORIZE: customAuthorize ? customAuthorize : '',
          ARC_OAUTH_MATCH_PROPERTY: matchProperty,
          ARC_OAUTH_AFTER_AUTH: afterAuthRedirect ? afterAuthRedirect : '/',
          ARC_OAUTH_UN_AUTH_REDIRECT: unAuthRedirect
            ? unAuthRedirect
            : '/login',
          ARC_OAUTH_USE_ALLOW_LIST: useAllowList ? 'true' : '',
          ARC_OAUTH_ALLOW_LIST: allowList,
          ARC_OAUTH_TOKEN_URI: 'https://github.com/login/oauth/access_token',
          ARC_OAUTH_USER_INFO_URI: 'https://api.github.com/user'
        }
      }
    },
    http: function ({ arc, inventory }) {
      const specificRoutes = arc.oauth.find((i) => i[0] === 'routes') || false
      const useMock = arc.oauth.find((i) => i[0] === 'use-mock')?.[1]
      let endpoints = []
      if (!specificRoutes || specificRoutes.includes('auth'))
        endpoints.push({
          method: 'get',
          path: '/auth',
          config: { runtime: 'nodejs18.x' },
          src: './node_modules/arc-plugin-oauth/src/src/http/get-auth'
        })
      if (!specificRoutes || specificRoutes.includes('logout'))
        endpoints.push({
          method: 'post',
          path: '/logout',
          config: { runtime: 'nodejs18.x' },
          src: './node_modules/arc-plugin-oauth/src/src/http/post-logout'
        })
      if (!specificRoutes || specificRoutes.includes('login'))
        endpoints.push({
          method: 'get',
          path: '/login',
          config: { runtime: 'nodejs18.x' },
          src: './node_modules/arc-plugin-oauth/src/src/http/get-login'
        })
      if (useMock && !inventory.inv?._arc?.deployStage)
        endpoints.push({
          method: 'any',
          path: '/mock/auth/:part',
          config: { runtime: 'nodejs18.x' },
          src: './node_modules/arc-plugin-oauth/src/src/http/get-mock-auth-000part'
        })

      return endpoints
    }
  }
}

function authenticate(req, redirect) {
  const unAuthRedirect = process.env.ARC_OAUTH_UN_AUTH_REDIRECT || '/login'
  function isJSON(req) {
    let contentType = req.headers['Content-Type'] || req.headers['content-type']
    return /application\/json/gi.test(contentType)
  }
  const account = req?.session?.account

  if (!account) {
    if (isJSON(req)) {
      return {
        statusCode: 401
      }
    } else {
      return {
        statusCode: 302,
        headers: {
          'cache-control':
            'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
        },
        location: redirect ? redirect : unAuthRedirect
      }
    }
  } else {
    return false
  }
}
