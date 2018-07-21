export interface NPMCountResponseBody {
	downloads: number
	start: string
	end: string
	package: string
}

export interface EtherscanResponseBody {
	status: number
	message: string
	result: number
}

export interface EtherscanResponseBodyAddressExtended
	extends EtherscanResponseBody {
	address: string
}

export interface IncrementalToken {
	address: string
	increment: number
}

export interface PackagesAllData {
	downloads: number
	start: string
	end: string
	package: string
	address: string
	increment: number
}

export interface DistributionTarget {
	package: string
	address: string
}

export interface DistributionRate extends DistributionTarget {
	value: number
	downloads: number
	incremental: number
}

export interface Distributions {
	count: number
	incrementalCount: number
	downloadsCount: number
	all: DistributionRate[]
}

export type Packages = string[]
