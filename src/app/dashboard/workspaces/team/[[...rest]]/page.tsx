'use client';

import PageContainer from '@/components/layout/page-container';
import { useTheme } from 'next-themes';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function TeamPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const params = useSearchParams();

  const orgId = params.get('org') ?? 'org_1';

  // Dummy team members (replace later with API data)
  const dummyTeam = useMemo(
    () => ({
      orgId,
      orgName:
        orgId === 'org_1'
          ? 'Sheikh Sahab HQ'
          : orgId === 'org_2'
            ? 'VIAB Project Team'
            : 'AEFNE Operations',

      members: [
        {
          id: 'user_1',
          name: 'Athar Naveed',
          role: 'Admin'
        },
        {
          id: 'user_2',
          name: 'Asad Ali',
          role: 'Manager'
        },
        {
          id: 'user_3',
          name: 'Athar Devops',
          role: 'Member'
        }
      ]
    }),
    [orgId]
  );

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
    >
      {/* Workspace Header */}
      <div className='mb-6'>
        <h2 className='text-xl font-semibold'>
          Workspace: {dummyTeam.orgName}
        </h2>
        <p className='text-muted-foreground text-sm'>
          Organization ID: {orgId}
        </p>
      </div>

      {/* Team Member List */}
      <div className='space-y-4'>
        {dummyTeam.members.map((member) => (
          <div
            key={member.id}
            className='flex items-center justify-between rounded-lg border p-4'
          >
            <div>
              <div className='text-base font-medium'>{member.name}</div>
              <div className='text-muted-foreground text-sm'>{member.role}</div>
            </div>

            <button
              className='hover:bg-accent rounded-md border px-3 py-1 text-sm'
              onClick={() => alert(`Edit member: ${member.name}`)}
            >
              Edit
            </button>
          </div>
        ))}

        {/* Add new member */}
        <button
          onClick={() => alert('Add member modal')}
          className='hover:bg-accent w-full rounded-lg border p-4 text-left'
        >
          <div className='text-base font-medium'>+ Add Team Member</div>
          <div className='text-muted-foreground text-sm'>
            Invite or assign roles
          </div>
        </button>
      </div>
    </PageContainer>
  );
}
