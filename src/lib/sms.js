/**
 * PearlSMS SMS Gateway Integration
 * Reference Implementation from SakhiHub
 */
export async function sendSMS(to, message, senderId) {
  try {
    const apiKey = process.env.SMS_API_KEY || 'deb13037dea54f789f1ecb0423da4dd0';
    const sender = senderId || process.env.SMS_SENDER || 'SPPLFW';
    const baseUrl = process.env.SMS_BASE_URL || 'http://sms.pearlsms.com/public/sms/send';
    const route = process.env.SMS_ROUTE || 'TRANS';

    if (!apiKey || !baseUrl) {
      console.warn('[PearlSMS] SMS credentials not configured in environment.');
      return { success: false, error: 'SMS credentials missing' };
    }

    const rawNumber = Array.isArray(to) ? to.join(',') : to;
    // Strip any leading '+' signs or spaces
    const number = rawNumber.replace(/\+/g, '').trim();

    const params = new URLSearchParams({
      sender,
      smstype: route,
      numbers: number,
      apikey: apiKey,
      message,
      unicode: 'no'
    });

    console.log(`[PearlSMS] Sending SMS to ${number}...`);
    const res = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const responseData = await res.json().catch(async () => {
      const text = await res.text().catch(() => '');
      return text;
    });

    console.log('[PearlSMS] Response:', responseData);

    const isSuccess = responseData && (
      responseData.status === 'success' ||
      responseData.status === 'SUCCESS' ||
      responseData.statuscode === 200 ||
      responseData.code === 200 ||
      (responseData.errormsg && responseData.errormsg.toLowerCase().includes('success')) ||
      (responseData.errorMessage && responseData.errorMessage.toLowerCase().includes('success')) ||
      (typeof responseData === 'string' && responseData.toLowerCase().includes('success')) ||
      (typeof responseData === 'string' && responseData.toLowerCase().includes('sent'))
    );

    if (!isSuccess) {
      const err = typeof responseData === 'object'
        ? (responseData.message || responseData.errorMessage || responseData.errormsg || JSON.stringify(responseData))
        : String(responseData);
      console.warn('[PearlSMS] Failed response:', err);
      return { success: false, error: err };
    }

    return {
      success: true,
      messageId: typeof responseData === 'object' ? (responseData.requestid || responseData.reqid || responseData.messageId) : undefined,
      data: responseData
    };
  } catch (error) {
    console.error('[PearlSMS] Send SMS Exception:', error.message || error);
    return { success: false, error: error.message || error };
  }
}
