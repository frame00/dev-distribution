import {
	getAllDownloadsCountNPM,
	calcAllDownloadsCount,
	createDistributions
} from './libs'
import { Distributions, DistributionTarget } from './types'

export default async (
	start: string,
	end: string,
	packages: DistributionTarget[]
): Promise<Distributions> =>
	getAllDownloadsCountNPM(start, end, packages.map(pkg => pkg.package))
		.then(allData => {
			const count = calcAllDownloadsCount(allData)
			return {
				count,
				all: createDistributions(packages, allData, count)
			}
		})
		.catch(err => err)
