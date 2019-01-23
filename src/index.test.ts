import test from 'ava'
import app from './index'
import { Distributions } from './types'
import { distribution } from '../config/distribution'
import { getBalanceDev, getDownloadsCountNPM, toPositiveNumber } from './libs'
import { contract } from '../config/contract'

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

let results: Distributions
test.before(async () => {
	results = await app(
		MOCK_START,
		MOCK_END,
		MOCK_TOTAL_DISTRIBUTION,
		MOCK_PACKAGES
	)
})

test('Value of "distributions" is 3rd arguments', t => {
	t.is(MOCK_TOTAL_DISTRIBUTION, results.distributions)
})

test('Value of "distributions" and the sum of "value" value of each item in "details" almost match(99.9999999999999%)', t => {
	const sum = results.details
		.map(dist => dist.value)
		.reduce((prev, current) => {
			return prev + current
		})
	const l = sum > MOCK_TOTAL_DISTRIBUTION ? sum : MOCK_TOTAL_DISTRIBUTION
	const s = sum < MOCK_TOTAL_DISTRIBUTION ? sum : MOCK_TOTAL_DISTRIBUTION
	t.true(s / l >= 0.999999999999999)
})

test('Value of "count" is sum of points and downloads', t => {
	const sum = results.points + results.downloads
	t.is(sum, results.count)
})

test('Value of "count" and the sum of "count" value of each item in "details" almost match(99.9999999999999%)', t => {
	const sum = results.details
		.map(detail => detail.count)
		.reduce((prev, current) => prev + current)
	const { count } = results
	const l = sum > count ? sum : count
	const s = sum < count ? sum : count
	t.true(s / l >= 0.999999999999999)
})

test('Value of "points" and the sum of "point" value of each item in "details" match', t => {
	const sum = results.details
		.map(detail => detail.point)
		.reduce((prev, current) => prev + current)
	t.is(sum, results.points)
})

test('Value of "downloads" and the sum of "downloads" value of each item in "details" match', t => {
	const sum = results.details
		.map(detail => detail.downloads)
		.reduce((prev, current) => prev + current)
	t.is(sum, results.downloads)
})

test('Value of "threshold" defined by the config file', t => {
	const threshold = distribution.threshold.downloads
	t.is(threshold, results.threshold)
})

test('When the "downloads" is greater than or equal to the "threshold", the value of "distributable" is true', t => {
	t.is(results.downloads >= results.threshold, results.distributable)
})

test('Value of "term.from" is 1st arguments', t => {
	t.is(MOCK_START, results.term.from)
})

test('Value of "term.to" is 2nd arguments', t => {
	t.is(MOCK_END, results.term.to)
})

test('Values of "timestamp.start", "timestamp.apiCallEnd" and "timestamp.end" are Date objects', t => {
	const { start, apiCallEnd, end } = results.timestamp
	t.true(start instanceof Date)
	t.true(apiCallEnd instanceof Date)
	t.true(end instanceof Date)
})

test('Value of "timestamp.apiCallEnd" is larger than the value of "timestamp.start", and the value of "timestamp.end" is larger than the value of "timestamp.apiCallEnd"', t => {
	const { start, apiCallEnd, end } = results.timestamp
	t.true(start < apiCallEnd)
	t.true(apiCallEnd <= end)
})

test('"details[i].value" multiples "distributions" by the ratio of "count" for all items.', t => {
	const { distributions, count: allCount } = results
	for (const iterator of results.details) {
		const { value, count } = iterator
		t.is(value, distributions * (count / allCount))
	}
})

test('Value of "details[i].count" is sum of point and downloads', t => {
	for (const iterator of results.details) {
		const { point, downloads, count } = iterator
		t.is(count, point + downloads)
	}
})

test('Value of "details[i].downloads" is the total number of package downloads for "term" period.', async t => {
	let c = 0
	await Promise.all(
		results.details.map(async detail => {
			const { downloads, package: pkg } = detail
			const res = await getDownloadsCountNPM(MOCK_START, MOCK_END, pkg)
			c += 1
			return t.is(downloads, res.downloads)
		})
	)
	t.is(c, results.details.length)
})

test('"details[i].balance" is the current holding tokens', async t => {
	let c = 0
	await Promise.all(
		results.details.map(async detail => {
			const { balance, address } = detail
			const tokens = await getBalanceDev(address)
			c += 1
			return t.is(balance, tokens.balance)
		})
	)
	t.is(c, results.details.length)
})

test('"details[i].point" divides the value of "balance" by the number of days elapsed since the date of "date"', t => {
	for (const iterator of results.details) {
		const { point, balance, date } = iterator
		const days =
			(new Date(MOCK_END).getTime() - new Date(date).getTime()) / 86400000
		t.is(point, toPositiveNumber(balance / days))
	}
})

test('Value of "tokens[i].value" is the sum of the "value" of the package of the same "address"', t => {
	for (const iterator of results.tokens) {
		let sum = 0
		const { address } = iterator
		for (const pkg of results.details) {
			if (pkg.address === address) {
				sum += pkg.value
			}
		}
		t.is(sum, iterator.value)
	}
})

test('Value of "tokens[i].uint256" is "value" converted to uint256.', t => {
	for (const iterator of results.tokens) {
		const { uint256, value } = iterator
		t.is(Number(uint256), value * Number(`1e+${contract.decimals}`))
	}
})
