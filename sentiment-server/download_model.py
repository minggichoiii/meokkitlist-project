from transformers import AutoTokenizer, AutoModelForSequenceClassification

# ✅ 변경된 모델명 (공개 상태)
model_name = "beomi/KcELECTRA-base"  
save_path = "./model/beomi_model"

print("📦 모델 다운로드 중...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

print("💾 모델 저장 중...")
tokenizer.save_pretrained(save_path)
model.save_pretrained(save_path)

print(f"✅ 완료! 모델이 {save_path} 경로에 저장되었습니다.")
