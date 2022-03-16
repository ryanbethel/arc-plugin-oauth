import arc from '@architect/functions'

async function logout () {
  return {
    session: {},
    status: 303,
    location: '/'
  }
}

export const handler = arc.http.async(logout)
