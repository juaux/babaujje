import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function ConsultarDespesas() {
    const [despesas, setDespesas] = useState([]);
    const [despesaEditando, setDespesaEditando] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        fetchDespesas();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (mensagem) setMensagem('');
            if (erro) setErro('');
        }, 5000);
        return () => clearTimeout(timer);
    }, [mensagem, erro]);

    const fetchDespesas = async () => {
        setCarregando(true);
        try {
            const { data, error } = await supabase
                .from('despesas')
                .select('*')
                .order('data', { ascending: false });

            if (error) {
                console.error('Erro ao buscar despesas:', error);
                setErro('Erro ao buscar despesas.');
            } else {
                console.log('Dados recebidos do Supabase:', data);
                setDespesas(data || []);
            }
        } catch (error) {
            console.error('Erro inesperado:', error);
            setErro('Erro inesperado ao buscar despesas.');
        } finally {
            setCarregando(false);
        }
    };

    const editarDespesa = (despesa) => {
        const date = new Date(despesa.data);
        const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const dataFormatada = adjustedDate.toISOString().split('T')[0];
        
        setDespesaEditando({ ...despesa, data: dataFormatada });
        setMostrarModal(true);
    };

    const salvarEdicaoDespesa = async (despesaAtualizada) => {
        try {
            const date = new Date(despesaAtualizada.data);
            const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            
            const dataParaEnviar = {
                ...despesaAtualizada,
                data: adjustedDate.toISOString()
            };

            const { data, error } = await supabase
                .from('despesas')
                .update(dataParaEnviar)
                .eq('id', despesaAtualizada.id)
                .select();

            if (error) {
                console.error('Erro ao atualizar despesa:', error);
                setErro('Erro ao atualizar despesa.');
            } else {
                setDespesas(despesas.map(d => d.id === despesaAtualizada.id ? data[0] : d));
                setMensagem('Despesa atualizada com sucesso!');
                setMostrarModal(false);
            }
        } catch (error) {
            console.error('Erro inesperado:', error);
            setErro('Erro inesperado ao atualizar despesa.');
        }
    };

    const excluirDespesa = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
        
        try {
            const { error } = await supabase
                .from('despesas')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir despesa:', error);
                setErro('Erro ao excluir despesa.');
            } else {
                setDespesas(despesas.filter(d => d.id !== id));
                setMensagem('Despesa excluída com sucesso!');
            }
        } catch (error) {
            console.error('Erro inesperado:', error);
            setErro('Erro inesperado ao excluir despesa.');
        }
    };

    const groupByMonth = () => {
        const grouped = {};
        
        const despesasOrdenadas = [...despesas].sort((a, b) => 
            new Date(b.data) - new Date(a.data)
        );

        despesasOrdenadas.forEach(despesa => {
            try {
                const date = new Date(despesa.data);
                if (isNaN(date.getTime())) {
                    console.error('Data inválida:', despesa.data);
                    return;
                }
                
                const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                
                const monthYear = `${adjustedDate.getFullYear()}-${(adjustedDate.getMonth() + 1).toString().padStart(2, '0')}`;
                const monthName = adjustedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                
                if (!grouped[monthYear]) {
                    grouped[monthYear] = {
                        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        despesas: [],
                        total: 0
                    };
                }
                
                const totalItem = (despesa.valor || 0) * (despesa.quantidade || 1);
                grouped[monthYear].despesas.push({ 
                    ...despesa, 
                    total: totalItem,
                    data: adjustedDate
                });
                grouped[monthYear].total += totalItem;
            } catch (error) {
                console.error('Erro ao processar despesa:', despesa, error);
            }
        });
        
        return grouped;
    };

    const groupedDespesas = groupByMonth();

    if (carregando) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Consulta de Despesas</h1>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Consulta de Despesas</h1>

            {mensagem && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded" role="alert">
                    <p>{mensagem}</p>
                </div>
            )}

            {erro && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
                    <p>{erro}</p>
                </div>
            )}

            <div className="space-y-8">
                {Object.entries(groupedDespesas).map(([monthYear, { monthName, despesas, total }]) => (
                    <div key={monthYear} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 bg-gray-100 border-b">
                            <h2 className="text-lg font-semibold">{monthName}</h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unit.</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {despesas.map(despesa => (
                                        <tr key={despesa.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {despesa.data.toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {despesa.produto || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {despesa.descricao || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {despesa.categoria || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {despesa.quantidade || 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                R$ {despesa.valor?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                R$ {despesa.total?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => editarDespesa(despesa)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => excluirDespesa(despesa.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="6" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                                            Total do Mês:
                                        </td>
                                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                                            R$ {total.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Editar Despesa</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            salvarEdicaoDespesa(despesaEditando);
                        }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Produto</label>
                                <input
                                    type="text"
                                    value={despesaEditando?.produto || ''}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, produto: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Descrição</label>
                                <input
                                    type="text"
                                    value={despesaEditando?.descricao || ''}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, descricao: e.target.value})}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Categoria</label>
                                <input
                                    type="text"
                                    value={despesaEditando?.categoria || ''}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, categoria: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={despesaEditando?.quantidade || 1}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, quantidade: parseInt(e.target.value) || 1})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Valor Unitário</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={despesaEditando?.valor || ''}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, valor: parseFloat(e.target.value)})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Data</label>
                                <input
                                    type="date"
                                    value={despesaEditando?.data || ''}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, data: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}