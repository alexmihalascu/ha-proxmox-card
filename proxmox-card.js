const VERSION = "0.1.1";

class ProxmoxCard extends HTMLElement {
  setConfig(config) {
    if (!config?.entity_prefix) throw new Error("Definește entity_prefix, de exemplu jellyfin");
    this.config = { name: config.entity_prefix, kind: "VM / LXC", ...config };
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() { return 5; }
  getGridOptions() { return { columns: 12, rows: 5, min_columns: 6, min_rows: 4 }; }

  entity(suffix, domain = "sensor") {
    return this._hass?.states[`${domain}.${this.config.entity_prefix}_${suffix}`];
  }

  number(suffix) {
    const value = Number.parseFloat(this.entity(suffix)?.state);
    return Number.isFinite(value) ? value : 0;
  }

  display(suffix, fallback = "—") {
    const state = this.entity(suffix);
    if (!state || ["unknown", "unavailable"].includes(state.state)) return fallback;
    const value = Number.parseFloat(state.state);
    const unit = state.attributes.unit_of_measurement || "";
    return Number.isFinite(value) ? `${value.toFixed(value < 10 ? 2 : 1)} ${unit}`.trim() : state.state;
  }

  status() {
    const binary = this.entity("status", "binary_sensor");
    const sensor = this.entity("status");
    const raw = (sensor?.state || binary?.state || "unknown").toLowerCase();
    return { raw, online: ["on", "online", "running"].includes(raw) };
  }

  ring(label, value, icon) {
    const pct = Math.max(0, Math.min(100, value));
    const color = pct >= 90 ? "var(--error-color, #db4437)" : pct >= 70 ? "#f5a623" : "var(--success-color, #43a047)";
    return `<div class="metric"><div class="ring" style="--pct:${pct};--metric-color:${color}">
      <div class="ring-inner"><ha-icon icon="${icon}"></ha-icon><strong>${pct.toFixed(1)}%</strong></div>
    </div><span>${label}</span></div>`;
  }

  render() {
    if (!this.shadowRoot || !this._hass) return;
    const status = this.status();
    const cpu = this.number("cpu_usage");
    const ram = this.number("memory_usage_percentage");
    const diskState = this.entity("disk_usage");
    const diskMax = this.number("max_disk_usage");
    const disk = diskState && diskMax ? (Number.parseFloat(diskState.state) / diskMax) * 100 : null;
    const netIn = this.display("network_input");
    const netOut = this.display("network_output");
    const uptime = this.display("uptime");
    const statusText = status.online ? "Online" : status.raw === "unknown" ? "Indisponibil" : "Oprit";
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;height:100%}ha-card{height:100%;overflow:hidden;position:relative;padding:18px;border-radius:22px;background:linear-gradient(145deg,var(--ha-card-background,var(--card-background-color)),color-mix(in srgb,var(--primary-color) 8%,var(--ha-card-background,var(--card-background-color))));box-sizing:border-box}
      ha-card:before{content:"";position:absolute;inset:-70%;background:conic-gradient(from 90deg,transparent,var(--primary-color),transparent 22%);opacity:.08;animation:orbit 12s linear infinite;pointer-events:none}@keyframes orbit{to{transform:rotate(360deg)}}
      .head,.status,.network,.footer{display:flex;align-items:center}.head{position:relative;justify-content:space-between;gap:12px}.title{display:flex;gap:11px;align-items:center}.title ha-icon{color:var(--primary-color);--mdc-icon-size:30px}.title strong{font-size:18px}.title small{display:block;opacity:.62;margin-top:2px}.status{gap:7px;font-weight:700;padding:7px 10px;border-radius:999px;background:color-mix(in srgb,${status.online ? "var(--success-color,#43a047)" : "var(--error-color,#db4437)"} 13%,transparent);color:${status.online ? "var(--success-color,#43a047)" : "var(--error-color,#db4437)"}.dot{width:9px;height:9px;border-radius:50%;background:currentColor;box-shadow:0 0 0 0 currentColor;animation:${status.online ? "pulse 2s infinite" : "none"}}@keyframes pulse{70%{box-shadow:0 0 0 9px transparent}}
      .metrics{position:relative;display:grid;grid-template-columns:repeat(${disk === null ? 2 : 3},1fr);gap:12px;margin:20px 0}.metric{text-align:center}.ring{width:86px;height:86px;margin:auto;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--metric-color) calc(var(--pct)*1%),color-mix(in srgb,var(--secondary-text-color) 18%,transparent) 0);transition:background .7s ease;animation:appear .7s ease-out}.ring:before{content:"";position:absolute}.ring-inner{width:68px;height:68px;border-radius:50%;background:var(--ha-card-background,var(--card-background-color));display:grid;place-content:center;gap:2px}.ring-inner ha-icon{margin:auto;color:var(--metric-color);--mdc-icon-size:19px}.metric span{display:block;margin-top:7px;font-size:12px;font-weight:700;opacity:.72}@keyframes appear{from{opacity:.2;transform:scale(.75)}}
      .network{position:relative;justify-content:space-between;padding:11px 13px;border-radius:14px;background:color-mix(in srgb,var(--primary-color) 7%,transparent);font-size:12px}.network div{display:flex;align-items:center;gap:6px}.network ha-icon{--mdc-icon-size:18px;color:var(--primary-color)}
      .footer{position:relative;justify-content:space-between;margin-top:13px;font-size:12px;opacity:.7}.footer ha-icon{--mdc-icon-size:17px;margin-right:5px}
    </style><ha-card>
      <div class="head"><div class="title"><ha-icon icon="${this.config.icon || "mdi:server"}"></ha-icon><div><strong>${this.config.name}</strong><small>${this.config.kind}</small></div></div><div class="status"><i class="dot"></i>${statusText}</div></div>
      <div class="metrics">${this.ring("CPU",cpu,"mdi:cpu-64-bit")}${this.ring("RAM",ram,"mdi:memory")}${disk === null ? "" : this.ring("Disk",disk,"mdi:harddisk")}</div>
      <div class="network"><div><ha-icon icon="mdi:download-network-outline"></ha-icon><span>IN ${netIn}</span></div><div><ha-icon icon="mdi:upload-network-outline"></ha-icon><span>OUT ${netOut}</span></div></div>
      <div class="footer"><span><ha-icon icon="mdi:timer-outline"></ha-icon>Uptime ${uptime}</span><span>v${VERSION}</span></div>
    </ha-card>`;
  }
}

customElements.define("proxmox-card", ProxmoxCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "proxmox-card", name: "Proxmox Card", description: "Card animat pentru noduri, VM-uri și containere Proxmox" });
console.info(`%c PROXMOX-CARD %c v${VERSION} `, "color:white;background:#e57000;font-weight:700", "color:#e57000;background:#fff");
