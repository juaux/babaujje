import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function Vendas() {
  const [producao, setProducao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datasRegistradas, setDatasRegistradas] = useState(new Set());
  const [statusMessages, setStatusMessages] = useState({});
  const [originalProducao, setOriginalProducao] = useState({});

  // Carregar dados do localStorage
  useEffect(() => {
    const loadLocalData = () => {
      const savedDatas = localStorage.getItem('datasRegistradas');
      const savedStatus = localStorage.getItem('statusMessages');

      if (savedDatas) setDatasRegistradas(new Set(JSON.parse(savedDatas)));
      if (savedStatus) setStatusMessages(JSON.parse(savedStatus));
    };

    loadLocalData();
  }, []);

  // Agrupar produção por data
  const producaoPorData = useCallback(() => {
    return producao.reduce((acc, item) => {
      const data = item.data_venda;
      acc[data] = acc[data] || [];
      acc[data].push(item);
      return acc;
    }, {});
  }, [producao]);

  // Buscar dados da produção (removido supabase das dependências)
  const fetchProducao = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('producao')
        .select(`
          id,
          produto_id,
          quantidade,
          data_venda,
          preco_unitario,
          produtos(nome)
        `)
        .order('data_venda', { ascending: false });

      if (error) throw error;

      const producaoData = data || [];
      setProducao(producaoData);

      const originalValues = {};
      producaoData.forEach(item => {
        originalValues[item.id] = {
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        };
      });
      setOriginalProducao(originalValues);

    } catch (error) {
      console.error('Erro ao buscar produção:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Removido supabase das dependências

  useEffect(() => {
    fetchProducao();
  }, [fetchProducao]);

  // Verificar alterações na data
  const hasChangesInDate = useCallback((dataVenda) => {
    const items = producaoPorData()[dataVenda] || [];
    return items.some(item => {
      const original = originalProducao[item.id];
      return original && (
        original.quantidade !== item.quantidade ||
        original.preco_unitario !== item.preco_unitario
      );
    });
  }, [originalProducao, producaoPorData]);

  // Atualizar status
  const updateStatus = useCallback((dataVenda, message, type = 'success') => {
    const newMessages = {
      ...statusMessages,
      [dataVenda]: { message, type, timestamp: new Date().toISOString() }
    };
    setStatusMessages(newMessages);
    localStorage.setItem('statusMessages', JSON.stringify(newMessages));
  }, [statusMessages]);

  // Registrar vendas (adicionado hasChangesInDate nas dependências)
  const registrarVendas = useCallback(async (dataVenda) => {
    try {
      const vendasDoDia = producaoPorData()[dataVenda] || [];
      
      if (!vendasDoDia.length) {
        updateStatus(dataVenda, 'Nenhuma venda para registrar!', 'error');
        return;
      }

      const isRegistered = datasRegistradas.has(dataVenda);
      const hasChanges = hasChangesInDate(dataVenda);

      if (isRegistered && !hasChanges) {
        updateStatus(dataVenda, 'Venda já registrada!', 'warning');
        return;
      }

      if (isRegistered) {
        await Promise.all(vendasDoDia.map(venda => 
          supabase
            .from('vendas')
            .update({
              quantidade: venda.quantidade,
              preco_unitario: venda.preco_unitario
            })
            .eq('produto_id', venda.produto_id)
            .eq('data_venda', venda.data_venda)
  )); // ← Remova o ponto e vírgula extra aqui
        updateStatus(dataVenda, 'Vendas atualizadas!', 'success');
      } else {
        const { error } = await supabase
          .from('vendas')
          .insert(vendasDoDia.map(venda => ({
            produto_id: venda.produto_id,
            quantidade: venda.quantidade,
            preco_unitario: venda.preco_unitario,
            data_venda: venda.data_venda
          })));

        if (error) throw error;

        const newDates = new Set([...datasRegistradas, dataVenda]);
        setDatasRegistradas(newDates);
        localStorage.setItem('datasRegistradas', JSON.stringify([...newDates]));
        updateStatus(dataVenda, 'Vendas registradas!', 'success');
      }

      const newOriginal = { ...originalProducao };
      vendasDoDia.forEach(item => {
        newOriginal[item.id] = {
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        };
      });
      setOriginalProducao(newOriginal);

    } catch (error) {
      console.error('Erro ao registrar vendas:', error);
      updateStatus(dataVenda, 'Erro ao registrar vendas!', 'error');
    }
  }, [datasRegistradas, originalProducao, producaoPorData, updateStatus, hasChangesInDate]); 

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Controle de Vendas</h1>
      
      {Object.entries(producaoPorData()).map(([data, items]) => {
        const totalVendas = items.reduce((sum, item) => 
          sum + (item.quantidade * item.preco_unitario), 0);
        
        const status = statusMessages[data];

        return (
          <div key={data} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">
                {new Date(data).toLocaleDateString('pt-BR')}
              </h2>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">
                  Total: {totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <button
                  onClick={() => registrarVendas(data)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Registrar Vendas
                </button>
              </div>
              {status && (
                <div className={`mt-2 p-2 rounded ${
                  status.type === 'error' ? 'bg-red-100 text-red-800' :
                  status.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {status.message}
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Tabela de produtos */}
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}