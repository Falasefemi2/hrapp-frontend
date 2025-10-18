import { Header } from "@/components/header"
import { Outlet } from "react-router"

export default function DashboardLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}
