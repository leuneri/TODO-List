#!/bin/bash

# Exit if any command fails
set -eux pipefail

pip install -t lib -r requirements.txt
(cd lib; python -m zipfile -c ../lambda_function.zip .)
python -m zipfile -u lambda_function.zip todo.py

# Clean up
rm -rf lib
