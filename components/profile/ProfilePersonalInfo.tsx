// components/profile/ProfilePersonalInfo.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Save, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ProfilePersonalInfo = ({
                               profile,
                               editingInfo,
                               setEditingInfo,
                               formData,
                               setFormData,
                               handleSaveInfo,
                               isUploadingPhoto,
                             }: {
  profile: {
    name: string;
    phone: string;
    photo?: string | null;
    description?: string;
    skills?: string;
  };
  editingInfo: boolean;
  setEditingInfo: (v: boolean) => void;
  formData: {
    name: string;
    description: string;
    skills: string;
    photoFile?: File | null;
  };
  setFormData: (data: any) => void;
  handleSaveInfo: () => void;
  isUploadingPhoto: boolean;
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photoFile: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const currentPhoto = photoPreview || (profile.photo ? `http://localhost:5000${profile.photo}` : null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Личный кабинет</CardTitle>
          {!editingInfo ? (
            <Button onClick={() => setEditingInfo(true)} variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-2" /> Редактировать
            </Button>
          ) : (
            <div className="space-x-2">
              <Button onClick={handleSaveInfo} size="sm" disabled={isUploadingPhoto}>
                {isUploadingPhoto ? "Сохранение..." : <><Save className="w-4 h-4 mr-2" /> Сохранить</>}
              </Button>
              <Button onClick={() => setEditingInfo(false)} variant="outline" size="sm">
                Отмена
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-background">
              <AvatarImage src={currentPhoto || undefined} />
              <AvatarFallback className="text-3xl">
                {profile.name[0]?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>

            {editingInfo && (
              <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">{profile.phone}</p>
            {photoPreview && (
              <p className="text-sm text-green-600 mt-2">Фото будет загружено при сохранении</p>
            )}
          </div>
        </div>

        {editingInfo ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Имя</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ваше имя"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>О себе</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Расскажите о вашем опыте..."
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Навыки (через запятую)</Label>
              <Textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                rows={2}
                placeholder="Мужские стрижки, бритьё, укладка..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.description && (
              <div>
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </div>
            )}
            {profile.skills && (
              <div>
                <p className="text-sm">
                  <strong className="text-gray-900">Навыки:</strong>{' '}
                  <span className="text-gray-600">{profile.skills}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePersonalInfo;