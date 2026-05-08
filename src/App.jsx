import { useState, useEffect, useRef } from "react";

const vehicles = [
  { id: 1, name: "Tata Nexon EV", battery_kwh: 40.5, consumption_wh_km: 160, range_certified: 312, emoji: "🚗" },
  { id: 2, name: "Tata Nexon EV Max", battery_kwh: 40.5, consumption_wh_km: 150, range_certified: 437, emoji: "🚗" },
  { id: 3, name: "MG ZS EV", battery_kwh: 50.3, consumption_wh_km: 175, range_certified: 461, emoji: "🚙" },
  { id: 4, name: "Tesla Model 3", battery_kwh: 75.0, consumption_wh_km: 145, range_certified: 576, emoji: "🚘" },
  { id: 5, name: "Hyundai Kona Electric", battery_kwh: 39.2, consumption_wh_km: 150, range_certified: 452, emoji: "🚕" },
  { id: 6, name: "BYD Atto 3", battery_kwh: 60.5, consumption_wh_km: 165, range_certified: 521, emoji: "🚖" },
  { id: 7, name: "Volvo XC40 Recharge", battery_kwh: 78.0, consumption_wh_km: 200, range_certified: 418, emoji: "🚐" },
  { id: 8, name: "BMW iX3", battery_kwh: 74.0, consumption_wh_km: 185, range_certified: 460, emoji: "🏎️" },
];

function calculateRange(soc, battery_kwh, base_consumption, mode, temp, hvac, speed) {
  const remaining_energy_kwh = battery_kwh * (soc / 100);

  const modeFactor = { city: 1.18, highway: 0.93, mixed: 1.00 };

  let tempFactor = 1.0;
  if (temp < 0) tempFactor = 0.68;
  else if (temp < 10) tempFactor = 0.83;
  else if (temp < 15) tempFactor = 0.92;
  else if (temp > 40) tempFactor = 0.87;
  else if (temp > 35) tempFactor = 0.93;

  const hvacFactor = hvac ? 0.87 : 1.0;

  let speedFactor = 1.0;
  if (speed < 40) speedFactor = 1.10;
  else if (speed < 60) speedFactor = 1.00;
  else if (speed < 80) speedFactor = 0.97;
  else if (speed < 100) speedFactor = 0.90;
  else speedFactor = 0.80;

  const adjusted = (base_consumption * modeFactor[mode]) / (tempFactor * hvacFactor * speedFactor);
  const range_km = (remaining_energy_kwh * 1000) / adjusted;

  return {
    estimated: Math.round(range_km),
    optimistic: Math.round(range_km * 1.08),
    pessimistic: Math.round(range_km * 0.92),
    remaining_energy: remaining_energy_kwh.toFixed(1),
    efficiency: Math.round(adjusted),
  };
}

function getTempLabel(temp) {
  if (temp <= 0) return { label: "Freezing ❄️", color: "#60c8f5" };
  if (temp <= 15) return { label: "Cold 🌨️", color: "#a8d8f0" };
  if (temp <= 25) return { label: "Ideal 🌤️", color: "#7bcf7b" };
  if (temp <= 35) return { label: "Warm ☀️", color: "#f5c842" };
  return { label: "Hot 🔥", color: "#f57842" };
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const diff = end - start;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else prev.current = end;
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display}</span>;
}

export default function EVRangeEstimator() {
  const [vehicleId, setVehicleId] = useState(1);
  const [soc, setSoc] = useState(80);
  const [mode, setMode] = useState("mixed");
  const [temp, setTemp] = useState(25);
  const [hvac, setHvac] = useState(false);
  const [speed, setSpeed] = useState(60);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const result = calculateRange(soc, vehicle.battery_kwh, vehicle.consumption_wh_km, mode, temp, hvac, speed);
  const tempInfo = getTempLabel(temp);

  const socColor = soc > 60 ? "#4ade80" : soc > 25 ? "#facc15" : "#f87171";
  const rangePercent = Math.min((result.estimated / vehicle.range_certified) * 100, 100);

 const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)",
    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
    color: "#e2e8f0",
    padding: "0",  // Removed padding for full-screen
    position: "relative",
    overflow: "auto",  // Changed to allow scrolling
  },
  grid: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px", pointerEvents: "none",
  },
  header: {
    textAlign: "center", marginBottom: "32px", position: "relative",
    padding: "20px",  // Added padding here for spacing
  },
  title: {
    fontSize: "clamp(28px, 5vw, 48px)",
    fontWeight: 700,
    letterSpacing: "0.15em",
    background: "linear-gradient(90deg, #00c8ff, #7b61ff, #00c8ff)",
    backgroundSize: "200%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    animation: "shimmer 3s infinite linear",
  },
  subtitle: {
    color: "#64748b", fontSize: "13px", letterSpacing: "0.3em", marginTop: "6px",
    textTransform: "uppercase",
  },
  container: {
  width: "100%",
  maxWidth: "none",
  margin: "0",
  padding: "0 20px 20px",
},
  card: {
    background: "rgba(15, 25, 50, 0.8)",
    border: "1px solid rgba(0, 200, 255, 0.15)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  sectionLabel: {
    fontSize: "11px", letterSpacing: "0.3em", color: "#00c8ff",
    textTransform: "uppercase", marginBottom: "14px", display: "flex",
    alignItems: "center", gap: "8px",
  },
  vehicleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "10px",
  },
  vehicleBtn: (selected) => ({
    background: selected ? "rgba(0, 200, 255, 0.12)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${selected ? "#00c8ff" : "rgba(255,255,255,0.08)"}`,
    borderRadius: "10px", padding: "12px 10px",
    cursor: "pointer", color: selected ? "#00c8ff" : "#94a3b8",
    fontSize: "13px", textAlign: "left", transition: "all 0.2s",
    fontFamily: "inherit",
  }),
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",  // Responsive: stacks on small screens
    gap: "20px",
  },
  sliderLabel: {
    display: "flex", justifyContent: "space-between",
    fontSize: "13px", color: "#94a3b8", marginBottom: "8px",
  },
  sliderValue: (color) => ({
    color: color || "#00c8ff", fontWeight: 700, fontSize: "16px",
  }),
  sliderTrack: {
    width: "100%", height: "6px", appearance: "none",
    background: "rgba(255,255,255,0.08)", borderRadius: "3px",
    outline: "none", cursor: "pointer",
  },
  modeGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px",
  },
  modeBtn: (active) => ({
    background: active ? "rgba(123, 97, 255, 0.2)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${active ? "#7b61ff" : "rgba(255,255,255,0.08)"}`,
    borderRadius: "8px", padding: "10px 6px",
    cursor: "pointer", color: active ? "#a78bfa" : "#64748b",
    fontSize: "12px", textAlign: "center", transition: "all 0.2s",
    fontFamily: "inherit",
  }),
  toggle: {
    display: "flex", alignItems: "center", gap: "10px",
    cursor: "pointer", padding: "10px 14px",
    background: hvac ? "rgba(251, 191, 36, 0.1)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${hvac ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: "8px", transition: "all 0.2s",
  },
  toggleDot: {
    width: "36px", height: "20px",
    background: hvac ? "#f59e0b" : "rgba(255,255,255,0.1)",
    borderRadius: "10px", position: "relative", transition: "all 0.3s",
    flexShrink: 0,
  },
  resultCard: {
    background: "linear-gradient(135deg, rgba(0,200,255,0.08), rgba(123,97,255,0.08))",
    border: "1px solid rgba(0, 200, 255, 0.25)",
    borderRadius: "16px", padding: "28px",
    marginBottom: "20px", textAlign: "center",
    position: "relative", overflow: "hidden",
  },
  bigNumber: {
    fontSize: "clamp(56px, 10vw, 96px)",
    fontWeight: 700, lineHeight: 1,
    background: "linear-gradient(180deg, #ffffff, #00c8ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "block",
  },
  kmLabel: {
    fontSize: "22px", color: "#64748b",
    letterSpacing: "0.2em", marginTop: "4px", display: "block",
  },
  bandRow: {
    display: "flex", justifyContent: "center", gap: "24px",
    marginTop: "16px", flexWrap: "wrap",
  },
  bandItem: (color) => ({
    fontSize: "13px", color, display: "flex", alignItems: "center", gap: "6px",
  }),
  progressBar: {
    height: "8px", background: "rgba(255,255,255,0.06)",
    borderRadius: "4px", overflow: "hidden", marginTop: "20px",
  },
  progressFill: {
    height: "100%",
    width: `${rangePercent}%`,
    background: "linear-gradient(90deg, #7b61ff, #00c8ff)",
    borderRadius: "4px",
    transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
  },
  statBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px", padding: "14px", textAlign: "center",
  },
  statVal: { fontSize: "22px", fontWeight: 700, color: "#e2e8f0" },
  statLbl: { fontSize: "11px", color: "#475569", letterSpacing: "0.15em", marginTop: "3px" },
  warning: {
    background: "rgba(248, 113, 113, 0.1)",
    border: "1px solid rgba(248, 113, 113, 0.3)",
    borderRadius: "10px", padding: "12px 16px",
    color: "#fca5a5", fontSize: "13px", marginTop: "12px",
    display: "flex", alignItems: "center", gap: "8px",
  },
  twoPartitions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "32px",
  },
  partition: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
};

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700&display=swap');
        @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        input[type=range]::-webkit-slider-thumb {
          appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: #00c8ff;
          cursor: pointer; box-shadow: 0 0 8px rgba(0,200,255,0.6);
        }
        input[type=range]::-webkit-slider-runnable-track {
          background: rgba(255,255,255,0.08); border-radius: 3px;
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.2); border-radius: 3px; }
        @media (max-width: 768px) {
          .twoPartitions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={styles.grid} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>⚡ EV RANGE ESTIMATOR</h1>
          <p style={styles.subtitle}>Real-time distance prediction · Battery analytics</p>
        </div>

        {/* Two Partitions */}
        <div className="twoPartitions" style={styles.twoPartitions}>
          {/* Left Partition: Inputs (Vehicle Selection and Controls) */}
          <div style={styles.partition}>
            {/* Vehicle Selection */}
            <div style={styles.card}>
              <div style={styles.sectionLabel}>
                <span style={{ width: "4px", height: "14px", background: "#00c8ff", borderRadius: "2px", display: "inline-block" }} />
                Select Vehicle
              </div>
              <div style={styles.vehicleGrid}>
                {vehicles.map((v) => (
                  <button key={v.id} style={styles.vehicleBtn(vehicleId === v.id)} onClick={() => setVehicleId(v.id)}>
                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>{v.emoji}</div>
                    <div style={{ fontWeight: 600, fontSize: "12px", lineHeight: 1.3 }}>{v.name}</div>
                    <div style={{ fontSize: "11px", color: "#475569", marginTop: "3px" }}>{v.battery_kwh} kWh</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Grid */}
            <div style={styles.mainGrid}>
              {/* Left Column */}
              <div>
                {/* SOC Slider */}
                <div style={styles.card}>
                  <div style={styles.sectionLabel}>
                    <span style={{ width: "4px", height: "14px", background: "#00c8ff", borderRadius: "2px", display: "inline-block" }} />
                    Battery Level
                  </div>
                  <div style={styles.sliderLabel}>
                    <span>State of Charge</span>
                    <span style={styles.sliderValue(socColor)}>{soc}%</span>
                  </div>
                  <input type="range" min="1" max="100" value={soc}
                    onChange={(e) => setSoc(Number(e.target.value))}
                    style={{ ...styles.sliderTrack, accentColor: socColor }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#334155", marginTop: "6px" }}>
                    <span>Empty</span><span>Full</span>
                  </div>

                  {/* Battery visual */}
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ flex: 1, height: "28px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ width: `${soc}%`, height: "100%", background: `linear-gradient(90deg, ${socColor}aa, ${socColor})`, borderRadius: "4px", transition: "all 0.4s ease", position: "relative" }}>
                        {soc > 15 && <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "#000", fontWeight: 700 }}>{soc}%</span>}
                      </div>
                    </div>
                    <div style={{ width: "6px", height: "14px", background: "rgba(255,255,255,0.15)", borderRadius: "0 3px 3px 0" }} />
                  </div>
                </div>

                {/* Speed */}
                <div style={styles.card}>
                  <div style={styles.sectionLabel}>
                    <span style={{ width: "4px", height: "14px", background: "#7b61ff", borderRadius: "2px", display: "inline-block" }} />
                    Average Speed
                  </div>
                  <div style={styles.sliderLabel}>
                    <span>Speed</span>
                    <span style={styles.sliderValue("#a78bfa")}>{speed} km/h</span>
                  </div>
                  <input type="range" min="20" max="130" value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    style={{ ...styles.sliderTrack, accentColor: "#7b61ff" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#334155", marginTop: "6px" }}>
                    <span>20 km/h</span><span>130 km/h</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Driving Mode */}
                <div style={styles.card}>
                  <div style={styles.sectionLabel}>
                    <span style={{ width: "4px", height: "14px", background: "#7b61ff", borderRadius: "2px", display: "inline-block" }} />
                    Driving Mode
                  </div>
                  <div style={styles.modeGrid}>
                    {[
                      { key: "city", label: "City", icon: "🏙️", desc: "Stop & go" },
                      { key: "mixed", label: "Mixed", icon: "🗺️", desc: "Balanced" },
                      { key: "highway", label: "Highway", icon: "🛣️", desc: "Steady speed" },
                    ].map((m) => (
                      <button key={m.key} style={styles.modeBtn(mode === m.key)} onClick={() => setMode(m.key)}>
                        <div style={{ fontSize: "22px" }}>{m.icon}</div>
                        <div style={{ fontWeight: 600, marginTop: "4px" }}>{m.label}</div>
                        <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
                <div style={styles.card}>
                  <div style={styles.sectionLabel}>
                    <span style={{ width: "4px", height: "14px", background: tempInfo.color, borderRadius: "2px", display: "inline-block" }} />
                    Temperature
                  </div>
                  <div style={styles.sliderLabel}>
                    <span>{tempInfo.label}</span>
                    <span style={styles.sliderValue(tempInfo.color)}>{temp}°C</span>
                  </div>
                  <input type="range" min="-10" max="45" value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    style={{ ...styles.sliderTrack, accentColor: tempInfo.color }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#334155", marginTop: "6px" }}>
                    <span>-10°C ❄️</span><span>45°C 🔥</span>
                  </div>
                </div>

                {/* HVAC Toggle */}
                <div style={styles.card}>
                  <div style={styles.sectionLabel}>
                    <span style={{ width: "4px", height: "14px", background: "#f59e0b", borderRadius: "2px", display: "inline-block" }} />
                    Climate Control
                  </div>
                  <div style={styles.toggle} onClick={() => setHvac(!hvac)}>
                    <div style={styles.toggleDot}>
                      <div style={{ position: "absolute", top: "3px", left: hvac ? "19px" : "3px", width: "14px", height: "14px", background: "#fff", borderRadius: "50%", transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: hvac ? "#fbbf24" : "#64748b" }}>
                        {hvac ? "AC / Heater ON" : "AC / Heater OFF"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                        {hvac ? "−12% range penalty applied" : "No climate penalty"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Partition: Outputs (Results and Stats) */}
          <div style={styles.partition}>
            {/* Result Display */}
            <div style={styles.resultCard}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 50% 0%, rgba(0,200,255,0.06), transparent 70%)", pointerEvents: "none" }} />
              <span style={{ fontSize: "13px", letterSpacing: "0.3em", color: "#64748b", textTransform: "uppercase" }}>
                Estimated Range
              </span>
              <span style={styles.bigNumber}>
                <AnimatedNumber value={result.estimated} />
              </span>
              <span style={styles.kmLabel}>KILOMETERS</span>

              <div style={styles.bandRow}>
                <span style={styles.bandItem("#4ade80")}>▲ Best case: {result.optimistic} km</span>
                <span style={styles.bandItem("#f87171")}>▼ Worst case: {result.pessimistic} km</span>
              </div>

              <div style={styles.progressBar}>
                <div style={styles.progressFill} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#475569", marginTop: "6px" }}>
                <span>0 km</span>
                <span style={{ color: "#64748b" }}>{Math.round(rangePercent)}% of certified range ({vehicle.range_certified} km)</span>
                <span>{vehicle.range_certified} km</span>
              </div>

              {result.estimated < 40 && (
                <div style={styles.warning}>
                  ⚠️ Critical range! Find a charging station immediately.
                </div>
              )}
              {result.estimated >= 40 && result.estimated < 80 && (
                <div style={{ ...styles.warning, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fde68a" }}>
                  ⚡ Low range. Plan your next charging stop.
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div style={{ ...styles.card, padding: "16px" }}>
              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <div style={{ ...styles.statVal, color: socColor }}>{soc}%</div>
                  <div style={styles.statLbl}>BATTERY SOC</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statVal}>{result.remaining_energy} kWh</div>
                  <div style={styles.statLbl}>REMAINING ENERGY</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statVal}>{result.efficiency}</div>
                  <div style={styles.statLbl}>Wh/km (ADJUSTED)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "11px", color: "#1e293b", letterSpacing: "0.15em", marginTop: "8px" }}>
          ESTIMATES BASED ON STANDARD CONDITIONS · ACTUAL RANGE MAY VARY
        </div>
      </div>
    </div>
  );
}