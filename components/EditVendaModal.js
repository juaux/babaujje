import React, { useState, useEffect } from 'react';

export default function EditVendaModal({ venda, onSalvar, onCancelar }) {
  const [quantidade, setQuantidade] = useState(venda?.quantidade || 1);
  const [dataVenda, setDataVenda] = useState(venda?.data_venda || new Date().toISOString().slice(0, 10));
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (venda) {
      setQuantidade(venda.quantidade);
      setDataVenda(venda.data_venda);
    }
  }, [venda]);

  const handleSubmit = (event) => {
    event.preventDefault();
    
    try {
      // Preparar os dados atualizados
      const vendaAtualizada = {
        ...venda,
        quantidade: parseInt(quantidade, 10),
        data_venda: dataVenda,
      };
      
      // Chamar a função onSalvar passada via props
      if (onSalvar) {
        onSalvar(vendaAtualizada);
      }
      
      setMensagem('Venda atualizada com sucesso!');
      
      // Não fecha automaticamente para que o usuário veja a mensagem de sucesso
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      setErro('Erro ao atualizar venda.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Venda</h2>
        
        {mensagem && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{mensagem}</span>
          </div>
        )}
        
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{erro}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Produto:
            </label>
            <div className="py-2 px-3 bg-gray-100 rounded">
              {venda?.produto}
            </div>
          </div>
          
          <div>
            <label htmlFor="quantidade" className="block text-gray-700 text-sm font-bold mb-2">
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
          
          <div>
            <label htmlFor="dataVenda" className="block text-gray-700 text-sm font-bold mb-2">
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
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}