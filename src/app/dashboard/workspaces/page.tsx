'use client';

import PageContainer from '@/components/layout/page-container';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

// Dummy workspace data (replace with real API later)
const dummyWorkspaces = [
  {
    id: 'org_1',
    name: 'Sheikh Sahab HQ',
    description: 'Main organization'
  },
  {
    id: 'org_2',
    name: 'VIAB Project Team',
    description: 'Architect & Builder Innovation'
  },
  {
    id: 'org_3',
    name: 'AEFNE Operations',
    description: 'Real estate backend systems'
  }
];

export default function WorkspacesPage() {
  const { theme } = useTheme();
  const router = useRouter();

  // Memoized workspace list
  const workspaces = useMemo(() => dummyWorkspaces, []);

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
    >
      <div className='space-y-4'>
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() =>
              router.push(`/dashboard/workspaces/team?org=${ws.id}`)
            }
            className={`hover:bg-accent w-full rounded-lg border p-4 text-left transition-all hover:cursor-pointer`}
          >
            <div className='text-lg font-semibold'>{ws.name}</div>
            <div className='text-muted-foreground text-sm'>
              {ws.description}
            </div>
          </button>
        ))}

        {/* Create Workspace */}
        <button
          onClick={() => router.push('/dashboard/workspaces/team?create=1')}
          className='hover:bg-accent w-full rounded-lg border p-4 text-left'
        >
          <div className='text-lg font-semibold'>+ Create Workspace</div>
          <div className='text-muted-foreground text-sm'>
            Start a new team or department
          </div>
        </button>
      </div>
    </PageContainer>
  );
}
