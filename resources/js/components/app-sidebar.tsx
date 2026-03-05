import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Pill, Wrench } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: "/dashboard/Administration/Dashboard",
        icon: LayoutGrid,
    },
      {
        title: 'Pharmacie',
        href: "/dashboard/Administration/Dashboard/pharmacies",
        icon: Pill,
    },
     {
        title: 'Ordonnances',
        href: "/dashboard/Administration/Dashboard/ordonnances",
        icon: BookOpen,
    },
     {
        title: 'Produits',
        href: "/dashboard/Administration/Dashboard/produits",
        icon: Folder,
    },
    {
        title: 'Paramètres',
        href: "/dashboard/Administration/Dashboard/parametres",
        icon:Wrench ,
    },
];


export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
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
