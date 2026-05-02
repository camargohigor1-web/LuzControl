import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Zap, Home, BookOpen, Cpu, BarChart2, Settings,
  Plus, Trash2, Edit2, TrendingUp, TrendingDown,
  AlertTriangle, Check, X, ChevronRight, Sun, Moon,
  Thermometer, Wind, Lightbulb, Tv, UtensilsCrossed,
  MoreVertical, Download, Target, ArrowUp, ArrowDown,
  Save, RefreshCw, ChevronDown, Info, Building2,
  BatteryCharging, Flame, Snowflake, Bell, BellOff
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ─── Paleta de cores ──────────────────────────────────────────────────────────
const COLORS = {
  primary: "#1D9E75",
  primaryDark: "#0F6E56",
  amber: "#EF9F27",
  red: "#E24B4A",
  blue: "#378ADD",
  green: "#1D9E75",
  bgDark: "#0f1923",
  bgDark2: "#16213e",
  cardDark: "#1a2535",
};

const BANDEIRAS = [
  { id: "verde", label: "Verde", color: "#1D9E75", bg: "#E1F5EE" },
  { id: "amarela", label: "Amarela", color: "#EF9F27", bg: "#FAEEDA" },
  { id: "vermelha1", label: "Vermelha 1", color: "#E24B4A", bg: "#FCEBEB" },
  { id: "vermelha2", label: "Vermelha 2", color: "#A32D2D", bg: "#F7C1C1" },
];

const CATEGORIAS = [
  { id: "climatizacao", label: "Climatização", icon: "❄️" },
  { id: "iluminacao", label: "Iluminação", icon: "💡" },
  { id: "cozinha", label: "Cozinha", icon: "🍳" },
  { id: "lazer", label: "Lazer", icon: "📺" },
  { id: "outros", label: "Outros", icon: "🔌" },
];

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "luzcontrol_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveData(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

function defaultState() {
  const perfilId = crypto.randomUUID ? crypto.randomUUID() : "perfil1";
  return {
    perfis: [{ id: perfilId, nome: "Minha Residência" }],
    perfilAtivo: perfilId,
    dados: {
      [perfilId]: {
        leituras: [],
        equipamentos: [],
      }
    },
    configuracoes: {
      tema: "claro",
      metaKwh: null,
      metaReais: null,
      diaLembrete: 5,
      tarifaBase: 0.75,
    }
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{
      position: "fixed", bottom: 82, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, display: "flex", flexDirection: "column", gap: 8,
      alignItems: "center", pointerEvents: "none", width: "max-content", maxWidth: "90vw"
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "error" ? COLORS.red : t.type === "warn" ? COLORS.amber : COLORS.primary,
          color: "#fff", padding: "11px 22px", borderRadius: 28, fontSize: 13, fontWeight: 600,
          boxShadow: `0 6px 24px ${t.type === "error" ? COLORS.red : t.type === "warn" ? COLORS.amber : COLORS.primary}55`,
          animation: "toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "auto", display: "flex", alignItems: "center", gap: 8,
          fontFamily: "'Nunito', sans-serif", letterSpacing: 0.1,
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          {t.type === "warn" ? <AlertTriangle size={14}/> : t.type === "error" ? <X size={14}/> : <Check size={14}/>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2800);
  }, []);
  return { toasts, add };
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(155deg, #0a1f14 0%, #071510 50%, #040d09 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 10000, animation: "splashOut 0.6s cubic-bezier(0.4,0,0.2,1) 2s both"
    }}>
      {/* Glow rings */}
      <div style={{
        position: "absolute", width: 260, height: 260, borderRadius: "50%",
        border: "1px solid rgba(29,158,117,0.12)", animation: "splashPulse 2s ease infinite"
      }} />
      <div style={{
        position: "absolute", width: 180, height: 180, borderRadius: "50%",
        border: "1px solid rgba(29,158,117,0.2)"
      }} />

      <div style={{
        animation: "splashLogo 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 22, zIndex: 1
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, rgba(29,158,117,0.3), rgba(15,46,31,0.9))",
          border: "2px solid rgba(29,158,117,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "splashPulse 2s ease 0.9s infinite"
        }}>
          <Zap size={46} color="#1D9E75" fill="#1D9E75" />
        </div>
        <div style={{ textAlign: "center", animation: "splashText 0.55s ease 0.75s both", opacity: 0 }}>
          <div style={{
            fontSize: 34, fontWeight: 800, color: "#fff",
            letterSpacing: -1, fontFamily: "'Nunito', sans-serif",
            textShadow: "0 0 30px rgba(29,158,117,0.4)"
          }}>
            Luz<span style={{ color: "#1D9E75" }}>Control</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 7, fontFamily: "'Nunito', sans-serif", letterSpacing: 0.3 }}>
            Controle inteligente do seu consumo elétrico
          </div>
        </div>
      </div>

      {/* Loading dots */}
      <div style={{
        position: "absolute", bottom: 60, display: "flex", gap: 6,
        animation: "splashText 0.4s ease 1.1s both", opacity: 0
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: COLORS.primary,
            animation: `spin 1.2s ease ${i * 0.15}s infinite`,
            animationName: "dotBounce"
          }} />
        ))}
      </div>

      <style>{`
        @keyframes dotBounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.2);opacity:1} }
      `}</style>
    </div>
  );
}

// ─── Navegação Inferior ───────────────────────────────────────────────────────
const ABAS = [
  { id: "inicio", label: "Início", Icon: Home },
  { id: "leituras", label: "Leituras", Icon: BookOpen },
  { id: "equipamentos", label: "Equipamentos", Icon: Cpu },
  { id: "relatorios", label: "Relatórios", Icon: BarChart2 },
  { id: "config", label: "Config", Icon: Settings },
];

function NavBar({ aba, setAba, dark }) {
  const bg = dark
    ? "rgba(26,37,53,0.95)"
    : "rgba(255,255,255,0.95)";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 68,
      background: bg,
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderTop: `1px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around",
      zIndex: 100, maxWidth: 480, margin: "0 auto",
    }}>
      {ABAS.map(({ id, label, Icon }) => {
        const active = aba === id;
        return (
          <button key={id} onClick={() => setAba(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer", padding: "6px 14px",
            color: active ? COLORS.primary : (dark ? "rgba(255,255,255,0.38)" : "#bbb"),
            transition: "color 0.2s", position: "relative", minWidth: 52,
          }}>
            {/* Active pill background */}
            {active && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 44, height: 32, borderRadius: 10,
                background: `${COLORS.primary}18`,
                animation: "navPop 0.25s cubic-bezier(0.34,1.56,0.64,1)"
              }} />
            )}
            <div style={{ position: "relative", transform: active ? "translateY(-1px)" : "none", transition: "transform 0.2s" }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 400,
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: active ? 0 : 0.1,
              transition: "font-weight 0.2s"
            }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Utilitários ──────────────────────────────────────────────────────────────
function fmt(n, dec = 0) {
  if (n == null || isNaN(n)) return "—";
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtR(n) {
  if (n == null || isNaN(n)) return "—";
  return "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getBandeira(id) {
  return BANDEIRAS.find(b => b.id === id) || BANDEIRAS[0];
}

function Card({ children, style, dark }) {
  return (
    <div style={{
      background: dark ? COLORS.cardDark : "#fff",
      borderRadius: 16, padding: "16px",
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
      border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)",
      ...style
    }}>
      {children}
    </div>
  );
}

function Section({ title, dark, action, children }) {
  const color = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color, fontFamily: "'Nunito', sans-serif" }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Badge({ bandeira }) {
  const b = getBandeira(bandeira);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: b.bg, color: b.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      border: `1px solid ${b.color}33`
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, display: "inline-block" }} />
      {b.label}
    </span>
  );
}

function ProgressBar({ value, max, dark }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const color = pct >= 90 ? COLORS.red : pct >= 70 ? COLORS.amber : COLORS.primary;
  return (
    <div>
      <div style={{ height: 8, borderRadius: 8, background: dark ? "rgba(255,255,255,0.1)" : "#f0f0f0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 8, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.5)" : "#999" }}>{fmt(value)} / {fmt(max)} kWh</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ─── ABA: INÍCIO ─────────────────────────────────────────────────────────────
function AbaInicio({ leituras, config, dark, setAba }) {
  const sorted = [...leituras].sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano;
    return b.mes - a.mes;
  });
  const atual = sorted[0];
  const anterior = sorted[1];
  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";

  const mediaHistorica = leituras.length >= 3
    ? leituras.reduce((s, l) => s + (l.consumo || 0), 0) / leituras.length
    : null;

  const varPct = atual && anterior && anterior.consumo > 0
    ? ((atual.consumo - anterior.consumo) / anterior.consumo) * 100
    : null;

  const mediaUlt3 = sorted.length >= 3
    ? (sorted.slice(1, 4).reduce((s, l) => s + (l.consumo || 0), 0) / 3)
    : null;

  const acimaDaMedia = mediaHistorica && atual
    ? ((atual.consumo - mediaHistorica) / mediaHistorica) * 100
    : null;

  return (
    <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: subColor, fontFamily: "'Nunito', sans-serif" }}>
          {atual ? `${MESES[atual.mes - 1]} ${atual.ano}` : "Sem leituras ainda"}
        </div>
        <h1 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: textColor, fontFamily: "'Nunito', sans-serif" }}>
          Painel de Consumo
        </h1>
      </div>

      {/* Alerta acima da média */}
      {acimaDaMedia > 20 && (
        <div style={{
          background: `${COLORS.red}18`, border: `1px solid ${COLORS.red}40`,
          borderRadius: 12, padding: "12px 14px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10
        }}>
          <AlertTriangle size={18} color={COLORS.red} />
          <span style={{ fontSize: 13, color: COLORS.red, fontWeight: 600 }}>
            {acimaDaMedia.toFixed(0)}% acima da média histórica
          </span>
        </div>
      )}

      {/* Cards principais */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Card dark={dark} style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: subColor, marginBottom: 4 }}>Consumo</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.primary, fontFamily: "'Nunito', sans-serif" }}>
            {atual ? fmt(atual.consumo) : "—"}
          </div>
          <div style={{ fontSize: 12, color: subColor }}>kWh</div>
          {varPct !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
              {varPct > 0 ? <ArrowUp size={13} color={COLORS.red} /> : <ArrowDown size={13} color={COLORS.primary} />}
              <span style={{ fontSize: 12, color: varPct > 0 ? COLORS.red : COLORS.primary, fontWeight: 600 }}>
                {Math.abs(varPct).toFixed(1)}%
              </span>
            </div>
          )}
        </Card>
        <Card dark={dark} style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: subColor, marginBottom: 4 }}>Custo</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.blue, fontFamily: "'Nunito', sans-serif" }}>
            {atual ? fmtR(atual.valor) : "—"}
          </div>
          <div style={{ fontSize: 12, color: subColor }}>total do mês</div>
          {atual?.custoPorKwh && (
            <div style={{ fontSize: 12, color: subColor, marginTop: 6 }}>
              {fmtR(atual.custoPorKwh)}/kWh
            </div>
          )}
        </Card>
      </div>

      {/* Bandeira tarifária */}
      {atual && (
        <Card dark={dark} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: subColor, marginBottom: 4 }}>Bandeira tarifária</div>
              <Badge bandeira={atual.bandeira} />
            </div>
            <BatteryCharging size={28} color={getBandeira(atual.bandeira).color} />
          </div>
        </Card>
      )}

      {/* Meta mensal */}
      {config.metaKwh && atual && (
        <Card dark={dark} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: textColor }}>Meta mensal</div>
            <Target size={16} color={COLORS.primary} />
          </div>
          <ProgressBar value={atual.consumo || 0} max={config.metaKwh} dark={dark} />
        </Card>
      )}

      {/* Projeção */}
      {mediaUlt3 && (
        <Card dark={dark} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: subColor, marginBottom: 4 }}>Projeção próximo mês</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: textColor, fontFamily: "'Nunito', sans-serif" }}>
                ~{fmt(mediaUlt3)} kWh
              </div>
              <div style={{ fontSize: 12, color: subColor }}>baseado nos últimos 3 meses</div>
            </div>
            <TrendingUp size={28} color={COLORS.blue} />
          </div>
        </Card>
      )}

      {/* Estado vazio */}
      {leituras.length === 0 && (
        <Card dark={dark} style={{ textAlign: "center", padding: "36px 24px" }}>
          {/* SVG illustration */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 16 }}>
            <circle cx="40" cy="40" r="38" fill={dark ? "rgba(29,158,117,0.1)" : "#E1F5EE"} stroke={dark ? "rgba(29,158,117,0.25)" : "#A8DFC9"} strokeWidth="1.5"/>
            <path d="M46 16 L24 44 H38 L34 64 L56 36 H42 Z" fill={dark ? "rgba(29,158,117,0.35)" : "#5AC8A0"} />
            <path d="M46 16 L24 44 H38 L34 64 L56 36 H42 Z" fill="none" stroke={dark ? "rgba(29,158,117,0.7)" : "#1D9E75"} strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 800, color: textColor, marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
            Nenhuma leitura ainda
          </div>
          <div style={{ fontSize: 13, color: subColor, marginBottom: 20, lineHeight: 1.6 }}>
            Registre a primeira leitura do medidor para ver seu painel de consumo
          </div>
          <button onClick={() => setAba("leituras")} style={{
            background: COLORS.primary, color: "#fff", border: "none", borderRadius: 24,
            padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif", transition: "opacity 0.15s",
            display: "inline-flex", alignItems: "center", gap: 8
          }}>
            <Plus size={15} /> Registrar leitura
          </button>
        </Card>
      )}
    </div>
  );
}

// ─── ABA: LEITURAS ────────────────────────────────────────────────────────────
const mesAtual = new Date().getMonth() + 1;
const anoAtual = new Date().getFullYear();

function FormLeitura({ leituras, onSave, onCancel, editData, dark }) {
  const lastLeitura = leituras.length > 0
    ? [...leituras].sort((a,b) => b.ano - a.ano || b.mes - a.mes)[0]
    : null;

  const [form, setForm] = useState(editData || {
    mes: mesAtual,
    ano: anoAtual,
    leituraAtual: "",
    valor: "",
    bandeira: "verde",
    anotacao: "",
  });

  const consumo = lastLeitura && form.leituraAtual
    ? parseFloat(form.leituraAtual) - parseFloat(lastLeitura.leituraAtual || 0)
    : null;

  const custoPorKwh = consumo > 0 && form.valor
    ? parseFloat(form.valor) / consumo : null;

  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";
  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 15,
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e0e0e0"}`,
    background: dark ? "rgba(255,255,255,0.06)" : "#fafafa",
    color: textColor, boxSizing: "border-box", fontFamily: "'Nunito', sans-serif",
    outline: "none"
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 5, display: "block" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Mês</label>
          <select style={inputStyle} value={form.mes} onChange={e => setForm(p => ({ ...p, mes: +e.target.value }))}>
            {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ano</label>
          <input type="number" style={inputStyle} value={form.ano} onChange={e => setForm(p => ({ ...p, ano: +e.target.value }))} min={2000} max={2099} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Leitura do medidor (kWh)</label>
        <input type="number" style={inputStyle} placeholder="ex: 1245.3" value={form.leituraAtual}
          onChange={e => setForm(p => ({ ...p, leituraAtual: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Valor da conta (R$)</label>
        <input type="number" style={inputStyle} placeholder="ex: 187.50" value={form.valor}
          onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} />
      </div>
      {consumo !== null && consumo > 0 && (
        <div style={{
          background: `${COLORS.primary}18`, borderRadius: 10, padding: "10px 14px",
          marginBottom: 12, display: "flex", gap: 16
        }}>
          <div>
            <div style={{ fontSize: 11, color: subColor }}>Consumo calculado</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{fmt(consumo, 1)} kWh</div>
          </div>
          {custoPorKwh && (
            <div>
              <div style={{ fontSize: 11, color: subColor }}>Custo/kWh</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.blue }}>{fmtR(custoPorKwh)}</div>
            </div>
          )}
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Bandeira tarifária</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {BANDEIRAS.map(b => (
            <button key={b.id} onClick={() => setForm(p => ({ ...p, bandeira: b.id }))} style={{
              padding: "9px 12px", borderRadius: 10, border: `2px solid ${form.bandeira === b.id ? b.color : "transparent"}`,
              background: form.bandeira === b.id ? b.bg : (dark ? "rgba(255,255,255,0.06)" : "#f5f5f5"),
              color: form.bandeira === b.id ? b.color : subColor,
              fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'Nunito', sans-serif"
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: b.color }} />
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Anotação do mês</label>
        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
          placeholder="ex: Novo ar-condicionado, viagem, calor intenso..."
          value={form.anotacao}
          onChange={e => setForm(p => ({ ...p, anotacao: e.target.value }))} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e0e0e0"}`,
          background: "transparent", color: subColor, fontSize: 14, fontWeight: 600, cursor: "pointer",
          fontFamily: "'Nunito', sans-serif"
        }}>Cancelar</button>
        <button onClick={() => {
          if (!form.leituraAtual || !form.valor) return;
          const c = lastLeitura && !editData ? parseFloat(form.leituraAtual) - parseFloat(lastLeitura.leituraAtual || 0) : (editData?.consumo || 0);
          const ckwh = c > 0 ? parseFloat(form.valor) / c : null;
          onSave({ ...form, consumo: c > 0 ? c : null, custoPorKwh: ckwh, id: editData?.id || crypto.randomUUID() });
        }} style={{
          flex: 2, padding: "12px", borderRadius: 12, border: "none",
          background: COLORS.primary, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Nunito', sans-serif"
        }}>
          <Save size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          {editData ? "Salvar alterações" : "Registrar leitura"}
        </button>
      </div>
    </div>
  );
}

function AbaLeituras({ leituras, onSave, onDelete, dark }) {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";
  const sorted = [...leituras].sort((a,b) => b.ano - a.ano || b.mes - a.mes);

  if (showForm || editData) {
    return (
      <div style={{ animation: "fadeSlideIn 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => { setShowForm(false); setEditData(null); }} style={{
            background: "none", border: "none", cursor: "pointer", color: COLORS.primary, padding: 0
          }}>
            <X size={22} />
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: textColor, fontFamily: "'Nunito', sans-serif" }}>
            {editData ? "Editar leitura" : "Nova leitura"}
          </h2>
        </div>
        <Card dark={dark}>
          <FormLeitura leituras={leituras} onSave={(d) => { onSave(d); setShowForm(false); setEditData(null); }}
            onCancel={() => { setShowForm(false); setEditData(null); }} editData={editData} dark={dark} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: textColor, fontFamily: "'Nunito', sans-serif" }}>Leituras</h1>
        <button onClick={() => setShowForm(true)} style={{
          background: COLORS.primary, color: "#fff", border: "none", borderRadius: 22,
          padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito', sans-serif"
        }}>
          <Plus size={15} /> Nova
        </button>
      </div>

      {sorted.length === 0 ? (
        <Card dark={dark} style={{ textAlign: "center", padding: "36px 24px" }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ marginBottom: 14 }}>
            <circle cx="36" cy="36" r="34" fill={dark ? "rgba(55,138,221,0.1)" : "#EAF3FB"} stroke={dark ? "rgba(55,138,221,0.25)" : "#B5D4F4"} strokeWidth="1.5"/>
            <rect x="20" y="18" width="32" height="36" rx="4" fill={dark ? "rgba(55,138,221,0.2)" : "#D0E8F8"} stroke={dark ? "rgba(55,138,221,0.5)" : "#378ADD"} strokeWidth="1.5"/>
            <line x1="26" y1="27" x2="46" y2="27" stroke={dark ? "rgba(255,255,255,0.3)" : "#378ADD"} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="26" y1="33" x2="46" y2="33" stroke={dark ? "rgba(255,255,255,0.2)" : "#82B8E8"} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="26" y1="39" x2="38" y2="39" stroke={dark ? "rgba(255,255,255,0.2)" : "#82B8E8"} strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="50" cy="50" r="10" fill={COLORS.primary}/>
            <path d="M46 50 L49 53 L54 47" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 800, color: textColor, marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
            Nenhuma leitura registrada
          </div>
          <div style={{ fontSize: 13, color: subColor, marginBottom: 20, lineHeight: 1.6 }}>
            Adicione a leitura do seu medidor todo mês para acompanhar o consumo
          </div>
          <button onClick={() => setShowForm(true)} style={{
            background: COLORS.primary, color: "#fff", border: "none", borderRadius: 24,
            padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif", display: "inline-flex", alignItems: "center", gap: 8
          }}>
            <Plus size={15} /> Adicionar leitura
          </button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((l, i) => (
            <Card key={l.id} dark={dark} style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: textColor, fontFamily: "'Nunito', sans-serif" }}>
                    {MESES[l.mes - 1]} {l.ano}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <div>
                      <span style={{ fontSize: 11, color: subColor }}>Consumo</span>
                      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>{l.consumo ? fmt(l.consumo, 1) : "—"} <span style={{ fontSize: 12 }}>kWh</span></div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: subColor }}>Custo</span>
                      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.blue }}>{fmtR(l.valor)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge bandeira={l.bandeira} />
                    {l.custoPorKwh && <span style={{ fontSize: 12, color: subColor }}>{fmtR(l.custoPorKwh)}/kWh</span>}
                  </div>
                  {l.anotacao && (
                    <div style={{ marginTop: 8, fontSize: 12, color: subColor, fontStyle: "italic" }}>"{l.anotacao}"</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditData(l)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.blue, padding: 4 }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => { if (confirm("Excluir esta leitura?")) onDelete(l.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.red, padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ABA: EQUIPAMENTOS ────────────────────────────────────────────────────────
function FormEquipamento({ onSave, onCancel, editData, custoPorKwh, dark }) {
  const [form, setForm] = useState(editData || {
    nome: "", descricao: "", potencia: "", categoria: "outros", horasDia: "1"
  });
  const [horasSlider, setHorasSlider] = useState(parseFloat(editData?.horasDia || 1));

  const consumoMensal = form.potencia && horasSlider
    ? (parseFloat(form.potencia) / 1000) * horasSlider * 30
    : 0;
  const custoMensal = consumoMensal * (custoPorKwh || 0.75);
  const custoHora = (parseFloat(form.potencia || 0) / 1000) * (custoPorKwh || 0.75);

  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";
  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 15,
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e0e0e0"}`,
    background: dark ? "rgba(255,255,255,0.06)" : "#fafafa",
    color: textColor, boxSizing: "border-box", fontFamily: "'Nunito', sans-serif", outline: "none"
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 5, display: "block" };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Nome do equipamento</label>
        <input style={inputStyle} placeholder="ex: Ar-condicionado sala" value={form.nome}
          onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Categoria</label>
        <select style={inputStyle} value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}>
          {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Potência (W)</label>
          <input type="number" style={inputStyle} placeholder="ex: 1500" value={form.potencia}
            onChange={e => setForm(p => ({ ...p, potencia: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Horas/dia</label>
          <input type="number" style={inputStyle} placeholder="ex: 4" value={form.horasDia} step="0.5"
            onChange={e => { setForm(p => ({ ...p, horasDia: e.target.value })); setHorasSlider(parseFloat(e.target.value) || 0); }} />
        </div>
      </div>
      {consumoMensal > 0 && (
        <div style={{
          background: dark ? "rgba(29,158,117,0.12)" : "#E1F5EE",
          borderRadius: 12, padding: "12px 14px", marginBottom: 12,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8
        }}>
          <div>
            <div style={{ fontSize: 10, color: subColor }}>Consumo/mês</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary }}>{fmt(consumoMensal, 1)} kWh</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: subColor }}>Custo/mês</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.blue }}>{fmtR(custoMensal)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: subColor }}>Custo/hora</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.amber }}>{fmtR(custoHora)}</div>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Descrição (opcional)</label>
        <input style={inputStyle} placeholder="ex: Inverter 12.000 BTUs" value={form.descricao}
          onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e0e0e0"}`,
          background: "transparent", color: subColor, fontSize: 14, fontWeight: 600, cursor: "pointer",
          fontFamily: "'Nunito', sans-serif"
        }}>Cancelar</button>
        <button onClick={() => {
          if (!form.nome || !form.potencia) return;
          onSave({ ...form, id: editData?.id || crypto.randomUUID(), horasDia: parseFloat(form.horasDia) || 1 });
        }} style={{
          flex: 2, padding: 12, borderRadius: 12, border: "none",
          background: COLORS.primary, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Nunito', sans-serif"
        }}>
          <Save size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          {editData ? "Salvar" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}

function CardEquipamento({ eq, custoPorKwh, onEdit, onDelete, dark }) {
  const [simHoras, setSimHoras] = useState(eq.horasDia);
  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";
  const cat = CATEGORIAS.find(c => c.id === eq.categoria) || CATEGORIAS[4];

  const calcMensal = (h) => (parseFloat(eq.potencia) / 1000) * h * 30 * (custoPorKwh || 0.75);
  const originalMensal = calcMensal(eq.horasDia);
  const simMensal = calcMensal(simHoras);
  const economia = originalMensal - simMensal;

  return (
    <Card dark={dark} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: `${COLORS.primary}20`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>{cat.icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: textColor, fontFamily: "'Nunito', sans-serif" }}>{eq.nome}</div>
            <div style={{ fontSize: 12, color: subColor }}>{eq.potencia}W · {eq.horasDia}h/dia</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onEdit(eq)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.blue, padding: 4 }}>
            <Edit2 size={15} />
          </button>
          <button onClick={() => { if (confirm("Excluir este equipamento?")) onDelete(eq.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.red, padding: 4 }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f8f8f8", borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, color: subColor }}>Custo/mês</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.blue }}>{fmtR(originalMensal)}</div>
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f8f8f8", borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, color: subColor }}>Custo/hora</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.amber }}>
            {fmtR((parseFloat(eq.potencia) / 1000) * (custoPorKwh || 0.75))}
          </div>
        </div>
      </div>
      {/* Simulador */}
      <div style={{ borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#f0f0f0"}`, paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: subColor, fontWeight: 600 }}>SIMULADOR DE ECONOMIA</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: simHoras < eq.horasDia ? COLORS.primary : COLORS.red }}>
            {economia > 0 ? `- ${fmtR(economia)}/mês` : `+ ${fmtR(-economia)}/mês`}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="range" min={0} max={24} step={0.5} value={simHoras}
            onChange={e => setSimHoras(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: COLORS.primary }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: textColor, minWidth: 40 }}>{simHoras}h/dia</span>
        </div>
      </div>
    </Card>
  );
}

function AbaEquipamentos({ equipamentos, onSave, onDelete, custoPorKwh, dark }) {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewMode, setViewMode] = useState("ranking"); // "ranking" | "categoria"
  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";

  const calcMensal = (eq) => (parseFloat(eq.potencia) / 1000) * eq.horasDia * 30 * (custoPorKwh || 0.75);

  const sorted = [...equipamentos].sort((a, b) => calcMensal(b) - calcMensal(a));

  const totalMensal = sorted.reduce((s, eq) => s + calcMensal(eq), 0);

  // Agrupamento por categoria
  const porCategoria = CATEGORIAS.map(cat => ({
    ...cat,
    itens: sorted.filter(eq => eq.categoria === cat.id),
  })).filter(cat => cat.itens.length > 0);

  if (showForm || editData) {
    return (
      <div style={{ animation: "fadeSlideIn 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => { setShowForm(false); setEditData(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.primary, padding: 0 }}>
            <X size={22} />
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: textColor, fontFamily: "'Nunito', sans-serif" }}>
            {editData ? "Editar equipamento" : "Novo equipamento"}
          </h2>
        </div>
        <Card dark={dark}>
          <FormEquipamento onSave={(d) => { onSave(d); setShowForm(false); setEditData(null); }}
            onCancel={() => { setShowForm(false); setEditData(null); }}
            editData={editData} custoPorKwh={custoPorKwh} dark={dark} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: textColor, fontFamily: "'Nunito', sans-serif" }}>Equipamentos</h1>
        <button onClick={() => setShowForm(true)} style={{
          background: COLORS.primary, color: "#fff", border: "none", borderRadius: 22,
          padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito', sans-serif"
        }}>
          <Plus size={15} /> Novo
        </button>
      </div>

      {sorted.length === 0 ? (
        <Card dark={dark} style={{ textAlign: "center", padding: "36px 24px" }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ marginBottom: 14 }}>
            <circle cx="36" cy="36" r="34" fill={dark ? "rgba(239,159,39,0.1)" : "#FAEEDA"} stroke={dark ? "rgba(239,159,39,0.25)" : "#FAC775"} strokeWidth="1.5"/>
            <rect x="22" y="26" width="28" height="20" rx="3" fill={dark ? "rgba(239,159,39,0.2)" : "#FDDCA8"} stroke={COLORS.amber} strokeWidth="1.5"/>
            <line x1="36" y1="22" x2="36" y2="26" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round"/>
            <circle cx="36" cy="20" r="3" fill={COLORS.amber}/>
            <line x1="36" y1="46" x2="36" y2="50" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round"/>
            <line x1="22" y1="36" x2="18" y2="36" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round"/>
            <line x1="50" y1="36" x2="54" y2="36" stroke={COLORS.amber} strokeWidth="2" strokeLinecap="round"/>
            <circle cx="36" cy="36" r="5" fill={COLORS.amber} opacity="0.7"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 800, color: textColor, marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
            Nenhum equipamento cadastrado
          </div>
          <div style={{ fontSize: 13, color: subColor, marginBottom: 20, lineHeight: 1.6 }}>
            Cadastre seus aparelhos para calcular o consumo e descobrir quais pesam mais na conta
          </div>
          <button onClick={() => setShowForm(true)} style={{
            background: COLORS.amber, color: "#fff", border: "none", borderRadius: 24,
            padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif", display: "inline-flex", alignItems: "center", gap: 8
          }}>
            <Plus size={15} /> Adicionar equipamento
          </button>
        </Card>
      ) : (
        <>
          {/* Custo total estimado */}
          <Card dark={dark} style={{ marginBottom: 16, padding: "12px 16px", background: dark ? "rgba(29,158,117,0.12)" : "#E1F5EE", border: `1px solid ${COLORS.primary}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: subColor }}>Custo estimado total/mês</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary, fontFamily: "'Nunito', sans-serif" }}>{fmtR(totalMensal)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: subColor }}>{sorted.length} equipamento{sorted.length > 1 ? "s" : ""}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: subColor }}>{fmt(sorted.reduce((s,e) => s + (parseFloat(e.potencia)/1000)*e.horasDia*30, 0), 1)} kWh/mês</div>
              </div>
            </div>
          </Card>

          {/* Toggle de visualização */}
          <div style={{
            display: "flex", background: dark ? "rgba(255,255,255,0.07)" : "#f0f0f0",
            borderRadius: 12, padding: 3, marginBottom: 16, gap: 2
          }}>
            {[{ id: "ranking", label: "🏆 Ranking" }, { id: "categoria", label: "📂 Categorias" }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                flex: 1, padding: "7px 10px", borderRadius: 10, border: "none",
                background: viewMode === v.id ? (dark ? COLORS.cardDark : "#fff") : "transparent",
                color: viewMode === v.id ? textColor : subColor,
                fontSize: 13, fontWeight: viewMode === v.id ? 700 : 400,
                cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                boxShadow: viewMode === v.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s"
              }}>{v.label}</button>
            ))}
          </div>

          {/* RANKING */}
          {viewMode === "ranking" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sorted.map((eq, i) => {
                const mensal = calcMensal(eq);
                const pct = totalMensal > 0 ? (mensal / totalMensal) * 100 : 0;
                const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                const cat = CATEGORIAS.find(c => c.id === eq.categoria) || CATEGORIAS[4];
                return (
                  <Card key={eq.id} dark={dark} style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      {/* Posição */}
                      <div style={{
                        minWidth: 28, height: 28, borderRadius: 8,
                        background: i < 3 ? `${COLORS.amber}20` : (dark ? "rgba(255,255,255,0.07)" : "#f5f5f5"),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: medalha ? 16 : 13, fontWeight: 700,
                        color: i < 3 ? COLORS.amber : subColor,
                      }}>
                        {medalha || `#${i + 1}`}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {eq.nome}
                        </div>
                        <div style={{ fontSize: 11, color: subColor }}>{cat.icon} {cat.label} · {eq.potencia}W · {eq.horasDia}h/dia</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.blue }}>{fmtR(mensal)}/mês</div>
                        <div style={{ fontSize: 11, color: subColor }}>{pct.toFixed(1)}% do total</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button onClick={() => setEditData(eq)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.blue, padding: 2 }}><Edit2 size={14} /></button>
                        <button onClick={() => { if (confirm("Excluir?")) onDelete(eq.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.red, padding: 2 }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    {/* Barra de proporção */}
                    <div style={{ height: 4, borderRadius: 4, background: dark ? "rgba(255,255,255,0.08)" : "#f0f0f0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? COLORS.red : i === 1 ? COLORS.amber : COLORS.blue, borderRadius: 4, transition: "width 0.5s ease" }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* POR CATEGORIA */}
          {viewMode === "categoria" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {porCategoria.map(cat => {
                const totalCat = cat.itens.reduce((s, eq) => s + calcMensal(eq), 0);
                return (
                  <div key={cat.id}>
                    {/* Header da categoria */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{cat.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: textColor, fontFamily: "'Nunito', sans-serif" }}>{cat.label}</span>
                      <span style={{
                        fontSize: 11, background: `${COLORS.primary}20`, color: COLORS.primary,
                        padding: "2px 8px", borderRadius: 20, fontWeight: 600
                      }}>{fmtR(totalCat)}/mês</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {cat.itens.map(eq => (
                        <CardEquipamento key={eq.id} eq={eq} custoPorKwh={custoPorKwh}
                          onEdit={setEditData} onDelete={onDelete} dark={dark} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Carrega script externo dinamicamente ─────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Hook: Lembrete mensal via Web Notifications ──────────────────────────────
function useNotificacaoLembrete(diaLembrete) {
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!diaLembrete) return;

    const LS_NOTIF_KEY = "luzcontrol_notif_last";
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesAno = `${hoje.getFullYear()}-${hoje.getMonth() + 1}`;

    if (diaHoje !== diaLembrete) return;

    const ultimo = localStorage.getItem(LS_NOTIF_KEY);
    if (ultimo === mesAno) return; // já notificou este mês

    // Pequeno delay para não disparar imediatamente ao montar
    const t = setTimeout(() => {
      try {
        new Notification("LuzControl ⚡", {
          body: "Lembre-se de registrar a leitura do medidor deste mês!",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          tag: "leitura-mensal",
        });
        localStorage.setItem(LS_NOTIF_KEY, mesAno);
      } catch {}
    }, 2000);

    return () => clearTimeout(t);
  }, [diaLembrete]);
}

// ─── ABA: RELATÓRIOS ─────────────────────────────────────────────────────────
function AbaRelatorios({ leituras, dark }) {
  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";
  const gridColor = dark ? "rgba(255,255,255,0.07)" : "#f0f0f0";
  const anos = [...new Set(leituras.map(l => l.ano))].sort((a,b) => b - a);
  const [anoSel, setAnoSel] = useState(anoAtual);
  const [exportando, setExportando] = useState(false);
  const relatorioRef = useRef(null);

  const exportarPDF = async () => {
    setExportando(true);
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const el = relatorioRef.current;
      if (!el) return;
      const canvas = await window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: dark ? "#0f1923" : "#f4f6f8" });
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`LuzControl_${anoSel}.pdf`);
    } catch (e) {
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExportando(false);
    }
  };

  const dadosAno = leituras.filter(l => l.ano === anoSel)
    .sort((a,b) => a.mes - b.mes)
    .map(l => ({ mes: MESES[l.mes-1], kwh: l.consumo || 0, reais: parseFloat(l.valor) || 0, cKwh: l.custoPorKwh || 0 }));

  const stats = leituras.length > 0 ? {
    maxKwh: Math.max(...leituras.map(l => l.consumo || 0)),
    minKwh: Math.min(...leituras.filter(l => l.consumo).map(l => l.consumo)),
    mediaKwh: leituras.filter(l=>l.consumo).reduce((s,l) => s + l.consumo, 0) / leituras.filter(l=>l.consumo).length,
    mediaReais: leituras.reduce((s,l) => s + parseFloat(l.valor || 0), 0) / leituras.length,
  } : null;

  const porBandeira = BANDEIRAS.map(b => {
    const ls = leituras.filter(l => l.bandeira === b.id && l.consumo);
    return {
      ...b,
      count: ls.length,
      mediaKwh: ls.length ? ls.reduce((s,l) => s+l.consumo,0)/ls.length : 0,
      mediaReais: ls.length ? ls.reduce((s,l) => s+parseFloat(l.valor||0),0)/ls.length : 0
    };
  }).filter(b => b.count > 0);

  // Heatmap anual
  const heatmapData = MESES.map((m, i) => {
    const l = leituras.find(l => l.ano === anoSel && l.mes === i+1);
    return { mes: m, consumo: l?.consumo || 0 };
  });
  const maxHeat = Math.max(...heatmapData.map(d => d.consumo), 1);

  const inputStyle = {
    padding: "8px 14px", borderRadius: 10, fontSize: 14,
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e0e0e0"}`,
    background: dark ? "rgba(255,255,255,0.06)" : "#fafafa",
    color: textColor, fontFamily: "'Nunito', sans-serif", outline: "none"
  };

  if (leituras.length === 0) {
    return (
      <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: textColor, fontFamily: "'Nunito', sans-serif", marginBottom: 20 }}>Relatórios</h1>
        <Card dark={dark} style={{ textAlign: "center", padding: "36px 24px" }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ marginBottom: 14 }}>
            <circle cx="36" cy="36" r="34" fill={dark ? "rgba(29,158,117,0.08)" : "#E1F5EE"} stroke={dark ? "rgba(29,158,117,0.2)" : "#A8DFC9"} strokeWidth="1.5"/>
            <rect x="16" y="44" width="8" height="14" rx="2" fill={dark ? "rgba(29,158,117,0.3)" : "#A8DFC9"}/>
            <rect x="28" y="34" width="8" height="24" rx="2" fill={dark ? "rgba(29,158,117,0.5)" : "#5AC8A0"}/>
            <rect x="40" y="24" width="8" height="34" rx="2" fill={COLORS.primary}/>
            <line x1="14" y1="58" x2="58" y2="58" stroke={dark ? "rgba(255,255,255,0.15)" : "#C8E6D8"} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 800, color: textColor, marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
            Sem dados suficientes
          </div>
          <div style={{ fontSize: 13, color: subColor, lineHeight: 1.6 }}>
            Registre pelo menos uma leitura para visualizar os relatórios e gráficos
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: textColor, fontFamily: "'Nunito', sans-serif" }}>Relatórios</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select style={inputStyle} value={anoSel} onChange={e => setAnoSel(+e.target.value)}>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={exportarPDF} disabled={exportando} style={{
            background: exportando ? "#ccc" : COLORS.primary, color: "#fff", border: "none",
            borderRadius: 10, padding: "8px 10px", cursor: exportando ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
            fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap"
          }}>
            <Download size={14} />
            {exportando ? "..." : "PDF"}
          </button>
        </div>
      </div>
      <div ref={relatorioRef}>

      {/* Gráfico de linha - kWh */}
      <Section title="Consumo mensal (kWh)" dark={dark}>
        <Card dark={dark}>
          {dadosAno.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dadosAno} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: subColor }} />
                <YAxis tick={{ fontSize: 10, fill: subColor }} />
                <Tooltip contentStyle={{ background: dark ? COLORS.cardDark : "#fff", border: "none", borderRadius: 10, fontSize: 12 }} />
                <Line type="monotone" dataKey="kwh" stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.primary }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: subColor, fontSize: 13 }}>Sem dados para {anoSel}</div>
          )}
        </Card>
      </Section>

      {/* Gráfico de barras - R$ */}
      <Section title="Custo mensal (R$)" dark={dark}>
        <Card dark={dark}>
          {dadosAno.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dadosAno} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: subColor }} />
                <YAxis tick={{ fontSize: 10, fill: subColor }} />
                <Tooltip contentStyle={{ background: dark ? COLORS.cardDark : "#fff", border: "none", borderRadius: 10, fontSize: 12 }}
                  formatter={v => fmtR(v)} />
                <Bar dataKey="reais" fill={COLORS.blue} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: subColor, fontSize: 13 }}>Sem dados para {anoSel}</div>
          )}
        </Card>
      </Section>

      {/* Heatmap anual */}
      <Section title={`Mapa de calor — ${anoSel}`} dark={dark}>
        <Card dark={dark}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
            {heatmapData.map((d, i) => {
              const intensity = d.consumo / maxHeat;
              const bg = d.consumo === 0
                ? (dark ? "rgba(255,255,255,0.05)" : "#f5f5f5")
                : `rgba(29,158,117,${0.15 + intensity * 0.85})`;
              return (
                <div key={i} style={{ background: bg, borderRadius: 8, padding: "10px 4px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: d.consumo > 0 ? "#fff" : subColor }}>{d.mes}</div>
                  <div style={{ fontSize: 10, color: d.consumo > 0 ? "rgba(255,255,255,0.8)" : subColor }}>
                    {d.consumo > 0 ? fmt(d.consumo) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Section>

      {/* Estatísticas */}
      {stats && (
        <Section title="Resumo estatístico" dark={dark}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Maior consumo", value: `${fmt(stats.maxKwh)} kWh`, color: COLORS.red },
              { label: "Menor consumo", value: `${fmt(stats.minKwh)} kWh`, color: COLORS.primary },
              { label: "Média kWh", value: `${fmt(stats.mediaKwh, 1)} kWh`, color: COLORS.blue },
              { label: "Média R$", value: fmtR(stats.mediaReais), color: COLORS.amber },
            ].map((s, i) => (
              <Card key={i} dark={dark} style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: subColor, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'Nunito', sans-serif" }}>{s.value}</div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Gráfico de linha - custo por kWh */}
      <Section title="Custo médio por kWh (R$/kWh)" dark={dark}>
        <Card dark={dark}>
          {dadosAno.filter(d => d.cKwh > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dadosAno} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: subColor }} />
                <YAxis tick={{ fontSize: 10, fill: subColor }} tickFormatter={v => `R$${v.toFixed(2)}`} />
                <Tooltip contentStyle={{ background: dark ? COLORS.cardDark : "#fff", border: "none", borderRadius: 10, fontSize: 12 }}
                  formatter={v => [fmtR(v), "R$/kWh"]} />
                <Line type="monotone" dataKey="cKwh" stroke={COLORS.amber} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.amber }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: subColor, fontSize: 13 }}>Sem dados para {anoSel}</div>
          )}
        </Card>
      </Section>

      {/* Por bandeira */}
      {porBandeira.length > 0 && (
        <Section title="Média por bandeira" dark={dark}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {porBandeira.map(b => (
              <Card key={b.id} dark={dark} style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: b.color, display: "inline-block" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{b.label}</span>
                    <span style={{ fontSize: 11, color: subColor }}>({b.count}x)</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary }}>{fmt(b.mediaKwh, 1)} kWh</div>
                    <div style={{ fontSize: 12, color: subColor }}>{fmtR(b.mediaReais)}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}
      </div>{/* fim relatorioRef */}
    </div>
  );
}

// ─── Componente: Configuração de notificação ─────────────────────────────────
function NotificacaoConfig({ config, setConfig, dark, toast }) {
  const [permissao, setPermissao] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 15,
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e0e0e0"}`,
    background: dark ? "rgba(255,255,255,0.06)" : "#fafafa",
    color: textColor, boxSizing: "border-box", fontFamily: "'Nunito', sans-serif", outline: "none"
  };

  const solicitarPermissao = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermissao(result);
    if (result === "granted") {
      toast("Notificações ativadas!");
      // Notificação de teste imediata
      new Notification("LuzControl ⚡", {
        body: "Lembrete mensal ativado com sucesso!",
        icon: "/icons/icon-192.png",
        tag: "teste",
      });
    } else {
      toast("Permissão negada pelo navegador", "warn");
    }
  };

  const StatusBadge = () => {
    if (permissao === "unsupported")
      return <span style={{ fontSize: 12, color: subColor }}>Não suportado neste navegador</span>;
    if (permissao === "granted")
      return (
        <span style={{ fontSize: 12, background: `${COLORS.primary}20`, color: COLORS.primary,
          padding: "3px 10px", borderRadius: 20, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Check size={11} /> Ativas
        </span>
      );
    if (permissao === "denied")
      return (
        <span style={{ fontSize: 12, background: `${COLORS.red}18`, color: COLORS.red,
          padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
          Bloqueadas
        </span>
      );
    return (
      <span style={{ fontSize: 12, background: `${COLORS.amber}18`, color: COLORS.amber,
        padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
        Não solicitado
      </span>
    );
  };

  return (
    <div>
      {/* Status + botão de ativar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {permissao === "granted"
            ? <Bell size={16} color={COLORS.primary} />
            : <BellOff size={16} color={subColor} />}
          <span style={{ fontSize: 14, color: textColor }}>Notificações</span>
        </div>
        <StatusBadge />
      </div>

      {permissao === "denied" && (
        <div style={{ fontSize: 12, color: COLORS.red, background: `${COLORS.red}10`,
          borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
          As notificações estão bloqueadas. Acesse as configurações do navegador para permitir.
        </div>
      )}

      {(permissao === "default" || permissao === "prompt") && (
        <button onClick={solicitarPermissao} style={{
          width: "100%", padding: "10px 16px", borderRadius: 12, border: "none",
          background: COLORS.primary, color: "#fff", fontSize: 14, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, fontFamily: "'Nunito', sans-serif", marginBottom: 14
        }}>
          <Bell size={15} /> Ativar lembretes mensais
        </button>
      )}

      {/* Seletor de dia */}
      {permissao === "granted" && (
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 6, display: "block" }}>
            Dia do mês para lembrete
          </label>
          <select style={inputStyle} value={config.diaLembrete || 5}
            onChange={e => {
              setConfig(p => ({ ...p, diaLembrete: +e.target.value }));
              toast("Dia do lembrete atualizado!");
            }}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>Dia {d}</option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: subColor, marginTop: 6 }}>
            Você receberá um aviso todo dia {config.diaLembrete || 5} para registrar a leitura.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ABA: CONFIGURAÇÕES ───────────────────────────────────────────────────────
function AbaConfig({ config, setConfig, perfis, perfilAtivo, onAddPerfil, onSwitchPerfil, onDeletePerfil, dark, onClearData, toast }) {
  const [novoPerfil, setNovoPerfil] = useState("");
  const textColor = dark ? "rgba(255,255,255,0.9)" : "#1a1a1a";
  const subColor = dark ? "rgba(255,255,255,0.5)" : "#888";
  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 15,
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#e0e0e0"}`,
    background: dark ? "rgba(255,255,255,0.06)" : "#fafafa",
    color: textColor, boxSizing: "border-box", fontFamily: "'Nunito', sans-serif", outline: "none"
  };

  return (
    <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
      <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: textColor, fontFamily: "'Nunito', sans-serif" }}>Configurações</h1>

      {/* Tema */}
      <Section title="Aparência" dark={dark}>
        <Card dark={dark}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {dark ? <Moon size={18} color={subColor} /> : <Sun size={18} color={COLORS.amber} />}
              <span style={{ fontSize: 14, color: textColor }}>Tema {dark ? "escuro" : "claro"}</span>
            </div>
            <button onClick={() => setConfig(p => ({ ...p, tema: p.tema === "claro" ? "escuro" : "claro" }))} style={{
              width: 48, height: 26, borderRadius: 13,
              background: dark ? COLORS.primary : "#ddd",
              border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s"
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3, left: dark ? 24 : 4, transition: "left 0.2s"
              }} />
            </button>
          </div>
        </Card>
      </Section>

      {/* Metas */}
      <Section title="Meta mensal" dark={dark}>
        <Card dark={dark}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 5, display: "block" }}>Meta em kWh</label>
              <input type="number" style={inputStyle} placeholder="ex: 200" value={config.metaKwh || ""}
                onChange={e => setConfig(p => ({ ...p, metaKwh: e.target.value ? +e.target.value : null }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 5, display: "block" }}>Meta em R$</label>
              <input type="number" style={inputStyle} placeholder="ex: 150" value={config.metaReais || ""}
                onChange={e => setConfig(p => ({ ...p, metaReais: e.target.value ? +e.target.value : null }))} />
            </div>
          </div>
        </Card>
      </Section>

      {/* Lembrete mensal */}
      <Section title="Lembrete mensal" dark={dark}>
        <Card dark={dark}>
          <NotificacaoConfig config={config} setConfig={setConfig} dark={dark} toast={toast} />
        </Card>
      </Section>

      {/* Tarifa */}
      <Section title="Tarifa base" dark={dark}>
        <Card dark={dark}>
          <label style={{ fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 5, display: "block" }}>R$/kWh (quando sem leituras suficientes)</label>
          <input type="number" style={inputStyle} step="0.01" placeholder="ex: 0.75" value={config.tarifaBase || ""}
            onChange={e => setConfig(p => ({ ...p, tarifaBase: +e.target.value }))} />
        </Card>
      </Section>

      {/* Perfis */}
      <Section title="Residências" dark={dark}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {perfis.map(p => (
            <Card key={p.id} dark={dark} style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Building2 size={16} color={p.id === perfilAtivo ? COLORS.primary : subColor} />
                  <span style={{ fontSize: 14, fontWeight: p.id === perfilAtivo ? 700 : 400, color: p.id === perfilAtivo ? textColor : subColor }}>
                    {p.nome}
                  </span>
                  {p.id === perfilAtivo && (
                    <span style={{ fontSize: 11, background: `${COLORS.primary}20`, color: COLORS.primary, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>ativo</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {p.id !== perfilAtivo && (
                    <button onClick={() => onSwitchPerfil(p.id)} style={{
                      background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8,
                      padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito', sans-serif"
                    }}>Usar</button>
                  )}
                  {perfis.length > 1 && p.id !== perfilAtivo && (
                    <button onClick={() => { if (confirm("Excluir esta residência e todos os seus dados?")) onDeletePerfil(p.id); }} style={{
                      background: "none", border: "none", cursor: "pointer", color: COLORS.red, padding: 4
                    }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          <Card dark={dark} style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1, padding: "8px 12px" }} placeholder="Nome da nova residência"
                value={novoPerfil} onChange={e => setNovoPerfil(e.target.value)} />
              <button onClick={() => {
                if (!novoPerfil.trim()) return;
                onAddPerfil(novoPerfil.trim());
                setNovoPerfil("");
                toast("Residência adicionada!");
              }} style={{
                background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10,
                padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito', sans-serif"
              }}>
                <Plus size={15} />
              </button>
            </div>
          </Card>
        </div>
      </Section>

      {/* Limpar dados */}
      <Section title="Dados" dark={dark}>
        <Card dark={dark}>
          <button onClick={() => {
            if (confirm("⚠️ Isso irá apagar TODOS os dados do app. Confirmar?")) {
              onClearData();
              toast("Todos os dados foram apagados", "warn");
            }
          }} style={{
            width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${COLORS.red}40`,
            background: `${COLORS.red}10`, color: COLORS.red, fontSize: 14, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "'Nunito', sans-serif"
          }}>
            <Trash2 size={16} /> Limpar todos os dados
          </button>
        </Card>
      </Section>

      {/* Info */}
      <Card dark={dark} style={{ textAlign: "center", padding: 20 }}>
        <Zap size={28} color={COLORS.primary} fill={COLORS.primary} />
        <div style={{ fontSize: 16, fontWeight: 700, color: textColor, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>LuzControl</div>
        <div style={{ fontSize: 12, color: subColor }}>v1.0.0 · Controle inteligente do seu consumo elétrico</div>
        <div style={{ fontSize: 11, color: subColor, marginTop: 6 }}>Todos os dados são salvos localmente no seu dispositivo</div>
      </Card>
    </div>
  );
}

// ─── App Principal ────────────────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash] = useState(true);
  const [aba, setAba] = useState("inicio");
  const [appData, setAppData] = useState(() => loadData() || defaultState());
  const { toasts, add: toast } = useToast();

  const config = appData.configuracoes;
  const dark = config.tema === "escuro";
  const perfilAtivo = appData.perfilAtivo;
  const dadosPerfil = appData.dados[perfilAtivo] || { leituras: [], equipamentos: [] };
  const leituras = dadosPerfil.leituras || [];
  const equipamentos = dadosPerfil.equipamentos || [];

  // Custo médio por kWh dos últimos meses
  const custoPorKwh = useMemo(() => {
    const recentes = leituras.filter(l => l.custoPorKwh).slice(-3);
    if (recentes.length === 0) return config.tarifaBase || 0.75;
    return recentes.reduce((s, l) => s + l.custoPorKwh, 0) / recentes.length;
  }, [leituras, config.tarifaBase]);

  // Persist
  useEffect(() => {
    saveData(appData);
  }, [appData]);

  // Lembrete mensal via notificação
  useNotificacaoLembrete(config.diaLembrete);

  const setConfig = useCallback((fn) => {
    setAppData(p => ({ ...p, configuracoes: typeof fn === "function" ? fn(p.configuracoes) : fn }));
  }, []);

  const updateDados = useCallback((fn) => {
    setAppData(p => ({
      ...p,
      dados: { ...p.dados, [p.perfilAtivo]: fn(p.dados[p.perfilAtivo] || { leituras: [], equipamentos: [] }) }
    }));
  }, []);

  const saveLeitura = useCallback((d) => {
    updateDados(prev => {
      const exists = prev.leituras.find(l => l.id === d.id);
      const leituras = exists
        ? prev.leituras.map(l => l.id === d.id ? d : l)
        : [...prev.leituras, d];
      return { ...prev, leituras };
    });
    toast(d.id && dadosPerfil.leituras.find(l => l.id === d.id) ? "Leitura atualizada!" : "Leitura registrada!");
  }, [updateDados, toast, dadosPerfil.leituras]);

  const deleteLeitura = useCallback((id) => {
    updateDados(prev => ({ ...prev, leituras: prev.leituras.filter(l => l.id !== id) }));
    toast("Leitura excluída", "warn");
  }, [updateDados, toast]);

  const saveEquipamento = useCallback((d) => {
    updateDados(prev => {
      const exists = prev.equipamentos.find(e => e.id === d.id);
      const equipamentos = exists
        ? prev.equipamentos.map(e => e.id === d.id ? d : e)
        : [...prev.equipamentos, d];
      return { ...prev, equipamentos };
    });
    toast(dadosPerfil.equipamentos.find(e => e.id === d.id) ? "Equipamento atualizado!" : "Equipamento adicionado!");
  }, [updateDados, toast, dadosPerfil.equipamentos]);

  const deleteEquipamento = useCallback((id) => {
    updateDados(prev => ({ ...prev, equipamentos: prev.equipamentos.filter(e => e.id !== id) }));
    toast("Equipamento excluído", "warn");
  }, [updateDados, toast]);

  const addPerfil = useCallback((nome) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    setAppData(p => ({
      ...p,
      perfis: [...p.perfis, { id, nome }],
      dados: { ...p.dados, [id]: { leituras: [], equipamentos: [] } }
    }));
  }, []);

  const switchPerfil = useCallback((id) => {
    setAppData(p => ({ ...p, perfilAtivo: id }));
    toast("Residência alterada!");
  }, [toast]);

  const deletePerfil = useCallback((id) => {
    setAppData(p => {
      const { [id]: _, ...restDados } = p.dados;
      return { ...p, perfis: p.perfis.filter(pf => pf.id !== id), dados: restDados };
    });
    toast("Residência excluída", "warn");
  }, [toast]);

  const clearData = useCallback(() => {
    const fresh = defaultState();
    setAppData(fresh);
    localStorage.removeItem(LS_KEY);
  }, []);

  const bg = dark ? COLORS.bgDark : "#f4f6f8";
  const contentBg = dark ? COLORS.bgDark : "#f4f6f8";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: ${bg}; font-family: 'Nunito', sans-serif; transition: background 0.3s ease; overflow-x: hidden; }
        #root { min-height: 100vh; background: ${bg}; transition: background 0.3s ease; }

        /* Scrollbar slim */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}; border-radius: 4px; }

        /* Range slider */
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 4px; background: ${dark ? "rgba(255,255,255,0.12)" : "#e0e0e0"}; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${COLORS.primary}; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.15s; }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: ${COLORS.primary}; border: 2px solid #fff; cursor: pointer; }

        /* Select */
        select option { background: ${dark ? "#1a2535" : "#fff"}; color: ${dark ? "#fff" : "#1a1a1a"}; }

        /* Inputs focus */
        input:focus, select:focus, textarea:focus { outline: none; border-color: ${COLORS.primary} !important; box-shadow: 0 0 0 3px ${COLORS.primary}22 !important; }

        /* Animations */
        @keyframes splashLogo { from { opacity:0; transform:scale(0.4) rotate(-10deg) } to { opacity:1; transform:scale(1) rotate(0deg) } }
        @keyframes splashText { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes splashPulse { 0%,100% { box-shadow: 0 0 40px rgba(29,158,117,0.3) } 50% { box-shadow: 0 0 70px rgba(29,158,117,0.6) } }
        @keyframes splashOut { from { opacity:1; transform:scale(1) } to { opacity:0; transform:scale(1.04); pointer-events:none } }
        @keyframes toastIn { from { opacity:0; transform:translateY(14px) scale(0.88) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeSlideInRight { from { opacity:0; transform:translateX(22px) } to { opacity:1; transform:translateX(0) } }
        @keyframes fadeSlideInLeft { from { opacity:0; transform:translateX(-22px) } to { opacity:1; transform:translateX(0) } }
        @keyframes navPop { from { transform:scaleX(0) } to { transform:scaleX(1) } }
        @keyframes cardIn { from { opacity:0; transform:translateY(12px) scale(0.98) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }
        @keyframes bounceIn { 0% { transform:scale(0.3) } 50% { transform:scale(1.08) } 100% { transform:scale(1) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>

      {splash && <SplashScreen onDone={() => setSplash(false)} />}

      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: contentBg, position: "relative" }}>

        {/* Pill de perfil ativo no topo */}
        {!splash && appData.perfis.length > 1 && (
          <div style={{
            position: "sticky", top: 0, zIndex: 50,
            display: "flex", justifyContent: "center", padding: "10px 16px 0",
            pointerEvents: "none"
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: dark ? "rgba(26,37,53,0.9)" : "rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"}`,
              borderRadius: 20, padding: "5px 14px", pointerEvents: "auto"
            }}>
              <Building2 size={12} color={COLORS.primary} />
              <span style={{ fontSize: 12, fontWeight: 600, color: dark ? "rgba(255,255,255,0.8)" : "#444", fontFamily: "'Nunito', sans-serif" }}>
                {appData.perfis.find(p => p.id === perfilAtivo)?.nome || "Residência"}
              </span>
            </div>
          </div>
        )}

        <div style={{ padding: "20px 16px 88px" }}>
          {/* Animated tab content — key forces remount + animation on tab change */}
          <div key={aba} style={{ animation: "fadeSlideIn 0.32s cubic-bezier(0.22,1,0.36,1)" }}>
            {aba === "inicio" && <AbaInicio leituras={leituras} config={config} dark={dark} setAba={setAba} />}
            {aba === "leituras" && <AbaLeituras leituras={leituras} onSave={saveLeitura} onDelete={deleteLeitura} dark={dark} />}
            {aba === "equipamentos" && <AbaEquipamentos equipamentos={equipamentos} onSave={saveEquipamento} onDelete={deleteEquipamento} custoPorKwh={custoPorKwh} dark={dark} />}
            {aba === "relatorios" && <AbaRelatorios leituras={leituras} dark={dark} />}
            {aba === "config" && <AbaConfig config={config} setConfig={setConfig} perfis={appData.perfis} perfilAtivo={perfilAtivo}
              onAddPerfil={addPerfil} onSwitchPerfil={switchPerfil} onDeletePerfil={deletePerfil}
              dark={dark} onClearData={clearData} toast={toast} />}
          </div>
        </div>

        <NavBar aba={aba} setAba={setAba} dark={dark} />
      </div>

      <Toast toasts={toasts} />
    </>
  );
}
