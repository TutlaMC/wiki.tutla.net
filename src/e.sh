#!/bin/bash

find . -type f ! -path '*/.*/*' ! -name '.*' | while read -r file; do
    echo "=== $file ==="
    cat "$file"
    echo
done
