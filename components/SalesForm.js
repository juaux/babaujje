import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function SalesForm({ adicionarVenda, vendasAtuais = [] }) {
    const [produtoId, setProdutoId] = useState('');
    const [quantidade, setQuantidade] = useState(1);
    const [dataVenda, setDataVenda] = useState(new Date().toISOString().slice(0, 10));
    const [produtos, setProdutos] = useState([]);
    const [erro, setErro] = useState('');

    const fetchProdutos = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('produtos')
                .select('id, nome, preco_venda, imagem_url');

            if (error) {
                console.error('Erro ao buscar produtos:', error);
                setErro('Erro ao buscar produtos.');
            } else {
                setProdutos(data || []);
            }
        } catch (error) {
            console.error('Erro inesperado ao buscar produtos:', error);
            setErro('Erro inesperado ao buscar produtos.');
        }
    }, []);

    useEffect(() => {
        fetchProdutos();
    }, [fetchProdutos]);

    useEffect(() => {
        if (erro) {
            const timer = setTimeout(() => {
                setErro('');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [erro]);

    const verificaProdutoJaLancado = useCallback((produtoId) => {
        if (!Array.isArray(vendasAtuais)) return false;
        return vendasAtuais.some(venda => venda.produto_id === produtoId);
    }, [vendasAtuais]);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();

        if (!produtoId) {
            setErro('Por favor, selecione um produto.');
            return;
        }

        if (verificaProdutoJaLancado(produtoId)) {
            setErro('Produto já lançado! Não é possível lançar o mesmo produto novamente.');
            return;
        }

        const produtoSelecionado = produtos.find((p) => p.id === produtoId);

        if (produtoSelecionado) {
            const novaVenda = {
                produto_id: produtoId,
                quantidade: parseInt(quantidade, 10),
                data_venda: dataVenda,
                preco_unitario: produtoSelecionado.preco_venda,
                produto: produtoSelecionado.nome,
                preco: produtoSelecionado.preco_venda,
                imagem_url: produtoSelecionado.imagem_url
            };

            adicionarVenda(novaVenda);
            setProdutoId('');
            setQuantidade(1);
            setDataVenda(new Date().toISOString().slice(0, 10));
        } else {
            setErro('Produto selecionado inválido.');
        }
    }, [produtoId, quantidade, dataVenda, produtos, verificaProdutoJaLancado, adicionarVenda]);

    const handleProdutoChange = useCallback((e) => {
        const selectedProdutoId = e.target.value;
        setProdutoId(selectedProdutoId);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            {erro && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded relative mb-2" role="alert">
                    <span className="block sm:inline">{erro}</span>
                </div>
            )}
            <div>
                <label htmlFor="produto" className="block text-gray-700 text-sm font-bold mb-1">
                    Produto:
                </label>
                <select
                    id="produto"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={produtoId}
                    onChange={handleProdutoChange}
                >
                    <option value="">Selecione um produto</option>
                    {produtos.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                            {produto.nome}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex space-x-4">
                <div className="w-1/2">
                    <label htmlFor="quantidade" className="block text-gray-700 text-sm font-bold mb-1">
                        Quantidade:
                    </label>
                    <input
                        type="number"
                        id="quantidade"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={quantidade}
                        onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 1)}
                        min="1"
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="dataVenda" className="block text-gray-700 text-sm font-bold mb-1">
                        Data da Venda:
                    </label>
                    <input
                        type="date"
                        id="dataVenda"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={dataVenda}
                        onChange={(e) => setDataVenda(e.target.value)}
                    />
                </div>
            </div>
            <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Adicionar à Tabela
            </button>
        </form>
    );
}