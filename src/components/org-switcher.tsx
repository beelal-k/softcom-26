'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, GalleryVerticalEnd, Plus, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

export function OrgSwitcher() {
  const router = useRouter();
  const { isMobile, state } = useSidebar();
  const [userData, setUserData] = useState<any>(null);

  // Get user data from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  // ---------------------------
  // DUMMY ORGANIZATIONS (Replace later)
  // ---------------------------
  // TODO: Replace with API call to fetch user's organizations and roles
  // const response = await fetch('/api/organizations/user');
  // const dummyMemberships = await response.json();
  
  const dummyMemberships: Array<{
    id: string;
    organization: {
      id: string;
      name: string;
      imageUrl: string;
      hasImage: boolean;
    };
    role: 'Owner' | 'Admin' | 'Manager' | 'Member';
  }> = [
    {
      id: 'membership_1',
      organization: {
        id: 'org_1',
        name: 'TechCorp Solutions',
        imageUrl: '',
        hasImage: false
      },
      role: 'Owner'
    },
    {
      id: 'membership_2',
      organization: {
        id: 'org_2',
        name: 'DesignHub Agency',
        imageUrl: '',
        hasImage: false
      },
      role: 'Admin'
    },
    {
      id: 'membership_3',
      organization: {
        id: 'org_3',
        name: 'DataFlow Analytics',
        imageUrl: '',
        hasImage: false
      },
      role: 'Member'
    }
  ];

  // ---------------------------
  // ACTIVE ORG HANDLING
  // ---------------------------
  const [activeOrgId, setActiveOrgId] = useState<string | undefined>(
    dummyMemberships[0]?.organization.id
  );

  const activeOrganization =
    dummyMemberships.find((m) => m.organization.id === activeOrgId)
      ?.organization || dummyMemberships[0]?.organization;

  // No organizations - show user name and "No organisation"
  if (!dummyMemberships || dummyMemberships.length === 0) {
    const userName = userData?.username || userData?.fullName || 'User';
    console.log('No organizations found for user:', userName);
    
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg'>
                  <User className='size-4' />
                </div>
                <div
                  className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
                    state === 'collapsed'
                      ? 'invisible max-w-0 overflow-hidden opacity-0'
                      : 'visible max-w-full opacity-100'
                  }`}
                >
                  <span className='truncate font-medium'>{userName}</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    No organisation
                  </span>
                </div>
                <ChevronsUpDown
                  className={`ml-auto transition-all duration-200 ease-in-out ${
                    state === 'collapsed'
                      ? 'invisible max-w-0 opacity-0'
                      : 'visible max-w-full opacity-100'
                  }`}
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              align='start'
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className='text-muted-foreground text-xs'>
                Organizations
              </DropdownMenuLabel>
              
              <DropdownMenuItem
                className='gap-2 p-2'
                onClick={() => router.push('/dashboard/workspaces')}
              >
                <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
                  <Plus className='size-4' />
                </div>
                <div className='text-muted-foreground font-medium'>
                  Create organisation
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg'>
                {activeOrganization.hasImage && activeOrganization.imageUrl ? (
                  <Image
                    src={activeOrganization.imageUrl}
                    alt={activeOrganization.name}
                    width={32}
                    height={32}
                    className='size-full object-cover'
                  />
                ) : (
                  <GalleryVerticalEnd className='size-4' />
                )}
              </div>

              <div
                className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
                  state === 'collapsed'
                    ? 'invisible max-w-0 overflow-hidden opacity-0'
                    : 'visible max-w-full opacity-100'
                }`}
              >
                <span className='truncate font-medium'>
                  {activeOrganization.name}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  Organization
                </span>
              </div>

              <ChevronsUpDown
                className={`ml-auto transition-all duration-200 ease-in-out ${
                  state === 'collapsed'
                    ? 'invisible max-w-0 opacity-0'
                    : 'visible max-w-full opacity-100'
                }`}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Organizations
            </DropdownMenuLabel>

            {dummyMemberships.map((membership, index) => {
              const org = membership.organization;
              const isActive = org.id === activeOrgId;

              return (
                <DropdownMenuItem
                  key={membership.id}
                  onClick={() => setActiveOrgId(org.id)}
                  className='gap-2 p-2'
                >
                  <div className='flex size-6 items-center justify-center overflow-hidden rounded-md border'>
                    {org.hasImage && org.imageUrl ? (
                      <Image
                        src={org.imageUrl}
                        alt={org.name}
                        width={24}
                        height={24}
                        className='size-full object-cover'
                      />
                    ) : (
                      <GalleryVerticalEnd className='size-3.5 shrink-0' />
                    )}
                  </div>

                  <div className='flex flex-col items-start'>
                    <span className='text-sm'>{org.name}</span>
                    <span className='text-muted-foreground text-xs'>
                      {membership.role}
                    </span>
                  </div>

                  {isActive ? (
                    <Check className='ml-auto size-4' />
                  ) : (
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className='gap-2 p-2'
              onClick={() => router.push('/dashboard/workspaces')}
            >
              <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
                <Plus className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>
                Add organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
