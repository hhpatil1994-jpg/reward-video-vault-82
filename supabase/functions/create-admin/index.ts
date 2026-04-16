import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create the admin user
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "hhpatil1994@gmail.com",
      password: "112233",
      email_confirm: true,
    });

    if (createError) {
      // User might already exist, try to get them
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existing = users?.users?.find((u: any) => u.email === "hhpatil1994@gmail.com");
      
      if (existing) {
        // Update password
        await supabaseAdmin.auth.admin.updateUserById(existing.id, { password: "112233" });
        
        // Assign admin role
        await supabaseAdmin.from("user_roles").upsert({
          user_id: existing.id,
          role: "admin",
        }, { onConflict: "user_id,role" });

        return new Response(JSON.stringify({ success: true, message: "Admin updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw createError;
    }

    // Assign admin role
    await supabaseAdmin.from("user_roles").insert({
      user_id: user.user.id,
      role: "admin",
    });

    return new Response(JSON.stringify({ success: true, message: "Admin created" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
