import * as assert from 'assert'
import app from '../src/index'

const MOCK_START = '2018-01-20'
const MOCK_END = '2018-02-20'
const MOCK_PACKAGES = [
	{ package: 'npm', address: 'xxx' },
	{ package: 'express', address: 'yyy' },
	{ package: 'react', address: 'zzz' }
]

const MOCK_EXPECTED = {
	count: 31287918,
	all: [
		{ value: 3685898, package: 'npm', address: 'xxx' },
		{ value: 19171074, package: 'express', address: 'yyy' },
		{ value: 8430946, package: 'react', address: 'zzz' }
	]
}

describe('prototyping', () => {
	it('all count', async () => {
		const all = await app(MOCK_START, MOCK_END, MOCK_PACKAGES)
		assert.deepStrictEqual(all, MOCK_EXPECTED)
	})
})
