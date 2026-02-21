import httpx
import asyncio
import json

async def test():
    async with httpx.AsyncClient(base_url='http://localhost:8000') as c:
        r = await c.post('/auth/register', json={'email': 'bot123@test.com', 'password': 'password123'})
        if r.status_code == 201:
            token = r.json()['access_token']
        elif r.status_code == 400:
            r = await c.post('/auth/login', json={'email': 'bot123@test.com', 'password': 'password123'})
            token = r.json()['access_token']
        else:
            print("Login Error", r.text)
            return

        print('Logged in successfully')
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test basic goal creation
        goal_res = await c.post('/goals', json={
            'title': 'Test Goal', 
            'description': 'testing ai generated plans', 
            'total_days': 3, 
            'use_ai': True
        }, headers=headers, timeout=20.0)
        
        if goal_res.status_code != 201:
            print('Goal creation failed:', goal_res.status_code, goal_res.text)
            return
            
        goal = goal_res.json()
        print('Goal created:', goal['id'])
        
        # Test dynamic plan logic
        date = goal['start_date']
        print(f"Fetching dynamic plan for {date}")
        plan_res = await c.get(f'/plans/date/{date}/dynamic', headers=headers, timeout=30.0)
        
        print('Dynamic plan code:', plan_res.status_code)
        print('Dynamic plan content:', plan_res.json().get('topic'))
        
        if plan_res.status_code == 200:
            print("EVERYTHING IS WORKING FINE!")

if __name__ == "__main__":
    asyncio.run(test())
