import * as React from "react";
import { Check, ChevronsUpDown, Phone, UserPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface Client {
  id: number;
  phone: string;
  name?: string;
}

interface ClientSelectorProps {
  clientPhone: string;
  // Используем any или расширяем базовый тип, чтобы TS не ругался на лишние поля
  foundClients: any[];
  handlePhoneSearch: (value: string) => void;
  handleSelectExistingClient: (client: any) => void;
  handleAddNewClient: () => void;
  t: any;
}

export function ClientSelector({
                                 clientPhone,
                                 foundClients,
                                 handlePhoneSearch,
                                 handleSelectExistingClient,
                                 handleAddNewClient,
                                 t,
                               }: ClientSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Выносим список в отдельный компонент для чистоты
  const ListContent = (
    <div className="flex flex-col h-full bg-popover text-popover-foreground">
      {/* Кастомный поиск */}
      <div className="flex items-center px-3 border-b sticky top-0 bg-popover z-10">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={t("placeholders.search_phone")}
          value={clientPhone}
          onChange={(e) => handlePhoneSearch(e.target.value)}
        />
      </div>

      {/* Прокручиваемая область */}
      <div className="overflow-y-auto max-h-[300px] md:max-h-64 p-1 space-y-1 overscroll-contain">

        {/* Найденные клиенты */}
        {foundClients.length > 0 ? (
          <div className="p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {t("search.found_clients")}
            </div>
            {foundClients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  handleSelectExistingClient(client);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-3 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-left transition-colors"
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    clientPhone === client.phone ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{client.phone}</span>
                  {client.name && (
                    <span className="text-xs text-muted-foreground">{client.name}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : clientPhone.length > 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("search.no_results")}
          </div>
        ) : null}

        {/* Добавление нового клиента */}
        {clientPhone.trim().length >= 7 && (
          <div className="p-1 border-t mt-1">
            <button
              onClick={() => {
                handleAddNewClient();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2 py-3 text-sm rounded-sm text-primary hover:bg-primary/10 transition-colors font-medium"
            >
              <UserPlus className="h-4 w-4" />
              {t("search.create_new", { phone: clientPhone })}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const TriggerButton = (
    <Button
      variant="outline"
      role="combobox"
      className="w-full justify-between h-auto py-2.5 px-3 text-left font-normal border-input hover:bg-accent"
    >
      {clientPhone ? (
        <span className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-primary" />
          {clientPhone}
        </span>
      ) : (
        <span className="text-muted-foreground">
          {t("placeholders.client_phone")}
        </span>
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
    </Button>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
          {ListContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent>
        <div className="mt-2 pb-10 px-2 ">
          {/* Маленькая полоска-индикатор сверху Drawer уже есть по умолчанию */}
          <div className="rounded-lg border overflow-hidden mt-4">
            {ListContent}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}