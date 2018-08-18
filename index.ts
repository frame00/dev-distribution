import { packages } from './config/packages'
import app from './src/index'
import { writeFile } from 'fs'

const [, , start, end, total] = process.argv
const DIR = 'log'
const write = (path: string, content: string) =>
	writeFile(path, content, 'utf-8', () => console.log(content))

app(start, end, ~~total, packages)
	.then(res => write(`${DIR}/${start}-to-${end}.json`, JSON.stringify(res)))
	.catch(err => console.error(err))
