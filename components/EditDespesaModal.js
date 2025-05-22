import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Input } from './ui/input'; // Caminho corrigido
import { Button } from './ui/button'; // Caminho corrigido
import { Calendar } from "./ui/calendar"; // Caminho corrigido
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

// Função utils inline para evitar problemas de caminho
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function EditDespesaModal({ despesa, onSalvar, onCancelar }) {
    const [isOpen, setIsOpen] = useState(true);
    const [valor, setValor] = useState(despesa.valor.toString());
    const [descricao, setDescricao] = useState(despesa.descricao);
    const [data, setData] = useState(despesa.data);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (despesa) {
            setValor(despesa.valor.toString());
            setDescricao(despesa.descricao);
            setData(despesa.data);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [despesa]);

    const handleSalvar = () => {
        const valorNumerico = Number(valor);
        if (!valor || isNaN(valorNumerico) || valorNumerico <= 0) {
            setErro('Valor inválido. Insira um número maior que zero.');
            return;
        }
        if (!descricao) {
            setErro('Descrição é obrigatória.');
            return;
        }
        if (!data) {
          setErro('Data é obrigatória');
          return;
        }

        onSalvar({
            ...despesa,
            valor: valorNumerico,
            descricao,
            data
        });
        setIsOpen(false);
    };

    const handleCancelar = () => {
        onCancelar();
        setIsOpen(false);
    };

    return (
        <Transition.Root show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={handleCancelar}>
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal content. */}
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left sm:w-full">
                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                            Editar Despesa
                                        </Dialog.Title>
                                        <div className="mt-2 w-full">
                                            <Input
                                                type="number"
                                                placeholder="Valor"
                                                value={valor}
                                                onChange={(e) => setValor(e.target.value)}
                                                className="w-full mb-4"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Descrição"
                                                value={descricao}
                                                onChange={(e) => setDescricao(e.target.value)}
                                                className="w-full mb-4"
                                            />
                                            <Calendar
                                                mode="single"
                                                selected={data ? new Date(data) : undefined}
                                                onSelect={(selectedDate) => {
                                                  if (selectedDate) {
                                                    const isoDate = selectedDate.toISOString().split('T')[0];
                                                    setData(isoDate);
                                                  } else {
                                                    setData(undefined);
                                                  }
                                                }}
                                                locale={ptBR}
                                                className={cn(
                                                  "rounded-md border shadow w-full",
                                                  "p-3",
                                                )}
                                              />
                                            {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <Button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleSalvar}
                                >
                                    Salvar
                                </Button>
                                <Button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleCancelar}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}