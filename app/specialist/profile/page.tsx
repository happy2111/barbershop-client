'use client';

import {useEffect, useState} from "react";
import {profileService, ScheduleDto} from "@/services/profile.service";
import {bookingService, BookingStatus} from "@/services/booking.service";
import {format} from "date-fns";
import {ru} from "date-fns/locale";

import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";

import {Calendar, Clock, Pencil, Trash2} from "lucide-react";

import ProfilePersonalInfo from "@/components/profile/ProfilePersonalInfo";
import ProfileServices from "@/components/profile/ProfileServices";

const daysOfWeek = [
  "Воскресенье", "Понедельник", "Вторник",
  "Среда", "Четверг", "Пятница", "Суббота"
];

export default function SpecialistProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editingInfo, setEditingInfo] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    description: "",
    skills: ""
  });

  const [scheduleForm, setScheduleForm] = useState<ScheduleDto>({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "18:00"
  });

  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prof, upcomingBookings, pastBookings] = await Promise.all([
        profileService.getProfile(),
        profileService.getUpcomingBookings(),
        profileService.getPastBookings(),
      ]);

      setProfile(prof);
      setUpcoming(upcomingBookings);
      setPast(pastBookings);

      setFormData({
        name: prof.name,
        photo: prof.photo || "",
        description: prof.description || "",
        skills: prof.skills || "",
      });

    } catch {
      alert("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const saveProfileInfo = async () => {
    try {
      await profileService.updateProfile(formData);
      setProfile({...profile, ...formData});
      setEditingInfo(false);
    } catch {
      alert("Ошибка сохранения профиля");
    }
  };

  const saveSchedule = async (day?: number) => {
    const dto = {...scheduleForm, ...(day !== undefined && {day_of_week: day})};

    try {
      await profileService.upsertSchedule(dto);
      await loadData();
      setEditingSchedule(null);
    } catch {
      alert("Ошибка сохранения расписания");
    }
  };

  const deleteSchedule = async (day: number) => {
    if (!confirm("Удалить расписание?")) return;

    try {
      await profileService.deleteSchedule(day);
      await loadData();
    } catch {
      alert("Ошибка удаления");
    }
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;


  const renderScheduleRow = (sch: any) => (
    <div
      key={sch.day_of_week}
      className="flex items-center justify-between border-b pb-3"
    >
      <div>
        <strong>{daysOfWeek[sch.day_of_week]}</strong>: {sch.start_time} – {sch.end_time}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditingSchedule(sch.day_of_week);
            setScheduleForm(sch);
          }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => deleteSchedule(sch.day_of_week)}
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    </div>
  );

  const renderBookingStatus = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-gray-200 text-gray-800",
    };

    const labels: Record<string, string> = {
      PENDING: "Ожидает",
      CONFIRMED: "Подтверждено",
      CANCELLED: "Отменено",
      COMPLETED: "Завершено",
    };

    return (
      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const renderUpcomingBooking = (b: any) => (
    <div
      key={b.id}
      className="border rounded-lg p-5 flex flex-col sm:flex-row justify-between gap-4"
    >
      <div className="flex-1">
        <p className="text-lg font-semibold">{b.client.name}</p>
        <p className="text-gray-600">{b.client.phone}</p>
        <p className="text-sm mt-1">{b.service.name} • {b.service.price} сум</p>

        <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
          <Calendar className="w-4 h-4" />
          {format(new Date(b.date), "dd MMMM yyyy", {locale: ru})}
          <Clock className="w-4 h-4 ml-3" />
          {b.start_time} – {b.end_time}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
        {renderBookingStatus(b.status)}

        {b.status === "PENDING" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => updateBooking(b.id, BookingStatus.CONFIRMED)}
            >
              Подтвердить
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => updateBooking(b.id, BookingStatus.CANCELLED)}
            >
              Отменить
            </Button>
          </div>
        )}

        {b.status === "CONFIRMED" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateBooking(b.id, BookingStatus.COMPLETED)}
          >
            Завершить
          </Button>
        )}
      </div>
    </div>
  );

  const updateBooking = async (id: number, status: BookingStatus) => {
    if (!confirm("Вы уверены?")) return;

    try {
      await bookingService.updateStatus(id, status);
      await loadData();
    } catch {
      alert("Ошибка обновления");
    }
  };

  // --------------------------

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        <ProfilePersonalInfo
          profile={profile}
          editingInfo={editingInfo}
          setEditingInfo={setEditingInfo}
          formData={formData}
          setFormData={setFormData}
          handleSaveInfo={saveProfileInfo}
        />

        <ProfileServices profile={profile}/>

        {/* Расписание */}
        <Card>
          <CardHeader>
            <CardTitle>Расписание</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {profile.schedules.map(renderScheduleRow)}

            {editingSchedule === null && profile.schedules.length < 7 && (
              <div className="border-2 border-dashed rounded-lg p-4">
                <select
                  className="mb-3 w-full border rounded p-2"
                  value={scheduleForm.day_of_week}
                  onChange={(e) =>
                    setScheduleForm({...scheduleForm, day_of_week: Number(e.target.value)})
                  }
                >
                  {daysOfWeek.map((day, i) => {
                    const exists = profile.schedules.some((s: any) => s.day_of_week === i);
                    return (
                      <option key={i} value={i} disabled={exists}>
                        {day} {exists && "(уже есть)"}
                      </option>
                    );
                  })}
                </select>

                <div className="flex gap-3">
                  <Input
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({...scheduleForm, start_time: e.target.value})}
                  />
                  <Input
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({...scheduleForm, end_time: e.target.value})}
                  />
                  <Button onClick={() => saveSchedule()}>Добавить</Button>
                </div>
              </div>
            )}

            {editingSchedule !== null && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="font-semibold mb-3">{daysOfWeek[editingSchedule]}</p>

                <div className="flex gap-3 items-end">
                  <div>
                    <Label>Начало</Label>
                    <Input
                      type="time"
                      value={scheduleForm.start_time}
                      onChange={(e) =>
                        setScheduleForm({...scheduleForm, start_time: e.target.value})
                      }
                    />
                  </div>

                  <div>
                    <Label>Конец</Label>
                    <Input
                      type="time"
                      value={scheduleForm.end_time}
                      onChange={(e) =>
                        setScheduleForm({...scheduleForm, end_time: e.target.value})
                      }
                    />
                  </div>

                  <Button onClick={() => saveSchedule(editingSchedule)}>Сохранить</Button>
                  <Button variant="outline" onClick={() => setEditingSchedule(null)}>
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Записи */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
            <TabsTrigger value="past">Прошедшие</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Предстоящие записи</CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                {upcoming.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Нет предстоящих записей</p>
                ) : (
                  <div className="space-y-4">
                    {upcoming.map(renderUpcomingBooking)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardContent className="pt-6">
                {past.length === 0 ? (
                  <p className="text-center text-gray-500">Нет прошедших записей</p>
                ) : (
                  <div className="space-y-4">
                    {past.map((b) => (
                      <div key={b.id} className="border rounded-lg p-4">
                        <p className="font-semibold">{b.client.name}</p>
                        <p className="text-sm">{b.service.name}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(b.date), "dd MMMM yyyy", {locale: ru})} • {b.start_time} – {b.end_time}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
