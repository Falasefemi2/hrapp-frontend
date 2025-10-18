import { useNavigate } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LogOut, ChevronDown, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface User {
    firstName: string
    lastName: string
    role?: {
        code: string
    }
}

export function Header() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/")
    }

    const initials = user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : "??"

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <Users className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground leading-none">
                                {user?.role?.code === "HR" ? "HR Portal" : "Portal"}
                            </span>
                            <span className="text-xs text-muted-foreground leading-none mt-0.5">Management System</span>
                        </div>
                    </div>

                    {/* User Profile Section */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-10 px-3 hover:bg-accent">
                                <Avatar className="h-8 w-8 border-2 border-primary/20">
                                    <AvatarImage src="/placeholder.svg" alt="User" />
                                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:flex flex-col items-start">
                                    <span className="text-sm font-medium text-foreground leading-none">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <span className="text-xs text-muted-foreground leading-none mt-0.5">
                                        {user?.role?.code || "User"}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">{user?.role?.code || "User"}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
