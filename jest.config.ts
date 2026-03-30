import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const ESM_PACKAGES = [
  'react-markdown',
  'remark-gfm',
  'rehype-highlight',
  'rehype-sanitize',
  'unified',
  'remark-parse',
  'rehype-parse',
  'vfile',
  'unist-util-visit',
  'mdast-util-from-markdown',
  'mdast-util-to-markdown',
  'mdast-util-gfm',
  'mdast-util-frontmatter',
  'micromark',
  'micromark-extension-gfm',
  'micromark-util-character',
  'micromark-util-chunked',
  'micromark-util-combine-extensions',
  'micromark-util-decode-string',
  'micromark-util-encode',
  'micromark-util-events-to-acorn',
  'micromark-util-html-tag-name',
  'micromark-util-normalize-identifier',
  'micromark-util-resolve-all',
  'micromark-util-sanitize-uri',
  'micromark-util-symbol',
  'micromark-util-types',
  'decode-named-character-reference',
  'character-entities',
  'devlop',
  'nuqs',
].join('|')

const customConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/__tests__/setup\\.ts$'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
  },
}

// Async export: post-process Next.js generated config to fix transformIgnorePatterns.
// Next.js prepends its own patterns that don't include nuqs — we replace ALL patterns
// with a single unified pattern that covers every ESM package we need to transform.
export default async () => {
  const nextConfig = await createJestConfig(customConfig)()
  return {
    ...nextConfig,
    transformIgnorePatterns: [
      `/node_modules/(?!(${ESM_PACKAGES})/)`,
      `^.+\\.module\\.(css|sass|scss)$`,
    ],
  }
}
