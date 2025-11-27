import requests
import json

# API Key của bạn (ĐÚNG key từ database)
API_KEY = "evmkt_4199d683db5740a2a07997d11b3c8e96"

# Base URL của API (thay đổi port nếu cần)
BASE_URL = "http://localhost:8080/api/v1"

# Headers với API Key
headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def test_get_datasets():
    """Test lấy danh sách datasets"""
    print("\n=== Test GET Datasets ===")
    url = f"{BASE_URL}/datasets"
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        else:
            print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_get_dataset_by_id(dataset_id):
    """Test lấy thông tin dataset theo ID"""
    print(f"\n=== Test GET Dataset ID: {dataset_id} ===")
    url = f"{BASE_URL}/datasets/{dataset_id}"
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        else:
            print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_analytics():
    """Test lấy analytics (cần scope analytics:access)"""
    print("\n=== Test GET Analytics ===")
    url = f"{BASE_URL}/analytics"
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        else:
            print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_health_check():
    """Test health check endpoint"""
    print("\n=== Test Health Check ===")
    url = f"{BASE_URL}/health"
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        else:
            print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def check_api_key_status():
    """Kiểm tra trạng thái API key"""
    print("\n=== Kiểm tra API Key ===")
    print(f"API Key: {API_KEY}")
    print(f"Độ dài: {len(API_KEY)} ký tự")
    print(f"Format đúng: {'evmkt_' if API_KEY.startswith('evmkt_') else 'SAI - phải bắt đầu với evmkt_'}")

if __name__ == "__main__":
    print("========================================")
    print("   EV Marketplace API Key Test")
    print("========================================")
    
    # Kiểm tra API key trước
    check_api_key_status()
    
    # Chạy các test
    test_get_datasets()
    test_get_dataset_by_id(1)
    test_analytics()
    test_health_check()
    
    print("\n========================================")
    print("   Test hoàn tất!")
    print("========================================")

