#!/usr/bin/env bash
set -e

echo "==> Instalando dependencias..."
pip install -r requirements.txt

#echo "==> Ejecutando migraciones..."
#python manage.py migrate --noinput

echo "==> Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "==> Build completado."
