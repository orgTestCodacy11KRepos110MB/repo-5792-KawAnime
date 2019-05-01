import { request } from 'https'

import formUrl from './formUrl'
import Logger from '../logger'
import Cache from '../cache'

const logger = new Logger('Http:Post')
const cache = new Cache()

export default function (url, data, params = []) {
  return new Promise((resolve, reject) => {
    const _url = formUrl(url, params)
    const _data = typeof data === 'string' ? data : JSON.stringify(data)
    const cacheKey = [ _url, _data ].join('|')

    if (cache.has(cacheKey)) {
      logger.info('Retrieved info from cache!')
      resolve(cache.get(cacheKey))

      return
    }

    logger.info(`Sending to ${_url}`)

    const req = request(_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': _data.length
      }
    }, (res) => {
      let response = ''

      res.on('data', (chunk) => { response += chunk })

      res.on('end', () => {
        const result = JSON.parse(response)

        cache.set(cacheKey, result)
        resolve(result)
      })
    })

    req.on('error', (err) => reject(err))

    req.write(_data)
    req.end()
  })
}