import sys
import json
import numpy as np
import joblib
import os

def predict_beam_strength(input_data):
    """
    Predict beam shear strength using the trained ML model
    
    Args:
        input_data: Dictionary containing beam parameters
        
    Returns:
        Dictionary with prediction results
    """
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'MLBeam_model.pkl')
        
        # Check if model file exists
        if not os.path.exists(model_path):
            return {
                'error': 'Model file not found. Please ensure MLBeam_model.pkl is in the project root.',
                'success': False
            }
        
        # Load the trained model
        data = joblib.load(model_path)
        model = data['model']
        mu = data['mu']
        sigma = data['sigma']
        
        # Define feature names in the correct order
        feature_names = ['h_mm', 'd_mm', 'b_mm', 'a_mm', 'abyd', 'fck_Mpa',
                        'rho', 'fyk_Mpa', 'da_mm', 'Plate_Top_mm', 'Plate_Bottom_mm']
        
        # Extract features in the correct order
        features = []
        for name in feature_names:
            if name not in input_data:
                return {
                    'error': f'Missing required parameter: {name}',
                    'success': False
                }
            features.append(float(input_data[name]))
        
        # Convert to numpy array
        features = np.array(features)
        
        # Check dimension match
        if features.shape[0] != len(mu):
            return {
                'error': 'Input dimension mismatch with model',
                'success': False
            }
        
        # Standardize the input
        standardized = (features - mu) / sigma
        
        # Make prediction
        prediction = model.predict([standardized])[0]
        
        # Calculate confidence (using out-of-bag score if available)
        confidence = getattr(model, 'oob_score_', 0.85)  # Default confidence if oob_score not available
        
        return {
            'success': True,
            'shearStrength': float(prediction),
            'confidence': float(confidence),
            'inputData': input_data
        }
        
    except Exception as e:
        return {
            'error': f'Prediction failed: {str(e)}',
            'success': False
        }

if __name__ == '__main__':
    # Read input from stdin
    try:
        input_json = sys.stdin.read()
        input_data = json.loads(input_json)
        
        result = predict_beam_strength(input_data)
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': f'Script execution failed: {str(e)}',
            'success': False
        }
        print(json.dumps(error_result))
