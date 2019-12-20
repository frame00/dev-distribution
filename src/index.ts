import {
	getAllDownloadsCountNPM,
	calcAllDownloadsCount,
	createDistributions,
	mergePackageData,
	getAllBalancePointDev,
	calcAllPointCount,
	createTokens
} from './libs'
import { Distributions, DistributionTarget } from './types'
import { distribution } from '../config/distribution'

export default async (
	from: string,
	to: string,
	distributions: number,
	packages: DistributionTarget[]
): Promise<Distributions> => {
	const start = new Date()
	const [downloadsRes, pointsRes] = await Promise.all([
		getAllDownloadsCountNPM(
			from,
			to,
			packages.map(pkg => pkg.package)
		),
		getAllBalancePointDev(to, packages)
	])
	const apiCallEnd = new Date()
	const marged = mergePackageData(downloadsRes, pointsRes, packages)
	const points = calcAllPointCount(marged)
	const downloads = calcAllDownloadsCount(downloadsRes)
	const count = downloads + points
	const threshold = distribution.threshold.downloads
	const distributable = threshold <= downloads
	const details = createDistributions(packages, marged, count, distributions)
	const tokens = createTokens(details)
	const end = new Date()

	return {
		distributions,
		count,
		points,
		downloads,
		threshold,
		distributable,
		term: {
			from,
			to
		},
		timestamp: {
			start,
			apiCallEnd,
			end
		},
		details,
		tokens
	}
}
