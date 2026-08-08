import sys
import requests

# URL pública de tu API desplegada en Vercel
URL = "https://pnelope.vercel.app/api/v1/service/query"

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def main():
    print("=" * 55)
    print("       CONSULTA DIRECTA DE USUARIOS Y LICENCIAS      ")
    print("=" * 55)

    default_api_key = "69415e37f9f2604ceb4852dc6b00ff1b"
    default_secret_id = "sec_e7c1376ec414edc901bfbfc3"

    print("\nPresiona Enter para usar los valores guardados o escribe uno nuevo:\n")
    
    api_key_input = input(f"1. API Key [{default_api_key}]: ").strip()
    api_key = api_key_input if api_key_input else default_api_key

    secret_id_input = input(f"2. Secret ID [{default_secret_id}]: ").strip()
    secret_id = secret_id_input if secret_id_input else default_secret_id

    service_name = input("3. Nombre o ID del Servicio: ").strip()
    while not service_name:
        print("   [!] El nombre del servicio es obligatorio.")
        service_name = input("3. Nombre o ID del Servicio: ").strip()

    payload = {
        "api_key": api_key,
        "secret_id": secret_id,
        "service": service_name
    }

    print(f"\n[+] Consultando API para el servicio '{service_name}'...")

    try:
        response = requests.post(URL, json=payload, headers=headers, timeout=12)
        
        try:
            data = response.json()
        except Exception:
            print(f"[!] Error: El servidor devolvió código {response.status_code} pero no es JSON.")
            print("Respuesta:", response.text[:300])
            return

        if response.status_code == 200 and "users" in data:
            users = data.get("users", [])
            print("\n" + "=" * 55)
            print(f"  USUARIOS ENCONTRADOS: {len(users)}")
            print("=" * 55)

            if users:
                for i, u in enumerate(users, start=1):
                    hwid_val = u.get('hwid') if u.get('hwid') else 'Sin HWID'
                    print(
                        f"{i}. [{u.get('status', 'active').upper()}] Usuario: {u.get('username')}\n"
                        f"   Key: {u.get('license_key')}\n"
                        f"   HWID: {hwid_val} | Expira: {u.get('expires_at')}\n"
                        f"   Banned: {u.get('is_banned')} | Expired: {u.get('is_expired')} | Rank: {u.get('rank')}\n"
                    )
            else:
                print("\n[i] No hay usuarios ni licencias registradas para este servicio.")
        else:
            print("\n[X] Error de autenticación o consulta:")
            print(f"    Código HTTP: {response.status_code}")
            print(f"    Detalle: {data.get('detail', data)}")

    except requests.exceptions.RequestException as e:
        print(f"\n[!] Error de conexión: {e}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nConsulta cancelada.")
        sys.exit(0)
