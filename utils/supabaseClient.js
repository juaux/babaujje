// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Validação das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    Variáveis de ambiente do Supabase não configuradas!
    Certifique-se de ter configurado:
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    no arquivo .env.local e nas configurações do Vercel
  `);
}

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar conexão (opcional - apenas para desenvolvimento)
export const testSupabaseConnection = async () => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { error } = await supabase
        .from('produtos')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      console.log('✅ Conexão com Supabase estabelecida com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Falha na conexão com Supabase:', error.message);
      return false;
    }
  }
};

// Teste automático apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  testSupabaseConnection();
}