/* eslint-disable */
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'


function CORSMiddleware(handler: NextApiHandler) {
    return (req: NextApiRequest, res: NextApiResponse) => {
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )
        if (req.method === 'OPTIONS') {
            res.status(200).end()
            return
        }
        return handler(req, res)
    }
}


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = req.headers.cookie
    const headers = req.headers
    const origin = req.headers.origin
    const method = req.method
    const body = req.body

    // get destination server from request body
    const destinationServer = body.destinationServer

    // make request to destination server with cookies, headers and everything
    // and return response to client
    const response = await fetch(destinationServer, {
        method,
        headers: {
            'Content-Type': headers['content-type']!,
            cookie: cookies!,
            origin: origin!,
        }
    })

    // get response headers
    const responseHeaders = response.headers

    // get response cookies
    const responseCookies = responseHeaders.get('set-cookie')

    // set response cookies to client
    if (responseCookies) {
        res.setHeader('set-cookie', responseCookies)
    }

    // set response headers to client
    res.setHeader('content-type', responseHeaders.get('content-type')!)

    // return response to client
    res.status(response.status).send(await response.text())
}

export const config = {
    api: {
        bodyParser: false,
    },
}

export default CORSMiddleware(handler)