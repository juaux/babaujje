import React, { useState } from "react";
import { supabase } from '../utils/supabaseClient';

export default function ProductForm() {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [uploading, setUploading] = useState(false);

  const handlePrecoVendaChange = (e) => {
    let valor = e.target.value.replace(/[^\d.,]/g, '');
    setPrecoVenda(valor);
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImagemArquivo(file);
    } else {
      setImagemArquivo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMensagem("");

    let imagemUrl = "";

    if (imagemArquivo) {
      const fileName = `${Date.now()}_${imagemArquivo.name.replace(/\s+/g, "_")}`;
      const { data, error } = await supabase.storage
        .from("imagens-produtos")
        .upload(fileName, imagemArquivo);

      if (error) {
        setMensagem("Erro ao enviar imagem.");
        setUploading(false);
        return;
      }

      imagemUrl = supabase.storage
        .from("imagens-produtos")
        .getPublicUrl(data.path).data.publicUrl;
    }

    const precoNumerico = parseFloat(precoVenda.replace('.', '').replace(',', '.'));

    const { error } = await supabase.from("produtos").insert([
      { nome, categoria, preco_venda: precoNumerico, imagem_url: imagemUrl }
    ]);

    if (error) {
      setMensagem("Erro ao cadastrar produto.");
    } else {
      setMensagem("Produto cadastrado com sucesso!");
      setNome("");
      setCategoria("");
      setPrecoVenda("");
      setImagemArquivo(null);
    }

    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mensagem && (
        <div className={`p-2 rounded text-sm ${mensagem.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensagem}
        </div>
      )}

      <input
        type="text"
        placeholder="Nome *"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        className="w-full border border-gray-300 rounded px-4 py-2"
      />

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
        className="w-full border border-gray-300 rounded px-4 py-2"
      >
        <option value="">Categoria</option>
        <option value="Doce">Doce</option>
        <option value="Salgado">Salgado</option>
      </select>

      <input
        type="text"
        placeholder="Preço de Venda *"
        value={precoVenda}
        onChange={handlePrecoVendaChange}
        required
        className="w-full border border-gray-300 rounded px-4 py-2"
      />

      <input
        type="file"
        accept="image/*"
        id="fileUpload"
        onChange={handleImagemChange}
        className="hidden"
      />
      <label htmlFor="fileUpload" className="inline-block border border-blue-500 text-blue-500 px-4 py-2 rounded cursor-pointer text-center">
        Selecionar Imagem
      </label>

      {imagemArquivo && (
        <p className="text-sm text-gray-600">Selecionado: {imagemArquivo.name}</p>
      )}

      <button
        type="submit"
        className={`w-full bg-blue-600 text-white py-2 rounded font-semibold ${uploading ? 'opacity-50' : ''}`}
        disabled={uploading}
      >
        {uploading ? 'Cadastrando...' : 'CADASTRAR'}
      </button>
    </form>
  );
}
