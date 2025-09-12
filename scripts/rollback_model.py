import pandas as pd
import numpy as np
import joblib
import os
import json
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

def rollback_to_original():
    print("Rolling back to original model v1.0.0...")
    
    try:
        # Load original data
        data = pd.read_excel('../../Inputs.xlsx')
        print(f"Loaded original data: {len(data)} samples")
        
        # Prepare features and target
        feature_cols = ['h_mm', 'd_mm', 'b_mm', 'a_mm', 'abyd', 'fck_Mpa',
                       'rho', 'fyk_Mpa', 'da_mm', 'Plate_Top_mm', 'Plate_Bottom_mm']
        target_col = 'V_Kn'
        
        X = data[feature_cols].values
        y = data[target_col].values
        
        # Standardize
        mu = X.mean(axis=0)
        sigma = X.std(axis=0)
        X_standardized = (X - mu) / sigma
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X_standardized, y, test_size=0.2, random_state=43)
        
        # Train original model
        model = RandomForestRegressor(
            n_estimators=100,
            max_features='sqrt',
            min_samples_leaf=1,
            random_state=43,
            oob_score=True,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        
        # Test performance
        y_test_pred = model.predict(X_test)
        r2_test = r2_score(y_test, y_test_pred)
        
        print(f"Original model R²: {r2_test:.4f}")
        print(f"Original model OOB: {model.oob_score_:.4f}")
        
        # Save original model
        original_model_data = {
            'model': model,
            'mu': mu,
            'sigma': sigma,
            'training_samples': len(data),
            'additional_samples': 0,
            'r2_score': r2_test,
            'oob_score': model.oob_score_,
            'version': 'v1.0.0',
            'created_at': '2025-09-12T19:47:22.821685'
        }
        
        joblib.dump(original_model_data, 'MLBeam_model.pkl')
        
        # Reset model versions
        versions = {
            "current_version": "v1.0.0",
            "versions": {
                "v1.0.0": {
                    "version": "v1.0.0",
                    "created_at": "2025-09-12T19:47:22.821685",
                    "training_samples": len(data),
                    "additional_samples": 0,
                    "r2_score": r2_test,
                    "oob_score": model.oob_score_,
                    "description": "Original model trained on 978 samples",
                    "status": "active"
                }
            }
        }
        
        with open('../data/model_versions.json', 'w') as f:
            json.dump(versions, f, indent=2)
        
        # Clear additional training data
        with open('../data/additional_training_data.json', 'w') as f:
            json.dump([], f)
        
        print("Model rolled back to original v1.0.0 successfully!")
        print("All additional training data cleared!")
        print("Model versions reset!")
        return True
        
    except Exception as e:
        print(f"Error during rollback: {e}")
        return False

if __name__ == '__main__':
    success = rollback_to_original()
    if success:
        print("Rollback completed successfully!")
    else:
        print("Rollback failed!")
