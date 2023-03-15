const useMock = process.env.ARC_OAUTH_USE_MOCK
const useAllowList = process.env.ARC_OAUTH_USE_ALLOW_LIST
const matchProperty = process.env.ARC_OAUTH_MATCH_PROPERTY

const loadModule = async (modulePath) => {
  try {
    // standard arc
    return await import(
      `@architect/shared/${modulePath}`
    )
  } catch (e) {
    // enhance app
    return await import(
      `@architect/views/models/${modulePath}`
    )
  }
}

export default async function authorize(providerAccount) {
  let allowList = null
  if (useAllowList && useMock)
    allowList = (await loadModule(process.env.ARC_OAUTH_MOCK_ALLOW_LIST)).default
  if (useAllowList && !useMock)
    allowList = (await loadModule(process.env.ARC_OAUTH_ALLOW_LIST)).default
  const appUser =
    allowList.appAccounts[providerAccount.oauth.user[matchProperty]]
  if (!appUser) return false
  return appUser
}
