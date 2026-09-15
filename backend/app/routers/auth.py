from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.common import ErrorResponse
from app.schemas.user import UserRead

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
    responses={401: {"model": ErrorResponse}},
)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    """Returns an access token and sets the refresh token cookie."""
    not_implemented()


@router.post("/refresh", response_model=TokenResponse)
def refresh() -> TokenResponse:
    """Issues a new access token from the refresh token cookie."""
    not_implemented()


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout() -> None:
    not_implemented()


@router.get("/me", response_model=UserRead)
def read_current_user() -> UserRead:
    not_implemented()
