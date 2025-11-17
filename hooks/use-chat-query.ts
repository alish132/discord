import qs from 'query-string'
import { useParams } from 'next/navigation'
import { useInfiniteQuery } from "@tanstack/react-query"
import { useSocket } from '@/components/providers/socket-provider'

interface ChatQueryProps {
  querykey: string
  apiUrl: string
  paramsKey: "channelId" | "conversationId"
  paramsValue: string
}

export const useChatQuery = ({ querykey, apiUrl, paramsKey, paramsValue }: ChatQueryProps) => {
  const { isConnected } = useSocket()
  const params = useParams()

  // ❗ FIXED HERE
  const fetchMessages = async ({ pageParam = undefined }) => {
    const url = qs.stringifyUrl({
      url: apiUrl,
      query: {
        cursor: pageParam,
        [paramsKey]: paramsValue
      }
    }, { skipNull: true })

    const response = await fetch(url)
    return response.json()
  }

  const query = useInfiniteQuery({
    queryKey: [querykey],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    refetchInterval: isConnected ? false : 1000
  })

  return query
}
