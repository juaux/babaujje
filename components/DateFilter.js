import React from 'react';

const DateFilter = ({ filtroData, onChange, onSearch, onAddNew }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium mb-1">Data Início</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs">Dia</label>
            <input
              type="text"
              name="inicioDia"
              value={filtroData.inicioDia}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs">Mês</label>
            <input
              type="text"
              name="inicioMes"
              value={filtroData.inicioMes}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs">Ano</label>
            <input
              type="text"
              name="inicioAno"
              value={filtroData.inicioAno}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Data Fim</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs">Ano</label>
            <input
              type="text"
              name="fimAno"
              value={filtroData.fimAno}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs">Dia</label>
            <input
              type="text"
              name="fimDia"
              value={filtroData.fimDia}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs">Mês</label>
            <input
              type="text"
              name="fimMes"
              value={filtroData.fimMes}
              onChange={onChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <button
          onClick={onSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          PESQUISAR
        </button>
        <button
          onClick={onAddNew}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
};

export default DateFilter;