'use client'
import React, {useEffect} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {bookingService} from "@/services/booking.service";

const SelfBooking = () => {
  let data;

  useEffect(() => {
    data = bookingService.getBlockedTimes()
    console.log(data)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мои услуги</CardTitle>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  )
}
export default SelfBooking
