import * as assert from 'assert'
import app from '../src/index'

const MOCK_START = '2018-01-20'
const MOCK_END = '2018-02-20'
const MOCK_PACKAGES = [
	{ package: 'npm', address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae' },
	{ package: 'express', address: '0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a' },
	{ package: 'react', address: '0x4e83362442b8d1bec281594cea3050c8eb01311c' }
]

const MOCK_EXPECTED = {
	count: 31287918,
	incrementalCount: 0,
	downloadsCount: 31287918,
	all: [
		{
			value: 3685898,
			downloads: 3685898,
			incremental: 0,
			package: 'npm',
			address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'
		},
		{
			value: 19171074,
			downloads: 19171074,
			incremental: 0,
			package: 'express',
			address: '0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a'
		},
		{
			value: 8430946,
			downloads: 8430946,
			incremental: 0,
			package: 'react',
			address: '0x4e83362442b8d1bec281594cea3050c8eb01311c'
		}
	]
}

describe('prototyping', () => {
	it('all count', async () => {
		const all = await app(MOCK_START, MOCK_END, MOCK_PACKAGES)
		assert.deepStrictEqual(all, MOCK_EXPECTED)
	}).timeout(100000)
})
