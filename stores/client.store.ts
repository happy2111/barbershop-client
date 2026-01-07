import { makeAutoObservable, runInAction } from "mobx";
import { clientService, Client, CreateClientDto, UpdateClientDto } from "@/services/client.service";

class ClientStore {
  clients: Client[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchAll() {
    this.loading = true;
    try {
      const data = await clientService.getAll();
      runInAction(() => {
        this.clients = data;
      });
    } finally {
      this.loading = false;
    }
  }

  async create(dto: CreateClientDto): Promise<Client> {
    try {
      const created = await clientService.create(dto);
      runInAction(() => {
        this.clients.push(created);
      });
      return created;
    } catch (error) {
      console.error("Store create client error:", error);
      throw error;
    }
  }

  async update(id: number, dto: UpdateClientDto) {
    const updated = await clientService.update(id, dto);
    runInAction(() => {
      const idx = this.clients.findIndex(c => c.id === id);
      if (idx !== -1) this.clients[idx] = updated;
    });
  }

  async remove(id: number) {
    await clientService.remove(id);
    runInAction(() => {
      this.clients = this.clients.filter(c => c.id !== id);
    });
  }
}

export const clientStore = new ClientStore();
