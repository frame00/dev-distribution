import * as assert from 'assert'
import app from '../src/index'
import { Distributions } from '../src/types'

const MOCK_START = '2018-01-20'
const MOCK_END = '2018-02-20'
const MOCK_TOTAL_DISTRIBUTION = 10000
const MOCK_PACKAGES = [
	{
		package: 'npm',
		address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
		date: '2018-01-01'
	},
	{
		package: 'express',
		address: '0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a',
		date: '2018-01-01'
	},
	{
		package: 'react',
		address: '0x4e83362442b8d1bec281594cea3050c8eb01311c',
		date: '2018-01-01'
	}
]

const MOCK_EXPECTED = {
	distributions: 10000,
	count: 31287918,
	pointCount: 0,
	downloadsCount: 31287918,
	all: [
		{
			value: 1178.0579327777577,
			count: 3685898,
			downloads: 3685898,
			balance: 0,
			point: 0,
			package: 'npm',
			address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
			date: '2018-01-01'
		},
		{
			value: 6127.30895037503,
			count: 19171074,
			downloads: 19171074,
			balance: 0,
			point: 0,
			package: 'express',
			address: '0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a',
			date: '2018-01-01'
		},
		{
			value: 2694.6331168472125,
			count: 8430946,
			downloads: 8430946,
			balance: 0,
			point: 0,
			package: 'react',
			address: '0x4e83362442b8d1bec281594cea3050c8eb01311c',
			date: '2018-01-01'
		}
	]
}

describe('prototyping', () => {
	let results: Distributions
	it('all count', async () => {
		results = await app(
			MOCK_START,
			MOCK_END,
			MOCK_TOTAL_DISTRIBUTION,
			MOCK_PACKAGES
		)
		assert.deepStrictEqual(results, MOCK_EXPECTED)
	}).timeout(100000)

	it('Sum of all values is the same as the value of "distributions"', () => {
		const sumValues = results.all
			.map(dist => dist.value)
			.reduce((prev, current) => prev + current)
		assert.strictEqual(sumValues, MOCK_TOTAL_DISTRIBUTION)
	})
})
