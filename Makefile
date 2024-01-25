.PHONY: install migrate

install:
	./scripts/install-deps.sh

migrate:
	cd backend && poetry run alembic upgrade head
