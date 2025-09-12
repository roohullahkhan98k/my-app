import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def retrain_model():
    print("Retraining model with new data...")
    
    # Load original training data
    original_data = pd.read_excel('../../Inputs.xlsx')
    print(f"📊 Original training data: {len(original_data)} samples")
    
    # Load additional training data
    additional_data_path = '../data/additional_training_data.json'
    additional_data = []
    
    if os.path.exists(additional_data_path):
        import json
        with open(additional_data_path, 'r') as f:
            additional_data = json.load(f)
        print(f"📈 Additional training data: {len(additional_data)} samples")
    
    if not additional_data:
        print("❌ No additional data to retrain with")
        return False
    
    # Convert additional data to DataFrame
    additional_df = pd.DataFrame(additional_data)
    
    # Combine original and additional data
    combined_data = pd.concat([original_data, additional_df], ignore_index=True)
    print(f"🎯 Combined training data: {len(combined_data)} samples")
    
    # Prepare features and target
    feature_cols = ['h_mm', 'd_mm', 'b_mm', 'a_mm', 'abyd', 'fck_Mpa',
                    'rho', 'fyk_Mpa', 'da_mm', 'Plate_Top_mm', 'Plate_Bottom_mm']
    target_col = 'V_Kn'
    
    X = combined_data[feature_cols].values
    y = combined_data[target_col].values
    
    # Standardize the data
    mu = X.mean(axis=0)
    sigma = X.std(axis=0)
    X_standardized = (X - mu) / sigma
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_standardized, y, test_size=0.2, random_state=43)
    
    # Train new model
    print("🤖 Training new model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_features='sqrt',
        min_samples_leaf=1,
        random_state=43,
        oob_score=True,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Test model
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    r2_train = r2_score(y_train, y_train_pred)
    r2_test = r2_score(y_test, y_test_pred)
    
    print(f"📊 New Model Performance:")
    print(f"   Training R²: {r2_train:.4f}")
    print(f"   Test R²: {r2_test:.4f}")
    print(f"   Out-of-bag Score: {model.oob_score_:.4f}")
    
    # Save new model
    model_data = {
        'model': model,
        'mu': mu,
        'sigma': sigma,
        'training_samples': len(combined_data),
        'additional_samples': len(additional_data),
        'r2_score': r2_test,
        'oob_score': model.oob_score_
    }
    
    model_path = 'MLBeam_model.pkl'
    joblib.dump(model_data, model_path)
    print(f"✅ New model saved to {model_path}")
    
    return True

if __name__ == '__main__':
    success = retrain_model()
    if success:
        print("🎉 Model retraining completed successfully!")
    else:
        print("❌ Model retraining failed!")
