import { motion } from 'framer-motion';

export default function LoadingSkeleton({
  className = '',
  lines = 3,
  variant = 'text',
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className={`rounded bg-slate-200 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] ${
            variant === 'card'
              ? 'h-48 w-full rounded-xl'
              : variant === 'circle'
              ? 'h-12 w-12 rounded-full mx-auto'
              : i === lines - 1
              ? 'h-4 w-3/4'
              : 'h-4 w-full'
          }`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
