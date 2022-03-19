import arc from '@architect/functions'
import oauth from './oauth.mjs'
import authorize from './authorize.mjs'
const afterAuthRedirect = process.env.ARC_OAUTH_AFTER_AUTH || '/'
const customAuthorize = process.env.ARC_OAUTH_CUSTOM_AUTHORIZE
const redirect = customAuthorize || afterAuthRedirect
export const handler = arc.http.async(auth)
const useAllowList = process.env.ARC_OAUTH_USE_ALLOW_LIST

async function auth(req) {
  const {
    query: { code }
  } = req
  if (code) {
    try {
      const oauthAccount = await oauth(req)
      if (!oauthAccount.oauth.user) throw Error('user not found')
      let session = { ...oauthAccount }
      if (useAllowList) {
        const appUser = await authorize(oauthAccount)
        if (appUser) {
          session.account = appUser
        } else {
          throw Error('user not found')
        }
      }

      return {
        session,
        location: redirect
      }
    } catch (err) {
      return {
        statusCode: err.code,
        body: err.message
      }
    }
  } else {
    return {
      statusCode: 302,
      location: '/login'
    }
  }
}
