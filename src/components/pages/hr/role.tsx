"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { useCreateRole, useDeleteRole, useUpdateRole, useRoles } from "@/hooks/useRole"
import type { Role } from "@/api/role"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    name: z.string().min(3, "Role name must be at least 3 characters").max(50, "Role name is too long"),
    code: z.string().min(1, "Code is required").max(10, "Code must not exceed 10 characters").toUpperCase(),
    description: z.string().min(3, "Description must be at least 3 characters").max(200, "Description is too long"),
    permissions: z.object({
        // Management permissions
        canManageRoles: z.boolean().optional().default(false),
        canManageUsers: z.boolean().optional().default(false),
        canManageOffers: z.boolean().optional().default(false),
        canManageDepartments: z.boolean().optional().default(false),

        // Approval permissions
        canApproveLeave: z.boolean().optional().default(false),
        canApproveExit: z.boolean().optional().default(false),
        canApproveMemo: z.boolean().optional().default(false),
        canApproveVoucher: z.boolean().optional().default(false),

        // Operational permissions
        canGenerateReports: z.boolean().optional().default(false),
        canGenerateVoucher: z.boolean().optional().default(false),

        // Employee permissions
        canApplyHMO: z.boolean().optional().default(false),
        canApplyMemo: z.boolean().optional().default(false),
        canApplyLeave: z.boolean().optional().default(false),
        canApplyVoucher: z.boolean().optional().default(false),
    }),
})

export type RoleFormValues = z.infer<typeof formSchema>

const getDefaultPermissions = () => ({
    canManageRoles: false,
    canManageUsers: false,
    canManageOffers: false,
    canManageDepartments: false,
    canApproveLeave: false,
    canApproveExit: false,
    canApproveMemo: false,
    canApproveVoucher: false,
    canGenerateReports: false,
    canGenerateVoucher: false,
    canApplyHMO: false,
    canApplyMemo: false,
    canApplyLeave: false,
    canApplyVoucher: false,
})

export default function RolePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            permissions: {
                canManageRoles: false,
                canManageUsers: false,
                canManageOffers: false,
                canManageDepartments: false,
                canApproveLeave: false,
                canApproveExit: false,
                canApproveMemo: false,
                canApproveVoucher: false,
                canGenerateReports: false,
                canGenerateVoucher: false,
                canApplyHMO: false,
                canApplyMemo: false,
                canApplyLeave: false,
                canApplyVoucher: false,
            },
        },
    })

    const { data: roles = [], isLoading: roleLoading } = useRoles()
    const createMutation = useCreateRole()
    const updateMutation = useUpdateRole()
    const deleteMutation = useDeleteRole()

    const onSubmit = async (values: RoleFormValues) => {
        try {
            if (editingRole) {
                await updateMutation.mutateAsync({
                    id: editingRole.id as string,
                    payload: values,
                })
                toast.success("Role updated successfully!")
            } else {
                await createMutation.mutateAsync(values)
                toast.success("Role created successfully!")
            }
            setIsDialogOpen(false)
            form.reset()
            setEditingRole(null)
        } catch (error: any) {
            console.error("Error submitting role:", error)
            toast.error("An error occurred while saving role.")
        }
    }

    const handleDelete = async () => {
        if (!deletingRoleId) return
        try {
            await deleteMutation.mutateAsync(deletingRoleId)
            toast.success("Role deleted successfully!")
            setIsDeleteDialogOpen(false)
            setDeletingRoleId(null)
        } catch (error) {
            console.error("Failed to delete role:", error)
            toast.error("Failed to delete role.")
        }
    }

    const handleEdit = (role: Role) => {
        setEditingRole(role)
        form.reset({
            name: role.name,
            code: role.code,
            description: role.description,
            permissions: {
                ...getDefaultPermissions(),
                ...role.permissions,
            },
        })
        setIsDialogOpen(true)
    }

    const handleCreateNew = () => {
        setEditingRole(null)
        form.reset({
            name: "",
            code: "",
            description: "",
            permissions: getDefaultPermissions(),
        })
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (id: string | undefined) => {
        if (!id) return
        setDeletingRoleId(id)
        setIsDeleteDialogOpen(true)
    }

    const countActivePermissions = (permissions: any) => {
        if (!permissions) return 0
        return Object.values(permissions).filter((value) => value === true).length
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Roles</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreateNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <DialogHeader>
                                    <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
                                    <DialogDescription>
                                        {editingRole
                                            ? "Update the role information and permissions below."
                                            : "Add a new role with specific permissions."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Basic Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Role Name <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Administrator" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Code <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., ADMIN" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Description <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe the role and its responsibilities..."
                                                            className="resize-none"
                                                            rows={3}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Management Permissions */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Management Permissions</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="permissions.canManageRoles"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Manage Roles</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canManageUsers"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Manage Users</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canManageOffers"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Manage Offers</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canManageDepartments"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Manage Departments</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Approval Permissions */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Approval Permissions</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="permissions.canApproveLeave"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Approve Leave</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canApproveExit"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Approve Exit</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canApproveMemo"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Approve Memo</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canApproveVoucher"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Approve Voucher</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Operational Permissions */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Operational Permissions</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="permissions.canGenerateReports"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Generate Reports</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canGenerateVoucher"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Generate Voucher</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Employee Permissions */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Employee Permissions</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="permissions.canApplyHMO"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Apply HMO</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canApplyMemo"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Apply Memo</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canApplyLeave"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Apply Leave</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="permissions.canApplyVoucher"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">Apply Voucher</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {createMutation.isPending || updateMutation.isPending
                                            ? "Saving..."
                                            : editingRole
                                                ? "Update"
                                                : "Create"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card shadow-sm">
                {roleLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading roles...</p>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2">
                        <Shield className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No roles found</p>
                        <Button onClick={handleCreateNew} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Role
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">Name</TableHead>
                                <TableHead className="w-[15%]">Code</TableHead>
                                <TableHead className="w-[35%]">Description</TableHead>
                                <TableHead className="w-[10%]">Permissions</TableHead>
                                <TableHead className="w-[15%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium">
                                            {role.code}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{role.description}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            {countActivePermissions(role.permissions)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(role)} className="hover:bg-muted">
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit role</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(role.id)}
                                                className="hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Delete role</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the role.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingRoleId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
