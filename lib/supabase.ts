
import { createClient } from '@supabase/supabase-js';

// No Vite, variáveis de ambiente são acessadas via import.meta.env
// Usamos "as any" para evitar erro de compilação caso o ambiente não tenha os tipos do Vite configurados
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || '';

// Verificação de segurança para evitar o erro "supabaseUrl is required"
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "ERRO DE CONFIGURAÇÃO:\n" +
    "As chaves do Supabase não foram encontradas.\n\n" +
    "1. Certifique-se de que existe um arquivo chamado '.env' na raiz do seu projeto.\n" +
    "2. O arquivo deve conter:\n" +
    "   VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n" +
    "   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui\n" +
    "3. Reinicie o servidor de desenvolvimento (npm run dev)."
  );
}

// Inicializa o cliente apenas se tivermos os dados, caso contrário exporta um proxy ou nulo
// Mas para manter a compatibilidade com o resto do app, exportamos a chamada direta:
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
