import React from 'react';

const NewSaleModal = ({ newVenda, produtos, onChange, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Adicionar Nova Venda</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Data</label>
          <input
            type="date"
            name="data_venda"
            value={newVenda.data_venda.split('T')[0]}
            onChange={onChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Produto</label>
          <select
            name="produto_id"
            value={newVenda.produto_id}
            onChange={onChange}
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
            onChange={onChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Preço Unitário</label>
          <input
            type="number"
            name="preco_unitario"
            value={newVenda.preco_unitario}
            onChange={onChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSaleModal;