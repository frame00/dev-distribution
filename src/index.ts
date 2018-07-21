import {
	getAllDownloadsCountNPM,
	calcAllDownloadsCount,
	createDistributions,
	getAllIncrementalBalanceDev,
	calcAllIncrementCount,
	mergePackageData
} from './libs'
import { Distributions, DistributionTarget } from './types'

export default async (
	start: string,
	end: string,
	packages: DistributionTarget[]
): Promise<Distributions> => {
	const results = await Promise.all([
		getAllDownloadsCountNPM(start, end, packages.map(pkg => pkg.package)),
		getAllIncrementalBalanceDev(start, end, packages.map(pkg => pkg.address))
	])
	const [downloads, incremental] = results
	const marged = mergePackageData(downloads, incremental, packages)
	const totalIncrement = calcAllIncrementCount(marged)
	const count = calcAllDownloadsCount(marged) + totalIncrement
	return {
		count,
		all: createDistributions(packages, marged, count)
	}
}
