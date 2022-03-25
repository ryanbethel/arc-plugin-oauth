import tiny from 'tiny-json-http'
const useMock = process.env.ARC_OAUTH_USE_MOCK
const includeProperties = JSON.parse(process.env.ARC_OAUTH_INCLUDE_PROPERTIES)

export default async function oauth(req) {
  const data = {
    code: req.query.code
  }
  if (!useMock) {
    data.client_id = process.env.ARC_OAUTH_CLIENT_ID
    data.client_secret = process.env.ARC_OAUTH_CLIENT_SECRET
    data.redirect_uri = process.env.ARC_OAUTH_REDIRECT
  }
  let result = await tiny.post({
    url: process.env.ARC_OAUTH_TOKEN_URI,
    headers: { Accept: 'application/json' },
    data
  })
  let token = result.body.access_token
  let userResult = await tiny.get({
    url: process.env.ARC_OAUTH_USER_INFO_URI,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/json'
    }
  })

  const providerUser = userResult.body
  const filteredDetails = {}
  includeProperties.forEach((i) => (filteredDetails[i] = providerUser[i]))
  return {
    oauth: { user: filteredDetails }
  }
}
