import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient'
export default function LancarDespesas() {
    const [despesas, setDespesas] = useState([]);
    const [novaDespesa, setNovaDespesa] = useState({
        produto: '',
        categoria: '',
        quantidade: 1,
        valorUnitario: 0,
        data: new Date().toISOString().split('T')[0]
    });
    const [despesaEditando, setDespesaEditando] = useState(null);
    const [dataEscolhida, setDataEscolhida] = useState(new Date().toISOString().split('T')[0]);
    const [datasRegistradas, setDatasRegistradas] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(true);

    const produtos = [
        "Margarina",
        "Fermento",
        "Farinha de trigo",
        "Massa Pronta",
        "Chocolate em pó",
        "Leite condensado",
        "Mistura Lactea",
        "Açúcar",
        "Leite em pó",
        "Leite Líquido",
        "Creme de Leite",
        "Creme culinário",
        "Forma empada",
        "Forma brigadeiro",
        "Suco em pó",
        "Maracujá",
        "Saco de potes",
        "Plástico filme",

    ];

    const LOCAL_STORAGE_KEY = 'despesasTemporarias';

    useEffect(() => {
        carregarDespesasTemporarias();
    }, []);

   const registrarDespesas = async () => {
        setCarregando(true);
        try {
            if (despesas.length === 0) {
                setMensagem('Nenhuma despesa para registrar');
                setTimeout(() => setMensagem(''), 3000);
                return;
            }

            // Formata os dados para o padrão da tabela no Supabase
            const despesasFormatadas = despesas.map(d => ({
                data: d.data,
                produto: d.produto,
                valor: parseFloat(d.valorUnitario),
                categoria: d.categoria,
                quantidade: parseInt(d.quantidade),
                total: parseFloat(d.valorUnitario) * parseInt(d.quantidade)
            }));

            const { data, error } = await supabase
                .from('despesas')
                .insert(despesasFormatadas)
                .select();

            if (error) throw error;

            // Limpa as despesas após o registro
            setDespesas([]);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            
            setMensagem(`${data.length} despesas registradas com sucesso!`);
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao registrar despesas:', error);
            setMensagem(`Erro: ${error.message}`);
            setTimeout(() => setMensagem(''), 5000);
        } finally {
            setCarregando(false);
        }
    };
    const adicionarDespesa = (e) => {
        e.preventDefault();

        const valorUnitario = parseFloat(novaDespesa.valorUnitario);
        const quantidade = parseInt(novaDespesa.quantidade);

        if (isNaN(valorUnitario) || valorUnitario <= 0) {
            setMensagem('Erro: Valor unitário inválido');
            setTimeout(() => setMensagem(''), 3000);
            return;
        }

        if (isNaN(quantidade) || quantidade <= 0) {
            setMensagem('Erro: Quantidade inválida');
            setTimeout(() => setMensagem(''), 3000);
            return;
        }

        if (despesas.length > 0 && despesas[0].data !== novaDespesa.data) {
            setMensagem('Não é possível misturar datas diferentes. Registre as despesas atuais antes de alterar a data.');
            setTimeout(() => setMensagem(''), 5000);
            return;
        }

        if (despesas.length === 0) {
            setDataEscolhida(novaDespesa.data);
        }

        const novaDespesaAdicionada = {
            ...novaDespesa,
            id: Date.now(),
            valorUnitario: valorUnitario,
            quantidade: quantidade,
            valorTotal: valorUnitario * quantidade
        };

        const novasDespesas = [novaDespesaAdicionada, ...despesas];
        setDespesas(novasDespesas);
        salvarDespesasTemporarias(novasDespesas);

        setNovaDespesa({
            produto: '',
            categoria: '',
            quantidade: 1,
            valorUnitario: 0,
            data: new Date().toISOString().split('T')[0]
        });
    };

    const editarDespesa = (despesa) => {
        setDespesaEditando(despesa);
    };

    const salvarEdicao = (despesaAtualizada) => {
        if (despesas.length > 0 && despesas[0].data !== despesaAtualizada.data) {
            setMensagem('Não é possível misturar datas diferentes. Mantenha a mesma data para todas as despesas.');
            setTimeout(() => setMensagem(''), 5000);
            return;
        }

        const valorUnitario = parseFloat(despesaAtualizada.valorUnitario);
        const quantidade = parseInt(despesaAtualizada.quantidade);

        const despesasAtualizadas = despesas.map(d => d.id === despesaAtualizada.id ? {
            ...despesaAtualizada,
            valorUnitario: valorUnitario,
            quantidade: quantidade,
            valorTotal: valorUnitario * quantidade
        } : d);
        
        setDespesas(despesasAtualizadas);
        salvarDespesasTemporarias(despesasAtualizadas);
        setDespesaEditando(null);
    };

    const excluirDespesa = (despesaId) => {
        const despesasAtualizadas = despesas.filter(d => d.id !== despesaId);
        setDespesas(despesasAtualizadas);
        salvarDespesasTemporarias(despesasAtualizadas);

        setMensagem('Despesa excluída com sucesso!');
        setTimeout(() => setMensagem(''), 2000);
    };

    const salvarDespesasTemporarias = (despesasParaSalvar) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(despesasParaSalvar));
        } catch (error) {
            console.error('Erro ao salvar despesas no localStorage:', error);
            setMensagem('Erro ao salvar despesas temporárias');
            setTimeout(() => setMensagem(''), 3000);
        }
    };

    const carregarDespesasTemporarias = () => {
        try {
            const despesasSalvas = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (despesasSalvas) {
                const despesasCarregadas = JSON.parse(despesasSalvas);
                // Garantindo que os valores são números válidos
                const despesasComValoresNumericos = despesasCarregadas.map(despesa => ({
                    ...despesa,
                    valorUnitario: typeof despesa.valorUnitario === 'string' ? parseFloat(despesa.valorUnitario) || 0 : despesa.valorUnitario || 0,
                    quantidade: typeof despesa.quantidade === 'string' ? parseInt(despesa.quantidade) || 1 : despesa.quantidade || 1,
                    valorTotal: (typeof despesa.valorUnitario === 'string' ? parseFloat(despesa.valorUnitario) || 0 : despesa.valorUnitario || 0) * 
                               (typeof despesa.quantidade === 'string' ? parseInt(despesa.quantidade) || 1 : despesa.quantidade || 1)
                }));
                setDespesas(despesasComValoresNumericos);

                if (despesasCarregadas.length > 0) {
                    setDataEscolhida(despesasCarregadas[0].data);
                }
            }
            setCarregando(false);
        } catch (error) {
            console.error('Erro ao carregar despesas do localStorage:', error);
            setMensagem('Erro ao carregar despesas temporárias');
            setTimeout(() => setMensagem(''), 3000);
            setCarregando(false);
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        const partes = dataString.split('-');
        if (partes.length !== 3) return dataString;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };

    const formatarValor = (valor) => {
    if (isNaN(valor)) return 'R$ 0,00';
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
};

    const totalGeral = despesas.reduce((sum, despesa) => sum + (despesa.valorTotal || 0), 0);        

    return (
    <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-4"></div>
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-4">
            <h1 className="text-2xl font-bold mb-4">Lançamento de Despesas</h1>

            {mensagem && (
                <div className={`p-3 mb-4 rounded-md ${mensagem.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <p className="text-sm font-medium">{mensagem}</p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Formulário Compacto (30%) */}
                <div className="w-full lg:w-1/3 bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Nova Despesa</h2>
                    <form onSubmit={adicionarDespesa} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="block text-sm text-gray-700 mb-1">Produto</label>
                                <select
                                    value={novaDespesa.produto}
                                    onChange={(e) => setNovaDespesa({...novaDespesa, produto: e.target.value})}
                                    className="w-full p-2 text-sm border rounded"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {produtos.map((produto, index) => (
                                        <option key={index} value={produto}>{produto}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Categoria</label>
                                <select
                                    value={novaDespesa.categoria}
                                    onChange={(e) => setNovaDespesa({...novaDespesa, categoria: e.target.value})}
                                    className="w-full p-2 text-sm border rounded"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Matéria Prima">Matéria Prima</option>
                                    <option value="Embalagem">Embalagem</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={novaDespesa.quantidade}
                                    onChange={(e) => setNovaDespesa({...novaDespesa, quantidade: e.target.value})}
                                    className="w-full p-2 text-sm border rounded"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Valor Unit.</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={novaDespesa.valorUnitario}
                                    onChange={(e) => setNovaDespesa({...novaDespesa, valorUnitario: e.target.value})}
                                    className="w-full p-2 text-sm border rounded"
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm text-gray-700 mb-1">Data</label>
                                <input
                                    type="date"
                                    value={novaDespesa.data}
                                    onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})}
                                    className="w-full p-2 text-sm border rounded"
                                    required
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
                        >
                            Adicionar Despesa
                        </button>
                    </form>
                </div>

                {/* Tabela Ampliada (70%) */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-3">Resumo de Despesas</h2>
                        
                        {despesas.length > 0 ? (
                            <>
                                <div className="overflow-auto max-h-[60vh] mb-4">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-blue-100 sticky top-0"> {/* Azul pastel */}
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Data</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Categ.</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Qtd</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unitário</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Total</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {despesas.map(despesa => (
                                                <tr key={despesa.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm">{formatarData(despesa.data)}</td>
                                                    <td className="px-3 py-2 text-sm">{despesa.produto}</td>
                                                    <td className="px-3 py-2 text-sm">{despesa.categoria}</td>
                                                    <td className="px-3 py-2 text-sm">{despesa.quantidade}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm">{formatarValor(despesa.valorUnitario)}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm">{formatarValor(despesa.valorTotal)}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm">
                                                        <button
                                                            onClick={() => editarDespesa(despesa)}
                                                            className="text-blue-500 hover:text-blue-700 mr-2"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => excluirDespesa(despesa.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Linha de total */}
                            <tr className="bg-gray-50 font-medium border-t-2 border-gray-200">
                    <td className="px-3 py-3 text-sm" colSpan="5">Total Geral</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-blue-600 font-bold">
                        {formatarValor(totalGeral)}
                    </td>
                    <td className="px-3 py-3"></td>
                </tr>
                                        </tbody>
                                    </table>
                                 </div>
                                
                                {/* Botão no rodapé */}
                                <div className="flex justify-end mt-4">
                                    <button
                                        className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md shadow ${carregando ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={registrarDespesas}
                                        disabled={carregando}
                                    >
                                        {carregando ? 'Registrando...' : 'Registrar Despesas'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Nenhuma despesa cadastrada ainda.</p>
                            </div>
                        )}
        
                    </div>
                </div>
            </div>
   </div>


            {despesaEditando && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Editar Despesa</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            salvarEdicao(despesaEditando);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-1">Produto</label>
                                <select
                                    value={despesaEditando.produto}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, produto: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Selecione o Produto...</option>
                                    {produtos.map((produto, index) => (
                                        <option key={index} value={produto}>{produto}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Categoria</label>
                                <select
                                    value={despesaEditando.categoria}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, categoria: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Matéria Prima">Matéria Prima</option>
                                    <option value="Embalagem">Embalagem</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={despesaEditando.quantidade}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, quantidade: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Valor Unitário</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={despesaEditando.valorUnitario}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, valorUnitario: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Data</label>
                                <input
                                    type="date"
                                    value={despesaEditando.data}
                                    onChange={(e) => setDespesaEditando({...despesaEditando, data: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100"
                                    onClick={() => setDespesaEditando(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
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