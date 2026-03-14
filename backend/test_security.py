
import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"Error in verify_password: {e}")
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Test
pwd = "password123"
h = get_password_hash(pwd)
print(f"Hashed: {h}")
print(f"Verify correct: {verify_password(pwd, h)}")
print(f"Verify incorrect: {verify_password('wrong', h)}")

# Test with a potential broken hash (simulating what might have happened)
broken_h = f"b'{h}'"
print(f"Broken hash: {broken_h}")
print(f"Verify broken: {verify_password(pwd, broken_h)}")
