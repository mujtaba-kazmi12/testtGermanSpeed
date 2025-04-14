"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    id?: string
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      id?: string
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-semibold text-slate-700">Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.id || item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {item.items?.length ? (
                // Item with dropdown
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    data-active={item.isActive}
                    className="transition-all data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-50 data-[active=true]:to-fuchsia-50 data-[active=true]:text-slate-900 data-[active=true]:font-medium hover:bg-slate-100"
                  >
                    {item.icon && <item.icon className={item.isActive ? 'text-violet-600' : ''} />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              ) : (
                // Item without dropdown - direct navigation link
                <Link href={item.url} passHref legacyBehavior>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    data-active={item.isActive}
                    className="transition-all data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-50 data-[active=true]:to-fuchsia-50 data-[active=true]:text-slate-900 data-[active=true]:font-medium hover:bg-slate-100"
                  >
                    {item.icon && <item.icon className={item.isActive ? 'text-violet-600' : ''} />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              )}
              {item.items?.length ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.id || subItem.title}>
                        <Link href={subItem.url} passHref legacyBehavior>
                          <SidebarMenuSubButton 
                            data-active={subItem.isActive}
                            className="transition-all data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-50 data-[active=true]:to-fuchsia-50 data-[active=true]:text-slate-900 data-[active=true]:font-medium hover:bg-slate-100"
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
