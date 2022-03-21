@app
plugin-tester

@http
get /

@plugins
arc-plugin-oauth

@oauth
provider github #defaults to github
use-mock true #default true use mock oauth for testing
match-property login #provider property to match against
include-properties name login #provider properties to add to session
routes login auth logout mock #default "login auth logout mock" are routes added
allow-list allow.mjs #use an allow list for simple authorization. allow.mjs in shared is default
mock-list mock-allow.mjs
after-auth-redirect /
un-auth-redirect /login
#custom-authorize /authorize

@aws
runtime nodejs14.x