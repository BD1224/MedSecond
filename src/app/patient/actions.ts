'use server';

import { db } from '@/lib/db';

/**
 * Server Action: Fetch patient's cases with response counts
 */
export async function getPatientCases(userId: string) {
  try {
    const supabase = await db.client();
    
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cases:', error.message);
      return { success: false, cases: [], error: error.message };
    }

    // Fetch response counts for each case
    const casesWithCounts = await Promise.all(
      (cases || []).map(async (caseItem: any) => {
        const { count: responseCount, error: countError } = await supabase
          .from('responses')
          .select('id', { count: 'exact', head: true })
          .eq('case_id', caseItem.id);
        
        return {
          ...caseItem,
          responseCount: !countError ? (responseCount || 0) : 0,
        };
      })
    );
    
    return { success: true, cases: casesWithCounts || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Get cases error:', errorMessage);
    return { success: false, cases: [], error: errorMessage };
  }
}

/**
 * Server Action: Submit a new medical case
 * 1. Uploads images to Supabase Storage (medical-records bucket)
 * 2. Creates case row in database with image URLs
 * @param data - Case data: title, description, image files
 */
export async function submitCase(
  title: string,
  description: string,
  imageFiles: { name: string; data: Buffer }[]
) {
  try {
    const supabase = await db.client();
    
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    // Upload images to storage
    const imageUrls: string[] = [];
    const caseId = crypto.randomUUID();

    for (const file of imageFiles) {
      try {
        const storagePath = `${user.id}/${caseId}/${file.name}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('medical-records')
          .upload(storagePath, file.data, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        if (data) {
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('medical-records')
            .getPublicUrl(storagePath);

          imageUrls.push(publicUrlData.publicUrl);
        }
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }

    // Create case in database
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert([{
        patient_id: user.id,
        title: title || 'Medical Case',
        description,
        images: imageUrls,
        status: 'open',
      }])
      .select()
      .single();

    if (caseError) {
      console.error('Case creation error:', caseError);
      return { success: false, error: `Failed to create case: ${caseError.message}` };
    }

    console.log('Case created successfully:', newCase.id);
    return { success: true, caseId: newCase.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Submit case error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Server Action: Fetch responses for a case with assessor info
 */
export async function getCaseResponses(caseId: string) {
  try {
    const supabase = await db.client();
    
    const { data: responses, error } = await supabase
      .from('responses')
      .select(`
        id,
        case_id,
        content,
        created_at,
        assessor_id,
        users!responses_assessor_id_fkey(
          id,
          name,
          assessor_profiles(
            specialty,
            verification_status,
            average_rating,
            review_count
          )
        )
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching responses:', error.message);
      return { success: false, responses: [], error: error.message };
    }
    
    return { success: true, responses: responses || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Get responses error:', errorMessage);
    return { success: false, responses: [], error: errorMessage };
  }
}

/**
 * Server Action: Close a case (patient marks as resolved)
 */
export async function closeCase(caseId: string) {
  try {
    const supabase = await db.client();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update case status to closed
    const { error: updateError } = await supabase
      .from('cases')
      .update({ status: 'closed' })
      .eq('id', caseId)
      .eq('patient_id', user.id);

    if (updateError) {
      console.error('Error closing case:', updateError.message);
      return { success: false, error: 'Could not close case' };
    }

    return { success: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Close case error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
