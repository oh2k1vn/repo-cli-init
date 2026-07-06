// import 'server-only'

import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport'
import { RpcError } from '@protobuf-ts/runtime-rpc'
import * as crypto from 'crypto'

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnYmTJKkxl/Yg3gA6SQ91foY5CB50LDXcYrq6Ukx8obTuSuH0RAcg/oSem+gT5G1aakdQqtCkYXSHS9wS8kLK3O4AXFCONED4I8tJ8GKRcxFvytxHTIMmqqa+gw+pbPpmV4Zr+KjLHZsLse0jFIJ+gZ2hR3CrAeJ8Au+3uKySNNZ0F2laJAPso9p/80d4nKhf6N/t3/AU2LirnvWyADQeoaXVRQAv3LVpe6IG+bgijg6Cu4rA1kOUxFSj7nD6n1+QZqS7Fu2WdwFd7DbAr1RQKzpxqwF2p7LTifDUUGLrGF45oslxytwbHyEc36eRx1g9mQIdipkIa1KXdjf51sE2jwIDAQAB
-----END PUBLIC KEY-----`

export function generateChecksum(values: string = 'web:optiflow_svc'): string {
  try {
    const md5Hash = crypto.createHash('md5').update(values).digest('hex')
    const padding = 'xxxxx'
    const rawPayload = padding + md5Hash + padding

    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(rawPayload)
    )

    return encryptedBuffer.toString('base64')
  } catch (error) {
    console.error('[gRPC Client] Checksum generation failed:', error)
    return ''
  }
}


export const transport = new GrpcWebFetchTransport({
  baseUrl: "https://grpc.optiflow.vn",
  interceptors: [
    {
      interceptUnary(next, method, input, options) {
        options.meta = {
          checksum: generateChecksum(),
          'x-org': '8581da5384b349e68575dfb8',
          'x-requested-at': Date.now().toString(),
          'x-user-name': 'local_dev@optiflow.vn',
          'x-userId': 'DEV-LOCAL-001',
          'x-display-name': 'Local Developer',
          'user-agent': 'QA-Bot',
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`[gRPC REQ] ${method.service.typeName}/${method.name}`, input)
        }

        const call = next(method, input, options)
        console.log('call', call)
        call.response.then(
          (res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[gRPC RES] ${method.service.typeName}/${method.name}`, res)
            }
          },
          (err) => {
            if (err instanceof RpcError) {
              const isHalted =
                err.message.toLowerCase().includes('halted') ||
                err.code === 'UNAVAILABLE' ||
                (err.meta && Object.values(err.meta).some(val => typeof val === 'string' && val.toLowerCase().includes('halted')))

              if (isHalted) {
                console.error(
                  `🔴 [gRPC HALTED ERROR] ${method.service.typeName}/${method.name}\n` +
                  `Code: ${err.code}\n` +
                  `Message: ${err.message}\n` +
                  `Meta:`, err.meta
                )
              } else {
                console.error(`[gRPC ERR] ${method.service.typeName}/${method.name}`, {
                  code: err.code,
                  message: err.message,
                  meta: err.meta,
                })
              }
            } else {
              console.error(`[gRPC ERR] ${method.service.typeName}/${method.name}`, err)
            }
          }
        )

        return call
      },
    },
  ],
  // Force no-cache at fetch level
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      cache: 'no-store',
    } as RequestInit),
})
