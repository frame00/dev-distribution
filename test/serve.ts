import * as assert from 'assert'
import micro from 'micro'
// tslint:disable-next-line:no-require-imports
import listen = require('test-listen')
import { service } from '../serve/service'
import { get } from '../src/libs'
import { packages } from '../config/packages'
import { contract } from '../config/contract'
import { distribution } from '../config/distribution'

let url: string
const server = micro(service)

describe('Serve', () => {
	before(async () => {
		url = await listen(server)
	})

	it('Get packages', async () => {
		const body = await get(`${url}/config/packages`)
		assert.deepStrictEqual(body, packages)
	})

	it('Get contract', async () => {
		const body = await get(`${url}/config/contract`)
		assert.deepStrictEqual(body, contract)
	})

	it('Get distribution', async () => {
		const body = await get(`${url}/config/distribution`)
		assert.deepStrictEqual(body, distribution)
	})

	after(() => {
		server.close()
	})
})
