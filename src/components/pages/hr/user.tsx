import { z } from "zod";
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Users, Plus, Pencil, Trash2, Power, PowerOff, Key, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useActivateUser,
    useDeactivateUser,
    useChangePassword,
} from "@/hooks/useUser"
import { useRoles } from "@/hooks/useRole"
import { useGetDepartments } from "@/hooks/useDepartment"
import { useGetLevels } from "@/hooks/useLevel"
import { useGetDesignations } from "@/hooks/useDesignation"

import type { User } from "@/api/user"


export const userFormSchema = z.object({
    employeeCode: z.string().optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email address"),
    phoneNumber: z.string().optional(),
    roleId: z.string().min(1, "Role is required"),
    departmentId: z.string().optional(),
    designationId: z.string().optional(),
    levelId: z.string().optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type UserFormValues = z.infer<typeof userFormSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function UserPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const { data: users = [], isLoading } = useUsers()
    const { data: roles = [] } = useRoles()
    const { data: departments = [] } = useGetDepartments()
    const { data: levels = [] } = useGetLevels()
    const { data: designations = [] } = useGetDesignations()

    const createUser = useCreateUser()
    const updateUser = useUpdateUser()
    const deleteUser = useDeleteUser()
    const activateUser = useActivateUser()
    const deactivateUser = useDeactivateUser()
    const changePassword = useChangePassword()

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            employeeCode: "",
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            roleId: "",
            departmentId: "",
            designationId: "",
            levelId: "",
        },
    })

    const passwordForm = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })


    const onSubmit = async (data: UserFormValues) => {
        try {
            if (editingUser) {
                await updateUser.mutateAsync({
                    id: editingUser.id as string,
                    payload: data,
                })
            } else {
                await createUser.mutateAsync(data)
            }
            setIsDialogOpen(false)
            form.reset()
            setEditingUser(null)
        } catch (error) {
            console.error("Failed to save user:", error)
        }
    }

    const onPasswordSubmit = async (data: ChangePasswordFormValues) => {
        try {
            await changePassword.mutateAsync(data)
            setIsPasswordDialogOpen(false)
            passwordForm.reset()
            setSelectedUserId(null)
        } catch (error) {
            console.error("Failed to change password:", error)
        }
    }

    const handleDelete = async () => {
        if (deletingUserId) {
            try {
                await deleteUser.mutateAsync(deletingUserId)
                setIsDeleteDialogOpen(false)
                setDeletingUserId(null)
            } catch (error) {
                console.error("Failed to delete user:", error)
            }
        }
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        form.reset({
            employeeCode: user.employeeCode || "",
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber || "",
            roleId: user.roleId,
            departmentId: user.departmentId || "",
            designationId: user.designationId || "",
            levelId: user.levelId || "",
        })
        setIsDialogOpen(true)
    }

    const handleCreateNew = () => {
        setEditingUser(null)
        form.reset()
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (userId: string) => {
        setDeletingUserId(userId)
        setIsDeleteDialogOpen(true)
    }

    const handleToggleStatus = async (user: User) => {
        try {
            const userId = user.id ?? "";
            if (user.isActive) {
                await deactivateUser.mutateAsync(userId)
            } else {
                await activateUser.mutateAsync(userId)
            }
        } catch (error) {
            console.error("Failed to toggle user status:", error)
        }
    }

    const handleChangePassword = (userId: string) => {
        setSelectedUserId(userId)
        passwordForm.reset()
        setIsPasswordDialogOpen(true)
    }

    const filteredUsers = users.filter((user) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.employeeCode?.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                                <p className="text-sm text-muted-foreground">Manage employee accounts and permissions</p>
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleCreateNew} size="lg" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or employee code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </Card>

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Skeleton className="h-10 w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-10 w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-10 w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-10 w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-10 w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-10 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    {searchQuery ? "No users found matching your search" : "No users yet"}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    {user.employeeCode && (
                                                        <div className="text-xs text-muted-foreground">{user.employeeCode}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm">{user.email}</div>
                                                    {user.phoneNumber && <div className="text-xs text-muted-foreground">{user.phoneNumber}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">Role #{user.roleId}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.departmentId ? (
                                                    <Badge variant="outline">Dept #{user.departmentId}</Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={user.isActive ? "default" : "secondary"}
                                                    className={
                                                        user.isActive ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                                                    }
                                                >
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleStatus(user)}
                                                        title={user.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {user.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => user.id && handleChangePassword(user.id)}
                                                        title="Change Password"
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => user.id && handleDeleteClick(user.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
                            <DialogDescription>
                                {editingUser ? "Update user information and permissions" : "Add a new user to the system"}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs font-medium text-muted-foreground">BASIC INFORMATION</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="employeeCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Employee Code (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="EMP001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs font-medium text-muted-foreground">CONTACT INFORMATION</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="john.doe@company.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1234567890" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Organization Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs font-medium text-muted-foreground">ORGANIZATION DETAILS</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="roleId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {roles.length === 0 ? (
                                                            <SelectItem value="placeholder" disabled>
                                                                No roles available
                                                            </SelectItem>
                                                        ) : (
                                                            roles.map((role: any) => (
                                                                <SelectItem key={role.id} value={role.id}>
                                                                    {role.name}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="departmentId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Department (Optional)</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select department" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {departments.length === 0 ? (
                                                                <SelectItem value="placeholder" disabled>
                                                                    No departments available
                                                                </SelectItem>
                                                            ) : (
                                                                departments.map((dept: any) => (
                                                                    <SelectItem key={dept.id} value={dept.id}>
                                                                        {dept.name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="designationId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Designation (Optional)</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select designation" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {designations.length === 0 ? (
                                                                <SelectItem value="placeholder" disabled>
                                                                    No designations available
                                                                </SelectItem>
                                                            ) : (
                                                                designations.map((designation: any) => (
                                                                    <SelectItem key={designation.id} value={designation.id}>
                                                                        {designation.name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="levelId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Level (Optional)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {levels.length === 0 ? (
                                                            <SelectItem value="placeholder" disabled>
                                                                No levels available
                                                            </SelectItem>
                                                        ) : (
                                                            levels.map((level: any) => (
                                                                <SelectItem key={level.id} value={level.id}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
                                        {editingUser ? "Update User" : "Create User"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>Update the password for this user account</DialogDescription>
                        </DialogHeader>
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={changePassword.isPending}>
                                        Change Password
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>


                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account and remove all associated
                                data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete User
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </div>
    )
}