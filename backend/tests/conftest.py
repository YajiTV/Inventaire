import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.schemas.enums import UserRole
from app.services.password import hash_password

# StaticPool: every session of a test shares the same in-memory database.
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)


# SQLite ignores foreign keys by default: enabled to get the same refusals as PostgreSQL.
@event.listens_for(engine, "connect")
def _enable_foreign_keys(dbapi_connection, _record):
    dbapi_connection.execute("PRAGMA foreign_keys=ON")


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    import app.models.user  # noqa: F401

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
        try:
            yield db_session
        except Exception:
            db_session.rollback()
            raise

    app.dependency_overrides[get_db] = override_get_db
    try:
        # https: the Secure refresh cookie is only sent back over https.
        yield TestClient(app, base_url="https://testserver")
    finally:
        app.dependency_overrides.clear()


@pytest.fixture()
def auth(client: TestClient, db_session: Session) -> dict[str, str]:
    """Authorization header of an operator, for the routes that need a token."""
    user = User(
        email="operateur@inventaire.fr",
        full_name="Operateur",
        hashed_password=hash_password("s3cret-pass"),
        role=UserRole.OPERATOR,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/auth/login", json={"email": "operateur@inventaire.fr", "password": "s3cret-pass"}
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture()
def authenticated(client: TestClient, auth: dict[str, str]) -> None:
    """Sends the operator token on every request of the test, helpers included.
    Enabled per module with: pytestmark = pytest.mark.usefixtures("authenticated")"""
    client.headers.update(auth)
