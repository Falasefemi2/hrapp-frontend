"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Pencil, Trash2, Building2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { useGetDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/useDepartment"
import type { Department, DepartmentResponse } from "@/api/department"

export default function DepartmentPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null)
    const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Department>({
        name: "",
        code: "",
        hodId: "",
    })

    // Queries and Mutations
    const { data: departments = [], isLoading } = useGetDepartments()
    const createMutation = useCreateDepartment()
    const updateMutation = useUpdateDepartment()
    const deleteMutation = useDeleteDepartment()

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Open dialog for creating new department
    const handleCreateNew = () => {
        setEditingDepartment(null)
        setFormData({ name: "", code: "", hodId: "" })
        setIsDialogOpen(true)
    }

    // Open dialog for editing existing department
    const handleEdit = (department: DepartmentResponse) => {
        setEditingDepartment(department)
        setFormData({
            name: department.name,
            code: department.code,
            hodId: department.hodId || "",
        })
        setIsDialogOpen(true)
    }

    // Handle form submission (create or update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.name.trim() || !formData.code.trim()) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            if (editingDepartment) {
                // Update existing department
                await updateMutation.mutateAsync({
                    id: editingDepartment.id,
                    payload: formData,
                })
                toast.success("Department updated successfully")
            } else {
                // Create new department
                await createMutation.mutateAsync(formData)
                toast.success("Department created successfully")
            }
            setIsDialogOpen(false)
            setFormData({ name: "", code: "", hodId: "" })
        } catch (error) {
            toast.error(editingDepartment ? "Failed to update department" : "Failed to create department")
        }
    }

    // Open delete confirmation dialog
    const handleDeleteClick = (id: string) => {
        setDeletingDepartmentId(id)
        setIsDeleteDialogOpen(true)
    }

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (!deletingDepartmentId) return

        try {
            await deleteMutation.mutateAsync(deletingDepartmentId)
            toast.success("Department deleted successfully")
            setIsDeleteDialogOpen(false)
            setDeletingDepartmentId(null)
        } catch (error) {
            toast.error("Failed to delete department")
        }
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Building2 className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Departments</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreateNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingDepartment ? "Edit Department" : "Create Department"}</DialogTitle>
                                <DialogDescription>
                                    {editingDepartment
                                        ? "Update the department information below."
                                        : "Add a new department to your organization."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Department Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g., Engineering"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="code">
                                        Department Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="e.g., ENG"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="hodId">Head of Department ID (Optional)</Label>
                                    <Input
                                        id="hodId"
                                        name="hodId"
                                        placeholder="e.g., user-123"
                                        value={formData.hodId}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending
                                        ? "Saving..."
                                        : editingDepartment
                                            ? "Update"
                                            : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading departments...</p>
                    </div>
                ) : departments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2">
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No departments found</p>
                        <Button onClick={handleCreateNew} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Department
                        </Button>
                    </div>
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[45%]">Name</TableHead>
                                <TableHead className="w-[25%]">Code</TableHead>
                                <TableHead className="w-[30%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.map((department) => (
                                <TableRow key={department.id}>
                                    <TableCell className="w-[45%] font-medium">{department.name}</TableCell>
                                    <TableCell className="w-[25%]">
                                        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium">
                                            {department.code}
                                        </span>
                                    </TableCell>
                                    <TableCell className="w-[30%] text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(department)}
                                                className="hover:bg-muted"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit department</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(department.id)}
                                                className="hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Delete department</span>
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
                            This action cannot be undone. This will permanently delete the department.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingDepartmentId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
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
