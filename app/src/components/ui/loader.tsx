export function Loader({ text = "Carregando..." }: { text?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 text-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#ff0055] border-t-transparent"
        role="status"
      >
        <span className="sr-only">Carregando...</span>
      </div>
      <p className="text-xl font-medium text-neutral-300">{text}</p>
    </div>
  );
}