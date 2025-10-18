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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { useCreateLevel, useUpdateLevel, useDeleteLevel, useGetLevels } from "@/hooks/useLevel"
import type { Level } from "@/api/level"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    name: z.string().min(3, "Level name must be at least 3 characters").max(50, "Level name is too long"),
    code: z.string().min(1, "Code is required").max(10, "Code must not exceed 10 characters"),

    // Leave information
    annualLeaveDays: z.number().min(0, "Annual leave days must be at least 0"),
    leaveExpirationInterval: z.number().min(1, "Leave expiration must be at least 1 day"),
    minimumLeaveDays: z.number().min(1, "Minimum leave days must be at least 1"),

    basicSalary: z.number().min(0, "Basic salary must be at least 0"),
    transportAllowance: z.number().min(0).default(0),
    domesticAllowance: z.number().min(0).default(0),
    utilityAllowance: z.number().min(0).default(0),
    lunchSubsidy: z.number().min(0).default(0),
    entertainmentAllowance: z.number().min(0).default(0),
    telephoneAllowance: z.number().min(0).default(0),
    fuelAllowance: z.number().min(0).default(0),
    maintenanceAllowance: z.number().min(0).default(0),
    housingAllowance: z.number().min(0).default(0),
    dressingAllowance: z.number().min(0).default(0),
    furnitureAllowance: z.number().min(0).default(0),
    educationAllowance: z.number().min(0).default(0),
    medicalAllowance: z.number().min(0).default(0),
    passageAllowance: z.number().min(0).default(0),
    annualLeaveAllowance: z.number().min(0).default(0),
    thirteenthMonth: z.number().min(0).default(0),

    total: z.number().min(0, "Total must be at least 0"),
})

export default function LevelPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingLevel, setEditingLevel] = useState<Level | null>(null)
    const [deletingLevelId, setDeletingLevelId] = useState<string | null>(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            annualLeaveDays: 0,
            leaveExpirationInterval: 1,
            minimumLeaveDays: 1,
            basicSalary: 0,
            transportAllowance: 0,
            domesticAllowance: 0,
            utilityAllowance: 0,
            lunchSubsidy: 0,
            entertainmentAllowance: 0,
            telephoneAllowance: 0,
            fuelAllowance: 0,
            maintenanceAllowance: 0,
            housingAllowance: 0,
            dressingAllowance: 0,
            furnitureAllowance: 0,
            educationAllowance: 0,
            medicalAllowance: 0,
            passageAllowance: 0,
            annualLeaveAllowance: 0,
            thirteenthMonth: 0,
            total: 0,
        },
    })

    function calculateTotal(values: z.infer<typeof formSchema>) {
        const {
            basicSalary,
            transportAllowance,
            domesticAllowance,
            utilityAllowance,
            lunchSubsidy,
            entertainmentAllowance,
            telephoneAllowance,
            fuelAllowance,
            maintenanceAllowance,
            housingAllowance,
            dressingAllowance,
            furnitureAllowance,
            educationAllowance,
            medicalAllowance,
            passageAllowance,
            annualLeaveAllowance,
            thirteenthMonth,
        } = values

        return (
            basicSalary +
            transportAllowance +
            domesticAllowance +
            utilityAllowance +
            lunchSubsidy +
            entertainmentAllowance +
            telephoneAllowance +
            fuelAllowance +
            maintenanceAllowance +
            housingAllowance +
            dressingAllowance +
            furnitureAllowance +
            educationAllowance +
            medicalAllowance +
            passageAllowance +
            annualLeaveAllowance +
            thirteenthMonth
        )
    }

    const { data: levels = [], isLoading: levelLoading } = useGetLevels()
    const createMutation = useCreateLevel()
    const updateMutation = useUpdateLevel()
    const deleteMutation = useDeleteLevel()

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const payload = { ...values, total: calculateTotal(values) }

        try {
            if (editingLevel) {
                await updateMutation.mutateAsync({ id: editingLevel.id as string, payload });
                toast.success("Level updated successfully!");
            } else {
                await createMutation.mutateAsync(payload)
                toast.success("Level created successfully!")
            }
            setIsDialogOpen(false)
            form.reset()
        } catch (error) {
            toast.error("An error occurred while saving level.")
        }
    }

    const handleDelete = async () => {
        if (!deletingLevelId) return
        try {
            await deleteMutation.mutateAsync(deletingLevelId)
            toast.success("Level deleted successfully!")
            setIsDeleteDialogOpen(false)
        } catch (error) {
            toast.error("Failed to delete level.")
        }
    }

    const handleEdit = (level: Level) => {
        setEditingLevel(level)
        form.reset(level)
        setIsDialogOpen(true)
    }

    const handleCreateNew = () => {
        setEditingLevel(null)
        form.reset({
            name: "",
            code: "",
            annualLeaveDays: 0,
            leaveExpirationInterval: 1,
            minimumLeaveDays: 1,
            basicSalary: 0,
            transportAllowance: 0,
            domesticAllowance: 0,
            utilityAllowance: 0,
            lunchSubsidy: 0,
            entertainmentAllowance: 0,
            telephoneAllowance: 0,
            fuelAllowance: 0,
            maintenanceAllowance: 0,
            housingAllowance: 0,
            dressingAllowance: 0,
            furnitureAllowance: 0,
            educationAllowance: 0,
            medicalAllowance: 0,
            passageAllowance: 0,
            annualLeaveAllowance: 0,
            thirteenthMonth: 0,
            total: 0,
        })
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (id: string | undefined) => {
        if (!id) return;
        setDeletingLevelId(id)
        setIsDeleteDialogOpen(true)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("NGN", {
            style: "currency",
            currency: "NGN",
        }).format(amount)
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Briefcase className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Levels</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreateNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Level
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <DialogHeader>
                                    <DialogTitle>{editingLevel ? "Edit Level" : "Create Level"}</DialogTitle>
                                    <DialogDescription>
                                        {editingLevel
                                            ? "Update the level information below."
                                            : "Add a new level with salary and leave details."}
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
                                                            Level Name <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Senior Level" {...field} />
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
                                                            <Input placeholder="e.g., L5" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Leave Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Leave Information</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="annualLeaveDays"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Annual Leave Days</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="leaveExpirationInterval"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Expiration (days)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="minimumLeaveDays"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Minimum Days</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Salary Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Salary & Allowances</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="basicSalary"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Basic Salary</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="transportAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Transport Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="domesticAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Domestic Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="utilityAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Utility Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lunchSubsidy"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Lunch Subsidy</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="entertainmentAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Entertainment Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="telephoneAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Telephone Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fuelAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Fuel Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="maintenanceAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Maintenance Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="housingAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Housing Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="dressingAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Dressing Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="furnitureAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Furniture Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="educationAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Education Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="medicalAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Medical Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="passageAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passage Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="annualLeaveAllowance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Annual Leave Allowance</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="thirteenthMonth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>13th Month</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
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
                                            : editingLevel
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
                {levelLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading levels...</p>
                    </div>
                ) : levels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2">
                        <Briefcase className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No levels found</p>
                        <Button onClick={handleCreateNew} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Level
                        </Button>
                    </div>
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">Name</TableHead>
                                <TableHead className="w-[15%]">Code</TableHead>
                                <TableHead className="w-[15%]">Leave Days</TableHead>
                                <TableHead className="w-[20%]">Total Salary</TableHead>
                                <TableHead className="w-[20%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {levels.map((level) => (
                                <TableRow key={level.id}>
                                    <TableCell className="w-[30%] font-medium">{level.name}</TableCell>
                                    <TableCell className="w-[15%]">
                                        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium">
                                            {level.code}
                                        </span>
                                    </TableCell>
                                    <TableCell className="w-[15%]">{level.annualLeaveDays} days</TableCell>
                                    <TableCell className="w-[20%]">{formatCurrency(level.total)}</TableCell>
                                    <TableCell className="w-[20%] text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(level)} className="hover:bg-muted">
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit level</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(level.id)}
                                                className="hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Delete level</span>
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
                            This action cannot be undone. This will permanently delete the level.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingLevelId(null)}>Cancel</AlertDialogCancel>
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
