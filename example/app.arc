@app
plugin-tester

@http
get /

@plugins
arc-plugin-oauth

@oauth
use-mock false
routes login auth logout 
allow-list allow.mjs
mock-list mock-allow.mjs

@aws
runtime nodejs14.x