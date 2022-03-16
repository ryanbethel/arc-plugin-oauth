@app
plugin-tester

@http
get /

@plugins
arc-plugin-oauth

@oauth
use-mock true
routes login auth logout 
allow-list allow.mjs
mock-list mock-allow.mjs
after-auth-url /

@aws
runtime nodejs14.x