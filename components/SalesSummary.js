import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SalesSummary({ vendas = [], onEditVenda, onDeleteVenda }) {
    const [totalGeral, setTotalGeral] = useState(0);
    const [vendasCount, setVendasCount] = useState(0);

    useEffect(() => {
        if (!Array.isArray(vendas)) {
            setTotalGeral(0);
            setVendasCount(0);
            return;
        }

        setVendasCount(vendas.length);

        if (vendas.length === 0) {
            setTotalGeral(0);
            return;
        }

        const total = vendas.reduce((acc, venda) => {
            const preco = venda.preco || venda.preco_unitario || 0;
            const quantidade = venda.quantidade || 0;
            return acc + (preco * quantidade);
        }, 0);

        setTotalGeral(total);
    }, [vendas]);

    const handleDelete = (vendaId) => {
        if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
            onDeleteVenda?.(vendaId);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Resumo ({vendasCount} {vendasCount === 1 ? 'item' : 'itens'})</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Data Venda
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Imagem
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Produto
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Qtd
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Preço
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(vendas) && vendas.length > 0 ? (
                            vendas.map((venda) => {
                                const preco = venda.preco || venda.preco_unitario || 0;
                                return (
                                    <tr key={venda.id}>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            {venda.data_venda}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            {venda.imagem_url && (
                                                <Image 
                                                    src={venda.imagem_url} 
                                                    alt={venda.produto || "Imagem do Produto"} 
                                                    width={50}
                                                    height={50}
                                                    className="object-contain"
                                                />
                                            )}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            {venda.produto || "Produto sem nome"}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            {venda.quantidade || 0}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            {preco.toFixed(2)}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            {(preco * venda.quantidade).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => onEditVenda?.(venda)}
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(venda.id)}
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    Nenhuma produção registrada
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={5} className="px-5 py-5 bg-white text-sm text-right font-semibold">
                                Total Geral:
                            </td>
                            <td className="px-5 py-5 bg-white text-sm font-bold">
                                R$ {totalGeral.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}