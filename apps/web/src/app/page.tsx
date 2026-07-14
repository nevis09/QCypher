import { redirect } from 'next/navigation'

// Root redirects to contacts (the main CRM view)
export default function Home() {
  redirect('/dashboard')
}
