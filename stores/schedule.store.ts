import { makeAutoObservable, runInAction } from "mobx";
import { scheduleService, Schedule } from "@/services/schedule.service";

class ScheduleStore {
  schedules: Schedule[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchForSpecialist(specialistId: number) {
    this.loading = true;
    try {
      const data = await scheduleService.getBySpecialistId(specialistId);
      runInAction(() => {
        this.schedules = data;
      });
    } finally {
      this.loading = false;
    }
  }
}

export const scheduleStore = new ScheduleStore();
