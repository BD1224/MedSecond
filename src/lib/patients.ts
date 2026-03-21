import { db } from '@/lib/db'

/**
 * Shared Patient logic for managing medical cases.
 * 
 * All functions here utilize the centralized Supabase client from @/lib/db
 * to ensure consistent session handling and global configuration.
 */
export const patients = {
  /**
   * Creates a new medical case for a patient.
   * @param data - The case data including title, description, and optional image URLs.
   * @returns The newly created case object.
   */
  createCase: async (data: { patient_id: string; title: string; description: string; images?: string[] }) => {
    const supabase = await db.client()
    
    const { data: newCase, error } = await supabase
      .from('cases')
      .insert([{
        patient_id: data.patient_id,
        title: data.title,
        description: data.description,
        images: data.images || [],
        status: 'open' // Default status
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating case:', error.message)
      throw new Error(`Failed to create case: ${error.message}`)
    }
    
    return newCase
  },

  /**
   * Fetches all cases belonging to a specific patient.
   * @param userId - The ID of the patient.
   * @returns An array of cases ordered by creation date.
   */
  getMyCases: async (userId: string) => {
    const supabase = await db.client()
    
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching patient cases:', error.message)
      throw new Error(`Failed to fetch cases: ${error.message}`)
    }
    
    return cases || []
  },

  /**
   * Fetches the details of a specific case by ID.
   * @param caseId - The unique identifier of the case.
   * @returns The case data or null if not found.
   */
  getCaseById: async (caseId: string) => {
    const supabase = await db.client()
    
    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (error) {
      console.error('Error fetching case details:', error.message)
      throw new Error(`Failed to fetch case details: ${error.message}`)
    }
    
    return caseData
  }
}
