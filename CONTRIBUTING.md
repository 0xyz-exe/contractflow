# Contributing to ContractFlow

Thank you for your interest in contributing to ContractFlow!

## Development Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Set up local development:
   - Backend:
     ```bash
     cd apps/api
     python -m venv .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     python seed.py
     uvicorn app.main:app --reload
     ```
   - Frontend:
     ```bash
     cd apps/web
     npm install
     npm run dev
     ```
3. Run test suites:
   ```bash
   cd apps/api
   pytest tests/test_api.py -v
   cd ../web
   npm run build
   ```
4. Submit a Pull Request with a clear description of changes and test evidence.
