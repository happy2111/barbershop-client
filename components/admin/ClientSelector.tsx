import * as React from "react";
import { Check, ChevronsUpDown, Phone, UserPlus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger, DrawerPortal, DrawerOverlay } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {DialogTitle} from "@/components/ui/dialog";

interface ClientSelectorProps {
  clientPhone: string;
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

  // Контент списка
  const ListContent = (
    <div className="flex flex-col h-full bg-popover text-popover-foreground">
      {/* Поиск */}
      <div className="flex items-center px-3 border-b sticky top-0 bg-popover z-30">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          autoFocus={!isDesktop && open}
          className="flex h-12 w-full rounded-md bg-transparent py-3 text-[16px] outline-none placeholder:text-muted-foreground"
          placeholder={t("placeholders.search_phone")}
          value={clientPhone}
          onChange={(e) => handlePhoneSearch(e.target.value)}
        />
        {clientPhone && (
          <button
            onClick={() => handlePhoneSearch("")}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4 opacity-50" />
          </button>
        )}
      </div>

      {/* Список с результатами */}
      <div className="overflow-y-auto flex-1 p-1 space-y-1">
        {foundClients.length > 0 ? (
          <div className="p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("search.found_clients")}
            </div>
            {foundClients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  handleSelectExistingClient(client);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-4 text-sm rounded-md hover:bg-accent text-left transition-colors border-b last:border-0 md:border-0"
              >
                <Check
                  className={cn(
                    "h-4 w-4 text-primary shrink-0",
                    clientPhone === client.phone ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-base">{client.phone}</span>
                  {client.name && (
                    <span className="text-xs text-muted-foreground truncate">{client.name}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : clientPhone.length > 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t("search.no_results")}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground italic">
            {t("placeholders.start_typing")}
          </div>
        )}

        {/* Кнопка добавления нового */}
        {clientPhone.trim().length >= 7 && (
          <div className="p-2 border-t sticky bottom-0 bg-popover mt-auto">
            <button
              onClick={() => {
                handleAddNewClient();
                setOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg active:scale-95 transition-transform"
            >
              <UserPlus className="h-5 w-5" />
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
      type="button"
      className="w-full justify-between h-auto py-3 px-4 text-left font-normal border-input hover:bg-accent shadow-sm"
    >
      {clientPhone ? (
        <span className="flex items-center gap-2 font-medium">
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
        <PopoverContent className="p-0 w-[400px]" align="start">
          {ListContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerPortal>
        <DrawerOverlay className="fixed inset-0 bg-black/40 z-50" />
        <DrawerContent className="fixed bottom-0 left-0 right-0 z-50 flex flex-col h-[92dvh] bg-background outline-none">
          <DialogTitle className="px-6 my-2 text-center"></DialogTitle>
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Заголовок для ориентации */}

            <div className="flex-1 overflow-hidden border-t">
              {ListContent}
            </div>
          </div>

          {/* Пространство для клавиатуры */}
          <div className="h-[env(keyboard-inset-height,0px)]" />
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}