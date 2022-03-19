import arc from '@architect/functions'
import arcOauth from '../../../index.js'
const href = arcOauth.loginHref()

export const handler = arc.http.async(login)

async function login() {
  return {
    statusCode: 200,
    html: `<a href="${href}">Login with Github</a>`
  }
}
