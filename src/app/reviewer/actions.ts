'use server';

import { db } from '@/lib/db';

/**
 * Server Action: Fetch available cases for assessor
 */
export async function getAvailableCases() {
  try {
    const supabase = await db.client();
    
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching available cases:', error.message);
      return { success: false, cases: [], error: error.message };
    }
    
    return { success: true, cases: cases || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Get available cases error:', errorMessage);
    return { success: false, cases: [], error: errorMessage };
  }
}

/**
 * Server Action: Submit a response to a case
 */
export async function submitCaseResponse(caseId: string, responseText: string) {
  try {
    const supabase = await db.client();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify case still exists and is open (defensive check for race conditions)
    const { data: caseData, error: caseCheckError } = await supabase
      .from('cases')
      .select('id, status')
      .eq('id', caseId)
      .single();

    if (caseCheckError || !caseData) {
      console.error('Error checking case:', caseCheckError?.message);
      return { success: false, error: 'Case not found' };
    }

    if (caseData.status !== 'open') {
      console.error('Case is not open, current status:', caseData.status);
      return { success: false, error: 'This case has already been completed by another assessor' };
    }

    // Create response record
    const { error: insertError } = await supabase
      .from('responses')
      .insert({
        case_id: caseId,
        assessor_id: user.id,
        content: responseText,
      });

    if (insertError) {
      console.error('Error creating response:', insertError.message);
      return { success: false, error: 'Could not save response' };
    }

    // Update case status to closed
    const { error: updateError } = await supabase
      .from('cases')
      .update({ status: 'closed' })
      .eq('id', caseId);

    if (updateError) {
      console.error('Error updating case status:', updateError.message);
      return { success: false, error: 'Could not update case status' };
    }

    return { success: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Submit response error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Server Action: Get closed cases with their responses
 */
export async function getClosedCases() {
  try {
    const supabase = await db.client();
    
    // Fetch all closed cases with their responses
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('*, responses(*)')
      .eq('status', 'closed')
      .order('created_at', { ascending: false });

    if (casesError) {
      console.error('Error fetching closed cases:', casesError.message);
      return { success: false, cases: [], error: casesError.message };
    }
    
    return { success: true, cases: cases || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Get closed cases error:', errorMessage);
    return { success: false, cases: [], error: errorMessage };
  }
}

/**
 * Server Action: Get full case details including patient info and images
 */
export async function getCaseDetail(caseId: string) {
  try {
    const supabase = await db.client();
    
    // Fetch case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, title, description, images, status, created_at, patient_id')
      .eq('id', caseId)
      .single();

    if (caseError) {
      console.error('Error fetching case:', caseError.message);
      return { success: false, case: null, error: caseError.message };
    }

    // Fetch patient info separately via users table
    let userData = null;
    if (caseData?.patient_id) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', caseData.patient_id)
        .single();
      
      if (!userError && user) {
        userData = user;
      }
    }
    
    return { success: true, case: { ...caseData, users: userData }, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Get case detail error:', errorMessage);
    return { success: false, case: null, error: errorMessage };
  }
}
