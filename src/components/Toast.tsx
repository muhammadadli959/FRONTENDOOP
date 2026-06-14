import { CheckCircle } from 'lucide-react';

interface Props {
  message: string;
}

export default function Toast({ message }: Props) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-green-900/90 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl shadow-xl backdrop-blur text-sm font-medium animate-fade-in-up">
      <CheckCircle size={16} />
      {message}
    </div>
  );
}
