import { Building2, Briefcase, TrendingUp, Shield, Users, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Link } from "react-router"

const dashboardItems = [
    {
        title: "Department",
        description: "Manage organizational departments and their hierarchies",
        icon: Building2,
        to: "/hr/department",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        hoverColor: "group-hover:bg-blue-100",
    },
    {
        title: "Designation",
        description: "Define and manage employee designations and job titles",
        icon: Briefcase,
        to: "/hr/designation",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        hoverColor: "group-hover:bg-amber-100",
    },
    {
        title: "Level",
        description: "Configure employee levels and career progression paths",
        icon: TrendingUp,
        to: "/hr/level",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        hoverColor: "group-hover:bg-emerald-100",
    },
    {
        title: "Role",
        description: "Set up roles and permissions for system access control",
        icon: Shield,
        to: "/hr/role",
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        hoverColor: "group-hover:bg-rose-100",
    },
    {
        title: "Users",
        description: "Manage system users and their account settings",
        icon: Users,
        to: "/hr/user",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        hoverColor: "group-hover:bg-indigo-100",
    },
]

export function DashboardCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {dashboardItems.map((item) => {
                const Icon = item.icon
                return (
                    <Link key={item.to} to={{ pathname: item.to }}>
                        <Card className="group relative overflow-hidden border border-border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer h-full">
                            <div className="p-6 md:p-7">
                                <div className="flex flex-col gap-4">
                                    {/* Icon */}
                                    <div
                                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bgColor} ${item.hoverColor} ${item.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                                    >
                                        <Icon className="h-6 w-6" strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h3>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Subtle border accent on hover */}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card>
                    </Link>
                )
            })}
        </div>
    )
}
