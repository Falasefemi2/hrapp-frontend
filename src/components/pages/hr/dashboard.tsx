import { DashboardCards } from "./dashboard-card"

export function HrDashboard() {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
                {/* Header Section */}
                <div className="mb-10 md:mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        System Active
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 text-balance tracking-tight">
                        HR Management
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mx-auto">
                        Streamline your organization's human resources with powerful tools for managing departments, roles, and team
                        members
                    </p>
                </div>

                {/* Dashboard Cards */}
                <DashboardCards />
            </div>
        </div>
    )
}
