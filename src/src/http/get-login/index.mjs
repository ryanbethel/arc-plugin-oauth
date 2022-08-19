import arc from '@architect/functions'
import oauthPlugin from '../../../index.js'
const loginHref = oauthPlugin.loginHref

export const handler = arc.http.async(login)

async function login(req) {
  const href = loginHref(req)
  return {
    statusCode: 200,
    html: `<a href="${href}">Login with Github</a>`
  }
}
