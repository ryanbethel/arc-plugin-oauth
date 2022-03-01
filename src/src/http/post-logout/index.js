const arc = require('@architect/functions')

async function logout () {
  return {
    session: {},
    status: 303,
    location: '/'
  }
}

exports.handler = arc.http.async(logout)
