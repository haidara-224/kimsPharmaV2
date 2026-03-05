import { Link } from '@inertiajs/react';
import { BookOpen, FileText, Folder, LayoutGrid } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { NavItem } from '@/types';
import AppPharmaLogo from './AppPharmaLogo';
import { NavUser } from './nav-user';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: "/",
        icon: LayoutGrid,
    },
     {
        title: 'Ordonnance',
        href: "/ordonance",
        icon: FileText,
    },
     {
        title: 'Produits',
        href: "/produit",
        icon: Folder,
    },
       {
        title: 'Paramettrage',
        href: "/paramettrage",
        icon: BookOpen,
    },
    

];


export function AppSidebar() {
    return (
        <Sidebar  collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={''} prefetch>
                                <AppPharmaLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

         <SidebarFooter>
              
                       <NavUser />
                   </SidebarFooter>
        </Sidebar>
    );
}
