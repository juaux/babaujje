import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Vendas() {
  const [producao, setProducao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [sobrasQuantidade, setSobrasQuantidade] = useState({});
  const [sobrasRegistradas, setSobrasRegistradas] = useState([]);
  const [sendingToSupabase, setSendingToSupabase] = useState(false);
  const [sendingSalesToSupabase, setSendingSalesToSupabase] = useState(false);
  const [datasRegistradas, setDatasRegistradas] = useState(new Set());
  const [statusMessages, setStatusMessages] = useState({});
  const [originalProducao, setOriginalProducao] = useState({});

  // Carregar dados do localStorage
  useEffect(() => {
    const savedSobras = localStorage.getItem('sobrasRegistradas');
    if (savedSobras) {
      setSobrasRegistradas(JSON.parse(savedSobras));
    }
    
    const savedDatasRegistradas = localStorage.getItem('datasRegistradas');
    if (savedDatasRegistradas) {
      setDatasRegistradas(new Set(JSON.parse(savedDatasRegistradas)));
    }

    const savedStatusMessages = localStorage.getItem('statusMessages');
    if (savedStatusMessages) {
      setStatusMessages(JSON.parse(savedStatusMessages));
    }
  }, []);

  // Agrupar produção por data
  const producaoPorData = useCallback(() => {
    return producao.reduce((acc, item) => {
      const data = item.data_venda;
      if (!acc[data]) {
        acc[data] = [];
      }
      acc[data].push(item);
      return acc;
    }, {});
  }, [producao]);

  // Buscar dados da produção
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
          produtos (nome)
        `)
        .order('data_venda', { ascending: false });

      if (error) throw error;

      setProducao(data || []);
      
      const original = {};
      data.forEach(item => {
        original[item.id] = {
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        };
      });
      setOriginalProducao(original);

      const inicialSobras = {};
      data.forEach(item => {
        const savedSobra = sobrasRegistradas.find(s => s.producao_id === item.id);
        inicialSobras[item.id] = savedSobra ? savedSobra.quantidade : 0;
      });
      setSobrasQuantidade(inicialSobras);
    } catch (error) {
      console.error('Erro ao buscar produção:', error);
    } finally {
      setLoading(false);
    }
  }, [sobrasRegistradas]);

  useEffect(() => {
    fetchProducao();
  }, [fetchProducao]);

  // Verificar se houve edições na data
  const hasChangesInDate = useCallback((dataVenda) => {
    const itemsData = producaoPorData()[dataVenda] || [];
    return itemsData.some(item => {
      const original = originalProducao[item.id];
      return original && (
        original.quantidade !== item.quantidade ||
        original.preco_unitario !== item.preco_unitario
      );
    });
  }, [originalProducao, producaoPorData]);

  // Atualizar mensagem de status
  const updateStatusMessage = useCallback((dataVenda, message, type = 'success') => {
    const newMessages = {
      ...statusMessages,
      [dataVenda]: { message, type, timestamp: new Date().toISOString() }
    };
    setStatusMessages(newMessages);
    localStorage.setItem('statusMessages', JSON.stringify(newMessages));
  }, [statusMessages]);

  // Atualizar sobras
  const handleSobraChange = useCallback((id, value) => {
    const maxValue = producao.find(item => item.id === id)?.quantidade || 0;
    const newValue = Math.max(0, Math.min(parseInt(value) || 0, maxValue));
    
    setSobrasQuantidade(prev => ({
      ...prev,
      [id]: newValue
    }));
  }, [producao]);

  const saveSobras = useCallback(async (id) => {
    const item = producao.find(item => item.id === id);
    const quantidadeSobra = sobrasQuantidade[id] || 0;

    if (quantidadeSobra <= 0) {
      setEditingId(null);
      return;
    }

    const novaSobra = {
      producao_id: id,
      produto_id: item.produto_id,
      produto_nome: item.produtos?.nome || 'Desconhecido',
      quantidade: quantidadeSobra,
      valor_total: quantidadeSobra * item.preco_unitario,
      data_venda: item.data_venda,
      data_registro: new Date().toISOString().split('T')[0],
      updated: false
    };

    const updatedSobras = [
      novaSobra,
      ...sobrasRegistradas.filter(s => s.producao_id !== id)
    ];

    setSobrasRegistradas(updatedSobras);
    localStorage.setItem('sobrasRegistradas', JSON.stringify(updatedSobras));
    setEditingId(null);
  }, [producao, sobrasQuantidade, sobrasRegistradas]);

  // Registrar vendas no Supabase
  const registrarVendasNoSupabase = useCallback(async (dataVenda) => {
    setSendingSalesToSupabase(true);
    try {
      const vendasDoDia = producaoPorData()[dataVenda] || [];
      
      if (vendasDoDia.length === 0) {
        updateStatusMessage(dataVenda, 'Nenhuma venda para registrar!', 'error');
        return;
      }

      const isRegistered = datasRegistradas.has(dataVenda);
      const hasChanges = hasChangesInDate(dataVenda);

      if (isRegistered && !hasChanges) {
        updateStatusMessage(dataVenda, 'Venda já registrada! Não há alterações.', 'warning');
        return;
      }

      if (isRegistered && hasChanges) {
        // UPDATE - atualizar registros existentes
        for (const venda of vendasDoDia) {
          const { error } = await supabase
            .from('vendas')
            .update({
              quantidade: venda.quantidade,
              preco_unitario: venda.preco_unitario
            })
            .eq('produto_id', venda.produto_id)
            .eq('data_venda', venda.data_venda);

          if (error) throw error;
        }
        updateStatusMessage(dataVenda, 'Venda Atualizada', 'success');
      } else {
        // INSERT - novo registro
        const { error } = await supabase
          .from('vendas')
          .insert(vendasDoDia.map(venda => ({
            produto_id: venda.produto_id,
            quantidade: venda.quantidade,
            preco_unitario: venda.preco_unitario,
            data_venda: venda.data_venda
          })));

        if (error) throw error;

        const newDatasRegistradas = new Set([...datasRegistradas, dataVenda]);
        setDatasRegistradas(newDatasRegistradas);
        localStorage.setItem('datasRegistradas', JSON.stringify([...newDatasRegistradas]));
        
        updateStatusMessage(dataVenda, 'Venda Registrada', 'success');
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
      updateStatusMessage(dataVenda, 'Erro ao registrar vendas!', 'error');
    } finally {
      setSendingSalesToSupabase(false);
    }
  }, [datasRegistradas, hasChangesInDate, originalProducao, producaoPorData, updateStatusMessage]);

  // Registrar sobras no Supabase
  const registrarSobrasNoSupabase = useCallback(async () => {
    setSendingToSupabase(true);
    try {
      const sobrasParaEnviar = sobrasRegistradas.filter(s => !s.updated);
      
      if (sobrasParaEnviar.length === 0) {
        alert('Nenhuma nova sobra para registrar!');
        return;
      }

      const { error } = await supabase
        .from('sobras')
        .insert(sobrasParaEnviar.map(sobra => ({
          produto_id: sobra.produto_id,
          quantidade_vendida: sobra.quantidade,
          valor_total: sobra.valor_total,
          data: sobra.data_venda
        })));

      if (error) throw error;

      const updatedSobras = sobrasRegistradas.map(s => ({
        ...s,
        updated: true
      }));

      setSobrasRegistradas(updatedSobras);
      localStorage.setItem('sobrasRegistradas', JSON.stringify(updatedSobras));
      alert('Sobras registradas com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar sobras:', error);
      alert('Erro ao registrar sobras!');
    } finally {
      setSendingToSupabase(false);
    }
  }, [sobrasRegistradas]);

  // Formatar data
  const formatDate = useCallback((dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  }, []);

  // Formatar moeda
  const formatCurrency = useCallback((value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, []);

  // Calcular totais por data
  const calcularTotaisPorData = useCallback((items) => {
    const totalVendas = items.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
    const totalSobras = items.reduce((sum, item) => {
      const sobra = sobrasQuantidade[item.id] || 0;
      return sum + (sobra * item.preco_unitario);
    }, 0);

    return { totalVendas, totalSobras };
  }, [sobrasQuantidade]);

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
        const { totalVendas, totalSobras } = calcularTotaisPorData(items);
        const isRegistered = datasRegistradas.has(data);
        const hasChanges = hasChangesInDate(data);
        const statusMessage = statusMessages[data];

        return (
          <div key={data} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
            {/* ... (restante do JSX permanece igual) ... */}
          </div>
        );
      })}

      {/* Tabela de Sobras Registradas */}
      <div className="mt-12">
        {/* ... (restante do JSX permanece igual) ... */}
      </div>
    </div>
  );
}