'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  UserPlus,
  MoreVertical,
  Pencil,
  Trash2,
  Mail,
  Shield,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// Form schema for team member creation/editing
const teamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'member'], {
    message: 'Please select a role'
  })
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
}

export default function TeamMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const orgId = searchParams.get('org');
  const teamId = params.teamId as string;

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

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

  // Fetch team and members from API
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !teamId) return;

      try {
        // Fetch team details
        const teamResponse = await apiClient.teams.getById(teamId);
        if (teamResponse.success && teamResponse.data) {
          const teamData = teamResponse.data;

          setTeam({
            id: teamData._id || teamData.id,
            name: teamData.name,
            description: teamData.description
          });

          // Check if user is owner (check organization owner)
          if (orgId) {
            const orgResponse = await apiClient.organizations.getById(orgId);
            if (orgResponse.success && orgResponse.data) {
              const currentUserId = currentUser?.id || currentUser?._id;
              setIsOwner(
                orgResponse.data.owner === currentUserId ||
                  orgResponse.data.owner?._id === currentUserId
              );
            }
          }

          // Get members from team data
          if (teamData.members && Array.isArray(teamData.members)) {
            console.log('✅ Found members array:', teamData.members.length);
            const members: TeamMember[] = teamData.members.map((member: any) => {
              console.log('👤 Processing member:', member);
              return {
                id: member.userId?._id || member.userId || member.id || member._id,
                name: member.userId?.name || member.userId?.username || member.name || 'Unknown',
                email: member.userId?.email || member.email || '',
                role: member.role || 'member',
                joinedAt: member.joinedAt || new Date().toISOString()
              };
            });
            console.log('✅ Processed members:', members);
            setTeamMembers(members);
          } else {
            console.warn('❌ No members array found or not an array');
          }
        } else {
          toast.error(teamResponse.error || 'Failed to fetch team');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch team data');
      }
    };

    if (currentUser && teamId) {
      fetchData();
    }
  }, [currentUser, teamId, orgId]);

  const addForm = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      email: '',
      role: 'member'
    }
  });

  const editForm = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      email: '',
      role: 'member'
    }
  });

  // Handle add team member (direct add + send email)
  const handleAdd = async (data: TeamMemberFormData) => {
    if (!teamId || !orgId) return;

    try {
      // Search for user by email
      const userResponse = await apiClient.users.search(data.email, 1);

      if (
        !userResponse.success ||
        !userResponse.data ||
        userResponse.data.length === 0
      ) {
        toast.error('User not found. Please ensure the user is registered.');
        return;
      }

      const user = userResponse.data[0];
      const userId = user._id || user.id;

      // Call both APIs simultaneously
      const [addResponse, inviteResponse] = await Promise.allSettled([
        // 1. Add member to team directly
        apiClient.teams.addMember( {
          teamId,
          organizationId: orgId,
          email: data.email,
          role: data.role
        }),
        // 2. Send email invitation/notification
        apiClient.invitations.send({
          email: data.email,
          teamId,
          organizationId: orgId,
          role: data.role
        })
      ]);

      // Check if add member was successful
      if (addResponse.status === 'fulfilled' && addResponse.value.success) {
        const newMember: TeamMember = {
          id: userId,
          name: user.name || user.username || 'Unknown',
          email: user.email || data.email,
          role: data.role,
          joinedAt: new Date().toISOString()
        };

        setTeamMembers([...teamMembers, newMember]);
        setIsAddDialogOpen(false);
        addForm.reset();

        // Show success message based on both results
        if (
          inviteResponse.status === 'fulfilled' &&
          inviteResponse.value.success
        ) {
          toast.success('Team member added and email notification sent!');
        } else {
          toast.success(
            'Team member added successfully (email notification failed)'
          );
          console.warn('Email notification failed:', inviteResponse);
        }
      } else {
        const error =
          addResponse.status === 'fulfilled'
            ? addResponse.value.error
            : 'Failed to add team member';
        toast.error(error || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    }
  };

  // Handle edit team member
  const handleEdit = async (data: TeamMemberFormData) => {
    if (!selectedMember || !teamId) return;

    try {
      const response = await apiClient.teams.updateMember(teamId, {
        userId: selectedMember.id,
        role: data.role
      });

      if (response.success) {
        const updatedMember = { ...selectedMember, role: data.role };

        setTeamMembers(
          teamMembers.map((member) =>
            member.id === selectedMember.id ? updatedMember : member
          )
        );
        setIsEditDialogOpen(false);
        setSelectedMember(null);
        editForm.reset();
        toast.success(response.message || 'Team member updated successfully');
      } else {
        toast.error(response.error || 'Failed to update team member');
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    }
  };

  // Handle delete team member
  const handleDelete = async () => {
    if (!selectedMember || !teamId) return;

    try {
      const response = await apiClient.teams.removeMember(
        teamId,
        selectedMember.id
      );

      if (response.success) {
        setTeamMembers(
          teamMembers.filter((member) => member.id !== selectedMember.id)
        );
        setIsDeleteDialogOpen(false);
        setSelectedMember(null);
        toast.success(response.message || 'Team member removed successfully');
      } else {
        toast.error(response.error || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  // Open edit dialog with member data
  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    editForm.reset({
      email: member.email,
      role: member.role as 'admin' | 'manager' | 'member'
    });
    setIsEditDialogOpen(true);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-accent text-accent-foreground';
      case 'manager':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (!teamId || !orgId) {
    return (
      <PageContainer
        pageTitle='Team Members'
        pageDescription='Select a team first'
      >
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-center'>
            <p className='text-muted-foreground mb-4'>
              Please select a team from the Teams page
            </p>
            <Button
              onClick={() =>
                router.push(`/dashboard/workspaces/teams?org=${orgId}`)
              }
            >
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
      pageDescription='Manage your team members and their roles'
    >
      {!isOwner && (
        <Alert className='border-muted-foreground/20 mb-6'>
          <Eye className='h-4 w-4' />
          <AlertDescription>
            You have view-only access to this team. You can view members but
            cannot add, edit, or remove them.
          </AlertDescription>
        </Alert>
      )}

      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>{team?.name}</h2>
          <p className='text-muted-foreground text-sm'>
            {teamMembers.length} team member
            {teamMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isOwner && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className='bg-accent text-accent-foreground hover:bg-accent/90'
          >
            <UserPlus className='mr-2 h-4 w-4' />
            Add Member
          </Button>
        )}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                    <Shield className='text-primary h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-base'>{member.name}</CardTitle>
                    <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                      <Mail className='h-3 w-3' />
                      {member.email}
                    </div>
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
                      <DropdownMenuItem onClick={() => openEditDialog(member)}>
                        <Pencil className='mr-2 h-4 w-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member);
                          setIsDeleteDialogOpen(true);
                        }}
                        className='text-destructive'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getRoleBadgeColor(member.role)}`}
                >
                  {member.role}
                </span>
                <span className='text-muted-foreground text-xs'>
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a registered user to your team and send them an email
              notification
            </DialogDescription>
          </DialogHeader>
          <Form
            form={addForm}
            onSubmit={addForm.handleSubmit(handleAdd)}
            className='space-y-4'
          >
            <FormField
              control={addForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='john@example.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={addForm.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='admin'>Admin</SelectItem>
                      <SelectItem value='manager'>Manager</SelectItem>
                      <SelectItem value='member'>Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsAddDialogOpen(false);
                  addForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type='submit'>Add Member</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update team member role</DialogDescription>
          </DialogHeader>
          <Form
            form={editForm}
            onSubmit={editForm.handleSubmit(handleEdit)}
            className='space-y-4'
          >
            <FormField
              control={editForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type='email' {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={editForm.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='admin'>Admin</SelectItem>
                      <SelectItem value='manager'>Manager</SelectItem>
                      <SelectItem value='member'>Member</SelectItem>
                    </SelectContent>
                  </Select>
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
                  setSelectedMember(null);
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
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{selectedMember?.name}" from the
              team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedMember(null);
              }}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
