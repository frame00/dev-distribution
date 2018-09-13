import * as assert from 'assert'
// tslint:disable-next-line:no-require-imports
import listen = require('test-listen')
import { service } from '../serve/service'
import { getForTest } from '../src/libs'
import { packages } from '../config/packages'
import { contract } from '../config/contract'
import { distribution } from '../config/distribution'

let url: string

describe('Serve', () => {
	before(async () => {
		url = await listen(service)
	})

	it('Get packages', async () => {
		const body = await getForTest(`${url}/config/packages`)
		assert.deepStrictEqual(body, packages)
	})

	it('Get contract', async () => {
		const body = await getForTest(`${url}/config/contract`)
		assert.deepStrictEqual(body, contract)
	})

	it('Get distribution', async () => {
		const body = await getForTest(`${url}/config/distribution`)
		assert.deepStrictEqual(body, distribution)
	})

	after(() => {
		service.close()
	})
})
