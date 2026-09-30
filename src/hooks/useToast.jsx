import { useState, useCallback, useRef } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type, visible: true }]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
        timersRef.current.delete(id);
        setTimeout(() => removeToast(id), 300);
      }, duration);

      timersRef.current.set(id, timer);
      return id;
    },
    [removeToast]
  );

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-[100] space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-5 py-3 rounded-lg shadow-lg text-sm font-semibold transition-all duration-300 ${
            toast.visible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-full'
          } ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'error'
              ? 'bg-red-600 text-white'
              : toast.type === 'warning'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-800 text-white'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );

  return { addToast, removeToast, ToastContainer, toasts };
}
