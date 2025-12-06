'use client'

import React, {useEffect} from 'react'
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import {useRouter} from "next/navigation";

const Page = () => {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/bookings')
  }, []);


  return (
    <ProtectedAdminRoute>
      <div>Page</div>
    </ProtectedAdminRoute>
  )
}
export default Page
