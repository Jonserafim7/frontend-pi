import React from "react"
import { QueryClientProvider } from "@tanstack/react-query"

import { AppRoutes } from "./routes"
import { AuthProvider } from "./features/auth/contexts/auth-context"
import { queryClient } from "./lib/react-query"

/**
 * Main application component
 * Wraps the app with required providers
 */
function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="app-container min-h-screen">
          <AppRoutes />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
