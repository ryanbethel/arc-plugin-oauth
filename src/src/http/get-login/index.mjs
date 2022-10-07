import arc from '@architect/functions'

export const handler = arc.http.async(login)

async function login(req) {
  const href = loginHref(req)
  return {
    statusCode: 200,
    html: `<a href="${href}">Login with Github</a>`
  }
}

function loginHref() {
  const redirectUrlPart = process.env.ARC_OAUTH_REDIRECT_URL
    ? `&redirect_url=${process.env.ARC_OAUTH_REDIRECT_URL}`
    : ''
  if (process.env.ARC_OAUTH_USE_MOCK)
    return 'http://localhost:3333/mock/auth/login'
  else
    return `https://github.com/login/oauth/authorize?client_id=${process.env.ARC_OAUTH_CLIENT_ID}${redirectUrlPart}`
}
