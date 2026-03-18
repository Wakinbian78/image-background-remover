from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from rembg import remove
import io

app = FastAPI(title="Image Background Remover")

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def index():
    return FileResponse("static/index.html")


@app.post("/remove-bg")
async def remove_bg(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    input_data = await file.read()
    output_data = remove(input_data)

    return Response(
        content=output_data,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=removed_{file.filename}"}
    )
