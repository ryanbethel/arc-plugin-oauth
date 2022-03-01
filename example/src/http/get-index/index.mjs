import arc from '@architect/functions'
import arcOauth from 'arc-plugin-oauth'
const auth = arcOauth.auth
export const handler = arc.http.async(auth, index)

async function index(req) {
  const user = req.session.user.login
  return {
    html: /* html*/ `
    <html>
      <head>
      </head>
      <body>
        Hello ${user || 'World'}
        You Made it!
        <form method="post" action="/logout" >
        <button type="submit">Logout</button></form>
      </body>
    </html>
    `
  }
}
