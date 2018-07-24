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

export interface AddressBalance {
	address: string
	balance: number
}

export interface AddressBalanceExtendedPoint extends AddressBalance {
	point: number
}

export interface PackagesAllData
	extends NPMCountResponseBody,
		AddressBalanceExtendedPoint {}

export interface DistributionTarget {
	package: string
	address: string
	date: string
}

export interface DistributionRate extends DistributionTarget {
	value: number
	balance: number
	count: number
	point: number
	downloads: number
}

export interface Distributions {
	count: number
	pointCount: number
	downloadsCount: number
	all: DistributionRate[]
}

export type Packages = string[]
