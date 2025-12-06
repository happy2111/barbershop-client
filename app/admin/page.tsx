import React from 'react'
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

const Page = () => {
  return (

    <ProtectedAdminRoute>
      <div>Page</div>
    </ProtectedAdminRoute>

  )
}
export default Page
