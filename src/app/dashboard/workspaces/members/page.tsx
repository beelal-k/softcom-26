'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  description?: string;
  organization: {
    id: string;
    name: string;
  };
  memberCount: number;
}

export default function MembersPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        // Fetch all teams for the current user
        const response = await apiClient.teams.getByOrganization();
        
        if (response.success && response.data) {
          const teamsData: Team[] = response.data.map((team: any) => ({
            id: team._id || team.id,
            name: team.name,
            description: team.description,
            organization: {
              id: team.organization?._id || team.organization?.id || team.organization,
              name: team.organization?.name || 'Organization'
            },
            memberCount: team.members?.length || 0
          }));

          setTeams(teamsData);

          // If there's only one team, redirect directly to its members page
          if (teamsData.length === 1) {
            const team = teamsData[0];
            router.push(`/dashboard/workspaces/teams/${team.id}/members?org=${team.organization.id}`);
          }
        } else {
          toast.error('Failed to fetch teams');
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTeams();
    }
  }, [currentUser, router]);

  const handleViewMembers = (teamId: string, orgId: string) => {
    router.push(`/dashboard/workspaces/teams/${teamId}/members?org=${orgId}`);
  };

  if (loading) {
    return (
      <PageContainer
        pageTitle='Members'
        pageDescription='View and manage team members'
      >
        <div className='flex h-[400px] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </PageContainer>
    );
  }

  if (teams.length === 0) {
    return (
      <PageContainer
        pageTitle='Members'
        pageDescription='View and manage team members'
      >
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-center space-y-4'>
            <Users className='h-16 w-16 text-muted-foreground mx-auto' />
            <div>
              <h3 className='text-lg font-semibold'>No teams found</h3>
              <p className='text-muted-foreground'>
                Create a team first to manage members
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard/workspaces/teams')}>
              Go to Teams
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle='Team Members'
      pageDescription='Select a team to view and manage its members'
    >
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {teams.map((team) => (
          <Card key={team.id} className='hover:border-accent transition-colors'>
            <CardHeader>
              <div className='flex items-center gap-3 mb-2'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                  <Users className='h-5 w-5 text-primary' />
                </div>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>{team.name}</CardTitle>
                  <CardDescription className='text-xs'>
                    {team.organization.name}
                  </CardDescription>
                </div>
              </div>
              {team.description && (
                <p className='text-sm text-muted-foreground line-clamp-2'>
                  {team.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className='text-sm'>
                  <span className='font-medium'>{team.memberCount}</span>
                  <span className='text-muted-foreground ml-1'>
                    member{team.memberCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleViewMembers(team.id, team.organization.id)}
                >
                  View Members
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
