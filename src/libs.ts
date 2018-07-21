import { get as _get } from 'request'
import {
	NPMCountResponseBody,
	Packages,
	DistributionTarget,
	EtherscanResponseBody,
	EtherscanResponseBodyAddressExtended,
	IncrementalToken,
	PackagesAllData
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
	date: string,
	address: string
): Promise<EtherscanResponseBodyAddressExtended> => {
	const res = await get<EtherscanResponseBody>(
		`https://welg1mzug8.execute-api.us-east-1.amazonaws.com/prototype/?date=${date}&address=${address}`
	)
	return { ...{ address }, ...res }
}

export const getAllBalanceDev = async (date: string, addresses: string[]) =>
	Promise.all(addresses.map(async address => getBalanceDev(date, address)))

const findBalance = (findTarget: EtherscanResponseBodyAddressExtended[]) => (
	address: string
) => findTarget.find(data => data.address === address)

const getBalance = (balance?: EtherscanResponseBodyAddressExtended) =>
	balance ? (balance.result ? balance.result : 0) : 0

const calcIncrementalBalance = (prev: number, current: number) =>
	current - prev >= 0 ? current - prev : 0

export const getAllIncrementalBalanceDev = async (
	start: string,
	end: string,
	addresses: string[]
) => {
	const results = await Promise.all([
		getAllBalanceDev(start, addresses),
		getAllBalanceDev(end, addresses)
	])
	const [prev, current] = results
	const find = findBalance(prev)
	return current.map(balance => {
		return {
			address: balance.address,
			increment: calcIncrementalBalance(
				getBalance(find(balance.address)),
				balance.result
			)
		}
	})
}

export const mergePackageData = (
	npms: NPMCountResponseBody[],
	incremental: IncrementalToken[],
	packages: DistributionTarget[]
) =>
	npms.map(npm => {
		const address = packages.find(pkg => pkg.package === npm.package) || {
			address: ''
		}
		const increment = incremental.find(
			inc => inc.address === address.address
		) || { address: '', increment: 0 }
		return { ...npm, ...increment }
	})

export const calcAllDownloadsCount = (items: NPMCountResponseBody[]) =>
	items.map(item => item.downloads).reduce((prev, current) => prev + current)

export const calcAllIncrementCount = (items: IncrementalToken[]) =>
	items.map(item => item.increment).reduce((prev, current) => prev + current)

export const calcDistributionRate = (itemCount: number, totalCount: number) =>
	itemCount / totalCount

export const calcDistributionValue = (
	itemCount: number,
	incrementCount: number,
	totalCount: number
) => totalCount * calcDistributionRate(itemCount + incrementCount, totalCount)

export const findPackageDownloads = (
	name: string,
	allData: PackagesAllData[]
) => {
	const pkg = allData.find(data => data.package === name)
	return pkg ? pkg.downloads : pkg
}

export const findPackageIncrement = (
	name: string,
	allData: PackagesAllData[]
) => {
	const pkg = allData.find(data => data.package === name)
	return pkg ? pkg.increment : pkg
}

export const createDistributions = (
	targets: DistributionTarget[],
	allData: PackagesAllData[],
	count: number
) =>
	targets.map(item => {
		const val = {
			value: calcDistributionValue(
				findPackageDownloads(item.package, allData) || 0,
				findPackageIncrement(item.package, allData) || 0,
				count
			)
		}
		return { ...val, ...item }
	})
