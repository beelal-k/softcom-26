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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Users, MoreVertical, Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// Form schema for team creation/editing
const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional()
});

type TeamFormData = z.infer<typeof teamSchema>;

interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  membersCount: number;
  createdAt: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const orgId = params.get('org');

  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);

  // Get current user
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

  // Fetch teams from API
  useEffect(() => {
    const fetchTeams = async () => {
      if (!currentUser || !orgId) return;

      try {
        // Fetch organization details
        const orgResponse = await apiClient.organizations.getById(orgId);
        if (orgResponse.success && orgResponse.data) {
          setOrganization(orgResponse.data);
        }

        // Fetch teams for this organization
        const response = await apiClient.teams.getByOrganization(orgId);

        if (response.success && response.data) {
          const teamsData: Team[] = response.data.map((team: any) => ({
            id: team._id || team.id,
            name: team.name,
            description: team.description || '',
            organizationId: team.organizationId,
            membersCount: team.membersCount || team.members?.length || 0,
            createdAt: team.createdAt
          }));
          setTeams(teamsData);
        } else {
          toast.error(response.error || 'Failed to fetch teams');
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to fetch teams');
      }
    };

    if (currentUser && orgId) {
      fetchTeams();
    }
  }, [currentUser, orgId]);

  const createForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const editForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  // Handle create team
  const handleCreate = async (data: TeamFormData) => {
    if (!orgId) return;

    try {
      const response = await apiClient.teams.create({
        name: data.name,
        description: data.description,
        organizationId: orgId
      });

      if (response.success && response.data) {
        const newTeam: Team = {
          id: response.data._id || response.data.id,
          name: response.data.name,
          description: response.data.description || '',
          organizationId: response.data.organizationId,
          membersCount: response.data.membersCount || 0,
          createdAt: response.data.createdAt
        };

        setTeams([...teams, newTeam]);
        setIsCreateDialogOpen(false);
        createForm.reset();
        toast.success(response.message || 'Team created successfully');
      } else {
        toast.error(response.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  // Handle edit team
  const handleEdit = async (data: TeamFormData) => {
    if (!selectedTeam) return;

    try {
      const response = await apiClient.teams.update(selectedTeam.id, {
        name: data.name,
        description: data.description
      });

      if (response.success && response.data) {
        const updatedTeam: Team = {
          ...selectedTeam,
          name: response.data.name,
          description: response.data.description || ''
        };

        setTeams(
          teams.map((team) => (team.id === selectedTeam.id ? updatedTeam : team))
        );
        setIsEditDialogOpen(false);
        setSelectedTeam(null);
        editForm.reset();
        toast.success(response.message || 'Team updated successfully');
      } else {
        toast.error(response.error || 'Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    }
  };

  // Handle delete team
  const handleDelete = async () => {
    if (!selectedTeam) return;

    try {
      const response = await apiClient.teams.delete(selectedTeam.id);

      if (response.success) {
        setTeams(teams.filter((team) => team.id !== selectedTeam.id));
        setIsDeleteDialogOpen(false);
        setSelectedTeam(null);
        toast.success(response.message || 'Team deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  // Open edit dialog with team data
  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    editForm.reset({
      name: team.name,
      description: team.description || ''
    });
    setIsEditDialogOpen(true);
  };

  // Check if user is owner
  const isOwner = organization?.owner === (currentUser?.id || currentUser?._id) ||
    organization?.owner?._id === (currentUser?.id || currentUser?._id);

  if (!orgId) {
    return (
      <PageContainer
        pageTitle='Teams'
        pageDescription='Select an organization first'
      >
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-center'>
            <p className='text-muted-foreground mb-4'>Please select an organization from the Workspaces page</p>
            <Button onClick={() => router.push('/dashboard/workspaces')}>
              Go to Workspaces
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle='Teams'
      pageDescription='Manage your organization teams'
    >
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>{organization?.name}</h2>
          <p className='text-muted-foreground text-sm'>
            {teams.length} team{teams.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isOwner && (
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className='bg-accent text-accent-foreground hover:bg-accent/90'
          >
            <Plus className='mr-2 h-4 w-4' />
            Create Team
          </Button>
        )}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                    <Users className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <CardTitle className='text-base'>{team.name}</CardTitle>
                    <Badge variant='secondary' className='mt-1'>
                      {team.membersCount} member{team.membersCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => openEditDialog(team)}>
                        <Pencil className='mr-2 h-4 w-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTeam(team);
                          setIsDeleteDialogOpen(true);
                        }}
                        className='text-destructive'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className='mb-4 line-clamp-2'>
                {team.description || 'No description provided'}
              </CardDescription>
              <Button
                className='w-full'
                variant='outline'
                onClick={() =>
                  router.push(`/dashboard/workspaces/teams/${team.id}/members?org=${orgId}`)
                }
              >
                Manage Members
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new team to your organization
            </DialogDescription>
          </DialogHeader>
          <Form
            form={createForm}
            onSubmit={createForm.handleSubmit(handleCreate)}
            className='space-y-4'
          >
            <FormField
              control={createForm.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name *</FormLabel>
                  <FormControl>
                    <Input placeholder='Engineering Team' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Brief description of the team'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief overview of the team
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  createForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type='submit'>Create Team</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team details
            </DialogDescription>
          </DialogHeader>
          <Form
            form={editForm}
            onSubmit={editForm.handleSubmit(handleEdit)}
            className='space-y-4'
          >
            <FormField
              control={editForm.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name *</FormLabel>
                  <FormControl>
                    <Input placeholder='Engineering Team' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={editForm.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Brief description of the team'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTeam(null);
                  editForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type='submit'>Save Changes</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTeam?.name}"? This action
              cannot be undone and will remove all team members.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedTeam(null);
              }}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
