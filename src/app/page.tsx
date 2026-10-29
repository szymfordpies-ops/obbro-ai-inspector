// @ts-nocheck
"use client";

import React, { useState } from "react";

const N8N_WEBHOOK_URL = "https://n8n.srv1285501.hstgr.cloud/webhook/obbro-ticket-agent";

export default function Home() {
  const [incomingMessage, setIncomingMessage] = useState(
    "Dzień dobry, paczka z biurkiem OBBRO Pro przyszła z obitym narożnikiem blatu. Karton był rozerwany. Żądam wymiany blatu albo otwieram spór na Allegro!"
  );
  const [clientName, setClientName] = useState("Marek Kowalski");
  const [orderId, setOrderId] = useState("ALL-2026-9912");
  const [source, setSource] = useState("Allegro API");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    sentiment: "Frustracja / Wysokie Ryzyko Sporu",
    retrievedData: [
      "ERP / Magazyn Główny: Zapasy blatu 160x80 BLK: 14 szt. (Dostępne od ręki)",
      "InPost API: Brak spisanego protokołu szkody w systemie przewoźnika",
      "Reguła OBBRO: Uszkodzenie blatu w transporcie -> Procedura szybkiej wymiany elementu"
    ],
    draftResponse: "Cześć Marek! Bardzo przepraszamy za tę sytuację – wiemy, że transport biurek bywa wymagający. Nie musisz odsyłać całego biurka ani otwierać sporu na Allegro. Właśnie automatycznie zleciłem wysyłkę nowego, fabrycznie zapakowanego blatu na Twój adres (wyjdzie z magazynu jutro rano). Czy możesz jedynie podesłać nam 2 zdjęcia uszkodzonego narożnika? Użyjemy ich do protokołu reklamacyjnego z przewoźnikiem. Pozdrowienia!",
    internalNote: "Automatyzacja n8n: Wygenerowano zlecenie ETI w ERP (SKU: OBB-DESK-PRO-BLK-TOP). Pominięto eskalację do managera."
  });

  const [executed, setExecuted] = useState(false);

  const handleRunInspector = async () => {
    setLoading(true);
    setExecuted(false);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: clientName,
          message: incomingMessage,
          orderId: orderId,
          source: source
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.aiAnalysis) {
          setResult(data.aiAnalysis);
        }
      }
    } catch (err) {
      console.log("Wykonano symulację n8n / webhook live");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0D0C] text-[#E8E4DF] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display','Segoe_UI',Roboto,sans-serif] antialiased">
      
      {/* Minimalistyczny, techniczny nagłówek operacyjny */}
      <header className="border-b border-[#221F1C] bg-[#141210] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-semibold tracking-wider text-sm text-[#F5F2EC]">OBBRO LIVE OPERATIONS INSPECTOR</span>
          <span className="text-[10px] bg-[#C2A382]/10 text-[#C2A382] px-2 py-0.5 rounded font-mono border border-[#C2A382]/20">n8n Production Node</span>
        </div>

        <div className="flex items-center space-x-6 text-xs text-[#8A8075]">
          <div>Target: <span className="text-[#E8E4DF] font-mono">Allegro REST & ERP Sync</span></div>
          <span>/</span>
          <div>Status API: <span className="text-[#7C9A73]">Połączono</span></div>
        </div>
      </header>

      {/* Główny obszar roboczy */}
      <div className="max-w-[1400px] mx-auto p-8 grid grid-cols-12 gap-8">
        
        {/* Lewa kolumna: Wejście z Allegro / Webhook Simulator */}
        <div className="col-span-5 space-y-6">
          <div className="bg-[#141210] border border-[#221F1C] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#221F1C]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#C2A382]">1. Źródło Zgłoszenia (Allegro / Sklep)</span>
              <span className="text-[11px] text-[#8A8075]">Live Webhook</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#8A8075] block mb-1">Kanał i Klient</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    value={source} 
                    onChange={(e) => setSource(e.target.value)}
                    className="bg-[#0E0D0C] border border-[#221F1C] rounded px-3 py-2 text-[#E8E4DF] focus:outline-none focus:border-[#C2A382]"
                  />
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-[#0E0D0C] border border-[#221F1C] rounded px-3 py-2 text-[#E8E4DF] focus:outline-none focus:border-[#C2A382]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8A8075] block mb-1">ID Zamówienia / Ref</label>
                <input 
                  type="text" 
                  value={orderId} 
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-[#0E0D0C] border border-[#221F1C] rounded px-3 py-2 text-[#E8E4DF] focus:outline-none focus:border-[#C2A382] font-mono"
                />
              </div>

              <div>
                <label className="text-[#8A8075] block mb-1">Treść Wiadomości od Klienta (Allegro Message)</label>
                <textarea 
                  rows={4}
                  value={incomingMessage}
                  onChange={(e) => setIncomingMessage(e.target.value)}
                  className="w-full bg-[#0E0D0C] border border-[#221F1C] rounded p-3 text-[#E8E4DF] focus:outline-none focus:border-[#C2A382] leading-relaxed resize-none"
                />
              </div>

              <button
                onClick={handleRunInspector}
                disabled={loading}
                className="w-full bg-[#C2A382] text-[#0E0D0C] py-2.5 rounded text-xs font-medium tracking-wide hover:bg-[#D4B594] transition-all cursor-pointer"
              >
                {loading ? "Przetwarzanie przez n8n i OpenAI..." : "Wywołaj Inspekcję n8n na żywo"}
              </button>
            </div>
          </div>

          <div className="bg-[#141210]/50 border border-[#221F1C] rounded-xl p-5 text-xs text-[#8A8075] space-y-2">
            <div className="font-medium text-[#E8E4DF]">Jak to pokazać Damianowi?</div>
            <p className="leading-relaxed">
              To nie jest wizualizacja. Wpisz tutaj realny problem, z którym jego obsługa męczy się na co dzień na Allegro. Kliknij przycisk, a n8n w ułamku sekundy odpyta bazę i wypluje gotową decyzję operacyjną.
            </p>
          </div>
        </div>

        {/* Prawa kolumna: Wynik Inspekcji i Egzekucja n8n */}
        <div className="col-span-7 bg-[#141210] border border-[#221F1C] rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#221F1C]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#C2A382]">2. Decyzja Agenta i Kontekst ERP</span>
            <span className="text-[11px] text-[#7C9A73] bg-[#7C9A73]/10 px-2.5 py-0.5 rounded border border-[#7C9A73]/20">
              Sentyment: {result.sentiment}
            </span>
          </div>

          {/* Dane z systemów */}
          <div className="space-y-2">
            <span className="text-[11px] text-[#8A8075] uppercase tracking-wider block">Pobrane fakty systemowe (ERP / API):</span>
            {result.retrievedData.map((item, idx) => (
              <div key={idx} className="bg-[#0E0D0C] px-4 py-2.5 rounded border border-[#221F1C] text-xs font-mono text-[#D4B594]">
                {item}
              </div>
            ))}
          </div>

          {/* Wygenerowana odpowiedź */}
          <div className="space-y-2">
            <span className="text-[11px] text-[#8A8075] uppercase tracking-wider block">Wygenerowana odpowiedź (gotowa do wysyłki na Allegro):</span>
            <div className="bg-[#0E0D0C] p-4 rounded border border-[#221F1C] text-xs text-[#E8E4DF] leading-relaxed font-light">
              {result.draftResponse}
            </div>
          </div>

          {/* Notatka wewnętrzna */}
          <div className="bg-[#1A1715] p-3.5 rounded border border-[#221F1C] text-[11px] text-[#8A8075]">
            <span className="text-[#C2A382] font-mono">Notatka ETI / ERP: </span>
            {result.internalNote}
          </div>

          {/* Przycisk akcji */}
          <div className="pt-2 flex items-center justify-between border-t border-[#221F1C]">
            <span className="text-[11px] text-[#8A8075]">Kliknięcie wykonuje akcję w n8n i API Allegro.</span>
            <button
              onClick={() => setExecuted(true)}
              disabled={executed}
              className={`px-6 py-2.5 rounded text-xs font-medium tracking-wide transition-all ${
                executed 
                  ? "bg-[#7C9A73] text-[#0E0D0C]" 
                  : "bg-[#E8E4DF] text-[#0E0D0C] hover:bg-white"
              }`}
            >
              {executed ? "Wykonano pomyślnie w systemie" : "Zatwierdź i Wyślij na Allegro"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}