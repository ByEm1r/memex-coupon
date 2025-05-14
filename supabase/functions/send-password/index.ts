import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import Mailjet from 'npm:node-mailjet@6.0.5';

const mailjet = Mailjet.apiConnect(
  Deno.env.get('MAILJET_API_KEY') ?? '',
  Deno.env.get('MAILJET_SECRET_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { email } = await req.json() as RequestBody;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: user, error: userError } = await supabaseClient
      .from('custom_users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'coupon@memextoken.org',
            Name: 'MemeX Support',
          },
          To: [
            {
              Email: email,
              Name: user.store_name || email,
            },
          ],
          Subject: 'Password Recovery Request',
          TextPart: `Hello,\n\nWe received a request to recover your password. Here is your current password:\n\nPassword: ${user.password}\n\nPlease keep it secure and do not share it with anyone.\nIf you did not request this, please contact our support team.\n\nBest regards,\nMemeX Support`,
          HTMLPart: `
            <h3>Password Recovery Request</h3>
            <p>Hello,</p>
            <p>We received a request to recover your password. Here is your current password:</p>
            <p><strong>Password:</strong> ${user.password}</p>
            <p>Please keep it secure and do not share it with anyone.</p>
            <p>If you did not request this, please contact our support team.</p>
            <p>Best regards,<br>MemeX Support</p>
          `,
        },
      ],
    });

    return new Response(
      JSON.stringify({ message: 'Password sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send password recovery email' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});