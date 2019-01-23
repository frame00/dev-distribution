import test from 'ava'
import micro from 'micro'
// tslint:disable-next-line:no-require-imports
import listen = require('test-listen')
import { service } from './service'
import { get } from '../src/libs'
import { packages } from '../config/packages'
import { contract } from '../config/contract'
import { distribution } from '../config/distribution'

let url: string
const server = micro(service)

test.before(async () => {
	url = await listen(server)
})

test('Get packages', async t => {
	const body = await get(`${url}/config/packages`)
	t.deepEqual(body, packages)
})

test('Get contract', async t => {
	const body = await get(`${url}/config/contract`)
	t.deepEqual(body, contract)
})

test('Get distribution', async t => {
	const body = await get(`${url}/config/distribution`)
	t.deepEqual(body, distribution)
})

test.after(() => {
	server.close()
})
