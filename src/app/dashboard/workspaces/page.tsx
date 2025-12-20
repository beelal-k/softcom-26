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
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Building2, MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// Form schema for organization creation/editing
const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal(''))
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  ownerId: string;
  createdAt: string;
  userRole: 'Owner' | 'Admin' | 'Manager' | 'Member';
}

export default function WorkspacesPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
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

  // Fetch user's organizations from API
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!currentUser) return;

      try {
        const userId = currentUser.id || currentUser._id;
        
        // Fetch organizations where user is owner
        const orgsResponse = await apiClient.organizations.getAll(userId);
        
        // Fetch teams where user is a member (to get organizations they're part of)
        const teamsResponse = await apiClient.teams.getByOrganization('');
        
        let allOrganizations: Organization[] = [];
        const orgMap = new Map<string, Organization>();

        // Add owned organizations
        if (orgsResponse.success && orgsResponse.data) {
          orgsResponse.data.forEach((org: any) => {
            const orgId = org._id || org.id;
            orgMap.set(orgId, {
              id: orgId,
              name: org.name,
              description: org.description || '',
              industry: org.industry || '',
              company_size: org.company_size || '',
              website: org.website || '',
              ownerId: org.owner?._id || org.owner,
              createdAt: org.createdAt,
              userRole: 'Owner'
            });
          });
        }

        // Add organizations from teams where user is a member
        if (teamsResponse.success && teamsResponse.data) {
          teamsResponse.data.forEach((team: any) => {
            const org = team.organizationId;
            if (org && typeof org === 'object') {
              const orgId = org._id || org.id;
              // Only add if not already in map (owner takes precedence)
              if (!orgMap.has(orgId)) {
                orgMap.set(orgId, {
                  id: orgId,
                  name: org.name,
                  description: org.description || '',
                  industry: org.industry || '',
                  company_size: org.company_size || '',
                  website: org.website || '',
                  ownerId: org.owner?._id || org.owner,
                  createdAt: org.createdAt,
                  userRole: 'Member'
                });
              }
            }
          });
        }

        allOrganizations = Array.from(orgMap.values());
        setOrganizations(allOrganizations);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Failed to fetch organizations');
      }
    };

    if (currentUser) {
      fetchOrganizations();
    }
  }, [currentUser]);

  const createForm = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      company_size: '',
      website: ''
    }
  });

  const editForm = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      company_size: '',
      website: ''
    }
  });

  // Handle create organization
  const handleCreate = async (data: OrganizationFormData) => {
    try {
      const response = await apiClient.organizations.create(data);

      if (response.success && response.data) {
        const newOrg: Organization = {
          id: response.data._id || response.data.id,
          name: response.data.name,
          description: response.data.description || '',
          industry: response.data.industry || '',
          company_size: response.data.company_size || '',
          website: response.data.website || '',
          ownerId: response.data.owner?._id || response.data.owner,
          createdAt: response.data.createdAt,
          userRole: 'Owner'
        };

        setOrganizations([...organizations, newOrg]);
        setIsCreateDialogOpen(false);
        createForm.reset();
        toast.success(response.message || 'Organization created successfully');
      } else {
        toast.error(response.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  // Handle edit organization
  const handleEdit = async (data: OrganizationFormData) => {
    if (!selectedOrg) return;

    try {
      const response = await apiClient.organizations.update(selectedOrg.id, data);

      if (response.success && response.data) {
        const updatedOrg: Organization = {
          ...selectedOrg,
          name: response.data.name,
          description: response.data.description || '',
          industry: response.data.industry || '',
          company_size: response.data.company_size || '',
          website: response.data.website || ''
        };

        setOrganizations(
          organizations.map((org) => (org.id === selectedOrg.id ? updatedOrg : org))
        );
        setIsEditDialogOpen(false);
        setSelectedOrg(null);
        editForm.reset();
        toast.success(response.message || 'Organization updated successfully');
      } else {
        toast.error(response.error || 'Failed to update organization');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    }
  };

  // Handle delete organization
  const handleDelete = async () => {
    if (!selectedOrg) return;

    try {
      const response = await apiClient.organizations.delete(selectedOrg.id);

      if (response.success) {
        setOrganizations(organizations.filter((org) => org.id !== selectedOrg.id));
        setIsDeleteDialogOpen(false);
        setSelectedOrg(null);
        toast.success(response.message || 'Organization deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete organization');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
    }
  };

  // Open edit dialog with organization data
  const openEditDialog = (org: Organization) => {
    setSelectedOrg(org);
    editForm.reset({
      name: org.name,
      description: org.description || '',
      industry: org.industry || '',
      company_size: org.company_size || '',
      website: org.website || ''
    });
    setIsEditDialogOpen(true);
  };

  // Check if user is owner
  const isOwner = (org: Organization) => {
    return org.ownerId === (currentUser?.id || currentUser?._id);
  };

  return (
    <PageContainer
      pageTitle='Your Organizations'
      pageDescription='Create and manage your organisation/workspaces'
    >
      <div className='mb-6 flex items-center justify-end'>
        
        <Button onClick={() => setIsCreateDialogOpen(true)} className='bg-accent text-accent-foreground hover:bg-accent/90'>
          <Plus className='mr-2 h-4 w-4' />
          Add Organization
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {organizations.map((org) => (
          <Card key={org.id} className='relative'>
            <CardHeader>
              <div className='mb-2 flex items-center justify-between'>
                <Badge
                  variant={isOwner(org) ? 'default' : 'secondary'}
                  className={
                    isOwner(org)
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {org.userRole}
                </Badge>
                
                {isOwner(org) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => openEditDialog(org)}>
                        <Pencil className='mr-2 h-4 w-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedOrg(org);
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
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                    <Building2 className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>{org.name}</CardTitle>
                    {org.industry && (
                      <p className='text-muted-foreground text-xs'>
                        {org.industry}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className='mb-4 line-clamp-2'>
                {org.description || 'No description provided'}
              </CardDescription>
              <div className='flex flex-col gap-2 text-sm'>
                {org.company_size && (
                  <div className='text-muted-foreground'>
                    <span className='font-medium'>Size:</span> {org.company_size} employees
                  </div>
                )}
                {org.website && (
                  <div className='text-muted-foreground truncate'>
                    <span className='font-medium'>Website:</span>{' '}
                    <a
                      href={org.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:underline'
                    >
                      {org.website}
                    </a>
                  </div>
                )}
              </div>
              <Button
                className='mt-4 w-full'
                variant={isOwner(org) ? 'default' : 'outline'}
                onClick={() =>
                  router.push(`/dashboard/workspaces/teams?org=${org.id}`)
                }
              >
                {isOwner(org) ? 'Manage Workspace' : 'View Workspace'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Organization Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Fill in the details to create your organization workspace
            </DialogDescription>
          </DialogHeader>
          <Form form={createForm} onSubmit={createForm.handleSubmit(handleCreate)} className='space-y-4'>
              <FormField
                control={createForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='Acme Corporation' {...field} />
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
                        placeholder='Brief description of your organization'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief overview of your organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='industry'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Technology, Finance, Healthcare, etc.'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='company_size'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='1-10, 10-50, 50-200, 200+'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com'
                        type='url'
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
                    setIsCreateDialogOpen(false);
                    createForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type='submit'>Create Organization</Button>
              </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update your organization details
            </DialogDescription>
          </DialogHeader>
          <Form form={editForm} onSubmit={editForm.handleSubmit(handleEdit)} className='space-y-4'>
              <FormField
                control={editForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='Acme Corporation' {...field} />
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
                        placeholder='Brief description of your organization'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name='industry'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Technology, Finance, Healthcare, etc.'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name='company_size'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='1-10, 10-50, 50-200, 200+'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com'
                        type='url'
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
                    setSelectedOrg(null);
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
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedOrg?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedOrg(null);
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
