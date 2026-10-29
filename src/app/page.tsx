// @ts-nocheck
"use client";

import React, { useState } from "react";

const N8N_WEBHOOK_URL = "https://n8n.srv1285501.hstgr.cloud/webhook/obbro-ticket-agent";

const MOCK_TICKETS = [
  {
    id: "ALL-8921",
    source: "Allegro",
    client: "Marek Kowalski",
    time: "2 min temu",
    topic: "Uszkodzenie w trasie & Spór",
    category: "Reklamacje",
    priority: "Wysoki",
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
    category: "Status zamówienia",
    priority: "Normalny",
    message: "Witam, czy zamówienie #ALL-2026-9840 wyjdzie dzisiaj? Zależy mi na dostawie przed weekendem.",
    product: "Fotel Ergonomiczny OBBRO Ergo",
    sku: "OBB-CHAIR-ERG",
    orderId: "ALL-2026-9840",
    status: "Spakowane / Czeka na kuriera",
    aiAnalysis: {
      sentiment: "Neutralny / Zapytanie",
      confidence: "99%",
      retrievedData: [
        "DPD API: Etykieta wygenerowana, podjazd kuriera zaplanowany na 14:30",
        "Przewidywana dostawa: Jutro (Piątek) do 12:00"
      ],
      proposedAction: "Informacja o podjeździe kuriera i numer śledzenia",
      draftResponse: "Dzień dobry Pani Anno! Pani fotel OBBRO Ergo jest już spakowany i czeka na magazynie na dzisiejszy odbiór kuriera DPD (podjazd o 14:30). Przesyłka dotrze do Pani jutro przed południem. Numer śledzenia: DPD984021992PL.",
      internalNote: "Brak akcji po stronie magazynu. Wysłano powiadomienie ze statusem dostawy."
    }
  },
  {
    id: "WEB-1042",
    source: "Sklep WWW",
    client: "Piotr Wiśniewski",
    time: "45 min temu",
    topic: "Specyfikacja techniczna i nośność",
    category: "Pytanie przedsprzedażowe",
    priority: "Normalny",
    message: "Czy stelaż biurka OBBRO Heavy wytrzyma 3 monitory na ramionach i ciężki komputer (łącznie ok. 95 kg)?",
    product: "Stelaż Elektryczny OBBRO Heavy Dual Engine",
    sku: "OBB-FRAME-HEAVY-SLV",
    orderId: "Brak (Pytanie przed zakupem)",
    status: "Zapytanie Klienta",
    aiAnalysis: {
      sentiment: "Zainteresowanie zakupem",
      confidence: "95%",
      retrievedData: [
        "Specyfikacja OBBRO Heavy: Udźwig maksymalny silnika Dual Engine to 120 kg (z uwzględnieniem wagi blatu)",
        "Gwarancja: 5 lat door-to-door"
      ],
      proposedAction: "Potwierdzenie parametrów technicznych + kod rabatowy 5%",
      draftResponse: "Cześć Piotr! Jak najbardziej. Stelaż OBBRO Heavy posiada dwa silniki o łącznym udźwigu do 120 kg, więc zestaw 95 kg obsłuży ze znacznym zapasem i zachowaniem pełnej płynności oraz cichej pracy. Jeśli planujesz zakup w tym tygodniu, możesz użyć kodu OBBRO5 na 5% rabatu.",
      internalNote: "Szanse na konwersję przedsprzedażową wysokie. Wysłano odpowiedź technologiczną."
    }
  }
];

export default function Home() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(MOCK_TICKETS[0]);
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setApproved(false);
    setLoading(true);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          client: ticket.client,
          message: ticket.message,
          product: ticket.product,
          sku: ticket.sku,
          orderId: ticket.orderId,
          source: ticket.source
        })
      });

      if (res.ok) {
        const liveData = await res.json();
        if (liveData && liveData.aiAnalysis) {
          setSelectedTicket((prev) => ({
            ...prev,
            aiAnalysis: {
              ...prev.aiAnalysis,
              ...liveData.aiAnalysis
            }
          }));
        }
      }
    } catch (err) {
      console.log("n8n live request finished (fallback to current data)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141211] text-[#E6E1DA] font-sans antialiased selection:bg-[#C2A382] selection:text-[#141211]">
      
      {/* Top Header */}
      <header className="border-b border-[#262220] bg-[#1A1716] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="font-serif tracking-widest text-xl text-[#F2ECE4] uppercase font-semibold">OBBRO</span>
            <span className="text-xs text-[#8C827A] border-l border-[#332E2B] pl-3 py-0.5 tracking-wider uppercase">System Operacyjny</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs text-[#A69B91]">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A86]"></span>
            <span>Silnik n8n: Aktywny</span>
          </div>
          <span className="text-[#332E2B]">|</span>
          <span>Średni czas analizy: 1.2s</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto p-8 grid grid-cols-12 gap-8">
        
        {/* Left Column: Tickets List */}
        <div className="col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#262220]">
            <span className="text-xs font-medium uppercase tracking-wider text-[#8C827A]">Oczekujące Zgłoszenia</span>
            <span className="text-xs px-2 py-0.5 bg-[#262220] text-[#C2A382] rounded font-mono">{tickets.length}</span>
          </div>

          <div className="space-y-2">
            {tickets.map((t) => {
              const isSelected = selectedTicket.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#211E1C] border-[#C2A382]/40 shadow-sm"
                      : "bg-[#1A1716]/60 border-[#262220] hover:bg-[#1A1716] hover:border-[#332E2B]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-[#8C827A] mb-1.5">
                    <span className="font-mono text-[#C2A382]">{t.id}</span>
                    <span>{t.time}</span>
                  </div>
                  <div className="font-medium text-sm text-[#F2ECE4] mb-1">{t.topic}</div>
                  <div className="text-xs text-[#A69B91] line-clamp-2 leading-relaxed mb-3">
                    {t.message}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8C827A] pt-2 border-t border-[#262220]/60">
                    <span>{t.client}</span>
                    <span className="text-[#A69B91]">{t.source}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Operational Inspector View */}
        <div className="col-span-8 bg-[#1A1716] border border-[#262220] rounded-lg p-6 space-y-6">
          
          {/* Section 1: Ticket & Client Details */}
          <div className="space-y-3 pb-6 border-b border-[#262220]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-[#C2A382] mb-1">{selectedTicket.id} &bull; Zamówienie: {selectedTicket.orderId}</div>
                <h1 className="text-xl font-medium text-[#F2ECE4]">{selectedTicket.topic}</h1>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#8C827A] block">Kanał</span>
                <span className="text-sm text-[#E6E1DA]">{selectedTicket.source}</span>
              </div>
            </div>

            <div className="bg-[#141211] p-4 rounded border border-[#262220] text-sm text-[#D4CBC0] leading-relaxed">
              <div className="text-xs text-[#8C827A] mb-1 font-medium">{selectedTicket.client}:</div>
              "{selectedTicket.message}"
            </div>
          </div>

          {/* Section 2: ERP & System Data */}
          <div className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-wider text-[#8C827A]">
              Dane z Systemów Wewnętrznych (ERP / Kurier / Procedury)
            </div>
            
            <div className="space-y-2">
              {selectedTicket.aiAnalysis.retrievedData.map((dataItem, idx) => (
                <div key={idx} className="bg-[#141211]/80 px-4 py-2.5 rounded border border-[#262220] text-xs font-mono text-[#C2A382] flex items-center justify-between">
                  <span>{dataItem}</span>
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider">Zweryfikowano</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: AI Analysis & Proposed Response */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#8C827A]">
                Sugerowana Odpowiedź i Akcja Operacyjna
              </span>
              <span className="text-xs text-[#8A9A86] bg-[#8A9A86]/10 px-2.5 py-1 rounded border border-[#8A9A86]/20">
                Sentyment: {selectedTicket.aiAnalysis.sentiment}
              </span>
            </div>

            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-[#1A1716]/90 backdrop-blur-sm flex items-center justify-center rounded z-10">
                  <span className="text-xs text-[#C2A382] font-mono animate-pulse">Przetwarzanie zapytania przez n8n i OpenAI...</span>
                </div>
              )}

              <div className="bg-[#141211] p-4 rounded border border-[#262220] space-y-3">
                <textarea
                  className="w-full bg-transparent text-sm text-[#F2ECE4] focus:outline-none resize-none leading-relaxed"
                  rows={5}
                  value={selectedTicket.aiAnalysis.draftResponse}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedTicket((prev) => ({
                      ...prev,
                      aiAnalysis: { ...prev.aiAnalysis, draftResponse: val }
                    }));
                  }}
                />

                <div className="pt-3 border-t border-[#262220] flex items-center justify-between text-xs text-[#8C827A]">
                  <div>
                    <span className="text-[#A69B91]">Notatka systemowa: </span>
                    {selectedTicket.aiAnalysis.internalNote}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-[#8C827A]">
                Akcja wyśle odpowiedź na {selectedTicket.source} oraz wygeneruje dokument w ERP.
              </div>

              <button
                onClick={() => setApproved(true)}
                disabled={approved}
                className={`px-6 py-2.5 rounded text-xs font-medium tracking-wide transition-all ${
                  approved
                    ? "bg-[#8A9A86] text-[#141211] cursor-default"
                    : "bg-[#C2A382] text-[#141211] hover:bg-[#D4B594] active:scale-[0.99]"
                }`}
              >
                {approved ? "Zatwierdzono i Wysłano" : "Zatwierdź i Wyślij"}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}