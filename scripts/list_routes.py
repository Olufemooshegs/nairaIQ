from app.main import app

for r in app.routes:
    try:
        methods = getattr(r, 'methods', None)
        print(r.path, methods)
    except Exception:
        pass
