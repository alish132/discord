"use client"

import { useParams } from 'next/navigation'
import React from 'react'

function page() {
  const {serverId} = useParams()

  return (
    <div>
      This is server {serverId}
    </div>
  )
}

export default page
