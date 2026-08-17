# Proxmox Card

Animated Home Assistant dashboard card for Proxmox nodes, virtual machines and containers.

The card automatically resolves the standard entities created by the Home Assistant Proxmox VE integration from a single `entity_prefix`.

## Installation

Add this repository to HACS as a custom **Dashboard** repository, install it, and refresh Home Assistant.

## Usage

```yaml
type: custom:proxmox-card
entity_prefix: homeassistant
name: Home Assistant
kind: VM 103
icon: mdi:home-assistant
```

The card displays live status, CPU, RAM, disk usage, network traffic and uptime. The RAM and disk rings also show the allocated amount (e.g. `2.4 / 4.0 GiB`), read from the integration's `max_memory_usage` / `max_disk_usage` sensors — no vCPU-count entity exists in the integration, so CPU allocation isn't shown. Missing or disabled entities are handled gracefully.

## Supported entity naming

For an `entity_prefix` of `homeassistant`, the card looks for entities such as:

- `binary_sensor.homeassistant_status`
- `sensor.homeassistant_cpu_usage`
- `sensor.homeassistant_memory_usage_percentage`
- `sensor.homeassistant_memory_usage`
- `sensor.homeassistant_max_memory_usage`
- `sensor.homeassistant_disk_usage`
- `sensor.homeassistant_max_disk_usage`
- `sensor.homeassistant_network_input`
- `sensor.homeassistant_network_output`
- `sensor.homeassistant_uptime`

## License

MIT
