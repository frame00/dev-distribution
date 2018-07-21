import { get } from 'request'
import { NPMCountResponseBody, Packages, DistributionTarget } from './types'

export const getDownloadsCountNPM = async (
	start: string,
	end: string,
	packageName: string
) =>
	new Promise<NPMCountResponseBody>((resolve, reject) => {
		get(
			{
				url: `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`,
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

export const getAllDownloadsCountNPM = async (
	start: string,
	end: string,
	packages: Packages
) =>
	Promise.all(packages.map(async pkg => getDownloadsCountNPM(start, end, pkg)))

export const calcAllDownloadsCount = (items: NPMCountResponseBody[]) =>
	items.map(item => item.downloads).reduce((prev, current) => prev + current)

export const calcDistributionRate = (itemCount: number, totalCount: number) =>
	itemCount / totalCount

export const calcDistributionValue = (itemCount: number, totalCount: number) =>
	totalCount * calcDistributionRate(itemCount, totalCount)

export const findPackageDownloads = (
	name: string,
	allCountData: NPMCountResponseBody[]
) => {
	const pkg = allCountData.find(data => data.package === name)
	return pkg ? pkg.downloads : pkg
}

export const createDistributions = (
	targets: DistributionTarget[],
	allData: NPMCountResponseBody[],
	count: number
) =>
	targets.map(item => {
		const val = {
			value: calcDistributionValue(
				findPackageDownloads(item.package, allData) || 0,
				count
			)
		}
		return { ...val, ...item }
	})
