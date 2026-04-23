'use server';

import { createServerSupabase } from '@/lib/supabase';
import { createSubaccount, updateSubaccount } from '@/lib/paystack';

export async function saveSettings(formData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  const { error } = await supabase
    .from('studios')
    .update({
      name: formData.get('name'),
      location: formData.get('location'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      bio: formData.get('bio'),
      accent_color: formData.get('accent_color'),
      instagram_url: formData.get('instagram_url') || null,
    })
    .eq('id', studio.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveBankDetails(formData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, paystack_subaccount_code')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  const bankCode = formData.get('bank_code');
  const bankName = formData.get('bank_name');
  const accountNumber = formData.get('account_number');
  const accountName = formData.get('account_name');

  if (!bankCode || !accountNumber || !accountName) {
    return { error: 'Please verify your account before saving.' };
  }

  try {
    let subaccountCode = studio.paystack_subaccount_code;

    if (subaccountCode) {
      await updateSubaccount(subaccountCode, { bankCode, accountNumber });
    } else {
      const result = await createSubaccount({
        businessName: studio.name,
        bankCode,
        accountNumber,
      });
      subaccountCode = result.subaccount_code;
    }

    const { error } = await supabase
      .from('studios')
      .update({
        paystack_subaccount_code: subaccountCode,
        paystack_bank_name: bankName,
        paystack_bank_code: bankCode,
        paystack_account_number: accountNumber,
        paystack_account_name: accountName,
      })
      .eq('id', studio.id);

    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    return { error: err.message || 'Failed to register bank account with Paystack.' };
  }
}
