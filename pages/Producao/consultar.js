import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const coresPorData = {
  '04': 'bg-blue-200',
  '06': 'bg-orange-200',
  '07': 'bg-green-200',
  '10': 'bg-yellow-200',
};

export default function ConsultaVendas() {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editVenda, setEditVenda] = useState({
    produto_id: '',
    quantidade: '',
    preco_unitario: 0
  });
  const [newVenda, setNewVenda] = useState({
    produto_id: '',
    quantidade: '',
    preco_unitario: 0,
    data_venda: new Date().toISOString()
  });
  const [totalGeral, setTotalGeral] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [filtroData, setFiltroData] = useState({
    inicioAno: '2025',
    inicioMes: '01',
    inicioDia: '01',
    fimAno: '2025',
    fimMes: '01',
    fimDia: '01'
  });

  useEffect(() => {
    fetchProdutos();
    fetchVendas();
  }, []);

  useEffect(() => {
  calcularTotalGeral();
}, [vendas, calcularTotalGeral]); // Adiciona a função como dependência

  const fetchVendas = async (inicio = null, fim = null) => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('vendas')
      .select('*, produtos(nome)');

    if (inicio && fim) {
      query = query.gte('data_venda', inicio).lte('data_venda', fim);
    }

    try {
      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar vendas:", error);
        setError("Erro ao buscar vendas.");
      } else {
        setVendas(data || []);
      }
    } catch (error) {
      console.error("Erro inesperado ao buscar vendas:", error);
      setError("Erro inesperado ao buscar vendas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, preco_venda');

      if (error) {
        console.error("Erro ao buscar produtos:", error);
      } else {
        setProdutos(data || []);
      }
    } catch (error) {
      console.error("Erro inesperado ao buscar produtos:", error);
    }
  };

  const formatarData = (data) => {
    try {
      const dataObj = parseISO(data);
      return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data", e);
      return 'Data Inválida';
    }
  };

  const calcularTotalGeral = () => {
    const total = vendas.reduce((acc, venda) => acc + (venda.quantidade * venda.preco_unitario), 0);
    setTotalGeral(total);
  };

  const handleNewVendaChange = (e) => {
    setNewVenda({ ...newVenda, [e.target.name]: e.target.value });
  };

  const handleEditVendaChange = (e) => {
    setEditVenda({ ...editVenda, [e.target.name]: e.target.value });
  };

  const handleFiltroChange = (e) => {
    setFiltroData({ ...filtroData, [e.target.name]: e.target.value });
  };

  const adicionarNovaVenda = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('vendas')
        .insert([newVenda])
        .select('*')
        .single();

      if (error) {
        console.error("Erro ao adicionar venda:", error);
        setError("Erro ao adicionar venda.");
        showAlertMessage('Erro ao adicionar venda.', 'error');
      } else {
        setVendas([...vendas, data]);
        setNewVenda({ produto_id: '', quantidade: '', preco_unitario: 0, data_venda: new Date().toISOString() });
        setAddingNew(false);
        showAlertMessage('Venda adicionada com sucesso!', 'success');
      }
    } catch (error) {
      console.error("Erro inesperado ao adicionar venda:", error);
      setError("Erro inesperado ao adicionar venda.");
      showAlertMessage('Erro inesperado ao adicionar venda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const salvarEdicao = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('vendas')
        .update(editVenda)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error("Erro ao atualizar venda:", error);
        setError("Erro ao atualizar venda.");
        showAlertMessage('Erro ao atualizar venda.', 'error');
      } else {
        const updatedVendas = vendas.map(venda => venda.id === id ? data : venda);
        setVendas(updatedVendas);
        setEditingId(null);
        showAlertMessage('Venda atualizada com sucesso!', 'success');
      }
    } catch (error) {
      console.error("Erro inesperado ao atualizar venda:", error);
      setError("Erro inesperado ao atualizar venda.");
      showAlertMessage('Erro inesperado ao atualizar venda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (venda) => {
    setEditingId(venda.id);
    setEditVenda({
      produto_id: venda.produto_id,
      quantidade: venda.quantidade,
      preco_unitario: venda.preco_unitario,
      data_venda: venda.data_venda
    });
  };

  const cancelarEdicao = () => {
    setEditingId(null);
  };

  const handleDeleteVenda = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta venda?")) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro ao excluir venda:", error);
        setError("Erro ao excluir venda.");
        showAlertMessage('Erro ao excluir venda.', 'error');
      } else {
        const updatedVendas = vendas.filter(venda => venda.id !== id);
        setVendas(updatedVendas);
        showAlertMessage('Venda excluída com sucesso!', 'success');
      }
    } catch (error) {
      console.error("Erro inesperado ao excluir venda:", error);
      setError("Erro inesperado ao excluir venda.");
      showAlertMessage('Erro inesperado ao excluir venda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pesquisarPorData = () => {
    const inicio = `${filtroData.inicioAno}-${filtroData.inicioMes}-${filtroData.inicioDia}`;
    const fim = `${filtroData.fimAno}-${filtroData.fimMes}-${filtroData.fimDia}`;
    fetchVendas(inicio, fim);
  };

  const showAlertMessage = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Consulta de Produção</h1>

      {/* Filtro por data */}
      <div className="mb-4 p-4 border rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <div className="grid grid-cols-3 gap-2">
             <div>
                <label className="block text-xs">Dia</label>
                <input
                  type="text"
                  name="inicioDia"
                  value={filtroData.inicioDia}
                  onChange={handleFiltroChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs">Mês</label>
                <input
                  type="text"
                  name="inicioMes"
                  value={filtroData.inicioMes}
                  onChange={handleFiltroChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
               <div>
                <label className="block text-xs">Ano</label>
                <input
                  type="text"
                  name="inicioAno"
                  value={filtroData.inicioAno}
                  onChange={handleFiltroChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs">Ano</label>
                <input
                  type="text"
                  name="fimAno"
                  value={filtroData.fimAno}
                  onChange={handleFiltroChange}
                  className="w-full p-2 border rounded"
                />
              </div>
               <div>
                <label className="block text-xs">Dia</label>
                <input
                  type="text"
                  name="fimDia"
                  value={filtroData.fimDia}
                  onChange={handleFiltroChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs">Mês</label>
                <input
                  type="text"
                  name="fimMes"
                  value={filtroData.fimMes}
                  onChange={handleFiltroChange}
                  className="w-full p-2 border rounded"
                />
              </div>
             
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={pesquisarPorData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              PESQUISAR
            </button>
          </div>
        </div>

        <button
          onClick={() => setAddingNew(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Adicionar Nova Venda
        </button>
      </div>

      {showAlert && (
        <div className={`mb-4 p-4 rounded ${
          alertSeverity === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {alertMessage}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="mt-2 p-4 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

{!loading && !error && (
  <div className="w-full overflow-x-auto">
    {/* Cabeçalho da tabela */}
    <div className="grid grid-cols-12 gap-4 bg-black text-white p-2 rounded-t">
      <div className="col-span-3 font-bold">Data</div>
      <div className="col-span-2 font-bold">Produto</div>
      <div className="col-span-2 font-bold text-right">Quantidade</div>
      <div className="col-span-2 font-bold text-right">Preço Unitário</div>
      <div className="col-span-2 font-bold text-right">Total</div>
      <div className="col-span-1 font-bold text-right">Ações</div>
    </div>

    {/* Corpo da tabela */}
    {[...vendas]
      .sort((a, b) => new Date(a.data_venda) - new Date(b.data_venda))
      .reduce((acc, currentVenda, index, array) => {
        const dataFormatada = formatarData(currentVenda.data_venda);
        const dia = dataFormatada.split('/')[0];
        const corFundo = coresPorData[dia] || '';
        
        const mostrarData = index === 0 || formatarData(array[index-1].data_venda) !== dataFormatada;
        
        if (mostrarData && index > 0) {
          const vendasDoDiaAnterior = array.filter(
            (v, i) => i < index && formatarData(v.data_venda) === formatarData(array[index-1].data_venda)
          );
          const totalDia = vendasDoDiaAnterior.reduce(
            (sum, v) => sum + (v.quantidade * v.preco_unitario), 0
          );
          
          acc.push({
            type: 'total',
            dataFormatada: formatarData(array[index-1].data_venda),
            total: totalDia
          });
        }
        
        acc.push({
          type: 'venda',
          venda: currentVenda,
          dataFormatada,
          dia,
          corFundo,
          mostrarData
        });
        
        return acc;
      }, [])
      .map((item, index) => {
        if (item.type === 'total') {
          return (
            <div key={`total-${item.dataFormatada}`} className="grid grid-cols-12 gap-4 bg-gray-100 p-2">
              <div className="col-span-8 text-right font-bold">Total</div>
              <div className="col-span-2 text-right font-bold">R$ {item.total.toFixed(2)}</div>
              <div className="col-span-2"></div>
            </div>
          );
        }

        // Verificações seguras
        const venda = item.venda || {};
        const produtos = venda.produtos || {};
        const nomeProduto = produtos.nome || 'Produto não encontrado';
        const quantidade = venda.quantidade || 0;
        const precoUnitario = venda.preco_unitario || 0;
        const totalItem = quantidade * precoUnitario;

        return (
          <React.Fragment key={venda.id || `venda-${index}`}>
            {item.mostrarData && (
              <div className="grid grid-cols-12 gap-4 bg-gray-200 p-2">
                <div className="col-span-12 font-bold">{item.dataFormatada}</div>
              </div>
            )}
            
            <div className={`${item.corFundo} grid grid-cols-12 gap-4 p-2`}>
              <div className="col-span-3">{item.dataFormatada}</div>
              <div className="col-span-2">{nomeProduto}</div>
              <div className="col-span-2 text-right">
                {editingId === venda.id ? (
                  <input
                    type="number"
                    name="quantidade"
                    value={editVenda.quantidade}
                    onChange={handleEditVendaChange}
                    className="w-full p-1 border rounded text-right"
                  />
                ) : (
                  quantidade
                )}
              </div>
              <div className="col-span-2 text-right">
                {editingId === venda.id ? (
                  <input
                    type="number"
                    name="preco_unitario"
                    value={editVenda.preco_unitario}
                    onChange={handleEditVendaChange}
                    className="w-full p-1 border rounded text-right"
                  />
                ) : (
                  precoUnitario
                )}
              </div>
              <div className="col-span-2 text-right">
                {totalItem.toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-end">
                {editingId === venda.id ? (
                  <>
                    <button
                      onClick={() => salvarEdicao(venda.id)}
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={cancelarEdicao}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => venda.id && iniciarEdicao(venda)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => venda.id && handleDeleteVenda(venda.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </React.Fragment>
      );
    })}
        

           {/* Total Geral */}
    <div className="grid grid-cols-12 gap-4 bg-gray-200 p-2 rounded-b">
      <div className="col-span-8 text-right font-bold">Total Geral</div>
      <div className="col-span-2 text-right font-bold">R$ {totalGeral.toFixed(2)}</div>
      <div className="col-span-2"></div>
    </div>
  </div>
)}

      {/* Modal para adicionar nova venda */}
      {addingNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Adicionar Nova Venda</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                name="data_venda"
                value={newVenda.data_venda.split('T')[0]}
                onChange={handleNewVendaChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Produto</label>
              <select
                name="produto_id"
                value={newVenda.produto_id}
                onChange={handleNewVendaChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Selecione um produto</option>
                {produtos.map(produto => (
                  <option key={produto.id} value={produto.id}>{produto.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Quantidade</label>
              <input
                type="number"
                name="quantidade"
                value={newVenda.quantidade}
                onChange={handleNewVendaChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Preço Unitário</label>
              <input
                type="number"
                name="preco_unitario"
                value={newVenda.preco_unitario}
                onChange={handleNewVendaChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddingNew(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarNovaVenda}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}