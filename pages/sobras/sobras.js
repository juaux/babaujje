import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function SobrasVendas() {
  const [sobras, setSobras] = useState([]);
  const [periodo, setPeriodo] = useState('Este Mês');
  const [totalSobras, setTotalSobras] = useState(0);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const getDataInicioPeriodo = useCallback((periodoSelecionado) => {
    const data = new Date();
    switch (periodoSelecionado) {
      case 'Hoje': return data.toISOString().split('T')[0];
      case 'Esta Semana': 
        data.setDate(data.getDate() - data.getDay()); 
        return data.toISOString().split('T')[0];
      case 'Este Mês': 
        return new Date(data.getFullYear(), data.getMonth(), 1).toISOString().split('T')[0];
      case 'Este Ano': 
        return new Date(data.getFullYear(), 0, 1).toISOString().split('T')[0];
      default: 
        return new Date().toISOString().split('T')[0];
    }
  }, []);

  const calcularSobrasPorPeriodo = useCallback((vendas, despesas) => {
    const totalVendas = vendas.reduce((acc, v) => acc + (v.preco_unitario * v.quantidade), 0);
    const totalDespesas = despesas.reduce((acc, d) => acc + (d.valor * d.quantidade), 0);
    return [{ data: new Date().toLocaleDateString(), valor: totalVendas - totalDespesas }];
  }, []);

  const buscarDados = useCallback(async () => {
    try {
      // 1. Buscar vendas no período
      const { data: vendas } = await supabase
        .from('vendas')
        .select('*')
        .gte('data_venda', getDataInicioPeriodo(periodo));

      // 2. Buscar despesas no período
      const { data: despesas } = await supabase
        .from('despesas')
        .select('*')
        .gte('data', getDataInicioPeriodo(periodo));

      // 3. Calcular sobras
      const sobrasCalculadas = calcularSobrasPorPeriodo(vendas, despesas);
      setSobras(sobrasCalculadas);
      setTotalSobras(sobrasCalculadas.reduce((acc, item) => acc + item.valor, 0));
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  }, [periodo, getDataInicioPeriodo, calcularSobrasPorPeriodo]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sobras de Vendas</h1>
        <Link href="/vendas/lancar" className="bg-pink-500 text-white px-4 py-2 rounded">
          Lançar Nova Venda
        </Link>
      </div>

      {/* Filtro por período */}
      <div className="mb-6 flex gap-2">
        {['Hoje', 'Esta Semana', 'Este Mês', 'Este Ano'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-md ${periodo === p ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Resumo */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumo do Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p className="text-sm text-green-600">Total de Sobras</p>
            <p className="text-2xl font-bold">{formatarMoeda(totalSobras)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="text-sm text-blue-600">Período</p>
            <p className="text-xl">{periodo}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded border border-purple-200">
            <p className="text-sm text-purple-600">Registros</p>
            <p className="text-xl">{sobras.length}</p>
          </div>
        </div>
      </div>

      {/* Tabela de detalhes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-pink-100">
            <tr>
              <th className="px-6 py-3 text-left">Data</th>
              <th className="px-6 py-3 text-left">Valor</th>
              <th className="px-6 py-3 text-left">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sobras.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4">{item.data}</td>
                <td className="px-6 py-4">{formatarMoeda(item.valor)}</td>
                <td className="px-6 py-4">
                  <button className="text-pink-600 hover:underline">
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}