'use client'

import React, {useEffect} from 'react'
import ProtectedAdminRoute from "@/components/Pretecters&Providers/ProtectedAdminRoute";
import {useRouter} from "next/navigation";

const Page = () => {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/bookings')
  }, []);


  return (
    <ProtectedAdminRoute>
      <div className="text-center">Redirecting...</div>
    </ProtectedAdminRoute>
  )
}
export default Page
