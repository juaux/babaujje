import React, { useState } from 'react';

const FiltroPorData = ({ onPesquisar }) => {
  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const meses = Array.from({ length: 12 }, (_, i) => i + 1);

  const [datas, setDatas] = useState({
    inicio: { ano: currentYear, mes: 1, dia: 1 },
    fim: { ano: currentYear, mes: currentYear, dia: 1 },
  });

  const getDias = (ano, mes) => {
    const diasNoMes = new Date(ano, mes, 0).getDate();
    return Array.from({ length: diasNoMes }, (_, i) => i + 1);
  };

  const handlePesquisar = () => {
    const inicioStr = `<span class="math-inline">\{datas\.inicio\.ano\}\-</span>{String(datas.inicio.mes).padStart(2, '0')}-${String(datas.inicio.dia).padStart(2, '0')}`;
    const fimStr = `<span class="math-inline">\{datas\.fim\.ano\}\-</span>{String(datas.fim.mes).padStart(2, '0')}-${String(datas.fim.dia).padStart(2, '0')}`;
    onPesquisar(inicioStr, fimStr);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Data Início</label>
        <div className="flex gap-1">
          <div className="min-w-[120px]">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="inicio-ano">Ano</label>
            <select
              id="inicio-ano"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={datas.inicio.ano}
              onChange={(e) => setDatas({ ...datas, inicio: { ...datas.inicio, ano: Number(e.target.value) } })}
            >
              {anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[120px]">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="inicio-mes">Mês</label>
            <select
              id="inicio-mes"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={datas.inicio.mes}
              onChange={(e) => setDatas({ ...datas, inicio: { ...datas.inicio, mes: Number(e.target.value) } })}
            >
              {meses.map((mes) => (
                <option key={mes} value={mes}>
                  {String(mes).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[120px]">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="inicio-dia">Dia</label>
            <select
              id="inicio-dia"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={datas.inicio.dia}
              onChange={(e) => setDatas({ ...datas, inicio: { ...datas.inicio, dia: Number(e.target.value) } })}
            >
              {getDias(datas.inicio.ano, datas.inicio.mes).map((dia) => (
                <option key={dia} value={dia}>
                  {String(dia).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Data Fim</label>
        <div className="flex gap-1">
          <div className="min-w-[120px]">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fim-ano">Ano</label>
            <select
              id="fim-ano"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={datas.fim.ano}
              onChange={(e) => setDatas({ ...datas, fim: { ...datas.fim, ano: Number(e.target.value) } })}
            >
              {anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[120px]">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fim-mes">Mês</label>
            <select
              id="fim-mes"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={datas.fim.mes}
              onChange={(e) => setDatas({ ...datas, fim: { ...datas.fim, mes: Number(e.target.value) } })}
            >
              {meses.map((mes) => (
                <option key={mes} value={mes}>
                  {String(mes).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[120px]">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fim-dia">Dia</label>
            <select
              id="fim-dia"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={datas.fim.dia}
              onChange={(e) => setDatas({ ...datas, fim: { ...datas.fim, dia: Number(e.target.value) } })}
            >
              {getDias(datas.fim.ano, datas.fim.mes).map((dia) => (
                <option key={dia} value={dia}>
                  {String(dia).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handlePesquisar}
      >
        Pesquisar
      </button>
    </div>
  );
};

export default FiltroPorData;