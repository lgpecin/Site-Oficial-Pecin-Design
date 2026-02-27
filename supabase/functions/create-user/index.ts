import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  role: z.enum(['admin', 'client', 'visitor']),
  expiresAt: z.string().datetime().optional().nullable()
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar se o usuário que está chamando é admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Não autenticado')
    }

    // Verificar se é admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      throw new Error('Sem permissão de admin')
    }

    const body = await req.json()
    const { email, password, role, expiresAt } = createUserSchema.parse(body)

    // Criar usuário usando admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { email }
    })

    if (createError) throw createError

    // Adicionar role se não for visitor
    if (role !== 'visitor') {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert([{ user_id: newUser.user.id, role }])

      if (roleError) throw roleError
    }

    // Adicionar data de expiração se fornecida
    if (expiresAt) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ expires_at: expiresAt })
        .eq('id', newUser.user.id)

      if (profileError) throw profileError
    }

    return new Response(
      JSON.stringify({ success: true, user: newUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('create-user error:', error)
    const message = error instanceof Error ? error.message : ''
    const userMessage = message.includes('permissão') || message.includes('admin')
      ? 'Access denied'
      : message.includes('autenticado')
      ? 'Authentication required'
      : 'An error occurred'
    return new Response(
      JSON.stringify({ error: userMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
