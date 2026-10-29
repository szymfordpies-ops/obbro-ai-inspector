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
      console.log("n8n live request finished");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11100F] text-[#F5F2EC] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display','Segoe_UI',Roboto,Helvetica,Arial,sans-serif] antialiased selection:bg-[#C2A382]/30 selection:text-white">
      
      {/* Apple-style macOS Header */}
      <header className="border-b border-[#221F1D] bg-[#161413]/80 backdrop-blur-md px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <span className="font-medium tracking-[0.2em] text-sm text-[#F5F2EC]">OBBRO</span>
          <span className="text-[11px] text-[#7A7067] tracking-wider uppercase font-light border-l border-[#2E2825] pl-4">System Operacyjny</span>
        </div>

        <div className="flex items-center space-x-6 text-[12px] text-[#9E948A] font-light">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C9A73]"></span>
            <span>n8n Live Engine</span>
          </div>
          <span className="text-[#2E2825]">/</span>
          <span>Autonomia: 89%</span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-[1500px] mx-auto p-8 grid grid-cols-12 gap-8">
        
        {/* Left Column: Minimal Ticket Stream */}
        <div className="col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#221F1D]">
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8C827A]">Kolejka Zgłoszeń</span>
            <span className="text-[11px] text-[#A3988E] font-mono">{tickets.length}</span>
          </div>

          <div className="space-y-1.5">
            {tickets.map((t) => {
              const isSelected = selectedTicket.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-150 border ${
                    isSelected
                      ? "bg-[#1E1B19] border-[#C2A382]/30 shadow-sm"
                      : "bg-[#161413]/40 border-transparent hover:bg-[#1A1817] hover:border-[#26211F]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#8C827A] mb-1 font-mono">
                    <span className="text-[#C2A382] font-normal">{t.id}</span>
                    <span className="font-light">{t.time}</span>
                  </div>
                  <div className="font-normal text-[13px] text-[#F5F2EC] mb-1 tracking-tight">{t.topic}</div>
                  <div className="text-[12px] text-[#9E948A] line-clamp-2 font-light leading-relaxed mb-3">
                    {t.message}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#7A7067] pt-2.5 border-t border-[#221F1D]/50 font-light">
                    <span>{t.client}</span>
                    <span className="text-[#8C827A]">{t.source}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Clean macOS Card Inspector */}
        <div className="col-span-8 bg-[#161413] border border-[#221F1D] rounded-2xl p-8 space-y-8 shadow-2xl">
          
          {/* Header Info */}
          <div className="space-y-4 pb-6 border-b border-[#221F1D]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-mono text-[#C2A382] tracking-wide mb-1.5">
                  {selectedTicket.id} &bull; Ref: {selectedTicket.orderId}
                </div>
                <h1 className="text-xl font-normal text-[#F5F2EC] tracking-tight">{selectedTicket.topic}</h1>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#7A7067] block uppercase tracking-wider font-light">Kanał</span>
                <span className="text-[13px] text-[#E0D9CE] font-light">{selectedTicket.source}</span>
              </div>
            </div>

            <div className="bg-[#11100F] p-4.5 rounded-xl border border-[#221F1D] text-[13px] text-[#D4CBC0] leading-relaxed font-light">
              <div className="text-[11px] text-[#8C827A] mb-1 font-normal tracking-wide uppercase">{selectedTicket.client}:</div>
              „{selectedTicket.message}”
            </div>
          </div>

          {/* ERP / Integrations Data Stack */}
          <div className="space-y-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8C827A]">
              Zweryfikowane Dane Systemowe (ERP & API)
            </div>
            
            <div className="space-y-2">
              {selectedTicket.aiAnalysis.retrievedData.map((dataItem, idx) => (
                <div key={idx} className="bg-[#11100F]/90 px-4 py-3 rounded-xl border border-[#221F1D] text-[12px] font-mono text-[#D4B594] flex items-center justify-between font-light">
                  <span>{dataItem}</span>
                  <span className="text-[10px] text-[#7C9A73] uppercase tracking-widest bg-[#7C9A73]/10 px-2 py-0.5 rounded">Zweryfikowano</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Draft & Response Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8C827A]">
                Sugerowana Odpowiedź Agencji
              </span>
              <span className="text-[11px] text-[#7C9A73] bg-[#7C9A73]/10 px-3 py-1 rounded-full font-light border border-[#7C9A73]/20">
                Sentyment: {selectedTicket.aiAnalysis.sentiment}
              </span>
            </div>

            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-[#161413]/90 backdrop-blur-md flex items-center justify-center rounded-xl z-10">
                  <span className="text-[12px] text-[#C2A382] font-mono font-light tracking-wide animate-pulse">Łączenie z silnikiem n8n & OpenAI...</span>
                </div>
              )}

              <div className="bg-[#11100F] p-5 rounded-xl border border-[#221F1D] space-y-4">
                <textarea
                  className="w-full bg-transparent text-[13px] text-[#F5F2EC] focus:outline-none resize-none leading-relaxed font-light"
                  rows={4}
                  value={selectedTicket.aiAnalysis.draftResponse}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedTicket((prev) => ({
                      ...prev,
                      aiAnalysis: { ...prev.aiAnalysis, draftResponse: val }
                    }));
                  }}
                />

                <div className="pt-3 border-t border-[#221F1D] text-[11px] text-[#7A7067] font-light">
                  <span className="text-[#A3988E]">Notatka wewnętrzna: </span>
                  {selectedTicket.aiAnalysis.internalNote}
                </div>
              </div>
            </div>

            {/* Apple Clean Action Bar */}
            <div className="pt-3 flex items-center justify-between">
              <div className="text-[11px] text-[#7A7067] font-light">
                Zatwierdzenie wyśle odpowiedź bezpośrednio na kanał {selectedTicket.source}.
              </div>

              <button
                onClick={() => setApproved(true)}
                disabled={approved}
                className={`px-6 py-2.5 rounded-lg text-[12px] font-normal tracking-wide transition-all duration-150 ${
                  approved
                    ? "bg-[#7C9A73] text-[#11100F] cursor-default"
                    : "bg-[#E6E1DA] text-[#11100F] hover:bg-white active:scale-[0.98] shadow-sm"
                }`}
              >
                {approved ? "Wysłano pomyślnie" : "Zatwierdź i Wyślij"}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}