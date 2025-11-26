"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { useState } from "react"

export const QueryProvider = ({children}: {children: React.ReactNode}) => {
    const [queryProvider] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryProvider}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}