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
import { useRouter, useSearchParams } from 'next/navigation';
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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Owner', 'Admin', 'Manager', 'Member'], {
    message: 'Please select a role'
  })
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Member';
  joinedAt: string;
}

interface Organization {
  id: string;
  name: string;
  ownerId: string;
  userRole: 'Owner' | 'Admin' | 'Manager' | 'Member';
}

export default function TeamPage() {
  const router = useRouter();
  const params = useSearchParams();
  const orgId = params.get('org') ?? 'org_1';

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  // Fetch organization and team members from API
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !orgId) return;

      try {
        // Fetch organization details
        const orgResponse = await apiClient.organizations.getById(orgId);

        if (orgResponse.success && orgResponse.data) {
          const orgData = orgResponse.data;
          const currentUserId = currentUser?.id || currentUser?._id;

          const org: Organization = {
            id: orgData._id || orgData.id,
            name: orgData.name,
            ownerId: orgData.owner?._id || orgData.owner,
            userRole:
              orgData.owner === currentUserId ||
              orgData.owner?._id === currentUserId
                ? 'Owner'
                : orgData.userRole || 'Member'
          };
          setOrganization(org);

          // Fetch teams for this organization
          const teamsResponse = await apiClient.teams.getByOrganization(orgId);

          if (
            teamsResponse.success &&
            teamsResponse.data &&
            teamsResponse.data.length > 0
          ) {
            // Get members from the first team (or combine all teams)
            const team = teamsResponse.data[0];
            setTeamId(team._id || team.id);

            if (team.members && Array.isArray(team.members)) {
              const members: TeamMember[] = team.members.map((member: any) => ({
                id: member.userId?._id || member.userId || member.id,
                name:
                  member.userId?.name ||
                  member.userId?.username ||
                  member.name ||
                  'Unknown',
                email: member.userId?.email || member.email || '',
                role: member.role || 'Member',
                joinedAt: member.joinedAt || new Date().toISOString()
              }));
              setTeamMembers(members);
            }
          } else {
            // No teams yet, empty members array
            setTeamMembers([]);
          }
        } else {
          toast.error(orgResponse.error || 'Failed to fetch organization');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch organization data');
      }
    };

    if (currentUser && orgId) {
      fetchData();
    }
  }, [currentUser, orgId]);

  const addForm = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Member'
    }
  });

  const editForm = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Member'
    }
  });

  // Handle add team member
  const handleAdd = async (data: TeamMemberFormData) => {
    if (!teamId) {
      toast.error('No team found. Please create a team first.');
      return;
    }

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

      // Add member to team
      const response = await apiClient.invitations.send({
        teamId,
        email: data.email,
        organizationId: orgId,
        role: data.role
      });
      if (response.success) {
        toast.success(response.message || 'Team member added successfully');
        // close the add dialog
        setIsAddDialogOpen(false);
        addForm.reset();
      } else {
        toast.error(response.error || 'Failed to add team member');
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
        role: data.role.toLowerCase()
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
      name: member.name,
      email: member.email,
      role: member.role
    });
    setIsEditDialogOpen(true);
  };

  // Check if current user is owner
  const isOwner =
    organization?.ownerId === (currentUser?.id || currentUser?._id);

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-accent text-accent-foreground';
      case 'Admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'Manager':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team members and their roles'
    >
      {!isOwner && (
        <Alert className='border-muted-foreground/20 mb-6'>
          <Eye className='h-4 w-4' />
          <AlertDescription>
            You have view-only access to this workspace. You can view team
            members but cannot add, edit, or remove them.
            {organization?.userRole && (
              <span className='ml-1 font-medium'>
                Your role: {organization.userRole}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>{organization?.name}</h2>
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

                {isOwner && member.role !== 'Owner' && (
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
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(member.role)}`}
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
              Add a new member to your organization team
            </DialogDescription>
          </DialogHeader>
          <Form
            form={addForm}
            onSubmit={addForm.handleSubmit(handleAdd)}
            className='space-y-4'
          >
            <FormField
              control={addForm.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder='John Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value='Admin'>Admin</SelectItem>
                      <SelectItem value='Manager'>Manager</SelectItem>
                      <SelectItem value='Member'>Member</SelectItem>
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
            <DialogDescription>
              Update team member details and role
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
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder='John Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={editForm.control}
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
                      <SelectItem value='Admin'>Admin</SelectItem>
                      <SelectItem value='Manager'>Manager</SelectItem>
                      <SelectItem value='Member'>Member</SelectItem>
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
