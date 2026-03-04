import React, { createContext, useContext, useState, useEffect } from "react";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

const typeConfig = {
    success: { color: "#4caf50", icon: "✔️" },
    error: { color: "#f44336", icon: "❌" },
    info: { color: "#2196f3", icon: "ℹ️" },
};

export const ToastProvider = ({ children, position = "top-right" }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "info", duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration, progress: 100, leaving: false }]);
    };

    useEffect(() => {
        const interval = 50;
        const timer = setInterval(() => {
            setToasts((prev) =>
                prev
                    .map((t) => {
                        if (t.leaving) return t;
                        const nextProgress = Math.max((t.progress - (interval / t.duration) * 100), 0);
                        return { ...t, progress: nextProgress, leaving: nextProgress <= 0 };
                    })
                    .filter((t) => !t.leaving || t.progress > 0)
            );
        }, interval);
        return () => clearInterval(timer);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    };

    const positionStyles = {
        "top-right": { top: 20, right: 20, flexDirection: "column-reverse" },
        "top-left": { top: 20, left: 20, flexDirection: "column-reverse" },
        "bottom-right": { bottom: 20, right: 20, flexDirection: "column" },
        "bottom-left": { bottom: 20, left: 20, flexDirection: "column" },
    };

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div
                style={{
                    position: "fixed",
                    display: "flex",
                    gap: 10,
                    zIndex: 9999,
                    maxWidth: 320,
                    pointerEvents: "none",
                    ...positionStyles[position],
                }}
            >
                {toasts.map((t) => {
                    const { color, icon } = typeConfig[t.type] || typeConfig.info;
                    return (
                        <div
                            key={t.id}
                            onClick={() => removeToast(t.id)}
                            style={{
                                pointerEvents: "auto",
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                backgroundColor: "#fff",
                                border: `1px solid ${color}`,
                                padding: "10px 14px",
                                borderRadius: 6,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                fontFamily: "Arial, sans-serif",
                                fontSize: 14,
                                cursor: "pointer",
                                opacity: t.leaving ? 0 : 1,
                                transform: t.leaving ? "translateX(100%)" : "translateX(0)",
                                transition: "opacity 0.3s ease, transform 0.3s ease",
                            }}
                        >
                            <span>{icon}</span>
                            <span>{t.message}</span>
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    height: 4,
                                    width: `${t.progress}%`,
                                    backgroundColor: color,
                                    borderRadius: "0 0 6px 6px",
                                    transition: "width 0.05s linear",
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};