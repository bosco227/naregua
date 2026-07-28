"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { MapView } from "./MapView";

type Status = "pendente" | "confirmado" | "concluido";
type Barber = {
  id: number;
  shopId: number;
  name: string;
  specialty: string;
  cuts: number;
  rating: number;
  image: string;
};
type Appointment = {
  id: number;
  client: string;
  barberId: number;
  date: string;
  time: string;
  service: string;
  status: Status;
};

const shops = [
  { id: 1, name: "Barbearia 85", area: "Aldeota", address: "Rua Silva Paulet, 1480", distance: "750 m", rating: 4.9, lat: -3.7352, lng: -38.5054, open: "Aberto até 20h" },
  { id: 2, name: "Cavalheiros Club", area: "Meireles", address: "Av. da Abolição, 2140", distance: "1,2 km", rating: 4.8, lat: -3.7248, lng: -38.502, open: "Aberto até 21h" },
  { id: 3, name: "Casa do Corte", area: "Centro", address: "Rua Major Facundo, 680", distance: "2,4 km", rating: 4.7, lat: -3.7299, lng: -38.5267, open: "Aberto até 19h" },
];

const barbers: Barber[] = [
  { id: 1, shopId: 1, name: "Rafael Lima", specialty: "Degradê & freestyle", cuts: 1248, rating: 4.9, image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=85" },
  { id: 2, shopId: 1, name: "Caio Mendes", specialty: "Barba clássica", cuts: 879, rating: 4.8, image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=85" },
  { id: 3, shopId: 2, name: "André Castro", specialty: "Visagismo", cuts: 1536, rating: 5, image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=85" },
  { id: 4, shopId: 3, name: "João Vitor", specialty: "Corte clássico", cuts: 642, rating: 4.7, image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=85" },
];

const initialAppointments: Appointment[] = [
  { id: 21, client: "Lucas Almeida", barberId: 1, date: "29 jul", time: "10:30", service: "Corte + Barba", status: "confirmado" },
  { id: 22, client: "Bruno Souza", barberId: 2, date: "29 jul", time: "14:00", service: "Barba", status: "pendente" },
  { id: 23, client: "Mateus Rocha", barberId: 1, date: "30 jul", time: "09:30", service: "Degradê", status: "pendente" },
];
const schedule = ["09:00", "09:30", "10:30", "11:00", "14:00", "15:30", "17:00"];

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="NaRégua - início">
      <span className="logo-mark">N</span>
      <span>NA<span>RÉGUA</span></span>
    </Link>
  );
}

function Header() {
  return (
    <header className="site-header">
      <Logo />
      <nav className="desktop-nav" aria-label="Navegação principal">
        <NavLink to="/">Explorar</NavLink>
        <NavLink to="/agendamentos">Meus agendamentos</NavLink>
        <NavLink to="/dashboard">Área da barbearia</NavLink>
      </nav>
      <div className="header-actions">
        <button className="notification-button" aria-label="Notificações"><span className="notification-dot" />◌</button>
        <div className="user-chip"><span>LA</span><div><strong>Lucas</strong><small>cliente</small></div></div>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Navegação para celular">
      <NavLink to="/"><span>⌖</span>Explorar</NavLink>
      <NavLink to="/agendamentos"><span>◫</span>Agenda</NavLink>
      <NavLink to="/dashboard"><span>◒</span>Gestão</NavLink>
    </nav>
  );
}

function StatusPill({ status }: { status: Status }) {
  return <span className={`status ${status}`}>{status}</span>;
}

function Explore({ appointments, onBook }: { appointments: Appointment[]; onBook: (appointment: Omit<Appointment, "id">) => boolean }) {
  const [selectedShop, setSelectedShop] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState(1);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedDate, setSelectedDate] = useState("Amanhã, 29 jul");
  const [toast, setToast] = useState("");
  const currentShop = shops.find((shop) => shop.id === selectedShop) ?? shops[0];
  const currentBarbers = barbers.filter((barber) => barber.shopId === selectedShop);
  const currentBarber = barbers.find((barber) => barber.id === selectedBarber) ?? currentBarbers[0];
  const selectedDay = selectedDate.includes("30") ? "30 jul" : selectedDate.includes("31") ? "31 jul" : "29 jul";
  const availableTimes = schedule.filter((time) => !appointments.some((item) =>
    item.barberId === currentBarber?.id && item.time === time && item.date === selectedDay && item.status !== "concluido",
  ));

  const selectShop = useCallback((id: number) => {
    setSelectedShop(id);
    const firstBarber = barbers.find((barber) => barber.shopId === id);
    if (firstBarber) setSelectedBarber(firstBarber.id);
  }, []);

  function book() {
    if (!currentBarber || !selectedTime) return;
    const created = onBook({
      client: "Lucas Almeida", barberId: currentBarber.id,
      date: selectedDay, time: selectedTime, service: "Corte masculino", status: "pendente",
    });
    setToast(created ? "Pedido enviado! A barbearia já recebeu seu agendamento." : "Esse horário acabou de ser reservado. Escolha outro.");
    window.setTimeout(() => setToast(""), 3800);
  }

  return (
    <main>
      <section className="explore-heading">
        <div><span className="eyebrow">TRANSPARÊNCIA ANTES DA CADEIRA</span><h1>Seu próximo corte,<br />sem surpresa.</h1></div>
        <p>Encontre quem manda bem no seu estilo. Compare experiência, especialidades e horários livres perto de você.</p>
      </section>

      <section className="finder-shell">
        <aside className="shop-panel">
          <div className="search-box"><span>⌕</span><input aria-label="Buscar bairro ou barbearia" placeholder="Busque por bairro ou barbearia" /></div>
          <div className="panel-title"><span><strong>3</strong> barbearias por perto</span><button>Filtros +</button></div>
          <div className="shop-list">
            {shops.map((shop) => (
              <button key={shop.id} className={`shop-card ${shop.id === selectedShop ? "selected" : ""}`} onClick={() => selectShop(shop.id)}>
                <span className="shop-index">{shop.id}</span>
                <span className="shop-copy"><strong>{shop.name}</strong><small>{shop.area} · {shop.distance}</small><small className="open-label">{shop.open}</small></span>
                <span className="shop-rating">★ {shop.rating}</span>
              </button>
            ))}
          </div>
          <div className="legend"><span><i className="legend-dot lime" /> Selecionada</span><span><i className="legend-dot dark" /> Disponível</span></div>
        </aside>
        <div className="map-wrap">
          <MapView shops={shops} selectedId={selectedShop} onSelect={selectShop} />
          <div className="map-location">Fortaleza, CE <span>⌄</span></div>
          <div className="selected-place">
            <div><small>SUA SELEÇÃO</small><strong>{currentShop.name}</strong><span>{currentShop.address}</span></div>
            <div className="place-score"><b>{currentShop.rating}</b><span>★★★★★</span><small>128 avaliações</small></div>
          </div>
        </div>
      </section>

      <section className="professionals-section">
        <div className="section-heading">
          <div><span className="eyebrow">PROFISSIONAIS DA {currentShop.name.toUpperCase()}</span><h2>Escolha pela experiência.</h2></div>
          <p>O número não mente: cada corte concluído conta uma história.</p>
        </div>
        <div className="booking-layout">
          <div className="barber-grid">
            {currentBarbers.map((barber) => (
              <button className={`barber-card ${barber.id === selectedBarber ? "selected" : ""}`} key={barber.id} onClick={() => setSelectedBarber(barber.id)}>
                <div className="barber-image"><Image src={barber.image} alt={`Foto de ${barber.name}`} width={300} height={420} unoptimized /><span>{barber.id === selectedBarber ? "SELECIONADO" : "VER PERFIL"}</span></div>
                <div className="barber-info"><div><h3>{barber.name}</h3><p>{barber.specialty}</p></div><b>★ {barber.rating.toFixed(1)}</b></div>
                <div className="cut-count"><strong>{barber.cuts.toLocaleString("pt-BR")}</strong><span>cortes concluídos</span></div>
              </button>
            ))}
          </div>
          {currentBarber && (
            <aside className="booking-card">
              <div className="booking-person"><Image src={currentBarber.image} alt="" width={90} height={90} unoptimized /><div><small>AGENDAR COM</small><strong>{currentBarber.name}</strong></div><span className="verified">✓</span></div>
              <label>Data<select value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setSelectedTime("09:00"); }}><option>Amanhã, 29 jul</option><option>Quinta, 30 jul</option><option>Sexta, 31 jul</option></select></label>
              <div><span className="input-label">Horários livres</span><div className="time-grid">
                {schedule.map((time) => <button key={time} disabled={!availableTimes.includes(time)} className={selectedTime === time ? "active" : ""} onClick={() => setSelectedTime(time)}>{time}</button>)}
              </div></div>
              <div className="booking-summary"><span>Corte masculino</span><strong>R$ 45</strong></div>
              <button className="primary-button" onClick={book}>Solicitar agendamento <span>↗</span></button>
              <small className="booking-note">Você só paga no local. Confirmação em tempo real.</small>
            </aside>
          )}
        </div>
      </section>
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}

function AppointmentsPage({ appointments }: { appointments: Appointment[] }) {
  const mine = appointments.filter((item) => item.client === "Lucas Almeida");
  return (
    <main className="inner-page">
      <div className="page-intro"><span className="eyebrow">SUA AGENDA</span><h1>Meus agendamentos</h1><p>Acompanhe cada solicitação e veja quando a cadeira estiver confirmada.</p></div>
      <div className="appointment-list">
        {mine.length === 0 ? (
          <div className="empty-state"><span>✦</span><h2>Nenhum corte marcado</h2><p>Seu próximo visual começa encontrando o profissional certo.</p><Link className="primary-button" to="/">Explorar barbearias</Link></div>
        ) : mine.map((appointment) => {
          const barber = barbers.find((item) => item.id === appointment.barberId)!;
          const shop = shops.find((item) => item.id === barber.shopId)!;
          return (
            <article className="appointment-card" key={appointment.id}>
              <div className="date-block"><strong>{appointment.date.split(" ")[0]}</strong><span>JUL</span></div>
              <Image src={barber.image} alt="" width={120} height={120} unoptimized />
              <div className="appointment-copy"><StatusPill status={appointment.status} /><h2>{appointment.service}</h2><p>com {barber.name} · {shop.name}</p><small>{appointment.date}, às {appointment.time}</small></div>
              <button className="outline-button">Ver detalhes</button>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function Dashboard({ appointments, onConfirm }: { appointments: Appointment[]; onConfirm: (id: number) => void }) {
  const [promoSent, setPromoSent] = useState(false);
  const pending = appointments.filter((item) => item.status === "pendente");
  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Logo />
        <div className="business-chip"><span>B85</span><div><strong>Barbearia 85</strong><small>Aldeota, Fortaleza</small></div></div>
        <nav><a className="active" href="#visao-geral">◫ <span>Visão geral</span></a><a href="#agenda">◷ <span>Agenda</span><b>{pending.length}</b></a><a href="#clientes">◎ <span>Clientes</span></a><a href="#marketing">↗ <span>Marketing</span></a></nav>
        <Link to="/" className="back-link">← Voltar ao app</Link>
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header"><div><span className="eyebrow">TERÇA-FEIRA, 28 DE JULHO</span><h1>Bom trabalho, Marcos.</h1></div><button className="outline-button">+ Novo horário</button></header>
        <section className="metric-grid" id="visao-geral">
          <article><span>HOJE</span><strong>8</strong><small>agendamentos</small><i>↗ 14%</i></article>
          <article><span>PENDENTES</span><strong>{pending.length}</strong><small>aguardam confirmação</small><i className="attention">Atenção</i></article>
          <article><span>CORTES NO MÊS</span><strong>184</strong><small>serviços concluídos</small><i>↗ 8%</i></article>
          <article><span>FATURAMENTO</span><strong>R$ 8,4k</strong><small>estimado em julho</small><i>↗ 11%</i></article>
        </section>
        <section className="dashboard-grid">
          <article className="dashboard-card agenda-card" id="agenda">
            <div className="card-heading"><div><span className="eyebrow">PRÓXIMOS DA FILA</span><h2>Agenda de hoje</h2></div><button>Ver agenda completa ↗</button></div>
            <div className="agenda-list">{appointments.map((appointment) => {
              const barber = barbers.find((item) => item.id === appointment.barberId)!;
              return <div className="agenda-row" key={appointment.id}><strong>{appointment.time}</strong><span className="timeline-dot" /><div><b>{appointment.client}</b><small>{appointment.service} · com {barber.name}</small></div><StatusPill status={appointment.status} />{appointment.status === "pendente" && <button className="confirm-button" onClick={() => onConfirm(appointment.id)}>Confirmar</button>}</div>;
            })}</div>
          </article>
          <article className="dashboard-card team-card">
            <div className="card-heading"><div><span className="eyebrow">PERFORMANCE</span><h2>Seu time</h2></div></div>
            {barbers.filter((barber) => barber.shopId === 1).map((barber) => <div className="team-row" key={barber.id}><Image src={barber.image} alt="" width={84} height={84} unoptimized /><div><strong>{barber.name}</strong><small>{barber.specialty}</small></div><div className="team-number"><strong>{barber.cuts}</strong><small>cortes</small></div></div>)}
          </article>
          <article className="dashboard-card crm-card" id="clientes">
            <div className="card-heading"><div><span className="eyebrow">CRM BÁSICO</span><h2>Clientes recorrentes</h2></div><b>286 clientes</b></div>
            <div className="customer-chips">{["Lucas Almeida", "Bruno Souza", "Mateus Rocha", "Davi Santos"].map((name, index) => <span key={name}><i>{name.split(" ").map((part) => part[0]).join("")}</i>{name}<small>{index + 2} visitas</small></span>)}</div>
          </article>
          <article className="dashboard-card marketing-card" id="marketing">
            <span className="eyebrow">MARKETING</span><h2>Cadeira vazia?<br />Chame quem já confia.</h2><p>Envie uma promoção simulada para os 286 clientes da sua base.</p>
            <button className="primary-button" disabled={promoSent} onClick={() => setPromoSent(true)}>{promoSent ? "Promoção enviada ✓" : "Criar promoção ↗"}</button>
          </article>
        </section>
      </div>
    </main>
  );
}

function AppContent() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window === "undefined") return initialAppointments;
    const saved = window.localStorage.getItem("naregua-appointments");
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  useEffect(() => {
    window.localStorage.setItem("naregua-appointments", JSON.stringify(appointments));
  }, [appointments]);

  const book = useCallback((appointment: Omit<Appointment, "id">) => {
    const conflict = appointments.some((item) =>
      item.barberId === appointment.barberId &&
      item.date === appointment.date &&
      item.time === appointment.time &&
      item.status !== "concluido",
    );
    if (conflict) return false;
    setAppointments((current) => {
      const simultaneousConflict = current.some((item) =>
        item.barberId === appointment.barberId &&
        item.date === appointment.date &&
        item.time === appointment.time &&
        item.status !== "concluido",
      );
      const nextId = Math.max(0, ...current.map((item) => item.id)) + 1;
      return simultaneousConflict ? current : [...current, { ...appointment, id: nextId }];
    });
    return true;
  }, [appointments]);
  const confirm = useCallback((id: number) => setAppointments((current) => current.map((item) => item.id === id ? { ...item, status: "confirmado" } : item)), []);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/dashboard" element={<Dashboard appointments={appointments} onConfirm={confirm} />} />
        <Route path="*" element={<><Header /><Routes><Route path="/" element={<Explore appointments={appointments} onBook={book} />} /><Route path="/agendamentos" element={<AppointmentsPage appointments={appointments} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes><MobileNav /></>} />
      </Routes>
    </div>
  );
}

export function BarberApp() {
  const ready = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  if (!ready) return <div className="app-loading"><span className="logo-mark">N</span><p>Preparando sua próxima cadeira...</p></div>;
  return <BrowserRouter><AppContent /></BrowserRouter>;
}
