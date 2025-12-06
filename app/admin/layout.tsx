'use client';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage
} from "@/components/ui/breadcrumb";
import {useBreadcrumbs} from "@/hooks/use-breadcrumbs";
import {useEffect} from "react";
import {authStore} from "@/stores/auth.store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const breadcrumbs = useBreadcrumbs()
  useEffect(() => {
    authStore.getState().initialize();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <BreadcrumbItem key={item.href} className={index === 0 ? "hidden md:block" : ""}>
                    {index !== breadcrumbs.length - 1 ? (
                      <>
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink> {"/"}
                      </>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

          </div>
        </header>

        <div className="flex-1 flex flex-col bg-background">
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </SidebarInset>

    </SidebarProvider>
  );
}
