import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app

# SQLite en memoire, une connexion partagee (StaticPool) pour que toutes les
# sessions de test voient les memes tables le temps du test.
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    import app.models.user  # noqa: F401 -- enregistre les tables sur Base.metadata

    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session: Session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    try:
        # base_url en https : le cookie refresh (Secure) n'est resend par le
        # client de test que si le scheme est https, sinon httpx l'ignore.
        yield TestClient(app, base_url="https://testserver")
    finally:
        app.dependency_overrides.clear()
