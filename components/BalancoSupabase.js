// components/BalancoSupabase.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const BalancoSupabase = () => {
    const [supabase] = useState(() => createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ));

    const [vendas, setVendas] = useState({ total: 0, crescimento: '0%', dados: [] });
    const [despesas, setDespesas] = useState({ total: 0, crescimento: '0%', dados: [] });
    const [sobras, setSobras] = useState({ total: 0, crescimento: '0%', dados: [] });
    const [lucro, setLucro] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    const periodos = ['Hoje', 'Esta Semana', 'Este Mês', 'Este Ano'];
    const [periodoSelecionado, setPeriodoSelecionado] = useState('Este Mês');

    // Memoize formatarMoeda
    const formatarMoeda = useCallback((valor) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }, []);

    // Memoize buscarDados
    const buscarDados = useCallback(async (periodo) => {
        setCarregando(true);
        setErro(null);

        try {
            let dataInicial = new Date();
            let dataFinal = new Date(); // Adicionar data final para o intervalo
            
            switch (periodo) {
                case 'Hoje':
                    dataInicial.setHours(0, 0, 0, 0);
                    break;
                case 'Esta Semana':
                    dataInicial.setDate(dataInicial.getDate() - dataInicial.getDay());
                    dataInicial.setHours(0, 0, 0, 0);
                    break;
                case 'Este Mês':
                    dataInicial = new Date(dataInicial.getFullYear(), dataInicial.getMonth(), 1);
                    break;
                case 'Este Ano':
                    dataInicial = new Date(dataInicial.getFullYear(), 0, 1);
                    break;
                default:
                    dataInicial = new Date(dataInicial.getFullYear(), dataInicial.getMonth(), 1);
            }

            const dataFormatadaInicial = dataInicial.toISOString().split('T')[0];
            const dataFormatadaFinal = dataFinal.toISOString().split('T')[0];

            // Otimizando consultas: Selecionando apenas colunas necessárias
            const { data: vendasData, error: vendasError } = await supabase
                .from('vendas')
                .select('preco_unitario, quantidade, data_venda')
                .gte('data_venda', dataFormatadaInicial)
                .lte('data_venda', dataFormatadaFinal);

            const { data: despesasData, error: despesasError } = await supabase
                .from('despesas')
                .select('total, data')  // Alterado de 'valor' para 'total'
                .gte('data', dataFormatadaInicial)
                .lte('data', dataFormatadaFinal);

            const { data: sobrasData, error: sobrasError } = await supabase
                .from('sobras')
                .select('valor_total, data')
                .gte('data', dataFormatadaInicial)
                .lte('data', dataFormatadaFinal);

            if (vendasError) throw new Error(`Erro ao buscar vendas: ${vendasError.message}`);
            if (despesasError) throw new Error(`Erro ao buscar despesas: ${despesasError.message}`);
            if (sobrasError) throw new Error(`Erro ao buscar sobras: ${sobrasError.message}`);

            // Cálculo dos totais com verificação de valores numéricos para evitar NaN
            const totalVendas = vendasData?.reduce((sum, item) => {
                const valor = Number(item.preco_unitario) * Number(item.quantidade);
                return sum + (isNaN(valor) ? 0 : valor);
            }, 0) || 0;
            
            const totalDespesas = despesasData?.reduce((sum, item) => {
                const valor = Number(item.total);  // Alterado de item.valor para item.total
                return sum + (isNaN(valor) ? 0 : valor);
            }, 0) || 0;
            
            const totalSobras = sobrasData?.reduce((sum, item) => {
                const valor = Number(item.valor_total);
                return sum + (isNaN(valor) ? 0 : valor);
            }, 0) || 0;
            
            const totalLucro = totalVendas - totalDespesas - totalSobras;

            setVendas({
                total: totalVendas,
                crescimento: calcularCrescimento(vendasData, totalVendas),
                dados: vendasData || []
            });

            setDespesas({
                total: totalDespesas,
                crescimento: calcularCrescimento(despesasData, totalDespesas),
                dados: despesasData || []
            });

            setSobras({
                total: totalSobras,
                crescimento: calcularCrescimento(sobrasData, totalSobras),
                dados: sobrasData || []
            });

            setLucro(totalLucro);

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setErro(error.message);
            setVendas({ total: 0, crescimento: '0%', dados: [] });
            setDespesas({ total: 0, crescimento: '0%', dados: [] });
            setSobras({ total: 0, crescimento: '0%', dados: [] });
            setLucro(0);
        } finally {
            setCarregando(false);
        }
    }, [supabase]); // Dependências do useCallback

    // Função auxiliar para calcular crescimento (simplificado)
    const calcularCrescimento = (dados, totalAtual) => {
        if (!dados || dados.length === 0) return '0%';
        
        // Lógica simplificada - você pode implementar uma comparação com período anterior
        return totalAtual > 0 ? '+5%' : '0%';
    };

    useEffect(() => {
        buscarDados(periodoSelecionado);
    }, [periodoSelecionado, buscarDados]); // Adicione buscarDados como dependência

    // Memoize o cálculo da margem de lucro
    const margemLucro = useMemo(() => {
        return vendas.total > 0 ? ((lucro / vendas.total) * 100).toFixed(2) : '0.00';
    }, [vendas.total, lucro]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Balanço Financeiro</h2>

                <div className="flex space-x-2">
                    {periodos.map((periodo) => (
                    <button
                        key={periodo}
                        onClick={() => setPeriodoSelecionado(periodo)}
                        className={`px-3 py-1 rounded-md text-sm ${
                        periodoSelecionado === periodo
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {periodo}
                    </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card de Vendas */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-green-600 font-medium">
                                Vendas {vendas.dados.length > 0 && <span className="text-xs">({vendas.dados.length} registros)</span>}
                            </p>
                            <p className="text-2xl font-bold text-green-800 mt-1">
                                {formatarMoeda(vendas.total)}
                            </p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {vendas.crescimento}
                        </span>
                    </div>
                    <div className="mt-4 h-2 bg-green-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                {/* Card de Despesas */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-red-600 font-medium">
                                Despesas {despesas.dados.length > 0 && <span className="text-xs">({despesas.dados.length} registros)</span>}
                            </p>
                            <p className="text-2xl font-bold text-red-800 mt-1">
                                {formatarMoeda(despesas.total)}
                            </p>
                        </div>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {despesas.crescimento}
                        </span>
                    </div>
                    <div className="mt-4 h-2 bg-red-200 rounded-full">
                        <div
                            className="h-2 bg-red-500 rounded-full"
                            style={{ width: vendas.total ? `${(despesas.total / vendas.total) * 100}%` : '0%' }}
                        ></div>
                    </div>
                </div>

                {/* Card de Sobras */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">
                                Sobras {sobras.dados.length > 0 && <span className="text-xs">({sobras.dados.length} registros)</span>}
                            </p>
                            <p className="text-2xl font-bold text-blue-800 mt-1">
                                {formatarMoeda(sobras.total)}
                            </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {sobras.crescimento}
                        </span>
                    </div>
                    <div className="mt-4 h-2 bg-blue-200 rounded-full">
                        <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: vendas.total ? `${(sobras.total / vendas.total) * 100}%` : '0%' }}
                        ></div>
                    </div>
                </div>

                {/* Card de Lucro */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Lucro</p>
                            <p className="text-2xl font-bold text-purple-800 mt-1">
                                {formatarMoeda(lucro)}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                                Margem de {margemLucro}%
                            </p>
                        </div>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                            {vendas.total ? `+${((lucro / vendas.total) * 100).toFixed(0)}%` : '0%'}
                        </span>
                    </div>
                    <div className="mt-4 h-2 bg-purple-200 rounded-full">
                        <div
                            className="h-2 bg-purple-500 rounded-full"
                            style={{ width: `${margemLucro}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Resumo */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Resumo do Período ({periodoSelecionado})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Vendas Totais</p>
                        <p className="font-medium">{formatarMoeda(vendas.total)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Despesas Totais</p>
                        <p className="font-medium">{formatarMoeda(despesas.total)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Sobras</p>
                        <p className="font-medium">{formatarMoeda(sobras.total)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Lucro Líquido</p>
                        <p className="font-medium text-green-600">
                            {formatarMoeda(lucro)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Botão para atualizar os dados */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => buscarDados(periodoSelecionado)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Atualizar Dados
                </button>
            </div>
            
            {/* Exibir mensagem de erro, se houver */}
            {erro && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {erro}
                </div>
            )}
            
            {/* Indicador de carregamento */}
            {carregando && (
                <div className="mt-4 text-center text-gray-500">
                    Carregando dados...
                </div>
            )}
        </div>
    );
};

export default BalancoSupabase;