import { AnimatePresence, motion } from "framer-motion";

export function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`glass-panel rounded-[28px] p-5 md:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Button({ children, className = "", variant = "primary", disabled = false, ...props }) {
  const styles = {
    primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    secondary: "bg-white/10 text-slate-100 hover:bg-white/15 border border-white/10",
    danger: "bg-rose-500 text-white hover:bg-rose-400"
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="glass-panel flex min-h-[220px] items-center justify-center rounded-[28px] text-slate-300">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-300" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="glass-panel flex min-h-[260px] flex-col items-center justify-center rounded-[28px] px-6 text-center">
      <p className="text-xl font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }) {
  const classes = {
    Pending: "bg-amber-400/15 text-amber-200 border border-amber-300/20",
    Preparing: "bg-sky-400/15 text-sky-200 border border-sky-300/20",
    Completed: "bg-emerald-400/15 text-emerald-200 border border-emerald-300/20"
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[status] || "bg-white/10 text-slate-200 border border-white/10"}`}>{status}</span>;
}

export function QuantityControl({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" className="h-9 w-9 rounded-xl p-0" onClick={onDecrease}>-</Button>
      <div className="flex h-9 min-w-10 items-center justify-center rounded-xl bg-white/5 px-3 text-sm text-white">{quantity}</div>
      <Button variant="secondary" className="h-9 w-9 rounded-xl p-0" onClick={onIncrease}>+</Button>
    </div>
  );
}

export function Modal({ isOpen, title, children, footer, onClose }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="glass-panel w-full max-w-lg rounded-[28px] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <div className="mt-4 text-sm text-slate-300">{children}</div>
            {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
