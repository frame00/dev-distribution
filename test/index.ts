import * as assert from 'assert'
import app from '../src/index'
import { Distributions } from '../src/types'
import { distribution } from '../config/distribution'
import {
	getBalanceDevForTest,
	getDownloadsCountNPMForTest,
	toPositiveNumberForTest
} from '../src/libs'

const MOCK_START = '2018-01-20'
const MOCK_END = '2018-02-20'
const MOCK_TOTAL_DISTRIBUTION = 10000
const MOCK_PACKAGES = [
	{
		package: 'npm',
		address: '0xE23fe51187A807d56189212591F5525127003bdf',
		date: '2018-01-01'
	},
	{
		package: 'n',
		address: '0xE23fe51187A807d56189212591F5525127003bdf',
		date: '2018-02-01'
	},
	{
		package: 'express',
		address: '0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a',
		date: '2018-03-01'
	},
	{
		package: 'react',
		address: '0x4e83362442b8d1bec281594cea3050c8eb01311c',
		date: '2018-04-01'
	}
]

describe('Distribution rate of Dev token', () => {
	let results: Distributions
	before(function(done) {
		this.timeout(10000)
		app(MOCK_START, MOCK_END, MOCK_TOTAL_DISTRIBUTION, MOCK_PACKAGES)
			.then(res => {
				results = res
				done()
			})
			.catch(err => console.error(err))
	})

	describe('distributions', () => {
		it('Value of "distributions" is 3rd arguments', () => {
			assert.strictEqual(MOCK_TOTAL_DISTRIBUTION, results.distributions)
		})

		it('Value of "distributions" and the sum of "value" value of each item in "details" almost match(99.9999999999999%)', () => {
			const sum = results.details
				.map(dist => dist.value)
				.reduce((prev, current) => {
					return prev + current
				})
			const l = sum > MOCK_TOTAL_DISTRIBUTION ? sum : MOCK_TOTAL_DISTRIBUTION
			const s = sum < MOCK_TOTAL_DISTRIBUTION ? sum : MOCK_TOTAL_DISTRIBUTION
			assert.ok(s / l >= 0.999999999999999)
		})
	})

	describe('count', () => {
		it('Value of "count" is sum of points and downloads', () => {
			const sum = results.points + results.downloads
			assert.strictEqual(sum, results.count)
		})

		it('Value of "count" and the sum of "count" value of each item in "details" almost match(99.9999999999999%)', () => {
			const sum = results.details
				.map(detail => detail.count)
				.reduce((prev, current) => prev + current)
			const { count } = results
			const l = sum > count ? sum : count
			const s = sum < count ? sum : count
			assert.ok(s / l >= 0.999999999999999)
		})
	})

	describe('points', () => {
		it('Value of "points" and the sum of "point" value of each item in "details" match', () => {
			const sum = results.details
				.map(detail => detail.point)
				.reduce((prev, current) => prev + current)
			assert.strictEqual(sum, results.points)
		})
	})

	describe('downloads', () => {
		it('Value of "downloads" and the sum of "downloads" value of each item in "details" match', () => {
			const sum = results.details
				.map(detail => detail.downloads)
				.reduce((prev, current) => prev + current)
			assert.strictEqual(sum, results.downloads)
		})
	})

	describe('threshold', () => {
		it('Value of "threshold" defined by the config file', () => {
			const threshold = distribution.threshold.downloads
			assert.strictEqual(threshold, results.threshold)
		})
	})

	describe('distributable', () => {
		it('When the "downloads" is greater than or equal to the "threshold", the value of "distributable" is true', () => {
			assert.strictEqual(
				results.downloads >= results.threshold,
				results.distributable
			)
		})
	})

	describe('term', () => {
		it('Value of "from" is 1st arguments', () => {
			assert.strictEqual(MOCK_START, results.term.from)
		})

		it('Value of "to" is 2nd arguments', () => {
			assert.strictEqual(MOCK_END, results.term.to)
		})
	})

	describe('timestamp', () => {
		it('Values of "start", "apiCallEnd" and "end" are Date objects', () => {
			const { start, apiCallEnd, end } = results.timestamp
			assert.ok(start instanceof Date)
			assert.ok(apiCallEnd instanceof Date)
			assert.ok(end instanceof Date)
		})

		it('Value of "ApiCallEnd" is larger than the value of "start", and the value of "end" is larger than the value of "apiCallEnd"', () => {
			const { start, apiCallEnd, end } = results.timestamp
			assert.ok(start < apiCallEnd)
			assert.ok(apiCallEnd <= end)
		})
	})

	describe('details', () => {
		it('"value" multiples "distributions" by the ratio of "count" for all items.', () => {
			const { distributions, count: allCount } = results
			for (const iterator of results.details) {
				const { value, count } = iterator
				assert.strictEqual(value, distributions * (count / allCount))
			}
		})

		it('Value of "count" is sum of point and downloads', () => {
			for (const iterator of results.details) {
				const { point, downloads, count } = iterator
				assert.strictEqual(count, point + downloads)
			}
		})

		it('Value of "downloads" is the total number of package downloads for "term" period.', async () => {
			await Promise.all(
				results.details.map(async detail => {
					const { downloads, package: pkg } = detail
					const res = await getDownloadsCountNPMForTest(
						MOCK_START,
						MOCK_END,
						pkg
					)
					return assert.strictEqual(downloads, res.downloads)
				})
			)
		}).timeout(10000)

		it('"balance" is the current holding tokens', async () => {
			await Promise.all(
				results.details.map(async detail => {
					const { balance, address } = detail
					const tokens = await getBalanceDevForTest(address)
					return assert.strictEqual(balance, tokens.balance)
				})
			)
		}).timeout(10000)

		it('"point" divides the value of "balance" by the number of days elapsed since the date of "date"', () => {
			for (const iterator of results.details) {
				const { point, balance, date } = iterator
				const days =
					(new Date(MOCK_END).getTime() - new Date(date).getTime()) / 86400000
				assert.strictEqual(point, toPositiveNumberForTest(balance / days))
			}
		})
	})

	describe('tokens', () => {
		it('Value of "value" is the sum of the "value" of the package of the same "address"', () => {
			for (const iterator of results.tokens) {
				let sum = 0
				const { address } = iterator
				for (const pkg of results.details) {
					if (pkg.address !== address) {
						return
					}
					sum += pkg.value
				}
				assert.strictEqual(sum, iterator.value)
			}
		})
	})
})
