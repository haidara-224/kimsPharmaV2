import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';

import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppSidebar } from '@/components/pharma-sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
