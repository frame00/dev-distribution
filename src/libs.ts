import { get as _get } from 'request'
import {
	NPMCountResponseBody,
	Packages,
	DistributionTarget,
	EtherscanResponseBody,
	EtherscanResponseBodyExtended,
	PackagesAllData,
	EtherscanResponseBodyExtendedPoint
} from './types'

const get = async <T>(url: string) =>
	new Promise<T>((resolve, reject) => {
		_get(
			{
				url,
				json: true
			},
			(err, res) => {
				if (err) {
					return reject(err)
				}
				resolve(res.body)
			}
		)
	})

export const getDownloadsCountNPM = async (
	start: string,
	end: string,
	packageName: string
) =>
	get<NPMCountResponseBody>(
		`https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`
	)

export const getAllDownloadsCountNPM = async (
	start: string,
	end: string,
	packages: Packages
) =>
	Promise.all(packages.map(async pkg => getDownloadsCountNPM(start, end, pkg)))

export const getBalanceDev = async (
	address: string
): Promise<EtherscanResponseBodyExtended> => {
	const res = await get<EtherscanResponseBody>(
		`https://welg1mzug8.execute-api.us-east-1.amazonaws.com/prototype/?address=${address}`
	)
	const balance = parseFloat(`${res.result}`)
	return { ...{ address, balance }, ...res }
}

export const getAllBalanceDev = async (addresses: string[]) =>
	Promise.all(addresses.map(async address => getBalanceDev(address)))

const calcBalancePoint = (
	balance: number,
	endDate: string,
	registerDate: string
) =>
	balance /
	(new Date(endDate).getTime() - new Date(registerDate).getTime()) /
	86400000

export const getAllBalancePointDev = async (
	end: string,
	targets: DistributionTarget[]
) => {
	const results = await getAllBalanceDev(targets.map(tgt => tgt.address))
	const find = (address: string) =>
		targets.find(tgt => tgt.address === address) || { date: end }
	return results.map(result => {
		const { address, balance } = result
		return {
			...result,
			...{
				address,
				balance,
				point: calcBalancePoint(balance, end, find(address).date)
			}
		}
	})
}

export const mergePackageData = (
	npms: NPMCountResponseBody[],
	points: EtherscanResponseBodyExtendedPoint[],
	packages: DistributionTarget[]
) =>
	npms.map(npm => {
		const address = packages.find(pkg => pkg.package === npm.package) || {
			address: ''
		}
		const balance = points.find(point => point.address === address.address) || {
			address: '',
			balance: 0,
			point: 0
		}
		return { ...npm, ...balance }
	})

export const calcAllDownloadsCount = (items: NPMCountResponseBody[]) =>
	items.map(item => item.downloads).reduce((prev, current) => prev + current)

export const calcAllPointCount = (items: PackagesAllData[]) =>
	items.map(item => item.point).reduce((prev, current) => prev + current)

export const calcDistributionRate = (itemCount: number, totalCount: number) =>
	itemCount / totalCount

export const calcDistributionValue = (
	itemCount: number,
	pointCount: number,
	totalCount: number
) => totalCount * calcDistributionRate(itemCount + pointCount, totalCount)

export const findPackageDownloads = (
	name: string,
	allData: PackagesAllData[]
) => {
	const pkg = allData.find(data => data.package === name)
	return pkg ? pkg.downloads : pkg
}

export const findPackageDistoributionDetails = (
	name: string,
	allData: PackagesAllData[]
) => allData.find(data => data.package === name)

export const createDistributions = (
	targets: DistributionTarget[],
	allData: PackagesAllData[],
	count: number
) =>
	targets.map(item => {
		const detail = findPackageDistoributionDetails(
			item.package,
			allData
		) as PackagesAllData
		const { downloads, balance, point } = detail
		const val = {
			value: calcDistributionValue(downloads, point, count),
			downloads,
			balance,
			point
		}
		return { ...val, ...item }
	})
