import { useState } from "react"
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { useGetDesignations, useCreateDesignation, useUpdateDesignation, useDeleteDesignation } from "@/hooks/useDesignation"
import type { DesignationResponse } from "@/api/designation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useGetDepartments } from "@/hooks/useDepartment"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    code: z.string().min(2, {
        message: "Code must be at least 2 characters."
    }),
    departmentId: z.string().min(1, {
        message: "Please select a department"
    })
})

export default function DesignationPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingDesignation, setEditingDesignation] = useState<DesignationResponse | null>(null)
    const [deletingDesignationId, setDeletingDesignationId] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            departmentId: ""
        },
    })

    // Queries and Mutations
    const { data: departments = [], isLoading: deptLoading } = useGetDepartments()
    const { data: designations = [], isLoading: desLoading } = useGetDesignations()
    const createMutation = useCreateDesignation()
    const updateMutation = useUpdateDesignation()
    const deleteMutation = useDeleteDesignation()

    // Open dialog for creating new designation
    const handleCreateNew = () => {
        setEditingDesignation(null)
        form.reset({
            name: "",
            code: "",
            departmentId: ""
        })
        setIsDialogOpen(true)
    }

    // Open dialog for editing existing designation
    const handleEdit = (designation: DesignationResponse) => {
        setEditingDesignation(designation)
        form.reset({
            name: designation.name,
            code: designation.code,
            departmentId: designation.departmentId
        })
        setIsDialogOpen(true)
    }

    // Handle form submission (create or update)
    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingDesignation) {
                // Update existing designation
                await updateMutation.mutateAsync({
                    id: editingDesignation.id,
                    payload: values,
                })
                toast.success("Designation updated successfully")
            } else {
                // Create new designation
                await createMutation.mutateAsync(values)
                toast.success("Designation created successfully")
            }
            setIsDialogOpen(false)
            form.reset()
        } catch (error) {
            toast.error(editingDesignation ? "Failed to update designation" : "Failed to create designation")
        }
    }

    // Open delete confirmation dialog
    const handleDeleteClick = (id: string) => {
        setDeletingDesignationId(id)
        setIsDeleteDialogOpen(true)
    }

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (!deletingDesignationId) return

        try {
            await deleteMutation.mutateAsync(deletingDesignationId)
            toast.success("Designation deleted successfully")
            setIsDeleteDialogOpen(false)
            setDeletingDesignationId(null)
        } catch (error) {
            toast.error("Failed to delete designation")
        }
    }

    // Get department name by ID
    const getDepartmentName = (departmentId: string) => {
        const dept = departments.find(d => d.id === departmentId)
        return dept ? dept.name : "Unknown"
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Briefcase className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Designations</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreateNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Designation
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <DialogHeader>
                                    <DialogTitle>{editingDesignation ? "Edit Designation" : "Create Designation"}</DialogTitle>
                                    <DialogDescription>
                                        {editingDesignation
                                            ? "Update the designation information below."
                                            : "Add a new designation to your organization."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Designation Name <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Senior Software Engineer" {...field} />
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
                                                    Designation Code <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., SSE" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="departmentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Department <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a department" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id}>
                                                                {dept.name} ({dept.code})
                                                            </SelectItem>
                                                        ))}
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
                                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {createMutation.isPending || updateMutation.isPending
                                            ? "Saving..."
                                            : editingDesignation
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
                {desLoading || deptLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading designations...</p>
                    </div>
                ) : designations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2">
                        <Briefcase className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No designations found</p>
                        <Button onClick={handleCreateNew} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Designation
                        </Button>
                    </div>
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[35%]">Name</TableHead>
                                <TableHead className="w-[20%]">Code</TableHead>
                                <TableHead className="w-[25%]">Department</TableHead>
                                <TableHead className="w-[20%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {designations.map((designation) => (
                                <TableRow key={designation.id}>
                                    <TableCell className="w-[35%] font-medium">{designation.name}</TableCell>
                                    <TableCell className="w-[20%]">
                                        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium">
                                            {designation.code}
                                        </span>
                                    </TableCell>
                                    <TableCell className="w-[25%]">
                                        {getDepartmentName(designation.departmentId)}
                                    </TableCell>
                                    <TableCell className="w-[20%] text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(designation)}
                                                className="hover:bg-muted"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit designation</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(designation.id)}
                                                className="hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Delete designation</span>
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
                            This action cannot be undone. This will permanently delete the designation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingDesignationId(null)}>Cancel</AlertDialogCancel>
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