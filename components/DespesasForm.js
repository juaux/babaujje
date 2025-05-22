import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

function DespesasForm({ onDespesaAdicionada }) {
    const [data, setData] = useState(new Date().toISOString().slice(0, 10));
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [categoria, setCategoria] = useState('');
    const [erro, setErro] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data || !descricao || !valor || !categoria) {
            setErro('Por favor, preencha todos os campos.');
            return;
        }

        const { data: novaDespesa, error } = await supabase
            .from('despesas')
            .insert([{ data, descricao, valor: parseFloat(valor), categoria }])
            .select();

        if (error) {
            console.error('Erro ao adicionar despesa:', error);
            setErro('Erro ao adicionar despesa.');
        } else {
            console.log('Despesa adicionada:', novaDespesa);
            if (onDespesaAdicionada) {
                onDespesaAdicionada(novaDespesa[0]);
            }
            limparFormulario();
        }
    };

    const limparFormulario = () => {
        setData(new Date().toISOString().slice(0, 10));
        setDescricao('');
        setValor('');
        setCategoria('');
        setErro('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{erro}</span>
                </div>
            )}
            <div>
                <label htmlFor="data" className="block text-gray-700 text-sm font-bold mb-2">
                    Data:
                </label>
                <input
                    type="date"
                    id="data"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="descricao" className="block text-gray-700 text-sm font-bold mb-2">
                    Descrição:
                </label>
                <input
                    type="text"
                    id="descricao"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="valor" className="block text-gray-700 text-sm font-bold mb-2">
                    Valor:
                </label>
                <input
                    type="number"
                    id="valor"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="categoria" className="block text-gray-700 text-sm font-bold mb-2">
                    Categoria:
                </label>
                <select
                    id="categoria"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                >
                    <option value="">Selecione a categoria</option>
                    <option value="Embalagem">Embalagem</option>
                    <option value="Materia Prima">Matéria Prima</option>
                    {/* Adicione mais categorias conforme necessário */}
                </select>
            </div>
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Adicionar Despesa
            </button>
        </form>
    );
}

export default DespesasForm;