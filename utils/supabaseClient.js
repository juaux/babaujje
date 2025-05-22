// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('produtos').select('*').limit(1); // Testa a conexão com a tabela "produtos"
    if (error) {
      console.error('Erro ao conectar ao banco de dados:', error.message);
    } else {
      console.log('Conexão com o banco de dados estabelecida com sucesso!');
    }
  } catch (err) {
    console.error('Erro inesperado ao conectar ao banco de dados:', err.message);
  }
};

// Executa o teste de conexão ao inicializar o cliente
testConnection();