import React from 'react';

export default function SalesTable({ vendas }) {
  return (
    <div>
      <h2>Tabela de Vendas</h2>
      {/* Aqui você adicionará a lógica para exibir a tabela de vendas */}
      {vendas && vendas.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Preço</th>
              <th>Data da Venda</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr key={venda.id}>
                <td>{venda.produto}</td>
                <td>{venda.quantidade}</td>
                <td>{venda.preco}</td>
                <td>{venda.dataVenda}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhuma venda encontrada.</p>
      )}
    </div>
  );
}