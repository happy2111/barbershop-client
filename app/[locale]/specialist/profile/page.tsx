'use client';

import {useEffect, useState} from "react";
import {useTranslations} from 'next-intl';
import {profileService, ScheduleDto} from "@/services/profile.service";
import {bookingService, BookingStatus} from "@/services/booking.service";
import {format} from "date-fns";
import {ru} from "date-fns/locale";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

import {Calendar, Clock, History, Pencil, Plus, Trash2} from "lucide-react";

import ProfilePersonalInfo from "@/components/profile/ProfilePersonalInfo";
import ProfileServices from "@/components/profile/ProfileServices";
import {toast} from "sonner";
import ChangePassword from "@/components/profile/ChangePassword";
import ProfileBlockedTime from "@/components/profile/ProfileBlockedTime";
import {AdminBookingModal} from "@/components/BookingModal";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

// Массив дней недели лучше тоже локализовать, но для простоты оставим пока так
const daysOfWeek = [
  "Воскресенье", "Понедельник", "Вторник",
  "Среда", "Четверг", "Пятница", "Суббота"
];


export default function SpecialistProfilePage() {
  const t = useTranslations();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editingInfo, setEditingInfo] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    description: "",
    skills: "",
    photoFile: null as File | null,
  });

  const [scheduleForm, setScheduleForm] = useState<ScheduleDto>({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "18:00"
  });

  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);

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
        photoFile: null,
      });
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (day?: number) => {
    const dto = { ...scheduleForm, ...(day !== undefined && { day_of_week: day }) };

    try {
      await profileService.upsertSchedule(dto);
      await loadData();
      setEditingSchedule(null);
    } catch {
      toast.error(t('profile.schedule.error_save'));
    }
  };

  const deleteSchedule = async (day: number) => {
    if (!confirm(t('profile.schedule.delete_confirm'))) return;

    try {
      await profileService.deleteSchedule(day);
      await loadData();
    } catch {
      toast.error(t('profile.schedule.error_delete'));
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

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

    return (
      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${styles[status]}`}>
        {t(`profile.bookings.status.${status.toLowerCase()}`)}
      </span>
    );
  };

  const updateBooking = async (id: number, status: BookingStatus) => {
    if (!confirm(t('profile.bookings.actions.update_confirm'))) return;

    try {
      await bookingService.updateStatus(id, status);
      await loadData();
    } catch {
      toast.error(t('profile.bookings.actions.error_update'));
    }
  };

  const saveProfileInfo = async () => {
    setIsUploadingPhoto(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      if (formData.description) payload.append("description", formData.description);
      if (formData.skills) payload.append("skills", formData.skills);
      if (formData.photoFile) {
        payload.append("photo", formData.photoFile);
      }

      await profileService.updateProfile(payload);
      await loadData();
      setEditingInfo(false);
      toast.success(t('profile.profile_info.success_update'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('profile.profile_info.error_update'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };


  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        <ProfilePersonalInfo
          profile={profile}
          editingInfo={editingInfo}
          setEditingInfo={setEditingInfo}
          formData={{
            name: formData.name,
            description: formData.description,
            skills: formData.skills,
            photoFile: formData.photoFile,
          }}
          setFormData={(data) => setFormData({ ...formData, ...data })}
          handleSaveInfo={saveProfileInfo}
          isUploadingPhoto={isUploadingPhoto}
        />

        <Tabs defaultValue="upcoming" className="w-full">
          {/* Кнопка создания записи */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold">{t('profile.bookings.section_title')}</h2>
            <Button
              onClick={() => setShowModal(true)}
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('profile.create_booking')}
            </Button>
          </div>

          {/* Переключатель вкладок */}
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">
              {t('profile.bookings.upcoming.title')}
              {upcoming.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
          {upcoming.length}
        </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              {t('profile.bookings.past.title')}
              {past.length > 0 && (
                <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
          {past.length}
        </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Предстоящие записи */}
          <TabsContent value="upcoming">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {t('profile.bookings.upcoming.title')}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {upcoming.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium mb-1">
                      {t('profile.bookings.upcoming.no_bookings')}
                    </p>
                    <p className="text-sm">
                      {t('profile.bookings.upcoming.no_bookings_hint')}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {upcoming.map((b) => (
                      <div
                        key={b.id}
                        className="group relative border border-border rounded-[var(--radius)] p-5 bg-card text-card-foreground hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                          {/* Инфо о клиенте и услугах */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold text-xl tracking-tight">
                                  {b.client?.name || t('common.unknown_client')}
                                </h3>
                                <p className="text-sm font-medium text-muted-foreground">
                                  {b.client?.phone}
                                </p>
                              </div>
                              <div className="shrink-0">
                                {renderBookingStatus(b.status)}
                              </div>
                            </div>

                            {/* Список услуг с ценами */}
                            <div className="space-y-2 rounded-lg bg-muted/30 p-3">
                              <div className="flex flex-col gap-1.5">
                                {b.services.map((bs: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between text-sm"
                                  >
                                  <span className="text-muted-foreground">
                                    <span className="text-primary mr-2">•</span>
                                    {bs.service.name}
                                  </span>
                                    <span className="font-medium whitespace-nowrap ml-4">
                                    {bs.service.price.toLocaleString()} сум
                                  </span>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 mt-2 border-t border-border flex justify-between items-center">
                                <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                                  Итого
                                </span>
                                <span className="text-lg font-bold text-primary">
                                  {b.services.reduce((sum: number, s: any) => sum + s.service.price, 0).toLocaleString()} сум
                                </span>
                              </div>
                            </div>

                            {/* Дата и время */}
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                                <Calendar className="w-4 h-4 opacity-70" />
                                {format(new Date(b.date), "dd MMM yyyy", {locale: ru})}
                              </div>
                              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                                <Clock className="w-4 h-4 opacity-70" />
                                {b.start_time} – {b.end_time}
                              </div>
                            </div>
                          </div>

                          {/* Секция действий */}
                          <div className="flex flex-row sm:flex-col gap-2 min-w-full sm:min-w-[160px]">
                            {b.status === "PENDING" && (
                              <>
                                <Button
                                  size="default"
                                  className="flex-1 bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                                  onClick={() => updateBooking(b.id, BookingStatus.CONFIRMED)}
                                >
                                  {t('profile.bookings.actions.confirm')}
                                </Button>
                                <Button
                                  size="default"
                                  variant="outline"
                                  className="flex-1 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-colors"
                                  onClick={() => updateBooking(b.id, BookingStatus.CANCELLED)}
                                >
                                  {t('profile.bookings.actions.cancel')}
                                </Button>
                              </>
                            )}

                            {b.status === "CONFIRMED" && (
                              <Button
                                size="default"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                onClick={() => updateBooking(b.id, BookingStatus.COMPLETED)}
                              >
                                {t('profile.bookings.actions.complete')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Прошедшие записи */}
          <TabsContent value="past">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" />
                  {t('profile.bookings.past.title')}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {past.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">
                      {t('profile.bookings.past.no_bookings')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {past.map((b) => (
                      <div
                        key={b.id}
                        className="border rounded-xl p-5 bg-muted/30"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">
                                {b.client?.name || t('common.unknown_client')}
                              </h3>
                              {renderBookingStatus(b.status)}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {b.service?.name}
                            </p>

                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(b.date), "dd MMMM yyyy", { locale: ru })}
                              <span className="mx-1">•</span>
                              <Clock className="w-4 h-4" />
                              {b.start_time} – {b.end_time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ProfileServices profile={profile} />


        <ProfileBlockedTime />

        {/* Расписание */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.schedule.title')}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Существующие дни расписания */}
            <div className="space-y-3">
              {profile.schedules.length > 0 ? (
                profile.schedules
                  .sort((a:  any, b: any) => a.day_of_week - b.day_of_week)
                  .map(renderScheduleRow)
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  {t('profile.schedule.no_schedule_yet')}
                </p>
              )}
            </div>

            {/* Форма добавления нового дня */}
            {editingSchedule === null && profile.schedules.length < 7 && (
              <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-5 bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {t('profile.schedule.add_new_day')}
                </p>

                <div className="space-y-4">
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-background"
                    value={scheduleForm.day_of_week}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, day_of_week: Number(e.target.value) })
                    }
                  >
                    <option value="" disabled>
                      {t('profile.schedule.select_day')}
                    </option>
                    {daysOfWeek.map((day, i) => {
                      const exists = profile.schedules.some((s: any) => s.day_of_week === i);
                      return (
                        <option key={i} value={i} disabled={exists}>
                          {t(`days.${i}`)} {exists && `(${t('profile.schedule.already_exists')})`}
                        </option>
                      );
                    })}
                  </select>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {t('profile.schedule.start_time')}
                      </Label>
                      <Input
                        type="time"
                        value={scheduleForm.start_time}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, start_time: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {t('profile.schedule.end_time')}
                      </Label>
                      <Input
                        type="time"
                        value={scheduleForm.end_time}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, end_time: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => saveSchedule()}
                        className="w-full sm:w-auto"
                        disabled={!scheduleForm.start_time || !scheduleForm.end_time}
                      >
                        {t('profile.schedule.add_new')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Форма редактирования существующего дня */}
            {editingSchedule !== null && (
              <div className="border border-primary/30 rounded-xl p-5 bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {t(`days.${editingSchedule}`)}
                  </h3>
                  <span className="text-sm text-muted-foreground">
            {t('profile.schedule.edit_mode')}
          </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('profile.schedule.start_time')}</Label>
                    <Input
                      type="time"
                      value={scheduleForm.start_time}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, start_time: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('profile.schedule.end_time')}</Label>
                    <Input
                      type="time"
                      value={scheduleForm.end_time}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, end_time: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-end gap-2 sm:gap-3">
                    <Button
                      onClick={() => saveSchedule(editingSchedule)}
                      className="flex-1"
                    >
                      {t('profile.schedule.save')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingSchedule(null)}
                      className="flex-1"
                    >
                      {t('profile.schedule.cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <ChangePassword />

      </div>
      {
        showModal && <AdminBookingModal isOpen={showModal} onClose={() => setShowModal(false)} specialistId={profile.id} onCreated={() => loadData()} />
      }
    </div>
  );
}