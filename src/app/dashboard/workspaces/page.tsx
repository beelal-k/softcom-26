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

// Form schema for organization creation/editing
const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal(''))
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
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

  // TODO: Replace with API call to fetch user's organizations
  useEffect(() => {
    // Mock API call - replace with actual API integration
    const fetchOrganizations = async () => {
      // const response = await fetch('/api/organizations');
      // const data = await response.json();
      // setOrganizations(data);

      // Dummy data for testing - multiple organizations with different roles
      const currentUserId = currentUser?.id || currentUser?._id || 'user_1';
      const dummyOrgs: Organization[] = [
        {
          id: 'org_1',
          name: 'TechCorp Solutions',
          description: 'A leading technology company specializing in AI and cloud services',
          industry: 'Technology',
          size: '50-200',
          website: 'https://techcorp.example.com',
          ownerId: currentUserId,
          createdAt: new Date().toISOString(),
          userRole: 'Owner'
        },
        {
          id: 'org_2',
          name: 'DesignHub Agency',
          description: 'Creative design agency focused on brand identity and digital experiences',
          industry: 'Design',
          size: '10-50',
          website: 'https://designhub.example.com',
          ownerId: 'user_other_1',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          userRole: 'Admin'
        },
        {
          id: 'org_3',
          name: 'DataFlow Analytics',
          description: 'Data analytics and business intelligence solutions provider',
          industry: 'Analytics',
          size: '200+',
          website: 'https://dataflow.example.com',
          ownerId: 'user_other_2',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          userRole: 'Member'
        }
      ];
      setOrganizations(dummyOrgs);
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
      size: '',
      website: ''
    }
  });

  const editForm = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      size: '',
      website: ''
    }
  });

  // Handle create organization
  const handleCreate = async (data: OrganizationFormData) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/organizations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const newOrg = await response.json();

      const newOrg: Organization = {
        id: `org_${Date.now()}`,
        ...data,
        ownerId: currentUser?.id || currentUser?._id || 'user_1',
        createdAt: new Date().toISOString(),
        userRole: 'Owner'
      };

      setOrganizations([...organizations, newOrg]);
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast.success('Organization created successfully');
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  // Handle edit organization
  const handleEdit = async (data: OrganizationFormData) => {
    if (!selectedOrg) return;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/organizations/${selectedOrg.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const updatedOrg = await response.json();

      const updatedOrg = { ...selectedOrg, ...data };

      setOrganizations(
        organizations.map((org) => (org.id === selectedOrg.id ? updatedOrg : org))
      );
      setIsEditDialogOpen(false);
      setSelectedOrg(null);
      editForm.reset();
      toast.success('Organization updated successfully');
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    }
  };

  // Handle delete organization
  const handleDelete = async () => {
    if (!selectedOrg) return;

    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/organizations/${selectedOrg.id}`, {
      //   method: 'DELETE'
      // });

      setOrganizations(organizations.filter((org) => org.id !== selectedOrg.id));
      setIsDeleteDialogOpen(false);
      setSelectedOrg(null);
      toast.success('Organization deleted successfully');
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
      size: org.size || '',
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
                {org.size && (
                  <div className='text-muted-foreground'>
                    <span className='font-medium'>Size:</span> {org.size} employees
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
                  router.push(`/dashboard/workspaces/team?org=${org.id}`)
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
                name='size'
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
                name='size'
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
