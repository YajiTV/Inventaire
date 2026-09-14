from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory

ALEMBIC_INI = Path(__file__).resolve().parent.parent / "alembic.ini"


def test_single_migration_head() -> None:
    """
    Vérifie qu'il n'y a qu'une seule tête de migration.
    Si le test échoue : lancer "alembic merge heads" pour les fusionner.
    """
    script = ScriptDirectory.from_config(Config(str(ALEMBIC_INI)))
    heads = script.get_heads()
    assert len(heads) == 1
