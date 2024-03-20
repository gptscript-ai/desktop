import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi:   false,
  },

  typescript: true,
  vue:        true,

  rules: {
    'array-bracket-spacing':         'error',
    'arrow-parens':                  ['error', 'always'],
    'arrow-spacing':                 ['error', { before: true, after: true }],
    'block-spacing':                 ['error', 'always'],
    'brace-style':                   ['error', '1tbs', { allowSingleLine: false }],
    'comma-dangle':                  ['error', 'only-multiline'],
    'comma-spacing':                 'error',
    'curly':                         ['error', 'all'],
    'func-call-spacing':             ['error', 'never'],
    'implicit-arrow-linebreak':      'error',
    'keyword-spacing':               'error',
    'lines-between-class-members':   ['error', 'always', { exceptAfterSingleLine: true }],
    'multiline-ternary':             ['error', 'never'],
    'n/prefer-global/process':       'off',
    'newline-per-chained-call':      ['error', { ignoreChainWithDepth: 4 }],
    'no-caller':                     'error',
    'no-cond-assign':                ['error', 'except-parens'],
    'no-console':                    ['error', { allow: ['debug', 'info', 'error', 'error'] }],
    'no-debugger':                   'error',
    'no-eq-null':                    'error',
    'no-eval':                       'error',
    'no-trailing-spaces':            'error',
    'no-unused-vars':                'error',
    'no-whitespace-before-property': 'error',
    'object-curly-spacing':          ['error', 'always'],
    'object-property-newline':       'off',
    'object-shorthand':              'error',
    'padded-blocks':                 ['error', 'never'],
    'prefer-arrow-callback':         'error',
    'prefer-template':               'error',
    'quote-props':                   ['error', 'consistent-as-needed'],
    'react/display-name':            'off',
    'react/no-unknown-property':     'off',
    'rest-spread-spacing':           'error',
    'space-before-function-paren':   'off',
    'space-in-parens':               'off',
    'space-infix-ops':               'error',
    'spaced-comment':                'error',
    'switch-colon-spacing':          'error',
    'template-curly-spacing':        ['error', 'always'],
    'yield-star-spacing':            ['error', 'both'],

    'style/arrow-parens':            ['error', 'always'],
    'style/brace-style':             ['error', '1tbs', { allowSingleLine: false }],
    'style/type-annotation-spacing': 'off',
    'style/template-curly-spacing':  ['error', 'always'],
    'style/no-multi-spaces':         'off',

    'style/key-spacing': ['error', {
      multiLine: {
        beforeColon: false,
        afterColon:  true,
      },

      align: {
        beforeColon: false,
        afterColon:  true,
        mode:        'minimum',
        on:          'value',
      },
    }],

    'style/object-curly-newline': ['error', {
      ObjectExpression: {
        multiline:     true,
        minProperties: 4,
      },
      ObjectPattern: {
        multiline:     true,
        minProperties: 4,
      },
      ImportDeclaration: {
        multiline:     true,
        minProperties: 5,
      },
      ExportDeclaration: {
        multiline:     true,
        minProperties: 3,
      },
    }],

    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev:      '*',
        next:      'return',
      },
      {
        blankLine: 'always',
        prev:      'function',
        next:      'function',
      },
      {
        blankLine: 'always',
        prev:      ['const', 'let', 'var'],
        next:      '*',
      },
      {
        blankLine: 'any',
        prev:      ['const', 'let', 'var'],
        next:      ['const', 'let', 'var'],
      },
    ],

    'quotes': [
      'error',
      'single',
      {
        avoidEscape:           true,
        allowTemplateLiterals: true,
      },
    ],

    'vue/component-options-name-casing': ['error', 'kebab-case'],
  },
})
