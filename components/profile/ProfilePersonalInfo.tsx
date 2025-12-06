import React from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Pencil, Save} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

const ProfilePersonalInfo = ({
  profile,
  editingInfo,
  setEditingInfo,
  formData,
  setFormData,
  handleSaveInfo
}: {
  profile: {
    name: string
    phone: string
    photo: string
    description?: string
    skills?: string
  }
  editingInfo: boolean
  setEditingInfo: (editing: boolean) => void
  formData: {
    name: string
    photo: string
    description: string
    skills: string
  }
  setFormData: (data: {
    name: string
    photo: string
    description: string
    skills: string
  }) => void
  handleSaveInfo: () => void
                             }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Личный кабинет</CardTitle>
          {!editingInfo ? (
            <Button
              onClick={() => setEditingInfo(true)}
              variant="outline"
              size="sm"
            >
              <Pencil className="w-4 h-4 mr-2" /> Редактировать
            </Button>
          ) : (
            <div className="space-x-2">
              <Button
                onClick={handleSaveInfo}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" /> Сохранить
              </Button>
              <Button
                onClick={() => setEditingInfo(false)}
                variant="outline"
                size="sm"
              >
                Отмена
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.photo} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">{profile.phone}</p>
          </div>
        </div>

        {editingInfo ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Имя</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Фото (URL)</Label>
              <Input
                value={formData.photo}
                onChange={(e) => setFormData({
                  ...formData,
                  photo: e.target.value
                })}
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e: any) => setFormData({
                  ...formData,
                  description: e.target.value
                })}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Навыки</Label>
              <Textarea
                value={formData.skills}
                onChange={(e: any) => setFormData({
                  ...formData,
                  skills: e.target.value
                })}
                rows={2}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.description &&
              <p className="text-gray-700">{profile.description}</p>}
            {profile.skills && <p className="text-sm text-gray-600">
              <strong>Навыки:</strong> {profile.skills}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
export default ProfilePersonalInfo
