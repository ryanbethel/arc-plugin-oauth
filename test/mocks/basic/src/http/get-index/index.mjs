import arc from '@architect/functions'
import arcOauth from 'arc-plugin-oauth'
const auth = arcOauth.auth
export const handler = arc.http.async(auth, index)

async function index(req) {
  const name = req?.session?.account?.name
  return {
    html: /* html*/ `
    <html>
      <head>
      </head>
      <body>
        <p>Hello ${name || 'World'}
        You Made it!</p>
        <form method="post" action="/logout" >
        <button type="submit">Logout</button></form>
      </body>
    </html>
    `
  }
}
