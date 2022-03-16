import tiny from 'tiny-json-http'
const useMock = process.env.ARC_OAUTH_USE_MOCK
const useAllowList = process.env.ARC_OAUTH_USE_ALLOW_LIST
let allowListPromise
if (useAllowList && useMock)
  allowListPromise = import(
    `@architect/shared/${process.env.ARC_OAUTH_MOCK_ALLOW_LIST}`
  )
if (useAllowList && !useMock)
  allowListPromise = import(
    `@architect/shared/${process.env.ARC_OAUTH_ALLOW_LIST}`
  )

export default async function oauth (req) {
  const allowList = (await allowListPromise).default
  const data = {
    code: req.query.code
  }
  if (!useMock) {
    data.client_id = process.env.ARC_OAUTH_CLIENT_ID
    data.client_secret = process.env.ARC_OAUTH_CLIENT_SECRET
    data.redirect_url = process.env.ARC_OAUTH_REDIRECT
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
  const matchOn = allowList.matchProperty
  const appUser = allowList.appAccounts[providerUser[matchOn]]
  const providerDetails = {}
  allowList.includeProviderProperties.forEach(
    (i) => (providerDetails[i] = providerUser[i])
  )
  return {
    user: { ...appUser, [matchOn]: providerUser[matchOn] },
    providerDetails
  }
}
