import { useState } from "react"
import { Pencil, Trash2, UserPlus, Search } from "lucide-react"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useCandidates, useCreateCandidate, useUpdateCandidate, useDeleteCandidate } from "@/hooks/useCandidate"
import { useGetDepartments } from "@/hooks/useDepartment"
import { useRoles } from "@/hooks/useRole"
import type { CreateCandidatePayload, UpdateCandidatePayload, Candidate } from "@/api/candidate"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Form validation schema
const candidateSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
    position: z.string().min(2, "Position is required"),
    department: z.string().optional(),
    resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    status: z.string().optional(),
})

type CandidateFormValues = z.infer<typeof candidateSchema>

const CANDIDATE_STATUSES = [
    { value: "SCREENING", label: "Screening", color: "bg-yellow-100 text-yellow-800" },
    { value: "INTERVIEWING", label: "Interview", color: "bg-blue-100 text-blue-800" },
    { value: "OFFER_SENT", label: "Offer  sent", color: "bg-purple-100 text-purple-800" },
    { value: "OFFER_REJECTED", label: "Offer rejected", color: "bg-purple-100 text-purple-800" },
    { value: "ONBOARDING", label: "Onboarding", color: "bg-purple-100 text-purple-800" },
    { value: "HIRED", label: "Hired", color: "bg-green-100 text-green-800" },
    { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
]

export default function UserCandidate() {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Queries
    const { data: candidates = [], isLoading } = useCandidates()
    const { data: departments = [] } = useGetDepartments()
    const { data: roles = [] } = useRoles()

    // Mutations
    const createMutation = useCreateCandidate()
    const updateMutation = useUpdateCandidate()
    const deleteMutation = useDeleteCandidate()

    // Forms
    const createForm = useForm<CandidateFormValues>({
        resolver: zodResolver(candidateSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            position: "",
            department: "",
            resumeUrl: "",
            status: "SCREENING",
        },
    })

    const editForm = useForm<CandidateFormValues>({
        resolver: zodResolver(candidateSchema),
    })

    // Handlers
    const handleCreate = (values: CandidateFormValues) => {
        const payload: CreateCandidatePayload = {
            ...values,
            resumeUrl: values.resumeUrl || undefined,
            department: values.department || undefined,
        }

        createMutation.mutate(payload, {
            onSuccess: () => {
                setIsCreateOpen(false)
                createForm.reset()
            },
        })
    }

    const handleEdit = (candidate: Candidate) => {
        setEditingCandidate(candidate)
        editForm.reset({
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            phoneNumber: candidate.phoneNumber,
            position: candidate.position,
            department: candidate.department || "",
            resumeUrl: candidate.resumeUrl || "",
            status: candidate.status,
        })
        setIsEditOpen(true)
    }

    const handleUpdate = (values: CandidateFormValues) => {
        if (!editingCandidate?.id) return

        const payload: UpdateCandidatePayload = {
            ...values,
            resumeUrl: values.resumeUrl || undefined,
            department: values.department || undefined,
        }

        updateMutation.mutate(
            { id: editingCandidate.id, payload },
            {
                onSuccess: () => {
                    setIsEditOpen(false)
                    setEditingCandidate(null)
                    editForm.reset()
                },
            }
        )
    }

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                setDeleteId(null)
            },
        })
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = CANDIDATE_STATUSES.find(s => s.value === status)
        return (
            <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
                {statusConfig?.label || status}
            </Badge>
        )
    }

    // Filter candidates based on search
    const filteredCandidates = candidates.filter((candidate) => {
        const search = searchQuery.toLowerCase()
        return (
            candidate.firstName.toLowerCase().includes(search) ||
            candidate.lastName.toLowerCase().includes(search) ||
            candidate.email.toLowerCase().includes(search) ||
            candidate.position.toLowerCase().includes(search)
        )
    })

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
                    <p className="text-muted-foreground">Manage your recruitment candidates</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Candidate</DialogTitle>
                            <DialogDescription>
                                Add a new candidate to the recruitment system
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={createForm.control}
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
                                        control={createForm.control}
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
                                    control={createForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {roles.map((role: any) => (
                                                        <SelectItem key={role.id} value={role.name}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments.map((dept: any) => (
                                                        <SelectItem key={dept.id} value={dept.name}>
                                                            {dept.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="resumeUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Resume URL (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://resume.url" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {CANDIDATE_STATUSES.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? "Creating..." : "Create Candidate"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Loading candidates...
                                </TableCell>
                            </TableRow>
                        ) : filteredCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No candidates found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCandidates.map((candidate) => (
                                <TableRow key={candidate.id}>
                                    <TableCell className="font-medium">
                                        {candidate.firstName} {candidate.lastName}
                                    </TableCell>
                                    <TableCell>{candidate.email}</TableCell>
                                    <TableCell>{candidate.phoneNumber}</TableCell>
                                    <TableCell>{candidate.position}</TableCell>
                                    <TableCell>{candidate.department || "-"}</TableCell>
                                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(candidate)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(candidate.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Candidate</DialogTitle>
                        <DialogDescription>
                            Update candidate information
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editForm.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={editForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map((dept: any) => (
                                                    <SelectItem key={dept.id} value={dept.name}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="resumeUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resume URL (Optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CANDIDATE_STATUSES.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Updating..." : "Update Candidate"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the candidate
                            from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}