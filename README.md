here # MediTwin — AI-Powered Predictive Hospital Digital Twin

## 1. Team Details

**Team Name:** MediTwin

**Team Members:**
- Pedakolimi Chandra Arjun

## 2. College / Institution

**Institution:** PSG Institute of Technology and Engineering (PSG ITech)

## 3. Problem Statement

Hospitals have continuously changing clinical and operational information, including patient vital signs, ICU beds, ambulances, departments, alerts, equipment, and other resources. Understanding these changing conditions together and identifying where attention may be required is a significant challenge.

MediTwin addresses this challenge through a virtual representation of hospital operations combined with machine-learning-based patient-risk prediction and generative AI explanations.

## 4. Healthcare Use Cases

### 4.1 Emergency Response
Simulation of ambulance arrivals, emergency department load, and ICU overload scenarios.

### 4.2 Patient Journey
Visualization of a patient's journey from arrival through diagnosis, treatment, and discharge.

### 4.3 ICU Monitoring
Monitoring of simulated ICU patient vital signs with machine-learning-based risk prediction.

### 4.4 AI Operations
Demonstration of hospital resource shortages, equipment failures, and mass-casualty scenarios where supported by the prototype.

### 4.5 Ambulance Fleet
Visualization of ambulance-fleet information and simulated routes or arrival estimates where implemented.

**Note:** Simulated operational data must not be interpreted as live data from real hospitals or ambulances.

## 5. Technical Stack

### Frontend
- React
- TypeScript
- Vite
- Three.js
- React Three Fiber

### Backend
- Python
- FastAPI
- Uvicorn

### Database
- MongoDB

### AI / ML
- Machine-learning-based patient-risk prediction
- Mistral AI (`mistral-small-latest`) for patient-risk explanations

## 6. AI/ML Model Details

The MediTwin patient-risk workflow consists of two AI layers.

### Workflow

```text
Patient Vital Signs
        |
        v
ML Risk Prediction
        |
        v
Risk Level + Probability
        |
        v
Mistral AI
        |
        v
Human-Readable Explanation
        |
        v
Hospital Dashboard
```

### Patient Inputs

The patient-risk workflow uses the following inputs:

- Age
- Heart rate
- Systolic blood pressure
- Oxygen saturation (SpO₂)
- Respiratory rate
- Temperature

### Model Output

The application provides a risk category such as LOW, MODERATE, or HIGH, together with the probability or score returned by the configured model.

The exact model algorithm, training dataset, and performance metrics should be documented only after verification.

### Role of Mistral AI

The machine-learning model estimates the patient's risk category. Mistral AI generates a natural-language explanation to help users understand the assessment.

Mistral AI does not replace the underlying risk-prediction model and its generated explanations are not independent clinical evidence.

## 7. System Architecture

MediTwin combines patient-risk assessment with a virtual representation of hospital operations.

```text
               MEDTWIN
                  |
      +-----------+-----------+
      |           |           |
      v           v           v
   Patients     ICU Beds   Ambulances
      |           |           |
      +-----------+-----------+
                  |
                  v
       Hospital Digital Twin
                  |
          +-------+-------+
          |               |
          v               v
     ML Risk Model   Operations
          |
          v
    Risk Category
    + Probability
          |
          v
      Mistral AI
          |
          v
  Human-Readable Explanation
          |
          v
    React Dashboard
```

The hospital operations component uses simulated data where applicable.

## 8. Technology and Application Workflow

1. Patient vital signs are entered into the application.
2. The frontend sends the input to the backend.
3. The machine-learning model estimates the patient-risk category.
4. The backend returns the prediction and associated score.
5. Mistral AI generates an explanation when the service is available.
6. The dashboard displays the assessment.
7. Hospital simulation features demonstrate related operational scenarios.

## 9. Project Features

- Patient-risk prediction
- AI-generated risk explanations
- Hospital operations dashboard
- Simulated ICU and emergency workflows
- Ambulance-fleet visualization
- Interactive 3D hospital visualization

Only features verified in the running application should be considered implemented.

## 10. Installation and Execution

### Prerequisites

- Python
- Node.js and npm
- MongoDB, if required by the configured application
- Mistral API key for AI explanation functionality

### Start the Backend

From the project root:

```bash
cd ~/Downloads/AIdigitaltwinHospital
source backend/.venv/bin/activate
uvicorn backend.app.main:app --reload
```

Backend:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### Start the Frontend

Open a second Terminal window:

```bash
cd ~/Downloads/AIdigitaltwinHospital/frontend
npm install
npm run dev
```

Open the local address printed by Vite, commonly:

`http://localhost:5173`

### Environment Configuration

Configure the required environment variables according to the project implementation.

Keep API keys and credentials in local environment files. Never publish secrets in the public repository.

## 11. Demonstration Video

**Demo Video:** To be added.

The demonstration will cover the problem statement, architecture, patient-risk prediction, AI-generated explanation, 3D hospital visualization, and available hospital simulation features.

The video must be uploaded to YouTube as an **Unlisted** video. Add the final video link here before submission.

## 12. Open-Source License
MIT License

Copyright (c) 2026 MediTwin Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
## 13. Architecture Diagram

The architecture diagram illustrates the MediTwin frontend, FastAPI backend, patient-risk prediction model, Mistral AI explanation workflow, and hospital simulation components.

**Architecture Diagram:** [View MediTwin System Architecture (PDF)](docs/MediTwin_Architecture.pdf)
download it you can see pdf.
## 14. Project Presentation

The MediTwin project presentation covers the problem statement, healthcare use cases, proposed solution, system architecture, AI/ML workflow, implementation, responsible AI, limitations, and future scope.

**Project Presentation:** [View MediTwin Project Presentation (PDF)](docs/MediTwin_Presentation.pdf)
download the Project Presentation You can see pdf.
## 15. Responsible AI and Limitations

MediTwin is an educational prototype and is not a clinically validated medical system.

- Predictions must not be treated as definitive diagnoses.
- AI-generated explanations may contain errors.
- Simulated data does not establish real-world hospital performance.
- Real EHR, wearable, and ambulance-system integrations are not claimed unless implemented and verified.
- Clinical use would require suitable validation, privacy safeguards, security controls, and healthcare-professional oversight.

## 16. Future Scope

- Authorized EHR integration
- Wearable-data integration
- Longitudinal patient monitoring
- Evaluation on appropriately governed clinical datasets
- Documented model-performance metrics
- Improved resource-demand forecasting
- More detailed emergency simulations
- Clinical validation and safety evaluation

These are proposed future improvements, not claims of current functionality.

## 17. Team and Project Links

**Team Name:** MediTwin

**Institution:** PSG Institute of Technology and Engineering (PSG ITech)

**GitHub Repository:** https://github.com/arjunpedakolimi/AIdigitaltwinHospital

**Demo Video:

**Architecture Diagram:** `docs/MediTwin_Architecture.pdf`

**Presentation:** `docs/MediTwin_Presentation.pdf`

## 18. Conclusion

MediTwin demonstrates how machine-learning-based patient-risk assessment, generative AI explanations, hospital operations simulation, and 3D visualization can be combined in a hospital digital-twin prototype.

The project explores the potential of AI-assisted analysis and virtual hospital environments to support operational awareness and emergency planning.

Further integration, evaluation, and clinical validation would be necessary before real-world clinical deployment.
