import pandas as pd
import numpy as np
import joblib
import os
import shutil
from datetime import datetime
import json

class ModelVersionManager:
    def __init__(self):
        self.versions_dir = '../data/model_versions'
        self.current_model_path = 'MLBeam_model.pkl'
        self.versions_file = '../data/model_versions.json'
        
        # Ensure versions directory exists
        os.makedirs(self.versions_dir, exist_ok=True)
        
        # Initialize versions file if it doesn't exist
        if not os.path.exists(self.versions_file):
            self.initialize_versions()
    
    def initialize_versions(self):
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
        
        with open(self.versions_file, 'w') as f:
            json.dump(versions, f, indent=2)
    
    def create_backup(self, version_name=None):
        """Create a backup of the current model"""
        if not os.path.exists(self.current_model_path):
            print("❌ No current model to backup")
            return False
        
        if not version_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            version_name = f"v1.0.{timestamp}"
        
        backup_path = os.path.join(self.versions_dir, f"{version_name}.pkl")
        shutil.copy2(self.current_model_path, backup_path)
        
        print(f"✅ Model backed up as {version_name}")
        return version_name
    
    def retrain_with_validation(self, additional_data):
        """Retrain model with validation and rollback capability"""
        print("Starting model retraining with validation...")
        
        # Create backup before retraining
        backup_version = self.create_backup()
        
        try:
            # Load original data
            original_data = pd.read_excel('../../Inputs.xlsx')
            print(f"📊 Original training data: {len(original_data)} samples")
            
            # Convert additional data to DataFrame
            additional_df = pd.DataFrame(additional_data)
            print(f"📈 Additional training data: {len(additional_df)} samples")
            
            # Combine data
            combined_data = pd.concat([original_data, additional_df], ignore_index=True)
            print(f"🎯 Combined training data: {len(combined_data)} samples")
            
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
            from sklearn.model_selection import train_test_split
            X_train, X_test, y_train, y_test = train_test_split(X_standardized, y, test_size=0.2, random_state=43)
            
            # Train new model
            from sklearn.ensemble import RandomForestRegressor
            from sklearn.metrics import r2_score
            
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
            
            print(f"📊 New Model Performance:")
            print(f"   Training R²: {r2_train:.4f}")
            print(f"   Test R²: {r2_test:.4f}")
            print(f"   Out-of-bag Score: {model.oob_score_:.4f}")
            
            # Load current model for comparison
            current_model_data = joblib.load(self.current_model_path)
            current_r2 = current_model_data.get('r2_score', 0.794)
            current_oob = current_model_data.get('oob_score', 0.794)
            
            print(f"📊 Current Model Performance:")
            print(f"   R² Score: {current_r2:.4f}")
            print(f"   Out-of-bag Score: {current_oob:.4f}")
            
            # Validation: Check if new model is better
            improvement_threshold = 0.01  # 1% improvement required
            
            r2_improvement = r2_test - current_r2
            oob_improvement = model.oob_score_ - current_oob
            
            print(f"📈 Performance Comparison:")
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
                
                joblib.dump(model_data, self.current_model_path)
                
                # Update versions tracking
                self.update_versions(new_version, model_data, additional_data)
                
                print(f"✅ New model saved as {new_version}")
                print(f"🎉 Model retraining successful with improved performance!")
                return True
            else:
                print(f"⚠️  New model performance is not significantly better")
                print(f"Keeping current model to avoid degradation")
                return False
                
        except Exception as e:
            print(f"❌ Error during retraining: {e}")
            print(f"Rolling back to previous version...")
            self.rollback_to_version(backup_version)
            return False
    
    def rollback_to_version(self, version_name):
        """Rollback to a previous model version"""
        backup_path = os.path.join(self.versions_dir, f"{version_name}.pkl")
        
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, self.current_model_path)
            print(f"✅ Rolled back to {version_name}")
            return True
        else:
            print(f"❌ Version {version_name} not found")
            return False
    
    def update_versions(self, new_version, model_data, additional_data):
        """Update the versions tracking file"""
        with open(self.versions_file, 'r') as f:
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
        
        with open(self.versions_file, 'w') as f:
            json.dump(versions, f, indent=2)
    
    def list_versions(self):
        """List all available model versions"""
        with open(self.versions_file, 'r') as f:
            versions = json.load(f)
        
        print("📋 Available Model Versions:")
        for version, info in versions["versions"].items():
            status = "🟢 ACTIVE" if info["status"] == "active" else "⚪ Inactive"
            print(f"   {version}: {info['description']} - {status}")
            print(f"      Samples: {info['training_samples']}, R²: {info['r2_score']:.4f}")
    
    def get_current_model_info(self):
        """Get information about the current model"""
        if os.path.exists(self.current_model_path):
            model_data = joblib.load(self.current_model_path)
            return {
                "version": model_data.get("version", "v1.0.0"),
                "training_samples": model_data.get("training_samples", 978),
                "r2_score": model_data.get("r2_score", 0.794),
                "oob_score": model_data.get("oob_score", 0.794)
            }
        return None

if __name__ == '__main__':
    manager = ModelVersionManager()
    manager.list_versions()
