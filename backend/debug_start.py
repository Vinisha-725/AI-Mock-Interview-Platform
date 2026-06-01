import asyncio
from config import load_local_env
load_local_env()

from routes.interview import start_interview
from models import InterviewStartRequest

async def main():
    try:
        req = InterviewStartRequest(
            user_id="00000000-0000-0000-0000-000000000000",
            interview_type="ai",
            skills=[],
            projects=[],
            company_name="test"
        )
        res = await start_interview(req)
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
