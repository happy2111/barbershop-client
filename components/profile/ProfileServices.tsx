import React from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

const ProfileServices = ({
  profile,
}: {
  profile: {
    services: Array<{
      id: string
      name: string
      duration_min: number
      price: number
      photo?: string
    }>
  }
                         }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Мои услуги</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.services.map((s: any) => (
            <div
              key={s.id}
              className="border rounded-lg p-4 flex items-start gap-4"
            >
              {s.photo && <img
                src={s.photo}
                alt={s.name}
                className="w-16 h-16 object-cover rounded"
              />}
              <div>
                <h4 className="font-semibold">{s.name}</h4>
                <p className="text-sm text-gray-600">{s.duration_min} мин</p>
                <p className="text-lg font-bold text-primary">{s.price} сум</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
export default ProfileServices
