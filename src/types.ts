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

export interface EtherscanResponseBodyExtended extends EtherscanResponseBody {
	address: string
	balance: number
}

export interface EtherscanResponseBodyExtendedPoint
	extends EtherscanResponseBodyExtended {
	point: number
}

export interface PackagesAllData {
	downloads: number
	start: string
	end: string
	package: string
	address: string
	balance: number
	point: number
}

export interface DistributionTarget {
	package: string
	address: string
	date: string
}

export interface DistributionRate extends DistributionTarget {
	value: number
	downloads: number
	balance: number
	point: number
}

export interface Distributions {
	count: number
	pointCount: number
	downloadsCount: number
	all: DistributionRate[]
}

export type Packages = string[]
