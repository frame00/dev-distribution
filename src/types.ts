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

export interface DistributionTarget {
	package: string
	address: string
	date: string
}

export interface AddressBalanceExtended
	extends AddressBalance,
		DistributionTarget {
	point: number
}

export interface PackagesAllData
	extends NPMCountResponseBody,
		AddressBalanceExtended {}

export interface DistributionRate extends DistributionTarget {
	value: number
	balance: number
	count: number
	point: number
	downloads: number
}

export interface DistributionTokens {
	value: number
	address: string
}

export interface Distributions {
	distributions: number
	count: number
	points: number
	downloads: number
	threshold: number
	distributable: boolean
	term: {
		// tslint:disable-next-line:type-literal-delimiter
		from: string
		// tslint:disable-next-line:type-literal-delimiter
		to: string
	}
	timestamp: {
		// tslint:disable-next-line:type-literal-delimiter
		start: Date
		// tslint:disable-next-line:type-literal-delimiter
		apiCallEnd: Date
		// tslint:disable-next-line:type-literal-delimiter
		end: Date
	}
	details: DistributionRate[]
	tokens: DistributionTokens[]
}

export type Packages = string[]
