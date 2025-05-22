import { useState, useEffect } from 'react';
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
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Função para mostrar notificação
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000); // Remove a notificação após 3 segundos
  };

  // Carregar dados do localStorage
  useEffect(() => {
    const savedSobras = localStorage.getItem('sobrasRegistradas');
    if (savedSobras) {
      setSobrasRegistradas(JSON.parse(savedSobras));
    }
  }, []);

  // Agrupar produção por data
  const producaoPorData = producao.reduce((acc, item) => {
    const data = item.data_venda;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(item);
    return acc;
  }, {});

  // Buscar dados da produção
  const fetchProducao = async () => {
    setLoading(true);
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

    if (error) console.error('Erro ao buscar produção:', error);
    else {
      setProducao(data);
      // Inicializa as sobras com zero ou valores salvos
      const inicialSobras = {};
      data.forEach(item => {
        const savedSobra = sobrasRegistradas.find(s => s.producao_id === item.id);
        inicialSobras[item.id] = savedSobra ? savedSobra.quantidade : 0;
      });
      setSobrasQuantidade(inicialSobras);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducao();
  }, []);

  // Atualizar sobras
  const handleSobraChange = (id, value) => {
    const maxValue = producao.find(item => item.id === id)?.quantidade || 0;
    const newValue = Math.max(0, Math.min(parseInt(value) || 0, maxValue));
    
    setSobrasQuantidade(prev => ({
      ...prev,
      [id]: newValue
    }));
  };

  const saveSobras = async (id) => {
    const item = producao.find(item => item.id === id);
    const quantidadeSobra = sobrasQuantidade[id] || 0;

    if (quantidadeSobra <= 0) {
      setEditingId(null);
      return;
    }

    // Atualiza a lista de sobras registradas
    const novaSobra = {
      producao_id: id,
      produto_id: item.produto_id,
      produto_nome: item.produtos?.nome || 'Desconhecido',
      quantidade: quantidadeSobra,
      valor_total: quantidadeSobra * item.preco_unitario,
      data_venda: item.data_venda,
      data_registro: new Date().toISOString().split('T')[0],
      updated: false // Flag para controle de envio ao Supabase
    };

    const updatedSobras = [
      novaSobra,
      ...sobrasRegistradas.filter(s => s.producao_id !== id)
    ];

    setSobrasRegistradas(updatedSobras);
    localStorage.setItem('sobrasRegistradas', JSON.stringify(updatedSobras));
    setEditingId(null);
  };

  // Registrar vendas no Supabase
  const registrarVendasNoSupabase = async (dataVenda) => {
    setSendingSalesToSupabase(true);
    try {
      const vendasDoDia = producaoPorData[dataVenda] || [];
      
      if (vendasDoDia.length === 0) {
        alert('Nenhuma venda para registrar para esta data!');
        return;
      }

      const { error } = await supabase
        .from('vendas')
        .insert(vendasDoDia.map(venda => ({
          produto_id: venda.produto_id,
          quantidade: venda.quantidade,
          preco_unitario: venda.preco_unitario,
          data_venda: venda.data_venda
        })));

      if (error) throw error;

      showNotification('Venda Registrada', 'success');
    } catch (error) {
      console.error('Erro ao registrar vendas:', error);
      showNotification('Erro ao registrar vendas!', 'error');
    } finally {
      setSendingSalesToSupabase(false);
    }
  };

  // Registrar sobras no Supabase
  const registrarSobrasNoSupabase = async () => {
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

      // Marca como enviado no estado local
      const updatedSobras = sobrasRegistradas.map(s => ({
        ...s,
        updated: true
      }));

      setSobrasRegistradas(updatedSobras);
      localStorage.setItem('sobrasRegistradas', JSON.stringify(updatedSobras));
      showNotification('Sobras registradas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao registrar sobras:', error);
      showNotification('Erro ao registrar sobras!', 'error');
    } finally {
      setSendingToSupabase(false);
    }
  };

  // Formatar data - versão corrigida
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Calcular totais por data
  const calcularTotaisPorData = (items) => {
    const totalVendas = items.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
    const totalSobras = items.reduce((sum, item) => {
      const sobra = sobrasQuantidade[item.id] || 0;
      return sum + (sobra * item.preco_unitario);
    }, 0);

    return { totalVendas, totalSobras };
  };

  return (
    <div className="container mx-auto p-4">
      {/* Notificação */}
      {notification.show && (
        <div className={`fixed left-4 top-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Controle de Vendas</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Tabela de Vendas por Data */}
          {Object.entries(producaoPorData).map(([data, items]) => {
            const { totalVendas, totalSobras } = calcularTotaisPorData(items);

            return (
              <div key={data} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-100 px-6 py-3 border-b">
                  <h2 className="font-semibold">Vendas em {formatDate(data)}</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">Produto</th>
                      <th className="px-6 py-3 text-left">Quantidade</th>
                      <th className="px-6 py-3 text-left">Sobras</th>
                      <th className="px-6 py-3 text-left">Preço Unitário</th>
                      <th className="px-6 py-3 text-left">Total</th>
                      <th className="px-6 py-3 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => {
                      const sobraRegistrada = sobrasRegistradas.find(s => s.producao_id === item.id);
                      const isUpdated = sobraRegistrada?.updated;

                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4">{item.produtos?.nome || 'N/A'}</td>
                          <td className="px-6 py-4">{item.quantidade}</td>
                          <td className="px-6 py-4">
                            {editingId === item.id ? (
                              <input
                                type="number"
                                min="0"
                                max={item.quantidade}
                                value={sobrasQuantidade[item.id] || 0}
                                onChange={(e) => handleSobraChange(item.id, e.target.value)}
                                className="w-20 border rounded px-2 py-1"
                              />
                            ) : (
                              sobrasQuantidade[item.id] || 0
                            )}
                          </td>
                          <td className="px-6 py-4">{formatCurrency(item.preco_unitario)}</td>
                          <td className="px-6 py-4">
                            {formatCurrency(item.quantidade * item.preco_unitario)}
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            {editingId === item.id ? (
                              <button 
                                onClick={() => saveSobras(item.id)} 
                                className={`px-3 py-1 rounded text-white ${
                                  isUpdated ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                              >
                                {isUpdated ? 'Atualizar' : 'Salvar'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => setEditingId(item.id)} 
                                className={`px-3 py-1 rounded text-white ${
                                  isUpdated ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                              >
                                {isUpdated ? 'Atualizar' : 'Lançar Sobras'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    {/* Linha de Sobras */}
                    {totalSobras > 0 && (
                      <tr className="bg-red-50">
                        <td colSpan="3" className="px-6 py-2 text-right font-semibold">Total Sobras:</td>
                        <td className="px-6 py-2 font-semibold text-red-600">-{formatCurrency(totalSobras)}</td>
                        <td colSpan="2"></td>
                      </tr>
                    )}
                    {/* Total do Dia */}
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right font-semibold">Total Líquido:</td>
                      <td className="px-6 py-3 font-semibold">
                        {formatCurrency(totalVendas - totalSobras)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                  <button
                    onClick={() => registrarVendasNoSupabase(data)}
                    disabled={sendingSalesToSupabase}
                    className={`px-4 py-2 rounded text-white ${
                      sendingSalesToSupabase ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {sendingSalesToSupabase ? 'Enviando...' : 'Registrar Vendas'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Tabela de Sobras Registradas */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sobras Registradas</h2>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Data Venda</th>
                    <th className="px-6 py-3 text-left">Produto</th>
                    <th className="px-6 py-3 text-left">Quantidade</th>
                    <th className="px-6 py-3 text-left">Valor Total</th>
                    <th className="px-6 py-3 text-left">Data Registro</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sobrasRegistradas.length > 0 ? (
                    sobrasRegistradas.map((sobra, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">{formatDate(sobra.data_venda)}</td>
                        <td className="px-6 py-4">{sobra.produto_nome}</td>
                        <td className="px-6 py-4">{sobra.quantidade}</td>
                        <td className="px-6 py-4 text-red-600">-{formatCurrency(sobra.valor_total)}</td>
                        <td className="px-6 py-4">{formatDate(sobra.data_registro)}</td>
                        <td className="px-6 py-4">
                          {sobra.updated ? (
                            <span className="text-green-600">Enviado</span>
                          ) : (
                            <span className="text-yellow-600">Pendente</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Nenhuma sobra registrada ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-4 bg-gray-50 border-t flex justify-end">
                <button
                  onClick={registrarSobrasNoSupabase}
                  disabled={sendingToSupabase || sobrasRegistradas.every(s => s.updated)}
                  className={`px-4 py-2 rounded text-white ${
                    sendingToSupabase ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {sendingToSupabase ? 'Enviando...' : 'Registrar Sobras'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}