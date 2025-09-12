import pandas as pd
import numpy as np
import joblib
import os
import shutil
from datetime import datetime
import json
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

def retrain_with_validation():
    print("Starting model retraining with validation...")
    
    # Paths
    versions_dir = '../data/model_versions'
    current_model_path = 'MLBeam_model.pkl'
    versions_file = '../data/model_versions.json'
    additional_data_path = '../data/additional_training_data.json'
    inputs_path = '../../Inputs.xlsx'
    
    # Ensure versions directory exists
    os.makedirs(versions_dir, exist_ok=True)
    
    # Initialize versions file if it doesn't exist
    if not os.path.exists(versions_file):
        initialize_versions(versions_file)
    
    # Create backup before retraining
    backup_version = create_backup(current_model_path, versions_dir)
    
    try:
        # Load original data
        original_data = pd.read_excel(inputs_path)
        print(f"Original training data: {len(original_data)} samples")
        
        # Load additional data
        additional_data = []
        if os.path.exists(additional_data_path):
            with open(additional_data_path, 'r') as f:
                additional_data = json.load(f)
        print(f"Additional training data: {len(additional_data)} samples")
        
        if not additional_data:
            print("❌ No additional data to retrain with")
            return False
        
        # Convert additional data to DataFrame
        additional_df = pd.DataFrame(additional_data)
        
        # Combine data
        combined_data = pd.concat([original_data, additional_df], ignore_index=True)
        print(f"Combined training data: {len(combined_data)} samples")
        
        # Prepare features and target
        feature_cols = ['h_mm', 'd_mm', 'b_mm', 'a_mm', 'abyd', 'fck_Mpa',
                       'rho', 'fyk_Mpa', 'da_mm', 'Plate_Top_mm', 'Plate_Bottom_mm']
        target_col = 'V_Kn'
        
        X = combined_data[feature_cols].values
        y = combined_data[target_col].values
        
        # Standardize
        mu = X.mean(axis=0)
        sigma = X.std(axis=0)
        X_standardized = (X - mu) / sigma
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X_standardized, y, test_size=0.2, random_state=43)
        
        # Train new model
        model = RandomForestRegressor(
            n_estimators=100,
            max_features='sqrt',
            min_samples_leaf=1,
            random_state=43,
            oob_score=True,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        
        # Validate new model
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        
        r2_train = r2_score(y_train, y_train_pred)
        r2_test = r2_score(y_test, y_test_pred)
        
        print(f"New Model Performance:")
        print(f"   Training R²: {r2_train:.4f}")
        print(f"   Test R²: {r2_test:.4f}")
        print(f"   Out-of-bag Score: {model.oob_score_:.4f}")
        
        # Load current model for comparison
        current_model_data = joblib.load(current_model_path)
        current_r2 = current_model_data.get('r2_score', 0.794)
        current_oob = current_model_data.get('oob_score', 0.794)
        
        print(f"Current Model Performance:")
        print(f"   R² Score: {current_r2:.4f}")
        print(f"   Out-of-bag Score: {current_oob:.4f}")
        
        # Validation: Check if new model is better
        improvement_threshold = 0.01  # 1% improvement required
        
        r2_improvement = r2_test - current_r2
        oob_improvement = model.oob_score_ - current_oob
        
        print(f"Performance Comparison:")
        print(f"   R² Improvement: {r2_improvement:+.4f}")
        print(f"   OOB Improvement: {oob_improvement:+.4f}")
        
        if r2_improvement >= improvement_threshold or oob_improvement >= improvement_threshold:
            # New model is better, save it
            new_version = f"v1.1.{len(additional_data)}"
            
            model_data = {
                'model': model,
                'mu': mu,
                'sigma': sigma,
                'training_samples': len(combined_data),
                'additional_samples': len(additional_data),
                'r2_score': r2_test,
                'oob_score': model.oob_score_,
                'version': new_version,
                'created_at': datetime.now().isoformat()
            }
            
            joblib.dump(model_data, current_model_path)
            
            # Update versions tracking
            update_versions(versions_file, new_version, model_data, additional_data)
            
            print(f"New model saved as {new_version}")
            print(f"Model retraining successful with improved performance!")
            return True
        else:
            print(f"New model performance is not significantly better")
            print(f"Keeping current model to avoid degradation")
            return False
            
    except Exception as e:
        print(f"Error during retraining: {e}")
        print(f"Rolling back to previous version...")
        rollback_to_version(current_model_path, versions_dir, backup_version)
        return False

def initialize_versions(versions_file):
    """Initialize the versions tracking file"""
    versions = {
        "current_version": "v1.0.0",
        "versions": {
            "v1.0.0": {
                "version": "v1.0.0",
                "created_at": datetime.now().isoformat(),
                "training_samples": 978,
                "additional_samples": 0,
                "r2_score": 0.794,
                "oob_score": 0.794,
                "description": "Original model trained on 978 samples",
                "status": "active"
            }
        }
    }
    
    with open(versions_file, 'w') as f:
        json.dump(versions, f, indent=2)

def create_backup(current_model_path, versions_dir):
    """Create a backup of the current model"""
    if not os.path.exists(current_model_path):
        print("No current model to backup")
        return None
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_version = f"v1.0.{timestamp}"
    backup_path = os.path.join(versions_dir, f"{backup_version}.pkl")
    shutil.copy2(current_model_path, backup_path)
    
    print(f"Model backed up as {backup_version}")
    return backup_version

def rollback_to_version(current_model_path, versions_dir, version_name):
    """Rollback to a previous model version"""
    if not version_name:
        return False
        
    backup_path = os.path.join(versions_dir, f"{version_name}.pkl")
    
    if os.path.exists(backup_path):
        shutil.copy2(backup_path, current_model_path)
        print(f"Rolled back to {version_name}")
        return True
    else:
        print(f"Version {version_name} not found")
        return False

def update_versions(versions_file, new_version, model_data, additional_data):
    """Update the versions tracking file"""
    with open(versions_file, 'r') as f:
        versions = json.load(f)
    
    # Mark current version as inactive
    if versions["current_version"] in versions["versions"]:
        versions["versions"][versions["current_version"]]["status"] = "inactive"
    
    # Add new version
    versions["versions"][new_version] = {
        "version": new_version,
        "created_at": model_data["created_at"],
        "training_samples": model_data["training_samples"],
        "additional_samples": model_data["additional_samples"],
        "r2_score": model_data["r2_score"],
        "oob_score": model_data["oob_score"],
        "description": f"Retrained with {len(additional_data)} additional samples",
        "status": "active"
    }
    
    versions["current_version"] = new_version
    
    with open(versions_file, 'w') as f:
        json.dump(versions, f, indent=2)

if __name__ == '__main__':
    success = retrain_with_validation()
    if success:
        print("Model retraining completed successfully!")
    else:
        print("Model retraining failed or was rejected!")
