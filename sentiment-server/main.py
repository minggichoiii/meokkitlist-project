from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

app = FastAPI()

# ✅ 모델 및 토크나이저 로드 (KcELECTRA)
tokenizer = AutoTokenizer.from_pretrained("beomi/KcELECTRA-base")
model = AutoModelForSequenceClassification.from_pretrained("beomi/KcELECTRA-base")

labels = ["very_pos", "pos", "neu", "neg", "very_neg"]
emojis = ["🤩", "😊", "😐", "🙁", "😡"]

# ✅ 감성 분석 요청 구조
class ReviewInput(BaseModel):
    text: str
    restaurant_id: str
    source: str
    user_id: str | None = None

# ✅ 키워드 확장 요청 구조
class KeywordInput(BaseModel):
    keyword: str

# ✅ 임시 하드코딩된 의미 연관 키워드 매핑
keyword_mapping = {
    "날씨는 맑음": ["날씨", "맑음", "더움", "시원함"],
    "매콤한 맛": ["매운맛", "고추", "얼큰", "불맛"],
    "눈 오는 날": ["눈", "추움", "국물", "따뜻함"],
    "바다 보면서 먹기 좋은": ["바다", "뷰맛집", "해산물", "광안리"],
}

# ✅ 감성 분석 API
@app.post("/analyze")
def analyze(input: ReviewInput):
    inputs = tokenizer(input.text, return_tensors="pt", truncation=True)
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = F.softmax(logits / 1.2, dim=-1).tolist()[0]

    top_idx = int(torch.argmax(torch.tensor(probs)))
    return {
        "restaurant_id": input.restaurant_id,
        "labels": labels,
        "probs": probs,
        "top_label": labels[top_idx],
        "top_prob": probs[top_idx],
        "ui": {
            "emoji": emojis[top_idx],
            "percent": round(probs[top_idx] * 100)
        }
    }

# ✅ 키워드 확장 API
@app.post("/expand_keywords")
def expand_keywords(req: KeywordInput):
    input_kw = req.keyword.strip()
    expanded = keyword_mapping.get(input_kw, [input_kw])  # 없으면 원문 그대로
    return { "keywords": expanded }
