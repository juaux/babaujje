import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

const LOCAL_STORAGE_KEY = 'vendasTemporarias';

// Componentes carregados dinamicamente
const SalesForm = dynamic(() => import('@/components/SalesForm'), {
  loading: () => <Spinner />,
  ssr: false
});

const SalesSummary = dynamic(() => import('@/components/SalesSummary'), {
  loading: () => <Spinner />,
  ssr: false
});

const EditVendaModal = dynamic(() => import('@/components/EditVendaModal'), {
  loading: () => <Spinner />,
  ssr: false
});

// Componente de spinner reutilizável
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function LancarVendas() {
  const [state, setState] = useState({
    vendas: [],
    vendaEditando: null,
    dataEscolhida: new Date().toISOString().split('T')[0],
    datasRegistradas: [],
    mensagem: '',
    carregando: true
  });

  const router = useRouter();

  // Atualização otimizada do estado
  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarVendasTemporarias();
    verificarRegistrosDatas();
  }, []);

  // Funções memoizadas
  const salvarVendasTemporarias = useCallback((vendasParaSalvar) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vendasParaSalvar));
      updateState({ vendas: vendasParaSalvar });
    } catch (error) {
      console.error('Erro ao salvar vendas no localStorage:', error);
      updateState({ mensagem: 'Erro ao salvar vendas temporárias' });
      setTimeout(() => updateState({ mensagem: '' }), 3000);
    }
  }, []);

  const carregarVendasTemporarias = useCallback(() => {
    try {
      const vendasSalvas = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (vendasSalvas) {
        const vendasCarregadas = JSON.parse(vendasSalvas);
        const newState = { vendas: vendasCarregadas, carregando: false };
        
        if (vendasCarregadas.length > 0) {
          newState.dataEscolhida = vendasCarregadas[0].data_venda;
        }
        
        updateState(newState);
      } else {
        updateState({ carregando: false });
      }
    } catch (error) {
      console.error('Erro ao carregar vendas do localStorage:', error);
      updateState({ 
        mensagem: 'Erro ao carregar vendas temporárias',
        carregando: false 
      });
      setTimeout(() => updateState({ mensagem: '' }), 3000);
    }
  }, []);

  const verificarRegistrosDatas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('producao')
        .select('data_venda')
        .order('data_venda');

      if (error) throw error;

      if (data?.length > 0) {
        const datasUnicas = [...new Set(data.map(item => item.data_venda))];
        updateState({ datasRegistradas: datasUnicas });
      } else {
        updateState({ datasRegistradas: [] });
      }
    } catch (error) {
      console.error('Erro ao verificar datas registradas:', error);
      updateState({ mensagem: 'Erro ao verificar datas com registros' });
      setTimeout(() => updateState({ mensagem: '' }), 3000);
    }
  }, []);

  const adicionarVenda = useCallback((venda) => {
    if (!venda.preco_unitario && venda.preco_unitario !== 0) {
      updateState({ mensagem: 'Erro: Preço unitário não informado' });
      setTimeout(() => updateState({ mensagem: '' }), 3000);
      return;
    }

    if (state.vendas.length > 0 && state.vendas[0].data_venda !== venda.data_venda) {
      updateState({ 
        mensagem: 'Não é possível misturar datas diferentes. Registre as vendas atuais antes de alterar a data.' 
      });
      setTimeout(() => updateState({ mensagem: '' }), 5000);
      return;
    }

    const novaVenda = {
      ...venda,
      id: Date.now(),
      data_venda: venda.data_venda
    };

    const novasVendas = [novaVenda, ...state.vendas];
    salvarVendasTemporarias(novasVendas);

    if (state.vendas.length === 0) {
      updateState({ dataEscolhida: venda.data_venda });
    }
  }, [state.vendas, salvarVendasTemporarias]);

  const registrarVendas = useCallback(async () => {
    try {
      updateState({ carregando: true });

      if (state.vendas.length > 0) {
        const dataVenda = state.vendas[0].data_venda;

        if (state.datasRegistradas.includes(dataVenda)) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          updateState({ 
            vendas: [],
            mensagem: `Já existem vendas registradas para ${formatarData(dataVenda)}. Os itens foram removidos.`,
            carregando: false
          });
          setTimeout(() => updateState({ mensagem: '' }), 5000);
          await verificarRegistrosDatas();
          return;
        }

        const vendasFormatadas = state.vendas.map(venda => ({
          data_venda: venda.data_venda,
          produto_id: venda.produto_id,
          quantidade: venda.quantidade,
          preco_unitario: venda.preco_unitario,
        }));

        const { error } = await supabase.from('producao').insert(vendasFormatadas);
        if (error) throw error;

        localStorage.removeItem(LOCAL_STORAGE_KEY);
        updateState({ 
          vendas: [],
          mensagem: 'Vendas registradas com sucesso!',
          carregando: false,
          datasRegistradas: [...state.datasRegistradas, dataVenda]
        });
        setTimeout(() => updateState({ mensagem: '' }), 3000);
      }
    } catch (error) {
      console.error('Erro ao registrar vendas:', error);
      updateState({ 
        mensagem: `Erro ao registrar vendas: ${error.message}`,
        carregando: false
      });
      setTimeout(() => updateState({ mensagem: '' }), 5000);
    }
  }, [state.vendas, state.datasRegistradas, verificarRegistrosDatas]);

  // Funções auxiliares
  const formatarData = (dataString) => {
    if (!dataString) return '';
    const partes = dataString.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataString;
  };

  const editarVenda = (venda) => updateState({ vendaEditando: venda });
  const excluirVenda = (vendaId) => {
    const vendasAtualizadas = state.vendas.filter(v => v.id !== vendaId);
    salvarVendasTemporarias(vendasAtualizadas);
    updateState({ mensagem: 'Venda excluída com sucesso!' });
    setTimeout(() => updateState({ mensagem: '' }), 2000);
  };
  const salvarEdicao = (vendaAtualizada) => {
    if (state.vendas.length > 0 && state.vendas[0].data_venda !== vendaAtualizada.data_venda) {
      updateState({ 
        mensagem: 'Não é possível misturar datas diferentes. Mantenha a mesma data para todas as vendas.' 
      });
      setTimeout(() => updateState({ mensagem: '' }), 5000);
      return;
    }
    const vendasAtualizadas = state.vendas.map(v => v.id === vendaAtualizada.id ? vendaAtualizada : v);
    salvarVendasTemporarias(vendasAtualizadas);
    updateState({ vendaEditando: null });
  };

  return (
    <div className="flex flex-col h-full px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lançamento de Produção</h1>

      {state.mensagem && (
        <div className={`p-3 mb-6 rounded-md ${
          state.mensagem.includes('sucesso') ? 'bg-green-100 text-green-700' :
          state.mensagem.includes('Já existem vendas registradas') ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          <p className="text-sm font-medium">{state.mensagem}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="lg:w-1/3 p-4 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Adicionar Produção</h2>
          <SalesForm
            adicionarVenda={adicionarVenda}
            vendasAtuais={state.vendas}
            carregando={state.carregando}
          />
        </div>

        <div className="lg:w-2/3 p-4 border border-gray-200 rounded-lg bg-white flex flex-col">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumo de Produção</h2>
          <div className="flex-grow overflow-auto">
  <SalesSummary
    vendas={state.vendas.map(venda => ({
      ...venda,
      data_venda: formatarData(venda.data_venda)
    }))}
    onEditVenda={editarVenda}
    onDeleteVenda={excluirVenda}
    carregando={state.carregando}
  />
</div>

          {state.vendas.length > 0 && (
            <div className="mt-4 flex justify-end pt-4 border-t border-gray-200">
              <button
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md shadow ${
                  state.carregando ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={registrarVendas}
                disabled={state.carregando}
              >
                {state.carregando ? 'Registrando...' : 'Registrar Vendas'}
              </button>
            </div>
          )}
        </div>
      </div>

      {state.vendaEditando && (
        <EditVendaModal
          venda={state.vendaEditando}
          onSalvar={salvarEdicao}
          onCancelar={() => updateState({ vendaEditando: null })}
        />
      )}
    </div>
  );
}