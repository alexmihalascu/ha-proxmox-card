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

If the Proxmox VE integration has created `button.<prefix>_start` / `_stop` / `_shut_down` / `_restart` entities for a guest or node, matching buttons appear on the card automatically. Stop/Shutdown/Restart ask for confirmation. Set `actions: false` to hide them.

This needs the Proxmox API token used by the integration to have power-management privileges — `PVEAuditor` alone is read-only:

```
# VM/container start/stop/shutdown/restart
pveum acl modify / --tokens 'root@pam!homeassistant' --roles PVEVMUser

# node reboot/shutdown (Sys.PowerMgmt isn't in any built-in role short of
# Administrator, which is root-equivalent — a scoped custom role is safer)
pveum role add ProxmoxHANodePower --privs "Sys.PowerMgmt"
pveum acl modify / --tokens 'root@pam!homeassistant' --roles ProxmoxHANodePower
```

Reload the Proxmox VE integration afterwards (Settings → Devices & Services → Proxmox VE → ⋮ → Reload) for the new buttons to appear. Node-only bulk actions (`start_all`/`stop_all`/`suspend_all`) exist as entities too but are intentionally not wired into the card — a one-click "stop every guest on this node" button next to a single VM's Stop button is a good way to have a bad night.

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
