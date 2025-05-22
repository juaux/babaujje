import React from 'react';

function DespesasSummary({ despesas, onEditarDespesa, onExcluirDespesa }) {
    const totalDespesas = despesas.reduce((acc, despesa) => acc + despesa.valor, 0);

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Resumo de Despesas</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Data
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Descrição
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Valor
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Categoria
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {despesas.map((despesa) => (
                            <tr key={despesa.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {despesa.data}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {despesa.descricao}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {despesa.valor.toFixed(2)}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {despesa.categoria}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onEditarDespesa(despesa)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => onExcluirDespesa(despesa.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="px-5 py-5 bg-white text-sm text-right font-semibold">
                                Total de Despesas:
                            </td>
                            <td className="px-5 py-5 bg-white text-sm font-bold">
                                R$ {totalDespesas.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

export default DespesasSummary;