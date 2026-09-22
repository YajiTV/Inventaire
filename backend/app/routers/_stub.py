from fastapi import HTTPException, status


def not_implemented() -> None:
    """
    Placeholder body for a route whose contract is frozen but not implemented yet.
    The owner of the resource replaces the call with the real implementation.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Route non implémentée",
    )
