import { createError, send as _send } from 'micro'
import { parse } from 'url'
import { packages } from '../config/packages'
import { contract } from '../config/contract'
import { distribution } from '../config/distribution'
import { IncomingMessage, ServerResponse } from 'http'

const error = (status = 404, body = 'not found') => createError(status, body)
const sendCreator = (res: ServerResponse) => async <T>(body: T) =>
	_send(res, 200, body)

export const service = async (req: IncomingMessage, res: ServerResponse) => {
	const send = sendCreator(res)
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
			return send(packages)
		case '/config/contract':
			return send(contract)
		case '/config/distribution':
			return send(distribution)
		default:
			throw error()
	}
}
