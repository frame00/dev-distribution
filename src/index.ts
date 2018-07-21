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
	const incrementalCount = calcAllIncrementCount(marged)
	const downloadsCount = calcAllDownloadsCount(downloads)
	const count = downloadsCount + incrementalCount

	return {
		count,
		incrementalCount,
		downloadsCount,
		all: createDistributions(packages, marged, count)
	}
}
