'use client';
import * as Dialog from '@radix-ui/react-dialog';

export default function ConfirmDialog({ open, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
          <Dialog.Title className="text-lg font-bold">Produto cadastrado!</Dialog.Title>
          <Dialog.Description className="mt-2 text-gray-600">
            O produto foi salvo com sucesso.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">OK</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
