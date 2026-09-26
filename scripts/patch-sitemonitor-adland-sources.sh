#!/usr/bin/env bash
# Back-compat wrapper — applies adland + creative-tech + any future *-sources.json SSOT.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/patch-sitemonitor-digest-sources.sh" "$@"
