from fastapi import APIRouter, Request, BackgroundTasks
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/")
async def log_client_error(request: Request, background_tasks: BackgroundTasks):
    try:
        data = await request.json()
        
        # Log error in background so it doesn't block the request
        def log_task(error_data):
            logger.error(f"Frontend Error: {error_data}")
            
        background_tasks.add_task(log_task, data)
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Failed to log frontend error: {e}")
        return {"status": "error"}
