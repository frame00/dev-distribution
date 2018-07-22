import {
	getAllDownloadsCountNPM,
	calcAllDownloadsCount,
	createDistributions,
	mergePackageData,
	getAllBalancePointDev,
	calcAllPointCount
} from './libs'
import { Distributions, DistributionTarget } from './types'

export default async (
	start: string,
	end: string,
	packages: DistributionTarget[]
): Promise<Distributions> => {
	const results = await Promise.all([
		getAllDownloadsCountNPM(start, end, packages.map(pkg => pkg.package)),
		getAllBalancePointDev(end, packages)
	])
	const [downloads, points] = results
	const marged = mergePackageData(downloads, points, packages)
	const pointCount = calcAllPointCount(marged)
	const downloadsCount = calcAllDownloadsCount(downloads)
	const count = downloadsCount + pointCount

	return {
		count,
		pointCount,
		downloadsCount,
		all: createDistributions(packages, marged, count)
	}
}
