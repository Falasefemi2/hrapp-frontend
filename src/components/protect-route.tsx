import { Navigate, Outlet } from 'react-router'


export const PageNotFound = ({ errorCode, title, desc }: { errorCode: string; title: string; desc: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="text-6xl font-bold text-red-500 mb-4">{errorCode}</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 mb-6">{desc}</p>
            <button
                onClick={() => window.history.back()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
                Go Back
            </button>
        </div>
    </div>
);

interface ProtectedRouteProps {
    roles?: string[];
}


export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') as string)
        : null

    if (!token) {
        return <Navigate to="/" replace />
    }

    if (roles && user && !roles.includes(user.role?.code)) {
        return (
            <PageNotFound
                errorCode="403"
                title="Access Denied"
                desc="You do not have permission to view this page."
            />
        )
    }

    return <Outlet />
}