const arc = require('@architect/functions')
const arcOauth = require('../../../index')
const href = arcOauth.loginHref()

exports.handler = arc.http.async(login)

async function login () {
  return {
    statusCode: 200,
    html: `<a href="${href}">Login with Github</a>`
  }
}
