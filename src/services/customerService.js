import { supabase } from '../lib/supabase.js';

// GET: Fetch all customers with organization and segments data
export const getCustomers = async () => {
  try {
    const { data, error } = await supabase?.from('customers')?.select(`
        *,
        organization:organizations (
          id,
          name,
          industry,
          website
        ),
        customer_segments (
          id,
          segment
        ),
        created_by_user:user_profiles!customers_created_by_fkey (
          id,
          full_name,
          email
        )
      `)?.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match the expected format
    const transformedData = data?.map(customer => ({
      ...customer,
      // Add camelCase aliases for backwards compatibility
      firstName: customer?.first_name,
      lastName: customer?.last_name,
      jobTitle: customer?.job_title,
      participationStatus: customer?.participation_status,
      organization: customer?.organization?.name || null,
      segments: customer?.customer_segments?.map(seg => seg?.segment) || []
    })) || []

    return { data: transformedData, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// GET: Fetch single customer by ID with full details
export const getCustomer = async (id) => {
  try {
    const { data, error } = await supabase?.from('customers')?.select(`
        *,
        organization:organizations (
          id,
          name,
          industry,
          website
        ),
        customer_segments (
          id,
          segment
        ),
        customer_program_participation (
          id,
          status,
          joined_at,
          completed_at,
          beta_program:beta_programs (
            id,
            name,
            description
          )
        )
      `)?.eq('id', id)?.single()

    if (error) {
      throw error
    }

    // Transform data
    const transformedData = {
      ...data,
      // Add camelCase aliases for backwards compatibility  
      firstName: data?.first_name,
      lastName: data?.last_name,
      jobTitle: data?.job_title,
      participationStatus: data?.participation_status,
      organization: data?.organization?.name || null,
      segments: data?.customer_segments?.map(seg => seg?.segment) || [],
      programs: data?.customer_program_participation || []
    }

    return { data: transformedData, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// POST: Create new customer
export const createCustomer = async (customerData) => {
  try {
    // Get current user
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate required fields before processing
    console.log('Testing The customerData:', customerData);
    if (!customerData?.firstName?.trim() || !customerData?.lastName?.trim() || !customerData?.email?.trim()) {
      throw new Error('First name, last name, and email are required fields');
    }

    // Handle organization - either find existing or create new
    // let organizationId = null;
    // if (customerData?.organization) {
    //   // Check if organization exists
    //   // const { data: existingOrg } = await supabase
    //   //   ?.from('organizations')
    //   //   ?.select('id')
    //   //   ?.ilike('name', customerData?.organization)
    //   //   ?.single();

    //     const { data: existingOrg } = await supabase
    //     .from('organizations')
    //     .select('id')
    //     .eq('name', customerData?.organization)
    //     .single();
      

    //   if (existingOrg) {
    //     organizationId = existingOrg?.id;
    //   } else {
    //     // Create new organization
    //     const { data: newOrg, error: orgError } = await supabase
    //       ?.from('organizations')
    //       ?.insert([{
    //         name: customerData?.organization,
    //         industry: customerData?.industry || null
    //       }])
    //       ?.select()
    //       ?.single();

    //     if (orgError) throw orgError;
    //     organizationId = newOrg?.id;
    //   }
    // }
    let organizationId = null;

    if (customerData?.organization) {
      try {
        const { data: existingOrg, error: orgLookupError } = await supabase
          .from('organizations')
          .select('id')
          // .ilike('name', customerData.organization)
          .ilike('name', `%${customerData.organization}%`)
          .maybeSingle();

        if (orgLookupError) {
          console.error('❌ Error fetching organization:', orgLookupError);
          throw orgLookupError;
        }

        if (existingOrg) {
          organizationId = existingOrg.id;
        } else {
          const { data: newOrg, error: orgInsertError } = await supabase
            .from('organizations')
            .insert([{
              name: customerData.organization,
              industry: customerData.industry || null
            }])
            .select()
            .single();

          if (orgInsertError) {
            console.error('❌ Error inserting organization:', orgInsertError);
            throw orgInsertError;
          }

          organizationId = newOrg.id;
        }
      } catch (err) {
        console.error('❌ Network or Supabase error:', err.message || err);
        throw err;
      }
    }


    // Prepare customer data with proper null handling
    const customerInsertData = {
      first_name: customerData?.firstName?.trim(), // Ensure trimmed and not empty
      last_name: customerData?.lastName?.trim(), // Ensure trimmed and not empty  
      email: customerData?.email?.trim(), // Ensure trimmed and not empty
      organization_id: organizationId,
      job_title: customerData?.jobTitle?.trim() || null,
      region: customerData?.region || null,
      time_zone: customerData?.timeZone || null,
      language: customerData?.language || 'English',
      participation_status: customerData?.participationStatus || 'invited',
      device_info: customerData?.deviceInfo?.trim() || null,
      os_info: customerData?.osInfo?.trim() || null,
      browser_info: customerData?.browserInfo?.trim() || null,
      notes: customerData?.notes?.trim() || null,
      created_by: user?.id
    };

    // Final validation - ensure required fields are present
    if (!customerInsertData?.first_name || !customerInsertData?.last_name || !customerInsertData?.email) {
      throw new Error('Required fields (first_name, last_name, email) cannot be null or empty');
    }

    // Create customer
    const { data, error } = await supabase
      ?.from('customers')
      ?.insert([customerInsertData])
      ?.select(`
        *,
        organization:organizations (
          id,
          name,
          industry
        )
      `)
      ?.single();

    if (error) {
      throw error;
    }

    // Add segments if provided
    if (customerData?.segments?.length > 0) {
      const segmentInserts = customerData?.segments?.map(segment => ({
        customer_id: data?.id,
        segment: segment
      }));

      const { error: segmentError } = await supabase
        ?.from('customer_segments')
        ?.insert(segmentInserts);
      
      if (segmentError) {
        // Log segment error but don't fail the customer creation console.warn('Warning: Customer created but segments failed to save:', segmentError);
      }
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// PUT: Update existing customer
export const updateCustomer = async (id, updates) => {
  try {
    const { data, error } = await supabase?.from('customers')?.update({
        first_name: updates?.firstName,
        last_name: updates?.lastName,
        email: updates?.email,
        job_title: updates?.jobTitle,
        region: updates?.region,
        time_zone: updates?.timeZone,
        language: updates?.language,
        participation_status: updates?.participationStatus,
        device_info: updates?.deviceInfo,
        os_info: updates?.osInfo,
        browser_info: updates?.browserInfo,
        notes: updates?.notes,
        updated_at: new Date()?.toISOString()
      })?.eq('id', id)?.select(`
        *,
        organization:organizations (
          id,
          name,
          industry
        )
      `)?.single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// DELETE: Remove customer
export const deleteCustomer = async (id) => {
  try {
    // First delete related segments
    await supabase?.from('customer_segments')?.delete()?.eq('customer_id', id)

    // Then delete customer
    const { error } = await supabase?.from('customers')?.delete()?.eq('id', id)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    return { error: error?.message };
  }
}

// GET: Fetch all organizations for dropdowns
export const getOrganizations = async () => {
  try {
    const { data, error } = await supabase?.from('organizations')?.select('*')?.order('name')

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error) {
    return { data: [], error: error?.message };
  }
}

// GET: Get customer statistics for dashboard
export const getCustomerStats = async () => {
  try {
    const { data: totalCount, error: totalError } = await supabase?.from('customers')?.select('id', { count: 'exact', head: true })

    const { data: activeCount, error: activeError } = await supabase?.from('customers')?.select('id', { count: 'exact', head: true })?.eq('participation_status', 'active')

    const { data: recentCount, error: recentError } = await supabase?.from('customers')?.select('id', { count: 'exact', head: true })?.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString())

    if (totalError || activeError || recentError) {
      throw totalError || activeError || recentError
    }

    return {
      data: {
        total: totalCount || 0,
        active: activeCount || 0,
        recent: recentCount || 0
      },
      error: null
    }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}