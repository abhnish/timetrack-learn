import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function SupabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        if (error) {
          setError(error.message)
          setIsConnected(false)
        } else {
          setIsConnected(true)
        }
      } catch (err) {
        setError('Failed to connect to Supabase')
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [])

  if (isConnected === null) {
    return null // Loading
  }

  if (!isConnected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Supabase Connection Error</AlertTitle>
        <AlertDescription>
          {error || 'Unable to connect to Supabase. Please check your project configuration.'}
          <br />
          <strong>Next steps:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Ensure you've created a Supabase project</li>
            <li>Run the SQL commands from SUPABASE_SETUP.md in your Supabase dashboard</li>
            <li>Check that your environment variables are properly configured</li>
          </ol>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Supabase Connected</AlertTitle>
      <AlertDescription className="text-green-700">
        Successfully connected to your Supabase database.
      </AlertDescription>
    </Alert>
  )
}