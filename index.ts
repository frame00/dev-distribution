import { packages } from './config/packages'
import app from './src/index'

const [, , start, end, total] = process.argv

app(start, end, ~~total, packages)
	.then(res => console.log(res))
	.catch(err => console.error(err))
