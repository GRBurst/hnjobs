from typing import Union
import json

from fastapi import FastAPI, Request

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/comments/")
async def write_comments(request: Request):
    json_data = await request.json()

    with open("comments.txt", "w") as file:
        file.write(json.dumps(json_data))

    return {"success": 200}

@app.get("/comments/")
async def read_comments(request: Request):
    with open("comments.txt", "r") as file:
        lines = file.readlines()
        print(lines)
        return {
            "success": 200,
            "data": lines
            }

    
