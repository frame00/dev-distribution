export interface NPMCountResponseBody {
	downloads: number
	start: string
	end: string
	package: string
}

export interface DistributionTarget {
	package: string
	address: string
}

export interface DistributionRate extends DistributionTarget {
	value: number
}

export interface Distributions {
	count: number
	all: DistributionRate[]
}

export type Packages = string[]
