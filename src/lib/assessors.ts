import { db } from '@/lib/db'

/**
 * Shared Assessor logic for reviewing and responding to medical cases.
 * 
 * All functions here utilize the centralized Supabase client from @/lib/db
 * to ensure consistent session handling and global configuration.
 */
export const assessors = {
  /**
   * Fetches all cases currently open for review.
   * This is used to populate the main feed for assessors.
   * @returns An array of open cases.
   */
  getAvailableCases: async () => {
    const supabase = await db.client()
    
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching available cases:', error.message)
      throw new Error(`Failed to fetch cases: ${error.message}`)
    }
    
    return cases || []
  },

  /**
   * Submits a medical second opinion for a specific case.
   * 1. Inserts the response into the 'responses' table.
   * 2. Updates the case status to 'completed'.
   * @param data - The response content, case ID, and assessor ID.
   */
  submitResponse: async (data: { case_id: string; assessor_id: string; content: string }) => {
    const supabase = await db.client()

    // 1. Insert the response
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert([{
        case_id: data.case_id,
        assessor_id: data.assessor_id,
        content: data.content
      }])
      .select()
      .single()

    if (responseError) {
      console.error('Error submitting response:', responseError.message)
      throw new Error(`Failed to submit response: ${responseError.message}`)
    }

    // 2. Update the case status
    const { error: caseError } = await supabase
      .from('cases')
      .update({ status: 'completed' })
      .eq('id', data.case_id)

    if (caseError) {
      console.error('Error updating case status:', caseError.message)
      // Note: We don't throw here as the response was successfully created, 
      // but we log it for admin review/sync.
    }
    
    return response
  },

  /**
   * Fetches the details of cases currently assigned to or responded to by the assessor.
   * @param assessorId - The ID of the assessor.
   */
  getMyResponses: async (assessorId: string) => {
    const supabase = await db.client()
    
    const { data: responses, error } = await supabase
      .from('responses')
      .select(`
        *,
        cases (
          title,
          status
        )
      `)
      .eq('assessor_id', assessorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assessor history:', error.message)
      throw new Error(`Failed to fetch response history: ${error.message}`)
    }
    
    return responses || []
  }
}
