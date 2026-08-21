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

## Power controls

If the Proxmox VE integration has created `button.<prefix>_start` / `_stop` / `_shutdown` / `_restart` entities for a guest (this needs the Proxmox API token used by the integration to have a role with `VM.PowerMgmt`, e.g. `PVEVMUser` — `PVEAuditor` alone is read-only and won't create these buttons), matching buttons appear on the card automatically. Stop/Shutdown/Restart ask for confirmation. Set `actions: false` to hide them.

## Overview card

`custom:proxmox-overview-card` auto-discovers every guest exposed by the Proxmox VE integration (no `entity_prefix` list to maintain) and lists them with status, CPU/RAM and the same power buttons. New VMs/containers show up as soon as they're added to the integration — no dashboard edits needed.

```yaml
type: custom:proxmox-overview-card
title: Proxmox
exclude:
  - homeassistant
  - ubuntu_dev
```

`exclude` takes a list of `entity_prefix` values to hide (e.g. the VM running Home Assistant itself, or a box you don't want a Shutdown button on).

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
