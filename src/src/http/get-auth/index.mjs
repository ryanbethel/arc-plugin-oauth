import arc from '@architect/functions'
import oauth from './oauth.mjs'
import authorize from './authorize.mjs'
const afterAuthRedirect = process.env.ARC_OAUTH_AFTER_AUTH || '/'
const customAuthorize = process.env.ARC_OAUTH_CUSTOM_AUTHORIZE
export const handler = arc.http.async(auth)
const useAllowList = process.env.ARC_OAUTH_USE_ALLOW_LIST

async function auth(req) {
  const {
    query: { code, state }
  } = req

  let oauthStateRedirect
  try {
    if (state) oauthStateRedirect = JSON.parse(state).redirectAfterAuth
  } catch (e) {
    console.log(e)
  }
  const redirect =
    customAuthorize || oauthStateRedirect || afterAuthRedirect || '/'
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
      if (customAuthorize && oauthStateRedirect) {
        return {
          session: { ...session, redirectAfterAuth: oauthStateRedirect },
          location: customAuthorize
        }
      } else {
        return {
          session,
          location: redirect
        }
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
