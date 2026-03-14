import asyncio
import websockets

async def test_ws():
    # Test both raw and encoded
    for token in ["1:user", "1%3Auser"]:
        uri = f"ws://localhost:8000/api/v1/chat/ws/{token}"
        try:
            async with websockets.connect(uri) as websocket:
                print(f"Successfully connected with token: {token}")
        except Exception as e:
            print(f"Failed with token {token}: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
