import arc from '@architect/functions'
import oauth from './oauth.mjs'
const redirect = process.env.ARC_OAUTH_AFTER_AUTH || '/'
export const handler = arc.http.async(auth)

async function auth (req) {

  const {
    query: { code }
  } = req
  if (code) {
    try {
      const account = await oauth(req)
      if (!account.user) throw Error('user not found')
      return {
        session: account,
        location: redirect
      }
    }
    catch (err) {
      return {
        statusCode: err.code,
        body: err.message
      }
    }
  }
  else {
    return {
      statusCode: 302,
      location: '/login'
    }
  }
}
