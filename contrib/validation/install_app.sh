#!/bin/bash

if [ ! -f frontend/app/validation.config.ts ]; then
  cp frontend/app/validation.config.ts.sample frontend/app/validation.config.ts
fi