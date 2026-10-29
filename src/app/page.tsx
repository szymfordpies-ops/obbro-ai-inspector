// @ts-nocheck
"use client";

import React, { useState } from "react";
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  Database, 
  MessageSquare, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  User, 
  Zap 
} from "lucide-react";

// PODMIEŃ TEN LINK NA SWÓJ PRODUCTION URL Z N8N:
const N8N_WEBHOOK_URL = "https://n8n.srv1285501.hstgr.cloud/webhook/obbro-ticket-agent";

const MOCK_TICKETS = [
  {
    id: "ALL-8921",
    source: "Allegro",
    client: "Marek Kowalski",
    time: "2 min temu",
    topic: "Uszkodzenie w trasie & Spór",
    category: "Reklamacje",
    priority: "HIGH",
    message: "Dzień dobry, paczka z biurkiem OBBRO Pro przyszła z obitym narożnikiem blatu. Karton był rozerwany. Żądam wymiany blatu albo otwieram spór na Allegro!",
    product: "Biurko Podnoszone OBBRO Pro 160x80",
    sku: "OBB-DESK-PRO-BLK",
    orderId: "ALL-2026-9912",
    status: "W trakcie wysyłki / Doręczono",
    aiAnalysis: {
      sentiment: "Frustracja / Ryzyko Sporu",
      confidence: "98%",
      retrievedData: [
        "ERP: Zapasy blatu 160x80 BLK: 14 szt. (Magazyn Główny)",
        "InPost API: Protokół szkody nie został jeszcze spisany z kurierem",
        "Procedura OBBRO: Szybka wymiana elementu bez odsyłania całości produktu"
      ],
      proposedAction: "Wysyłka nowego blatu w 24h + formularz szkody",
      draftResponse: "Cześć Marek! Bardzo przepraszamy za tę sytuację – transport biurek bywa wymagający. Nie musisz odsyłać całego biurka ani otwierać sporu. Właśnie zleciłem wysyłkę nowego, fabrycznie zapakowanego blatu na Twój adres (wysyłka jutro rano). Czy możesz jedynie zrobić 2 zdjęcia uszkodzonego narożnika i kartonu? Przyda nam się to do reklamacji u przewoźnika. Z góry dziękuję!",
      internalNote: "Dla zespołu: Wygenerowano automatyczny ETI na magazyn (Nowy Blat SKU: OBB-DESK-PRO-BLK-TOP). Brak konieczności angażowania managera."
    }
  },
  {
    id: "ALL-8922",
    source: "Allegro",
    client: "Anna Nowak",
    time: "12 min temu",
    topic: "Pytanie o termin dostawy",
    category: "Status Zamówienia",
    priority: "LOW",
    message: "Witam, czy zamówienie #ALL-2026-9840 wyjdzie dzisiaj? Zależy mi na dostawie przed weekendem.",
    product: "Fotel Ergonomiczny OBBRO ErgoX",
    sku: "OBB-CHAIR-ERGX",
    orderId: "ALL-2026-9840",
    status: "Spakowane / Czeka na kuriera",
    aiAnalysis: {
      sentiment: "Neutralny / Zapytanie",
      confidence: "99%",
      retrievedData: [
        "DPD API: Etykieta wygenerowana, podjazd kuriera zaplanowany na 14:30",
        "Przewidywana dostawa: Jutro (Piątek) do 12:00"
      ],
      proposedAction: "Automatyczna odpowiedź z linkiem do śledzenia",
      draftResponse: "Dzień dobry Pani Anno! Tak, zamówienie jest już spakowane i gotowe w strefie wydań. Dzisiaj o 14:30 odbiera je kurier DPD. Paczka będzie u Pani jutro w ciągu dnia. Link do śledzenia przesyłki aktywny od 16:00: [DPD-TRACKING-9840]. Pozdrawiamy, Zespół OBBRO!",
      internalNote: "Auto-reply wysłany na Allegro. Zgłoszenie zamknięte."
    }
  },
  {
    id: "SKLEP-104",
    source: "Sklep WWW",
    client: "Piotr Wiśniewski",
    time: "45 min temu",
    topic: "Specyfikacja techniczna i nośność",
    category: "Przedsprzedaż",
    priority: "MEDIUM",
    message: "Czy stelaż biurka OBBRO Heavy wytrzyma 3 monitory na ramionach i ciężki komputer (łącznie ok. 95 kg)?",
    product: "Stelaż Elektryczny OBBRO Heavy Dual",
    sku: "OBB-FRAME-HD-SLV",
    orderId: "Brak (Pytanie z karty produktu)",
    status: "Niewysłane",
    aiAnalysis: {
      sentiment: "Zainteresowany zakupem",
      intent: "Weryfikacja parametrów technicznych",
      confidence: "97%",
      retrievedData: [
        "Specyfikacja OBBRO Heavy Dual: Max nośność dynamiczna 120 kg (2 silniki)",
        "Gwarancja: 5 lat na mechanizm i silniki",
        "Rekomendacja: Zalecane równomierne obciążenie"
      ],
      proposedAction: "Potwierdzenie specyfikacji + Rekomendacja akcesoriów",
      draftResponse: "Cześć Piotr! Jak najbardziej. Stelaż OBBRO Heavy Dual posiada dwa silniki o łącznej nośności dynamicznej do 120 kg, więc obciążenie 95 kg z 3 monitorami obsłuży bez najmniejszego problemu i bez szarpania przy podnoszeniu. Mamy klientów montujących dokładnie takie zestawy. W razie pytań o montaż ramion – służę pomocą!",
      internalNote: "Dopisano potencjalnego klienta do grupy B2B."
    }
  }
];

export default function ObbroOperationsInspector() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(MOCK_TICKETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Triggery żywego requestu do n8n po kliknięciu w zgłoszenie
  const handleSelectTicket = async (ticket: typeof MOCK_TICKETS[0]) => {
    setSelectedTicket(ticket);
    setSentSuccess(false);
    setIsProcessing(true);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: ticket.message,
          sku: ticket.sku,
          orderId: ticket.orderId,
        }),
      });

      const result = await res.json();

      if (result.success && result.data) {
        const aiData = result.data;
        
        const updatedTicket = {
          ...ticket,
          aiAnalysis: {
            ...ticket.aiAnalysis,
            sentiment: aiData.sentiment || ticket.aiAnalysis.sentiment,
            draftResponse: aiData.draftResponse || ticket.aiAnalysis.draftResponse,
            internalNote: aiData.internalAction || ticket.aiAnalysis.internalNote,
          }
        };

        setSelectedTicket(updatedTicket);
      }
    } catch (err) {
      console.error("Błąd połączenia z n8n (używam danych lokalnych):", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateSend = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSentSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-neutral-800">
      
      {/* TOP BAR / METRICS */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-white">OBBRO</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 font-mono">
                  Live Operations Copilot
                </span>
              </div>
              <p className="text-xs text-neutral-400">AI Order & Allegro Resolution Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-300">n8n Engine: <strong className="text-white">Połączono</strong></span>
            </div>
            <div className="flex items-center gap-2 border-l border-neutral-800 pl-6">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-300">Śr. czas odpowiedzi: <strong className="text-emerald-400">11 sekund</strong></span>
            </div>
            <div className="flex items-center gap-2 border-l border-neutral-800 pl-6">
              <Bot className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-300">Autonomia zgłoszeń: <strong className="text-white">89%</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: TICKET LIST */}
        <section className="col-span-12 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neutral-400" />
              Napływające zgłoszenia
            </h2>
            <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">
              3 oczekujące
            </span>
          </div>

          <div className="space-y-3">
            {tickets.map((ticket) => {
              const isSelected = selectedTicket.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-neutral-900 border-neutral-600 shadow-lg shadow-black/40"
                      : "bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                  )}
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                      {ticket.source}
                    </span>
                    <span>{ticket.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{ticket.topic}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{ticket.message}</p>
                  
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/60 text-neutral-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-neutral-400" />
                      {ticket.client}
                    </span>
                    <span className={`font-medium ${
                      ticket.priority === 'HIGH' ? 'text-amber-400' : 'text-neutral-400'
                    }`}>
                      {ticket.priority === 'HIGH' ? '● Wysoki Priorytet' : '● Normalny'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl border border-dashed border-neutral-800 bg-neutral-950 text-center text-xs text-neutral-400">
            <p>💡 Live Copilot zasilany przez silnik n8n.</p>
            <p className="mt-1 text-neutral-400">Kliknij zgłoszenie, aby przesłać request do OpenAI.</p>
          </div>
        </section>

        {/* RIGHT COLUMN: AI AGENT DECISION ENGINE */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* TICKET HEADER & CONTEXT */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedTicket.id}
                  </span>
                  <span className="text-xs text-neutral-400">Zamówienie: {selectedTicket.orderId}</span>
                </div>
                <h1 className="text-lg font-semibold text-white">{selectedTicket.topic}</h1>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400 block">Produkt:</span>
                <span className="text-xs font-medium text-neutral-200">{selectedTicket.product}</span>
              </div>
            </div>

            {/* ORIGINAL CLIENT MESSAGE */}
            <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Wiadomość od klienta ({selectedTicket.client}):
                </span>
                <span className="text-xs text-neutral-400 font-mono">SKU: {selectedTicket.sku}</span>
              </div>
              <p className="text-sm text-neutral-200 leading-relaxed italic">
                "{selectedTicket.message}"
              </p>
            </div>
          </div>

          {/* AI AGENT REASONING & RAG PROCESS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Analiza Agenta n8n & Kontekst</h2>
              </div>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sentyment: {selectedTicket.aiAnalysis.sentiment}
              </span>
            </div>

            {/* DATA RETRIEVAL STEP */}
            <div className="space-y-2">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Pobrane dane systemowe (ERP / Allegro / DPD):
              </span>
              <div className="grid grid-cols-1 gap-2">
                {selectedTicket.aiAnalysis.retrievedData.map((dataItem, idx) => (
                  <div key={idx} className="text-xs bg-neutral-950 border border-neutral-800/80 px-3 py-2 rounded-md text-neutral-300 font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {dataItem}
                  </div>
                ))}
              </div>
            </div>

            {/* PROPOSED DRAFT RESPONSE */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  Wygenerowana odpowiedź (Gotowa do wygenerowania na Allegro):
                </span>
                <span className="text-xs text-neutral-400">Kanal: {selectedTicket.source}</span>
              </div>

              <div className="bg-neutral-950 border border-emerald-500/30 rounded-lg p-4 relative min-h-[100px]">
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 py-6">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Przetwarzanie przez n8n & OpenAI...
                  </div>
                ) : (
                  <p className="text-sm text-neutral-100 leading-relaxed">
                    {selectedTicket.aiAnalysis.draftResponse}
                  </p>
                )}
              </div>
            </div>

            {/* INTERNAL MANAGER NOTE */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300">Notatka operacyjna wygenerowana przez n8n:</strong>
                <p className="mt-0.5">{selectedTicket.aiAnalysis.internalNote}</p>
              </div>
            </div>

            {/* ACTIONS BAR */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSimulateSend}
                  disabled={isProcessing || sentSuccess}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold rounded-lg text-xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Przetwarzanie...
                    </>
                  ) : sentSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Wysłano na Allegro!
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Zatwierdź i Wyślij na Allegro
                    </>
                  )}
                </button>
              </div>

              <span className="text-xs text-neutral-400 italic">
                {sentSuccess ? "Zgłoszenie przetworzone w n8n" : "Kliknij, aby przetestować akcję wysyłki"}
              </span>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}