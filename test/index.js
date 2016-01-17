import path from 'path'
import fs from 'fs'
import assert from 'assert'
import { transformFileSync } from 'babel-core'
import plugin from '../src'
import { trim } from 'lodash'

describe('numeric operators in N`` tags', () => {
  const fixturesDir = path.join(__dirname, 'fixtures')
  fs.readdirSync(fixturesDir).map(caseName => {
    it(`should ${caseName.split('-').join(' ')}`, () => {
      const fixtureDir = path.join(fixturesDir, caseName)
      const sourcePath = path.join(fixtureDir, 'source.js')
      const transformedPath = path.join(fixtureDir, 'transformed.js')

      const transformed = transformFileSync(sourcePath, { 
          plugins: [plugin] 
      }).code

      const expected = fs.readFileSync(transformedPath).toString()

      assert.equal(trim(transformed), trim(expected));
    });
  });
});
