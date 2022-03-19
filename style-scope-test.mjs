import buildScoper from '../../src/scope-css.mjs'
import test from 'tape'
const scope = buildScoper({
    scopeTo: 'my-tag',
    disable: false,
    instance: 'abc'
  })

test('global block', (t) => {
  t.plan(1)

  const block = `<style enh-scope="global"> 
    div { background:blue; }
  </style>`
  const result = scope`${block}`
  const expected = `<style enh-scope="global"> 
    div { background:blue; }
  </style>`
  t.equal(expected,result,'global block match')
})

test('default global block', (t) => {
  t.plan(1)

  const block = `<style> 
    div { background:blue; }
  </style>`
  const result = scope`${block}`
  const expected = `<style> 
    div { background:blue; }
  </style>`
  t.equal(expected,result,'default global block match')

})


test('component block', (t) => {
  t.plan(1)

  const block = `<style enh-scope="component"> 
    :host { background:blue; }
    .container > ::slotted(*) {
      display: block;
    }
    .container > ::slotted(*[slot="title"]) {
      display: block;
    }
    .foo { display: block; }
    another-tag::part(thing) { display: block; }
  </style>`
  const result = scope`${block}`
  const expected = `<style enh-scope="my-tag"> 
my-tag  {
  background: blue;
}

my-tag .container > * {
  display: block;
}

my-tag .container > *[slot="title"] {
  display: block;
}

my-tag .foo {
  display: block;
}

my-tag another-tag [part*="thing"][part*="another-tag"] {
  display: block;
} 
</style>`
  t.equal(expected,result,'component block match')

})

test('instance block', (t) => {
  t.plan(1)

  const block = `<style enh-scope="instance"> 
    :host { background:blue; }
    .container > ::slotted(*) {
      display: block;
    }
    .container > ::slotted(*[slot="title"]) {
      display: block;
    }
    .foo { display: block; }
    another-tag::part(thing) { display: block; }
  </style>`
  const result = scope`${block}`
  const expected = `<style enh-scope="my-tag.abc"> 
my-tag.abc  {
  background: blue;
}

my-tag.abc .container > * {
  display: block;
}

my-tag.abc .container > *[slot="title"] {
  display: block;
}

my-tag.abc .foo {
  display: block;
}

my-tag.abc another-tag [part*="thing"][part*="another-tag"] {
  display: block;
} 
</style>`
  t.equal(expected,result,'component block match')

})
