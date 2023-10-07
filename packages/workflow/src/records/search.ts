import { ValidRecord } from '@opencrvs/commons/types'
import { SEARCH_URL } from '@workflow/constants'
import fetch from 'node-fetch'

export async function indexBundle(bundle: ValidRecord, authToken: string) {
  const res = await fetch(new URL('/record', SEARCH_URL).href, {
    method: 'POST',
    body: JSON.stringify(bundle),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    }
  })
  if (!res.ok) {
    throw new Error(
      `Indexing a bundle to search service failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }

  return res
}
