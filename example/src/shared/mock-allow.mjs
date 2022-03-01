export default {
  mockProviderAccounts: {
    'Ryan Bethel': {
      login: 'ryanbethel',
      name: 'Ryan Bethel'
    },
    'John Doe': {
      login: 'johndoe',
      name: 'John Doe'
    }
  },
  matchProperty: 'login',
  includeProviderProperties: ['name', 'login'],
  appAccounts: {
    ryanbethel: {
      role: 'member'
    },
    johndoe: {
      role: 'member'
    }
  }
}
