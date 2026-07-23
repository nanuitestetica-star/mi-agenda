import React, { useState, useEffect, useRef } from "react";
import {
  Calendar, MessageCircle, BarChart3,
  Search, Plus, ChevronRight, X,
  AlertCircle, Sparkles, UserX, Cake,
  Wallet, Phone, FileText, ArrowLeft, Check, Trash2, Edit3, Loader2
} from "lucide-react";

/* ============================================================
   CATÁLOGO DE SERVICIOS POR DEFECTO
   ============================================================ */
const DEFAULT_CATALOG = {
  facial: {
    label: "Cosmetología Facial",
    color: "#D88AA3",
    services: [
      { id: "f01", name: "Limpieza facial profunda", duration: 60, price: 18000, variants: null },
      { id: "f02", name: "Limpieza facial con Neocell", duration: 70, price: 24000, variants: null },
      { id: "f03", name: "Peeling químico", duration: 45, price: 22000, variants: null },
      { id: "f04", name: "Radiofrecuencia facial", duration: 50, price: 20000, variants: null },
      { id: "f05", name: "Crioradiofrecuencia facial", duration: 55, price: 26000, variants: null },
      { id: "f06", name: "Radiofrecuencia fraccionada facial", duration: 50, price: 28000, variants: null },
      { id: "f07", name: "Dermaplaning", duration: 40, price: 16000, variants: null },
      { id: "f08", name: "Electroporación", duration: 45, price: 19000, variants: null },
      { id: "f09", name: "HIFU facial", duration: 75, price: 45000, variants: null },
      {
        id: "f10", name: "Microneedling", duration: 60, price: 25000,
        variants: ["Vitamina C", "Ácido Hialurónico", "Péptidos", "Exosomas", "PRP"]
      },
    ],
  },
  corporal: {
    label: "Tratamientos Corporales",
    color: "#C97B98",
    services: [
      { id: "c01", name: "Criolipólisis", duration: 60, price: 30000, variants: null },
      { id: "c02", name: "Ondas de choque", duration: 40, price: 21000, variants: null },
      { id: "c03", name: "Radiofrecuencia multipolar", duration: 50, price: 23000, variants: null },
      { id: "c04", name: "Crioradiofrecuencia corporal", duration: 55, price: 27000, variants: null },
      { id: "c05", name: "Radiofrecuencia fraccionada corporal", duration: 50, price: 29000, variants: null },
      { id: "c06", name: "Ultracavitación", duration: 45, price: 22000, variants: null },
      { id: "c07", name: "Velaslim", duration: 50, price: 26000, variants: null },
      { id: "c08", name: "Body Up Pro", duration: 45, price: 24000, variants: null },
      { id: "c09", name: "Thermocell Smart", duration: 50, price: 25000, variants: null },
      { id: "c10", name: "Presoterapia", duration: 40, price: 14000, variants: null },
      { id: "c11", name: "HIFU corporal", duration: 80, price: 48000, variants: null },
      { id: "c12", name: "Drenaje linfático manual", duration: 60, price: 17000, variants: null },
    ],
  },
  combos: {
    label: "Protocolos Combinados",
    color: "#E0A8C2",
    services: [
      { id: "x01", name: "Cicles (RF + Ultracavitación)", duration: 70, price: 32000, variants: null },
    ],
  },
};

const BODY_ZONES = ["Abdomen", "Flancos", "Pantalón de montar", "Glúteos", "Brazos", "Espalda", "Papada", "Muslos internos", "Rodillas"];
const FITZPATRICK_OPTIONS = ["I — Muy clara", "II — Clara", "III — Media", "IV — Oliva", "V — Morena", "VI — Oscura"];
const SKIN_TYPE_OPTIONS = ["Seca", "Grasa", "Mixta", "Sensible", "Normal"];
const PROTOCOL_OPTIONS = ["Reductor", "Reafirmante", "Anticelulítico", "Mixto"];

const STATUS_STYLES = {
  asignado: { bg: "#F5E9EF", text: "#B0648A", label: "Asignado" },
  confirmado: { bg: "#FBE4ED", text: "#C2447B", label: "Confirmado" },
  concretado: { bg: "#FCE7F0", text: "#A23E78", label: "Concretado" },
  cancelado: { bg: "#FBEAEA", text: "#C75C5C", label: "Cancelado" },
  ausente: { bg: "#FBF1E4", text: "#C28A3E", label: "Ausente" },
};

const fmtMoney = (n) => "$" + Number(n || 0).toLocaleString("es-AR");

const C = {
  bg: "#FFFFFF",
  panel: "#FFF8FA",
  panelBorder: "#F3D9E4",
  sidebarBg: "#FFF3F7",
  sidebarBorder: "#F3D9E4",
  activeBg: "#FCE7F0",
  textDark: "#3A2530",
  textMid: "#9C6B82",
  textFaint: "#C79CB1",
  primary: "#D88AA3",
  primaryDark: "#C2447B",
  primarySoft: "#F7C9DA",
  accent: "#E8A7C4",
};

/* ============================================================
   PERSISTENCIA
   ============================================================ */
const STORAGE_KEY = "agenda-data-v1";

function useAgendaData() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const loadedOnce = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({
          catalog: parsed.catalog || DEFAULT_CATALOG,
          clients: parsed.clients || [],
          appointments: parsed.appointments || [],
          movements: parsed.movements || [],
          stock: parsed.stock || [],
          businessName: parsed.businessName || "Mi Agenda",
          _onboarded: parsed._onboarded || false,
        });
      } else {
        setData({
          catalog: DEFAULT_CATALOG,
          clients: [],
          appointments: [],
          movements: [],
          stock: [
            { name: "Ampollas Vitamina C (caja x10)", qty: 0, min: 5, unit: "cajas" },
            { name: "Ácido Hialurónico inyectable cosmético", qty: 0, min: 4, unit: "frascos" },
            { name: "Gel conductor RF/Ultracavitación", qty: 0, min: 6, unit: "litros" },
            { name: "Puntas Dermapen (un solo uso)", qty: 0, min: 15, unit: "unidades" },
          ],
          businessName: "Mi Agenda",
          _onboarded: false,
        });
      }
      setStatus("ready");
      loadedOnce.current = true;
    } catch (e) {
      setData({
        catalog: DEFAULT_CATALOG,
        clients: [],
        appointments: [],
        movements: [],
        stock: [],
        businessName: "Mi Agenda",
        _onboarded: false,
      });
      setStatus("ready");
      loadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    if (!loadedOnce.current || !data) return;
    const timeout = setTimeout(() => {
      try {
        setStatus("saving");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setStatus("ready");
      } catch (e) {
        setStatus("error");
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [data]);

  return [data, setData, status];
}

/* ============================================================
   COMPONENTES BASE
   ============================================================ */
function ModuleLabel({ n, title }) {
  return (
    <div className="flex items-baseline gap-3 mb-1">
      <span className="font-mono text-xs tracking-widest" style={{ color: C.primaryDark }}>{n}</span>
      <h1 className="font-serif text-2xl" style={{ color: C.textDark }}>{title}</h1>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.45)" }}>
      <div className="w-full max-w-[340px] rounded-lg p-6" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }}>
        <p className="text-sm mb-5 text-center" style={{ color: C.textDark }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textMid }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded text-sm font-medium" style={{ background: "#C75C5C", color: "#fff" }}>
            Sí, borrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Pill({ children, color = C.primaryDark, bg = C.activeBg }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded" style={{ color, background: bg }}>
      {children}
    </span>
  );
}

function SaveIndicator({ status }) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: C.textFaint }}>
        <Loader2 size={11} className="animate-spin" /> Guardando...
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: "#C75C5C" }}>
        <AlertCircle size={11} /> No se pudo guardar
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: "#3E9A7C" }}>
      <Check size={11} /> Guardado en este dispositivo
    </div>
  );
}

function Sidebar({ active, setActive, onClose, businessName, status }) {
  const items = [
    { id: "servicios", n: "01", label: "Servicios", icon: Sparkles },
    { id: "fichas", n: "02", label: "Fichas & Historial", icon: FileText },
    { id: "agenda", n: "03", label: "Agenda", icon: Calendar },
    { id: "caja", n: "04", label: "Caja & Stock", icon: Wallet },
    { id: "marketing", n: "05", label: "Marketing", icon: MessageCircle },
    { id: "dashboard", n: "06", label: "Dashboard", icon: BarChart3 },
  ];
  return (
    <div className="w-64 h-full flex flex-col shrink-0 overflow-y-auto" style={{ background: C.sidebarBg, borderRight: `1px solid ${C.sidebarBorder}` }}>
      <div className="px-6 py-7 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.sidebarBorder}` }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: C.primaryDark }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M3 9h18" />
              <path d="M8 2v4M16 2v4" />
              <path d="M7 13h3M7 17h7" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-serif text-xl tracking-wide truncate" style={{ color: C.primaryDark }}>AGENDA</div>
            <div className="font-mono text-[10px] tracking-[0.15em] mt-0.5 truncate" style={{ color: C.textMid }}>{(businessName || "MI AGENDA").toUpperCase()}</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 rounded shrink-0" style={{ color: C.textMid }}>
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => { setActive(it.id); if (onClose) onClose(); }}
              className="w-full flex items-center gap-3 px-6 py-3 text-left transition-colors"
              style={{
                background: isActive ? C.activeBg : "transparent",
                borderLeft: isActive ? `2px solid ${C.primaryDark}` : "2px solid transparent",
              }}
            >
              <span className="font-mono text-[10px]" style={{ color: isActive ? C.primaryDark : C.textFaint }}>{it.n}</span>
              <Icon size={16} strokeWidth={1.5} color={isActive ? C.primaryDark : C.textMid} />
              <span className="text-sm" style={{ color: isActive ? C.textDark : C.textMid, fontWeight: isActive ? 500 : 400 }}>
                {it.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="px-6 py-5" style={{ borderTop: `1px solid ${C.sidebarBorder}` }}>
        <SaveIndicator status={status} />
      </div>
    </div>
  );
}

function TopBar({ onMenu }) {
  return (
    <div className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30" style={{ background: C.bg, borderBottom: `1px solid ${C.panelBorder}` }}>
      <button onClick={onMenu} className="p-2 rounded-md" style={{ background: C.activeBg, color: C.primaryDark }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
      </button>
      <span className="font-serif text-lg" style={{ color: C.primaryDark }}>AGENDA</span>
    </div>
  );
}

/* ============================================================
   ONBOARDING
   ============================================================ */
function WelcomeModal({ onSave }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.45)" }}>
      <div className="w-full max-w-[420px] rounded-lg p-6" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }}>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3" style={{ background: C.primaryDark }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M3 9h18" />
              <path d="M8 2v4M16 2v4" />
              <path d="M7 13h3M7 17h7" />
            </svg>
          </div>
          <h3 className="font-serif text-xl" style={{ color: C.textDark }}>Bienvenida a tu Agenda</h3>
          <p className="text-sm mt-1.5" style={{ color: C.textMid }}>
            Esto es tuyo: lo que cargues acá queda guardado solo en este dispositivo, sin afectar a nadie más que use esta misma plantilla.
          </p>
        </div>
        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Nombre de tu negocio</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm"
          style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}
          placeholder="Ej: Estudio Bella Piel"
        />
        <button
          onClick={() => onSave(name.trim() || "Mi Agenda")}
          className="w-full py-2 rounded text-sm font-medium"
          style={{ background: C.primaryDark, color: "#fff" }}
        >
          Empezar
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MÓDULO 01 — SERVICIOS
   ============================================================ */
function ServiciosModule({ catalog, setCatalog }) {
  const [openCat, setOpenCat] = useState("facial");
  const [showCombo, setShowCombo] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draftPrice, setDraftPrice] = useState("");
  const [editingDurationId, setEditingDurationId] = useState(null);
  const [draftDuration, setDraftDuration] = useState("");

  const startEdit = (service) => {
    setEditingId(service.id);
    setDraftPrice(String(service.price));
  };

  const savePrice = (catKey, serviceId) => {
    const newPrice = Number(draftPrice.replace(/[^\d]/g, "")) || 0;
    setCatalog((prev) => ({
      ...prev,
      [catKey]: {
        ...prev[catKey],
        services: prev[catKey].services.map((s) => s.id === serviceId ? { ...s, price: newPrice } : s),
      },
    }));
    setEditingId(null);
  };

  const startEditDuration = (service) => {
    setEditingDurationId(service.id);
    setDraftDuration(String(service.duration));
  };

  const saveDuration = (catKey, serviceId) => {
    const newDuration = Number(draftDuration.replace(/[^\d]/g, "")) || 0;
    setCatalog((prev) => ({
      ...prev,
      [catKey]: {
        ...prev[catKey],
        services: prev[catKey].services.map((s) => s.id === serviceId ? { ...s, duration: newDuration } : s),
      },
    }));
    setEditingDurationId(null);
  };

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <ModuleLabel n="01" title="Configuración de Servicios" />
      <p className="text-sm mb-6" style={{ color: C.textMid }}>Catálogo técnico, precios y duración editables.</p>

      <div className="flex gap-2 md:gap-3 mb-6 flex-wrap">
        {Object.entries(catalog).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setOpenCat(key)}
            className="px-3 md:px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
            style={{
              background: openCat === key ? C.activeBg : "transparent",
              border: `1px solid ${openCat === key ? cat.color : C.panelBorder}`,
              color: openCat === key ? C.textDark : C.textMid,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
            {cat.label}
            <span className="font-mono text-[10px]" style={{ color: C.textFaint }}>{cat.services.length}</span>
          </button>
        ))}
        <button
          onClick={() => setShowCombo(true)}
          className="md:ml-auto px-3 py-2 rounded-md text-sm flex items-center gap-1.5"
          style={{ background: C.primaryDark, color: "#fff" }}
        >
          <Plus size={14} /> Crear combo
        </button>
      </div>

      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ border: `1px solid ${C.panelBorder}` }}>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr style={{ background: C.activeBg, color: C.textMid }}>
              <th className="text-left font-mono text-[10px] uppercase tracking-wider px-4 py-3">Tratamiento</th>
              <th className="text-left font-mono text-[10px] uppercase tracking-wider px-4 py-3">Variantes / Activos</th>
              <th className="text-left font-mono text-[10px] uppercase tracking-wider px-4 py-3 w-32">Duración</th>
              <th className="text-left font-mono text-[10px] uppercase tracking-wider px-4 py-3 w-40">Precio</th>
            </tr>
          </thead>
          <tbody>
            {catalog[openCat].services.map((s, i) => (
              <tr key={s.id} style={{ borderTop: i > 0 ? `1px solid ${C.panelBorder}` : "none", background: C.bg }}>
                <td className="px-4 py-3" style={{ color: C.textDark }}>{s.name}</td>
                <td className="px-4 py-3">
                  {s.variants ? (
                    <div className="flex gap-1.5 flex-wrap">
                      {s.variants.map((v) => <Pill key={v}>{v}</Pill>)}
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: C.textFaint }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {editingDurationId === s.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={draftDuration}
                        onChange={(e) => setDraftDuration(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveDuration(openCat, s.id); if (e.key === "Escape") setEditingDurationId(null); }}
                        className="w-16 px-2 py-1 rounded outline-none"
                        style={{ background: C.panel, border: `1px solid ${C.primaryDark}`, color: C.textDark }}
                      />
                      <span style={{ color: C.textMid }}>min</span>
                      <button onClick={() => saveDuration(openCat, s.id)} className="p-1 rounded" style={{ background: C.primaryDark }}>
                        <Check size={12} color="#fff" />
                      </button>
                      <button onClick={() => setEditingDurationId(null)} className="p-1 rounded" style={{ background: C.panelBorder }}>
                        <X size={12} color={C.textMid} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEditDuration(s)} className="flex items-center gap-1.5">
                      <span style={{ color: C.textMid }}>{s.duration} min</span>
                      <Edit3 size={11} color={C.textFaint} />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {editingId === s.id ? (
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: C.textMid }}>$</span>
                      <input
                        autoFocus
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") savePrice(openCat, s.id); if (e.key === "Escape") setEditingId(null); }}
                        className="w-24 px-2 py-1 rounded outline-none"
                        style={{ background: C.panel, border: `1px solid ${C.primaryDark}`, color: C.textDark }}
                      />
                      <button onClick={() => savePrice(openCat, s.id)} className="p-1 rounded" style={{ background: C.primaryDark }}>
                        <Check size={12} color="#fff" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 rounded" style={{ background: C.panelBorder }}>
                        <X size={12} color={C.textMid} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(s)} className="flex items-center gap-1.5">
                      <span style={{ color: C.primaryDark }}>{fmtMoney(s.price)}</span>
                      <Edit3 size={11} color={C.textFaint} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCombo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.35)" }} onClick={() => setShowCombo(false)}>
          <div className="w-full max-w-[480px] rounded-lg p-6" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg" style={{ color: C.textDark }}>Nuevo protocolo combinado</h3>
              <X size={16} color={C.textMid} className="cursor-pointer" onClick={() => setShowCombo(false)} />
            </div>
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Nombre del combo</label>
            <input className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="Ej: Lifting Express (HIFU + Electroporación)" />
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Servicios incluidos</label>
            <div className="mt-2 mb-4 max-h-40 overflow-y-auto space-y-1">
              {[...catalog.facial.services, ...catalog.corporal.services].map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded" style={{ color: C.textMid }}>
                  <input type="checkbox" /> {s.name}
                </label>
              ))}
            </div>
            <button className="w-full py-2 rounded text-sm font-medium" style={{ background: C.primaryDark, color: "#fff" }}>
              Guardar protocolo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MÓDULO 02 — FICHAS / HISTORIAL CLÍNICO
   ============================================================ */
function BodyMap({ activeZones }) {
  const zoneCoords = {
    Abdomen: { cx: 100, cy: 130, r: 18 },
    Flancos: { cx: 75, cy: 135, r: 12 },
    "Pantalón de montar": { cx: 80, cy: 175, r: 14 },
    Glúteos: { cx: 100, cy: 180, r: 16 },
    Brazos: { cx: 50, cy: 100, r: 10 },
    Espalda: { cx: 100, cy: 95, r: 16 },
    Papada: { cx: 100, cy: 38, r: 8 },
    "Muslos internos": { cx: 100, cy: 220, r: 12 },
    Rodillas: { cx: 95, cy: 260, r: 8 },
  };
  return (
    <svg viewBox="0 0 200 300" className="w-full h-64">
      <ellipse cx="100" cy="32" rx="16" ry="20" fill="none" stroke={C.panelBorder} strokeWidth="1.5" />
      <path d="M70,55 Q100,45 130,55 L138,160 Q120,175 100,178 Q80,175 62,160 Z" fill="none" stroke={C.panelBorder} strokeWidth="1.5" />
      <path d="M65,60 L40,110 M135,60 L160,110" fill="none" stroke={C.panelBorder} strokeWidth="1.5" />
      <path d="M75,175 L65,280 M125,175 L135,280" fill="none" stroke={C.panelBorder} strokeWidth="1.5" />
      {Object.entries(zoneCoords).map(([name, c]) => {
        const isActive = (activeZones || []).includes(name);
        return (
          <circle key={name} cx={c.cx} cy={c.cy} r={c.r} fill={isActive ? "#F0B8D0" : "transparent"} stroke={isActive ? C.primaryDark : "#E3C2D2"} strokeWidth={isActive ? 2 : 1} />
        );
      })}
    </svg>
  );
}

function NewClientModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hasFacial, setHasFacial] = useState(true);
  const [hasBody, setHasBody] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      birthday: "",
      since: new Date().toISOString().slice(0, 10),
      balance: 0,
      lastVisit: "—",
      tag: [hasFacial && "Facial", hasBody && "Corporal"].filter(Boolean).join(" · ") || "Sin perfil",
      facialProfile: hasFacial ? { skinType: "", fitzpatrick: "", diagnosis: "" } : null,
      bodyProfile: hasBody ? { zones: [], protocol: "", measurements: {} } : null,
      history: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-lg p-6" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg" style={{ color: C.textDark }}>Nueva ficha de clienta</h3>
          <X size={16} color={C.textMid} className="cursor-pointer" onClick={onClose} />
        </div>
        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Nombre y apellido</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="Nombre de la clienta" />
        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Teléfono</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="+54 9 ..." />
        <div className="flex gap-4 mb-5">
          <label className="flex items-center gap-2 text-sm" style={{ color: C.textDark }}>
            <input type="checkbox" checked={hasFacial} onChange={(e) => setHasFacial(e.target.checked)} /> Ficha facial
          </label>
          <label className="flex items-center gap-2 text-sm" style={{ color: C.textDark }}>
            <input type="checkbox" checked={hasBody} onChange={(e) => setHasBody(e.target.checked)} /> Ficha corporal
          </label>
        </div>
        <button onClick={handleSave} className="w-full py-2 rounded text-sm font-medium" style={{ background: C.primaryDark, color: "#fff" }}>
          Crear ficha
        </button>
      </div>
    </div>
  );
}

function NewSessionModal({ catalog, onClose, onSave }) {
  const allServices = [
    ...catalog.facial.services.map((s) => ({ ...s, area: "facial" })),
    ...catalog.corporal.services.map((s) => ({ ...s, area: "corporal" })),
    ...catalog.combos.services.map((s) => ({ ...s, area: "combo" })),
  ];
  const [serviceId, setServiceId] = useState(allServices[0]?.id || "");
  const [variant, setVariant] = useState("");
  const [notes, setNotes] = useState("");
  const [device, setDevice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const service = allServices.find((s) => s.id === serviceId);

  const handleSave = () => {
    if (!service) return;
    onSave({
      date,
      service: service.name,
      variant: variant || undefined,
      area: service.area,
      notes,
      device: device || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-lg p-6 max-h-[90vh] overflow-y-auto" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg" style={{ color: C.textDark }}>Registrar atención</h3>
          <X size={16} color={C.textMid} className="cursor-pointer" onClick={onClose} />
        </div>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Fecha</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} />

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Tratamiento realizado</label>
        <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setVariant(""); }} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
          {allServices.map((s) => <option key={s.id} value={s.id}>{s.name} · {fmtMoney(s.price)}</option>)}
        </select>

        {service && service.variants && (
          <>
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Variante / activo usado</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
              <option value="">— Sin especificar —</option>
              {service.variants.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </>
        )}

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Equipo utilizado (opcional)</label>
        <input value={device} onChange={(e) => setDevice(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="Ej: Dermapen Pro" />

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Notas de la sesión</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm resize-none" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="Tolerancia, recomendaciones, evolución..." />

        <button onClick={handleSave} className="w-full py-2 rounded text-sm font-medium" style={{ background: C.primaryDark, color: "#fff" }}>
          Guardar atención
        </button>
      </div>
    </div>
  );
}

function EditSessionModal({ catalog, entry, onClose, onSave }) {
  const allServices = [
    ...catalog.facial.services.map((s) => ({ ...s, area: "facial" })),
    ...catalog.corporal.services.map((s) => ({ ...s, area: "corporal" })),
    ...catalog.combos.services.map((s) => ({ ...s, area: "combo" })),
  ];
  const matchedService = allServices.find((s) => s.name === entry.service);
  const [serviceId, setServiceId] = useState(matchedService ? matchedService.id : (allServices[0] ? allServices[0].id : ""));
  const [variant, setVariant] = useState(entry.variant || "");
  const [notes, setNotes] = useState(entry.notes || "");
  const [device, setDevice] = useState(entry.device || "");
  const [date, setDate] = useState(entry.date);

  const service = allServices.find((s) => s.id === serviceId);

  const handleSave = () => {
    if (!service) return;
    onSave({
      date,
      service: service.name,
      variant: variant || undefined,
      area: service.area,
      notes,
      device: device || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-lg p-6 max-h-[90vh] overflow-y-auto" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg" style={{ color: C.textDark }}>Editar atención</h3>
          <X size={16} color={C.textMid} className="cursor-pointer" onClick={onClose} />
        </div>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Fecha</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} />

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Tratamiento realizado</label>
        <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setVariant(""); }} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
          {allServices.map((s) => <option key={s.id} value={s.id}>{s.name} · {fmtMoney(s.price)}</option>)}
        </select>

        {service && service.variants && (
          <>
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Variante / activo usado</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
              <option value="">— Sin especificar —</option>
              {service.variants.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </>
        )}

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Equipo utilizado (opcional)</label>
        <input value={device} onChange={(e) => setDevice(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="Ej: Dermapen Pro" />

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Notas de la sesión</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm resize-none" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="Tolerancia, recomendaciones, evolución..." />

        <button onClick={handleSave} className="w-full py-2 rounded text-sm font-medium" style={{ background: C.primaryDark, color: "#fff" }}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function EditFacialModal({ profile, onClose, onSave }) {
  const [skinType, setSkinType] = useState(profile.skinType || "");
  const [fitzpatrick, setFitzpatrick] = useState(profile.fitzpatrick || "");
  const [diagnosis, setDiagnosis] = useState(profile.diagnosis || "");

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-lg p-6 max-h-[90vh] overflow-y-auto" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg" style={{ color: C.textDark }}>Editar ficha facial</h3>
          <X size={16} color={C.textMid} className="cursor-pointer" onClick={onClose} />
        </div>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Tipo de piel</label>
        <select value={skinType} onChange={(e) => setSkinType(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
          <option value="">— Sin especificar —</option>
          {SKIN_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Fototipo (Fitzpatrick)</label>
        <select value={fitzpatrick} onChange={(e) => setFitzpatrick(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
          <option value="">— Sin especificar —</option>
          {FITZPATRICK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Diagnóstico</label>
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm resize-none" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="Observaciones clínicas..." />

        <button onClick={() => { onSave({ skinType, fitzpatrick, diagnosis }); onClose(); }} className="w-full py-2 rounded text-sm font-medium" style={{ background: C.primaryDark, color: "#fff" }}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function EditBodyModal({ profile, onClose, onSave }) {
  const [zones, setZones] = useState(profile.zones || []);
  const [protocol, setProtocol] = useState(profile.protocol || "");
  const [measurements, setMeasurements] = useState(
    Object.entries(profile.measurements || {}).map(([zone, val]) => ({ zone, val: String(val) }))
  );

  const toggleZone = (z) => {
    setZones((prev) => prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z]);
  };

  const addMeasurement = () => setMeasurements((prev) => [...prev, { zone: "", val: "" }]);
  const updateMeasurement = (i, field, value) => {
    setMeasurements((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };
  const removeMeasurement = (i) => setMeasurements((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    const measurementsObj = {};
    measurements.forEach((m) => {
      if (m.zone.trim()) measurementsObj[m.zone.trim()] = Number(m.val) || 0;
    });
    onSave({ zones, protocol, measurements: measurementsObj });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-[460px] rounded-lg p-6 max-h-[90vh] overflow-y-auto" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg" style={{ color: C.textDark }}>Editar ficha corporal</h3>
          <X size={16} color={C.textMid} className="cursor-pointer" onClick={onClose} />
        </div>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Zonas tratadas</label>
        <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
          {BODY_ZONES.map((z) => {
            const active = zones.includes(z);
            return (
              <button key={z} onClick={() => toggleZone(z)} className="px-2.5 py-1 rounded text-xs" style={{ background: active ? C.activeBg : C.panel, border: `1px solid ${active ? C.primaryDark : C.panelBorder}`, color: active ? C.primaryDark : C.textMid }}>
                {z}
              </button>
            );
          })}
        </div>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Protocolo seleccionado</label>
        <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
          <option value="">— Sin especificar —</option>
          {PROTOCOL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Mediciones (cm)</label>
        <div className="space-y-2 mt-2 mb-3">
          {measurements.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={m.zone} onChange={(e) => updateMeasurement(i, "zone", e.target.value)} placeholder="Zona" className="flex-1 px-2 py-1.5 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} />
              <input value={m.val} onChange={(e) => updateMeasurement(i, "val", e.target.value)} placeholder="cm" className="w-20 px-2 py-1.5 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} />
              <button onClick={() => removeMeasurement(i)} className="p-1.5 rounded" style={{ background: "#FBEAEA" }}>
                <X size={12} color="#C75C5C" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addMeasurement} className="flex items-center gap-1.5 text-xs mb-5" style={{ color: C.primaryDark }}>
          <Plus size={12} /> Agregar medición
        </button>

        <button onClick={handleSave} className="w-full py-2 rounded text-sm font-medium" style={{ background: C.primaryDark, color: "#fff" }}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function ClientDetail({ client, catalog, onBack, onAddSession, onEditSession, onDeleteSession, onDelete, onUpdateFacial, onUpdateBody }) {
  const [tab, setTab] = useState(client.facialProfile ? "facial" : "corporal");
  const [showSession, setShowSession] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showEditFacial, setShowEditFacial] = useState(false);
  const [showEditBody, setShowEditBody] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // "client" | number (session index)

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm" style={{ color: C.textMid }}>
          <ArrowLeft size={14} /> Volver a fichas
        </button>
        <button onClick={() => setConfirmDelete("client")} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded" style={{ color: "#C75C5C", border: "1px solid #F3D9D9" }}>
          <Trash2 size={13} /> Eliminar ficha
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl" style={{ color: C.textDark }}>{client.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 font-mono text-xs" style={{ color: C.textMid }}>
            {client.phone && <span className="flex items-center gap-1"><Phone size={11} /> {client.phone}</span>}
            <span>· Cliente desde {client.since}</span>
            <span>· Última visita {client.lastVisit}</span>
          </div>
        </div>
        <div className="text-left md:text-right">
          <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.textMid }}>Cuenta corriente</div>
          <div className="font-mono text-lg" style={{ color: client.balance > 0 ? "#C28A3E" : client.balance < 0 ? "#3E9A7C" : C.textMid }}>
            {client.balance === 0 ? "Al día" : fmtMoney(Math.abs(client.balance)) + (client.balance > 0 ? " debe" : " a favor")}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {client.facialProfile && (
          <button onClick={() => setTab("facial")} className="px-4 py-1.5 rounded-md text-sm" style={{ background: tab === "facial" ? C.activeBg : "transparent", border: `1px solid ${tab === "facial" ? C.primaryDark : C.panelBorder}`, color: tab === "facial" ? C.textDark : C.textMid }}>
            Ficha Facial
          </button>
        )}
        {client.bodyProfile && (
          <button onClick={() => setTab("corporal")} className="px-4 py-1.5 rounded-md text-sm" style={{ background: tab === "corporal" ? C.activeBg : "transparent", border: `1px solid ${tab === "corporal" ? C.primary : C.panelBorder}`, color: tab === "corporal" ? C.textDark : C.textMid }}>
            Ficha Corporal
          </button>
        )}
      </div>

      {tab === "facial" && client.facialProfile && (
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          <div className="md:col-span-2 rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
            <div className="flex justify-between items-start mb-4">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMid }}>Tipo de piel</div>
                  <div className="text-sm" style={{ color: C.textDark }}>{client.facialProfile.skinType || "Sin registrar"}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMid }}>Fototipo (Fitzpatrick)</div>
                  <div className="text-sm" style={{ color: C.textDark }}>{client.facialProfile.fitzpatrick || "Sin registrar"}</div>
                </div>
              </div>
              <button onClick={() => setShowEditFacial(true)} className="p-1.5 rounded shrink-0" style={{ background: C.activeBg }}>
                <Edit3 size={13} color={C.primaryDark} />
              </button>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMid }}>Diagnóstico</div>
            <p className="text-sm leading-relaxed" style={{ color: C.textDark }}>{client.facialProfile.diagnosis || "Sin diagnóstico registrado aún."}</p>
          </div>
          <div className="rounded-lg p-5 flex flex-col items-center justify-center text-center" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
            <Sparkles size={20} color={C.primaryDark} className="mb-2" />
            <div className="text-xs" style={{ color: C.textMid }}>Rutina domiciliaria</div>
            <div className="text-sm mt-1" style={{ color: C.textDark }}>Sin definir todavía</div>
          </div>
        </div>
      )}

      {tab === "corporal" && client.bodyProfile && (
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          <div className="rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMid }}>Mapa de zonas tratadas</div>
            <BodyMap activeZones={client.bodyProfile.zones} />
          </div>
          <div className="md:col-span-2 rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
            <div className="flex justify-between items-start mb-4">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMid }}>Zonas tratadas</div>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {client.bodyProfile.zones && client.bodyProfile.zones.length > 0 ? client.bodyProfile.zones.map((z) => <Pill key={z}>{z}</Pill>) : <span className="text-xs" style={{ color: C.textFaint }}>Sin zonas registradas</span>}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMid }}>Protocolo seleccionado</div>
                  <div className="text-sm" style={{ color: C.textDark }}>{client.bodyProfile.protocol || "Sin definir"}</div>
                </div>
              </div>
              <button onClick={() => setShowEditBody(true)} className="p-1.5 rounded shrink-0" style={{ background: C.activeBg }}>
                <Edit3 size={13} color={C.primaryDark} />
              </button>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMid }}>Mediciones (cm)</div>
            <div className="flex gap-4 flex-wrap">
              {client.bodyProfile.measurements && Object.keys(client.bodyProfile.measurements).length > 0 ? (
                Object.entries(client.bodyProfile.measurements).map(([zone, val]) => (
                  <div key={zone} className="px-3 py-2 rounded" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }}>
                    <div className="font-mono text-lg" style={{ color: C.primaryDark }}>{val}</div>
                    <div className="text-[10px] capitalize" style={{ color: C.textMid }}>{zone}</div>
                  </div>
                ))
              ) : (
                <span className="text-xs" style={{ color: C.textFaint }}>Sin mediciones registradas</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.textMid }}>
          Historial de sesiones
          <span className="ml-2 px-1.5 py-0.5 rounded" style={{ background: C.activeBg, color: C.primaryDark }}>{client.history.length} en total</span>
        </div>
        <button onClick={() => setShowSession(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.primaryDark, color: "#fff" }}>
          <Plus size={12} /> Registrar atención
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: C.textFaint }}>
        No hay límite de tratamientos: podés sumar todos los que necesite esta clienta, y van a quedar guardados acá para siempre.
      </p>
      <div className="space-y-2">
        {client.history.length === 0 && (
          <div className="text-center py-10 text-sm rounded-lg" style={{ color: C.textFaint, border: `1px dashed ${C.panelBorder}` }}>
            Todavía no hay tratamientos registrados para esta clienta.
          </div>
        )}
        {client.history.map((h, i) => (
          <div key={i} className="rounded-lg p-4 flex flex-col sm:flex-row gap-2 sm:gap-4" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
            <div className="font-mono text-xs sm:w-20 shrink-0" style={{ color: C.textMid }}>{h.date}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm" style={{ color: C.textDark }}>{h.service}</span>
                {h.variant && <Pill>{h.variant}</Pill>}
                {h.area === "facial" ? <Pill color={C.primaryDark} bg={C.activeBg}>Facial</Pill> : h.area === "corporal" ? <Pill color="#A2638A" bg="#FBEAF1">Corporal</Pill> : <Pill color="#A2638A" bg="#FBEAF1">Combo</Pill>}
              </div>
              {h.notes && <p className="text-xs mt-1.5 leading-relaxed" style={{ color: C.textMid }}>{h.notes}</p>}
              {h.device && (
                <div className="flex gap-3 mt-2 font-mono text-[10px] flex-wrap" style={{ color: C.textFaint }}>
                  <span>Equipo: {h.device}</span>
                </div>
              )}
            </div>
            <div className="flex sm:flex-col gap-1.5 shrink-0">
              <button onClick={() => setEditingIndex(i)} className="p-1.5 rounded" style={{ background: C.activeBg }}>
                <Edit3 size={12} color={C.primaryDark} />
              </button>
              <button onClick={() => setConfirmDelete(i)} className="p-1.5 rounded" style={{ background: "#FBEAEA" }}>
                <Trash2 size={12} color="#C75C5C" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showSession && (
        <NewSessionModal
          catalog={catalog}
          onClose={() => setShowSession(false)}
          onSave={(entry) => onAddSession(client.id, entry)}
        />
      )}
      {editingIndex !== null && (
        <EditSessionModal
          catalog={catalog}
          entry={client.history[editingIndex]}
          onClose={() => setEditingIndex(null)}
          onSave={(entry) => onEditSession(client.id, editingIndex, entry)}
        />
      )}
      {showEditFacial && (
        <EditFacialModal
          profile={client.facialProfile}
          onClose={() => setShowEditFacial(false)}
          onSave={(profile) => onUpdateFacial(client.id, profile)}
        />
      )}
      {confirmDelete === "client" && (
        <ConfirmModal
          message={`¿Borrar la ficha de ${client.name}? Esta acción no se puede deshacer.`}
          onConfirm={() => { onDelete(client.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {typeof confirmDelete === "number" && (
        <ConfirmModal
          message="¿Borrar esta atención del historial?"
          onConfirm={() => { onDeleteSession(client.id, confirmDelete); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {showEditBody && (
        <EditBodyModal
          profile={client.bodyProfile}
          onClose={() => setShowEditBody(false)}
          onSave={(profile) => onUpdateBody(client.id, profile)}
        />
      )}
    </div>
  );
}

function FichasModule({ clients, setClients, catalog }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddSession = (clientId, entry) => {
    setClients((prev) => prev.map((c) => c.id === clientId
      ? { ...c, history: [entry, ...c.history], lastVisit: entry.date }
      : c
    ));
  };

  const handleEditSession = (clientId, index, entry) => {
    setClients((prev) => prev.map((c) => {
      if (c.id !== clientId) return c;
      const newHistory = [...c.history];
      newHistory[index] = entry;
      return { ...c, history: newHistory };
    }));
  };

  const handleDeleteSession = (clientId, index) => {
    setClients((prev) => prev.map((c) => {
      if (c.id !== clientId) return c;
      const newHistory = c.history.filter((_, i) => i !== index);
      return { ...c, history: newHistory };
    }));
  };

  const handleDelete = (clientId) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setSelected(null);
  };

  const handleUpdateFacial = (clientId, profile) => {
    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, facialProfile: profile } : c));
  };

  const handleUpdateBody = (clientId, profile) => {
    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, bodyProfile: profile } : c));
  };

  if (selected) {
    const client = clients.find((c) => c.id === selected);
    if (!client) {
      return (
        <div className="p-5 md:p-8 max-w-5xl">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm" style={{ color: C.textMid }}>
            <ArrowLeft size={14} /> Volver a fichas
          </button>
        </div>
      );
    }
    return (
      <ClientDetail
        client={client}
        catalog={catalog}
        onBack={() => setSelected(null)}
        onAddSession={handleAddSession}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
        onDelete={handleDelete}
        onUpdateFacial={handleUpdateFacial}
        onUpdateBody={handleUpdateBody}
      />
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <ModuleLabel n="02" title="Fichas Estéticas & Historial" />
      <p className="text-sm mb-6" style={{ color: C.textMid }}>Diagnóstico clínico, evolución y registro de cada atención.</p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
          <Search size={14} color={C.textMid} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar clienta por nombre..."
            className="bg-transparent text-sm flex-1 outline-none"
            style={{ color: C.textDark }}
          />
        </div>
        <button onClick={() => setShowNewClient(true)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm" style={{ background: C.primaryDark, color: "#fff" }}>
          <Plus size={14} /> Nueva ficha
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className="w-full text-left rounded-lg p-4 flex items-center justify-between transition-colors"
            style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm shrink-0" style={{ background: C.activeBg, color: C.primaryDark }}>
                {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div className="text-sm" style={{ color: C.textDark }}>{c.name}</div>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: C.textMid }}>{c.tag} · Última visita {c.lastVisit}</div>
              </div>
            </div>
            <ChevronRight size={16} color={C.textFaint} />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm rounded-lg" style={{ color: C.textFaint, border: `1px dashed ${C.panelBorder}` }}>
            {clients.length === 0 ? "Todavía no cargaste ninguna clienta. Usá \"Nueva ficha\" para empezar." : "No se encontraron resultados."}
          </div>
        )}
      </div>

      {showNewClient && (
        <NewClientModal onClose={() => setShowNewClient(false)} onSave={(c) => setClients((prev) => [...prev, c])} />
      )}
    </div>
  );
}

/* ============================================================
   MÓDULO 03 — AGENDA
   ============================================================ */
function AppointmentFormModal({ clients, catalog, initial, onClose, onSave }) {
  const allServices = [
    ...catalog.facial.services.map((s) => ({ ...s, area: "facial" })),
    ...catalog.corporal.services.map((s) => ({ ...s, area: "corporal" })),
    ...catalog.combos.services.map((s) => ({ ...s, area: "combo" })),
  ];
  const matched = initial ? allServices.find((s) => s.name === initial.service) : null;

  const [clientName, setClientName] = useState(initial ? initial.clientName : (clients[0] ? clients[0].name : ""));
  const [serviceId, setServiceId] = useState(matched ? matched.id : (allServices[0] ? allServices[0].id : ""));
  const [date, setDate] = useState(initial ? initial.date : new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(initial ? initial.time : "09:00");
  const [duration, setDuration] = useState(String(initial ? initial.duration : (allServices[0] ? allServices[0].duration : 30)));

  const handleServiceChange = (id) => {
    setServiceId(id);
    const svc = allServices.find((s) => s.id === id);
    if (svc) setDuration(String(svc.duration));
  };

  const handleSave = () => {
    const service = allServices.find((s) => s.id === serviceId);
    if (!clientName.trim() || !service) return;
    const finalDuration = Number(String(duration).replace(/[^\d]/g, "")) || service.duration;
    onSave({
      id: initial ? initial.id : Date.now(),
      clientName: clientName.trim(),
      service: service.name,
      date,
      time,
      duration: finalDuration,
      status: initial ? initial.status : "asignado",
      area: service.area,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(60,30,45,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-lg p-6 max-h-[90vh] overflow-y-auto" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg" style={{ color: C.textDark }}>{initial ? "Editar turno" : "Nuevo turno"}</h3>
          <X size={16} color={C.textMid} className="cursor-pointer" onClick={onClose} />
        </div>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Clienta</label>
        {clients.length > 0 ? (
          <select value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
            {clients.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        ) : (
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} placeholder="Nombre de la clienta" />
        )}

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Servicio</label>
        <select value={serviceId} onChange={(e) => handleServiceChange(e.target.value)} className="w-full mt-1 mb-4 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }}>
          {allServices.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Hora</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full mt-1 px-3 py-2 rounded text-sm" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, color: C.textDark }} />
          </div>
        </div>

        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMid }}>Duración (minutos) — la elegís vos</label>
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full mt-1 mb-5 px-3 py-2 rounded text-sm"
          style={{ background: C.panel, border: `1px solid ${C.primaryDark}`, color: C.textDark }}
          placeholder="Ej: 45"
        />

        <button onClick={handleSave} className="w-full py-2 rounded text-sm font-medium" style={{ background: C.primaryDark, color: "#fff" }}>
          {initial ? "Guardar cambios" : "Confirmar turno"}
        </button>
      </div>
    </div>
  );
}

function AgendaModule({ clients, catalog, appointments, setAppointments }) {
  const [view, setView] = useState("diario");
  const [showNew, setShowNew] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [confirmDeleteAppt, setConfirmDeleteAppt] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const uniqueDays = [...new Set(appointments.map((a) => a.date))].sort();
  const [day, setDay] = useState(uniqueDays[0] || todayStr);
  const days = uniqueDays.length > 0 ? uniqueDays : [todayStr];

  const dayLabel = (d) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short" });
  };

  const dayAppointments = appointments.filter((a) => a.date === day).sort((a, b) => a.time.localeCompare(b.time));

  const cycleStatus = (id) => {
    const order = ["asignado", "confirmado", "concretado", "ausente", "cancelado"];
    setAppointments((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      const next = order[(order.indexOf(a.status) + 1) % order.length];
      return { ...a, status: next };
    }));
  };

  const handleSaveAppointment = (appt) => {
    setAppointments((prev) => {
      const exists = prev.some((a) => a.id === appt.id);
      return exists ? prev.map((a) => a.id === appt.id ? appt : a) : [...prev, appt];
    });
  };

  const handleDeleteAppointment = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-5 md:p-8 max-w-6xl">
      <ModuleLabel n="03" title="Agenda de Turnos" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <p className="text-sm" style={{ color: C.textMid }}>Vista {view} · Tocá un estado para avanzarlo.</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setView("diario")} className="px-3 py-1.5 rounded text-xs" style={{ background: view === "diario" ? C.activeBg : "transparent", border: `1px solid ${view === "diario" ? C.primaryDark : C.panelBorder}`, color: view === "diario" ? C.textDark : C.textMid }}>Diario</button>
          <button onClick={() => setView("semanal")} className="px-3 py-1.5 rounded text-xs" style={{ background: view === "semanal" ? C.activeBg : "transparent", border: `1px solid ${view === "semanal" ? C.primaryDark : C.panelBorder}`, color: view === "semanal" ? C.textDark : C.textMid }}>Semanal</button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs" style={{ background: C.primaryDark, color: "#fff" }}><Plus size={12} /> Nuevo turno</button>
        </div>
      </div>

      {view === "diario" && (
        <>
          <div className="flex gap-2 mb-5 flex-wrap">
            {days.map((d) => (
              <button key={d} onClick={() => setDay(d)} className="px-4 py-2 rounded-md text-sm flex items-center gap-2 capitalize" style={{ background: day === d ? C.activeBg : "transparent", border: `1px solid ${day === d ? C.primaryDark : C.panelBorder}`, color: day === d ? C.textDark : C.textMid }}>
                {dayLabel(d)}
                <Pill color={C.textMid} bg={C.bg}>{appointments.filter((a) => a.date === d).length}</Pill>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {dayAppointments.map((a) => {
              const st = STATUS_STYLES[a.status];
              return (
                <div key={a.id} className="rounded-lg p-4 flex flex-wrap items-center gap-3 sm:gap-4" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
                  <div className="font-mono text-sm w-14 shrink-0" style={{ color: C.textDark }}>{a.time}</div>
                  <div className="hidden sm:block w-px h-8" style={{ background: C.panelBorder }} />
                  <div className="flex-1 min-w-[140px]">
                    <div className="text-sm" style={{ color: C.textDark }}>{a.clientName}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.textMid }}>{a.service} · {a.duration} min</div>
                  </div>
                  <button onClick={() => cycleStatus(a.id)} className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded" style={{ background: st.bg, color: st.text }}>
                    {st.label}
                  </button>
                  <button onClick={() => setEditingAppt(a)} className="p-2 rounded" title="Editar turno" style={{ background: C.activeBg }}>
                    <Edit3 size={14} color={C.primaryDark} />
                  </button>
                  <button onClick={() => setConfirmDeleteAppt(a.id)} className="p-2 rounded" title="Eliminar turno" style={{ background: "#FBEAEA" }}>
                    <Trash2 size={14} color="#C75C5C" />
                  </button>
                </div>
              );
            })}
            {dayAppointments.length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color: C.textFaint }}>Sin turnos este día.</div>
            )}
          </div>
        </>
      )}

      {view === "semanal" && (
        <div className="grid md:grid-cols-3 gap-4">
          {days.map((d) => (
            <div key={d} className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
              <div className="font-mono text-xs uppercase tracking-wider mb-3 capitalize" style={{ color: C.textMid }}>{dayLabel(d)}</div>
              <div className="space-y-2">
                {appointments.filter((a) => a.date === d).sort((a, b) => a.time.localeCompare(b.time)).map((a) => {
                  const st = STATUS_STYLES[a.status];
                  return (
                    <div key={a.id} className="rounded p-2.5" style={{ background: C.bg, border: `1px solid ${C.panelBorder}` }}>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs" style={{ color: C.textMid }}>{a.time}</span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.text }} />
                      </div>
                      <div className="text-xs mt-1" style={{ color: C.textDark }}>{a.clientName}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: C.textMid }}>{a.service}</div>
                    </div>
                  );
                })}
                {appointments.filter((a) => a.date === d).length === 0 && (
                  <div className="text-xs text-center py-4" style={{ color: C.textFaint }}>Sin turnos.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDeleteAppt && (
        <ConfirmModal
          message="¿Borrar este turno?"
          onConfirm={() => { handleDeleteAppointment(confirmDeleteAppt); setConfirmDeleteAppt(null); }}
          onCancel={() => setConfirmDeleteAppt(null)}
        />
      )}
      {(showNew || editingAppt) && (
        <AppointmentFormModal
          clients={clients}
          catalog={catalog}
          initial={editingAppt}
          onClose={() => { setShowNew(false); setEditingAppt(null); }}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
}

/* ============================================================
   MÓDULO 04 — CAJA & STOCK
   ============================================================ */
function CajaModule({ movements, stock }) {
  const totalDay = movements.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="p-5 md:p-8 max-w-6xl">
      <ModuleLabel n="04" title="Caja, Flujo de Dinero & Stock" />
      <p className="text-sm mb-6" style={{ color: C.textMid }}>Movimientos del día, métodos de pago y control de insumos.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
          <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMid }}>Ingresos de hoy</div>
          <div className="font-mono text-2xl" style={{ color: C.primaryDark }}>{fmtMoney(totalDay)}</div>
        </div>
        <div className="rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
          <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMid }}>Cuentas corrientes pendientes</div>
          <div className="font-mono text-2xl" style={{ color: "#C28A3E" }}>{fmtMoney(0)}</div>
        </div>
        <div className="rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
          <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMid }}>Insumos bajo mínimo</div>
          <div className="font-mono text-2xl" style={{ color: "#C75C5C" }}>{stock.filter((s) => s.qty <= s.min).length}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.textMid }}>Movimientos de hoy</div>
          </div>
          <div className="space-y-2">
            {movements.length === 0 && (
              <div className="text-center py-10 text-sm rounded-lg" style={{ color: C.textFaint, border: `1px dashed ${C.panelBorder}` }}>
                Sin movimientos registrados todavía.
              </div>
            )}
            {movements.map((m, i) => (
              <div key={i} className="rounded-lg p-3.5 flex items-center justify-between" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
                <div>
                  <div className="text-sm" style={{ color: C.textDark }}>{m.client}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.textMid }}>{m.concept}</div>
                </div>
                <div className="font-mono text-sm" style={{ color: C.primaryDark }}>{fmtMoney(m.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider mb-3" style={{ color: C.textMid }}>Stock de insumos</div>
          <div className="space-y-2">
            {stock.map((s, i) => {
              const low = s.qty <= s.min;
              return (
                <div key={i} className="rounded-lg p-3.5" style={{ background: C.panel, border: `1px solid ${low ? "#E7B8B8" : C.panelBorder}` }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: C.textDark }}>{s.name}</span>
                    {low && <AlertCircle size={13} color="#C75C5C" />}
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="font-mono text-xs" style={{ color: low ? "#C75C5C" : C.textMid }}>{s.qty} {s.unit}</span>
                    <span className="font-mono text-[10px]" style={{ color: C.textFaint }}>mín. {s.min}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MÓDULO 05 — MARKETING
   ============================================================ */
function MarketingModule({ clients }) {
  const inactive = clients.filter((c) => c.lastVisit && c.lastVisit !== "—").map((c) => {
    const days = Math.floor((new Date() - new Date(c.lastVisit)) / 86400000);
    return { ...c, daysSince: days };
  }).filter((c) => c.daysSince >= 30);

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <ModuleLabel n="05" title="Marketing & Fidelización" />
      <p className="text-sm mb-6" style={{ color: C.textMid }}>Reactivación conectada a WhatsApp, a partir de tus clientas reales.</p>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Cake size={15} color={C.primaryDark} />
            <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.textMid }}>Cumpleaños próximos</div>
          </div>
          <div className="text-sm py-6 text-center rounded-lg" style={{ color: C.textFaint, border: `1px dashed ${C.panelBorder}` }}>
            Agregá la fecha de cumpleaños en cada ficha para que aparezca acá.
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <UserX size={15} color="#C75C5C" />
            <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: C.textMid }}>Clientas sin visitar (+30 días)</div>
          </div>
          <div className="space-y-2">
            {inactive.map((c) => (
              <div key={c.id} className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <div className="text-sm" style={{ color: C.textDark }}>{c.name}</div>
                    <div className="font-mono text-[10px] mt-0.5" style={{ color: "#C28A3E" }}>{c.daysSince} días sin visitar</div>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: "#FBF1E4", color: "#C28A3E" }}>
                    <MessageCircle size={12} /> Reactivar
                  </button>
                </div>
              </div>
            ))}
            {inactive.length === 0 && (
              <div className="text-sm py-6 text-center rounded-lg" style={{ color: C.textFaint, border: `1px dashed ${C.panelBorder}` }}>
                Ninguna clienta inactiva por ahora.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MÓDULO 06 — DASHBOARD
   ============================================================ */
function DashboardModule({ appointments }) {
  const statusCounts = appointments.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <div className="p-5 md:p-8 max-w-6xl">
      <ModuleLabel n="06" title="Dashboard de Estadísticas" />
      <p className="text-sm mb-6" style={{ color: C.textMid }}>Vista general del negocio en tiempo real.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {Object.entries(STATUS_STYLES).map(([key, st]) => (
          <div key={key} className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
            <div className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMid }}>{st.label}</div>
            <div className="font-mono text-2xl" style={{ color: st.text }}>{statusCounts[key] || 0}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-8 text-center text-sm" style={{ background: C.panel, border: `1px dashed ${C.panelBorder}`, color: C.textFaint }}>
        Las estadísticas de ingresos, top tratamientos y clientas nuevas vs. recurrentes se van a completar a medida que registrés turnos y atenciones reales.
      </div>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [active, setActive] = useState("agenda");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData, status] = useAgendaData();

  if (!data) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <Loader2 size={24} className="animate-spin" color={C.primaryDark} />
      </div>
    );
  }

  const setCatalog = (updater) => setData((prev) => ({ ...prev, catalog: typeof updater === "function" ? updater(prev.catalog) : updater }));
  const setClients = (updater) => setData((prev) => ({ ...prev, clients: typeof updater === "function" ? updater(prev.clients) : updater }));
  const setAppointments = (updater) => setData((prev) => ({ ...prev, appointments: typeof updater === "function" ? updater(prev.appointments) : updater }));

  const needsOnboarding = !data._onboarded;

  const modules = {
    servicios: <ServiciosModule catalog={data.catalog} setCatalog={setCatalog} />,
    fichas: <FichasModule clients={data.clients} setClients={setClients} catalog={data.catalog} />,
    agenda: <AgendaModule clients={data.clients} catalog={data.catalog} appointments={data.appointments} setAppointments={setAppointments} />,
    caja: <CajaModule movements={data.movements} stock={data.stock} />,
    marketing: <MarketingModule clients={data.clients} />,
    dashboard: <DashboardModule appointments={data.appointments} />,
  };

  return (
    <div className="w-full h-screen flex" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #fff; }
        ::-webkit-scrollbar-thumb { background: #F3D9E4; border-radius: 4px; }
      `}</style>

      {needsOnboarding && (
        <WelcomeModal onSave={(name) => setData((prev) => ({ ...prev, businessName: name, _onboarded: true }))} />
      )}

      {/* Sidebar — solo visible en pantallas grandes */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar active={active} setActive={setActive} businessName={data.businessName} status={status} />
      </div>

      {/* Drawer móvil — flota encima, no desplaza el contenido */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <Sidebar active={active} setActive={setActive} onClose={() => setMobileOpen(false)} businessName={data.businessName} status={status} />
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Contenido principal — ocupa TODO el ancho en móvil */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        {modules[active]}
      </div>
    </div>
  );
        }
