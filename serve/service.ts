import { createError } from 'micro'
import { parse } from 'url'
import { packages } from '../config/packages'
import { contract } from '../config/contract'
import { distribution } from '../config/distribution'
import { IncomingMessage } from 'http'

const error = (status = 404, body = 'not found') => createError(status, body)

export const service = async (req: IncomingMessage) => {
	const { url } = req
	if (!url) {
		throw error()
	}
	const parsed = parse(url)
	const { pathname } = parsed
	if (!pathname) {
		throw error()
	}
	switch (pathname) {
		case '/config/packages':
			return packages
		case '/config/contract':
			return contract
		case '/config/distribution':
			return distribution
		default:
			throw error()
	}
}
