import type { UpdateOfferDto } from "@/api/offer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCandidates } from "@/hooks/useCandidate"
import { useGetDepartments } from "@/hooks/useDepartment"
import { useGetDesignations } from "@/hooks/useDesignation"
import { useGetLevels } from "@/hooks/useLevel"
import { useCreateOffer, useOffers, useOfferStats, useUpdateOffer } from "@/hooks/useOffer"
import { useRoles } from "@/hooks/useRole"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { z } from "zod"


const offerSchema = z.object({
    candidateId: z.string().min(1, "Candidate ID is required"),
    position: z.string().min(1, "Position is required"),
    departmentId: z.string().optional(),
    designationId: z.string().optional(),
    levelId: z.string().optional(),
    salary: z.coerce.number().min(1, "Salary must be greater than 0"),
    startDate: z.string().optional(),
})

type OfferFormData = z.infer<typeof offerSchema>

export default function UserOffer() {

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingOffer, setEditingOffer] = useState<UpdateOfferDto | null>(null)


    const { data: offers = [], isLoading: offersLoading } = useOffers()
    const { data: stats = { total: 0, pending: 0, accepted: 0, rejected: 0 }, isLoading: statsLoading } = useOfferStats()
    const { data: departments = [] } = useGetDepartments()
    const { data: candidates = [] } = useCandidates()
    const { data: designations = [] } = useGetDesignations()
    const { data: levels = [] } = useGetLevels()
    const { data: roles = [] } = useRoles()
    const createMutation = useCreateOffer()
    const updateMutation = useUpdateOffer()

    const createForm = useForm<OfferFormData>({
        defaultValues: {
            candidateId: "",
            position: "",
            departmentId: "",
            designationId: "",
            levelId: "",
            salary: 0,
            startDate: "",
        },
    })
    const editForm = useForm<OfferFormData>({
        resolver: zodResolver(offerSchema) as Resolver<OfferFormData>,
    })

    const handleCreate = (values: OfferFormData) => {
        const payload = {
            ...values,
            departmentId: values.departmentId || undefined,
            designationId: values.designationId || undefined,
            levelId: values.levelId || undefined,
            startDate: values.startDate || undefined,
        }

        createMutation.mutate(payload, {
            onSuccess: () => {
                setIsCreateOpen(false)
                createForm.reset()
            },
        })
    }

    const handleUpdate = (values: OfferFormData) => {
        if (!editingOffer?.id) return

        const payload = {
            ...values,
            departmentId: values.departmentId || undefined,
            designationId: values.designationId || undefined,
            levelId: values.levelId || undefined,
            startDate: values.startDate || undefined,
        }

        updateMutation.mutate(
            { id: editingOffer.id, payload },
            {
                onSuccess: () => {
                    setIsEditOpen(false)
                    setEditingOffer(null)
                    editForm.reset()
                },
            }
        )
    }

    const getStatusColor = (status: string) => {
        const colors = {
            Pending: "bg-amber-100 text-amber-800",
            Approved: "bg-blue-100 text-blue-800",
            Accepted: "bg-emerald-100 text-emerald-800",
            Rejected: "bg-red-100 text-red-800",
            Withdrawn: "bg-gray-100 text-gray-800",
        }
        return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Offers Management</h1>
                    <p className="text-muted-foreground">Create, manage and track job offers for candidates</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Offer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Offer</DialogTitle>
                            <DialogDescription>Fill in the offer details to create a new offer</DialogDescription>
                        </DialogHeader>

                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={createForm.control}
                                        name="candidateId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Candidate</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a candidate" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {candidates.map((candidate: any) => (
                                                            <SelectItem key={candidate.id} value={candidate.id}>
                                                                {candidate.firstName} {candidate.lastName}
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
                                        name="designationId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Designation</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a designation" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {designations.map((des: any) => (
                                                            <SelectItem key={des.id} value={des.id}>
                                                                {des.name}
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
                                        name="levelId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Level</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {levels.map((lvl: any) => (
                                                            <SelectItem key={lvl.id} value={lvl.id}>
                                                                {lvl.name}
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
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Position</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a position" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {roles.map((role: any) => (
                                                            <SelectItem key={role.id} value={role.id}>
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
                                        name="departmentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Department</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a department" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {departments.map((dept: any) => (
                                                            <SelectItem key={dept.id} value={dept.id}>
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
                                        name="salary"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Annual Salary</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="120000" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={createForm.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? "Creating..." : "Create Offer"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Offers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Pending</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Accepted</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.accepted}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Rejected</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle>All Offers</CardTitle>
                    <CardDescription>View and manage all job offers sent to candidates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Salary</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {offersLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            Loading offers...
                                        </TableCell>
                                    </TableRow>
                                ) : offers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No offers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    offers.map((offer: any) => (
                                        <TableRow key={offer.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {offer.candidate?.firstName} {offer.candidate?.lastName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {offer.candidate?.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{offer.position}</TableCell>
                                            <TableCell>{offer.department?.name || "-"}</TableCell>
                                            <TableCell>${offer.salary.toLocaleString()}</TableCell>
                                            <TableCell>
                                                {offer.startDate
                                                    ? new Date(offer.startDate).toLocaleDateString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(offer.status)}>
                                                    {offer.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">

                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>


            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Offer</DialogTitle>
                        <DialogDescription>Update the offer details below</DialogDescription>
                    </DialogHeader>

                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editForm.control}
                                    name="candidateId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Candidate</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {candidates.map((candidate: any) => (
                                                        <SelectItem key={candidate.id} value={candidate.id}>
                                                            {candidate.firstName} {candidate.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

        </div>
    )


}