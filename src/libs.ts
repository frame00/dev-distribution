import { get as _get } from 'request'
import BigNumber from 'bignumber.js'
import {
	NPMCountResponseBody,
	Packages,
	DistributionTarget,
	EtherscanResponseBody,
	PackagesAllData,
	AddressBalance,
	AddressBalanceExtended,
	DistributionRate,
	DistributionTokens
} from './types'
import { all as ThrottleAll } from 'promise-parallel-throttle'
import { contract } from '../config/contract'

export const get = async <T>(url: string) =>
	new Promise<T>((resolve, reject) => {
		_get(
			{
				url,
				json: true
			},
			(err, res) => {
				if (err) {
					reject(err)
					return
				}
				resolve(res.body as T)
			}
		)
	})

export const integerToDecimals = (int: number) =>
	int / Number(`1e+${contract.decimals}`)

export const decimalsToInteger = (int: number) =>
	int * Number(`1e+${contract.decimals}`)

export const toPositiveNumber = (num: number) => (num > 0 ? num : 0)

export const getDownloadsCountNPM = async (
	start: string,
	end: string,
	packageName: string
) =>
	get<NPMCountResponseBody>(
		`https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`
	).then(res =>
		res.package
			? res
			: {
					...res,
					downloads: 0,
					start,
					end,
					package: packageName
			  }
	)

export const getAllDownloadsCountNPM = async (
	start: string,
	end: string,
	packages: Packages
) =>
	ThrottleAll(
		packages.map(pkg => async () => getDownloadsCountNPM(start, end, pkg)),
		{ maxInProgress: 20 }
	)

export const getBalanceDev = async (
	address: string
): Promise<AddressBalance> => {
	const res = await get<EtherscanResponseBody>(
		// Source Code of The API: https://gist.github.com/aggre/5b83279ff99b6cecac557810eab73b89
		`https://welg1mzug8.execute-api.us-east-1.amazonaws.com/prototype/?address=${address}`
	)
	const balance = integerToDecimals(parseFloat(`${res.result}`)) || 0
	return { address, balance }
}

export const getAllBalanceDev = async (addresses: string[]) =>
	ThrottleAll(addresses.map(address => async () => getBalanceDev(address)), {
		maxInProgress: 5
	})

export const calcBalancePoint = (
	balance: number,
	endDate: string,
	registerDate: string
) =>
	toPositiveNumber(
		balance /
			((new Date(endDate).getTime() - new Date(registerDate).getTime()) /
				86400000)
	)

export const arrayWithoutDuplication = <T>(arr: T[]) => Array.from(new Set(arr))

export const getAllBalancePointDev = async (
	end: string,
	targets: DistributionTarget[]
) => {
	const results = await getAllBalanceDev(
		arrayWithoutDuplication(targets.map(tgt => tgt.address))
	)
	const find = (address: string) =>
		results.find(res => res.address === address) || { balance: 0 }
	return targets.map(pkg => {
		const { balance } = find(pkg.address)
		return {
			...pkg,
			...{
				balance,
				point: calcBalancePoint(balance, end, pkg.date)
			}
		}
	})
}

export const mergePackageData = (
	npms: NPMCountResponseBody[],
	points: AddressBalanceExtended[],
	packages: DistributionTarget[]
): PackagesAllData[] =>
	npms.map(npm => {
		const pkg = packages.find(pk => pk.package === npm.package)
		if (!pkg) {
			console.log(npm)
			throw new Error(`Package not found: ${npm.package}`)
		}
		const data = points.find(p => p.package === pkg.package)
		if (!data) {
			throw new Error(`Point not found: ${npm.package}`)
		}
		if (npm.error) {
			// When the download count of the npm package cannot be fetched, the point is regarded as 0.
			return {
				...npm,
				...data,
				point: 0
			}
		}
		return { ...npm, ...data }
	})

export const calcAllDownloadsCount = (items: NPMCountResponseBody[]) =>
	items.map(item => item.downloads).reduce((prev, current) => prev + current)

export const calcAllPointCount = (items: PackagesAllData[]) =>
	items.map(item => item.point).reduce((prev, current) => prev + current)

export const calcDistributionRate = (itemCount: number, totalCount: number) =>
	itemCount / totalCount

export const calcDistributionValue = (
	itemCount: number,
	totalCount: number,
	totalDistribution: number
) => totalDistribution * calcDistributionRate(itemCount, totalCount)

export const calcDistributionCount = (
	downloadsCount: number,
	pointCount: number
) => downloadsCount + pointCount

export const findPackageDistoributionDetails = (
	name: string,
	allData: PackagesAllData[]
) => allData.find(data => data.package === name)

export const createDistributions = (
	targets: DistributionTarget[],
	allData: PackagesAllData[],
	totalCount: number,
	totalDistribution: number
) =>
	targets.map(item => {
		const { downloads, balance, point } = findPackageDistoributionDetails(
			item.package,
			allData
		) as PackagesAllData
		const count = calcDistributionCount(downloads, point)
		const val = {
			value: calcDistributionValue(count, totalCount, totalDistribution),
			count,
			downloads,
			balance,
			point
		}
		return { ...val, ...item }
	})

export const createTokens = (
	distributionRates: DistributionRate[]
): DistributionTokens[] => {
	const list = arrayWithoutDuplication(
		distributionRates.map(dist => dist.address)
	)
	const sumValues = (address: string) => {
		let value = 0
		for (const dist of distributionRates) {
			if (dist.address === address) {
				value += dist.value
			}
		}
		return value
	}
	return list.map(address => {
		const value = sumValues(address)
		const uint256 = new BigNumber(decimalsToInteger(value)).toString(10)
		return {
			address,
			value,
			uint256
		}
	})
}
