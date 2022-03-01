const arc = require('@architect/functions')
const mockAllowList = require(`@architect/shared/${process.env.ARC_OAUTH_MOCK_ALLOW_LIST}`)

exports.handler = arc.http.async(getLogin, getCode, getToken, getUserInfo)
async function getLogin (req) {
  const providerAccounts = Object.keys(mockAllowList.mockProviderAccounts)
  const mockCodes = providerAccounts.map((i) =>
    Buffer.from(i).toString('base64')
  )
  if (req.params.part === 'login') {
    return {
      status: 200,
      html: `
    ${providerAccounts
    .map(
      (k, i) =>
        `<a href="${
          process.env.ARC_OAUTH_CODE_URI + '?mock=' + mockCodes[i]
        }">${k}</a>`
    )
    .join('  ')}
    `
    }
  }
}
async function getCode (req) {
  if (req.params.part === 'code') {
    const code = req.query.mock
    return {
      status: 302,
      location: `${process.env.ARC_OAUTH_AUTH_URI}?code=${code}`
    }
  }
}
async function getToken (req) {
  if (req.params.part === 'token') {
    const access_token = req.body.code
    return {
      status: 200,
      json: { access_token }
    }
  }
}
async function getUserInfo (req) {
  if (req.params.part === 'user') {
    const token = req.headers.authorization.replace('token ', '')
    const userReference = Buffer.from(token, 'base64').toString('ascii')
    const user = mockAllowList.mockProviderAccounts[userReference]

    return {
      status: 200,
      json: user
    }
  }
}
