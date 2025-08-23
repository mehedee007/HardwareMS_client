import React from 'react'

function GlobalLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-muted-foreground">Loading...</p>
        </div>
    )
}

export default GlobalLoading